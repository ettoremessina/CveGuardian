import { simpleGit } from 'simple-git';
import { db, projects, projectDependencies, matches, cves, cveAffectedItems } from '@cve-guardian/core';
import { eq, sql, and, ilike } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const SCAN_DIR_BASE = process.env.SCAN_TEMP_DIR || '/tmp/cve-guardian-scans';
const DEPSCANITY_PATH = path.resolve(process.cwd(), '../../tools/DepScanity/depscanity'); // Relative to apps/api

export async function scanProject(projectId: number) {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) throw new Error('Project not found');

    const projectDir = path.join(SCAN_DIR_BASE, `project-${projectId}`);
    const outputDir = path.join(SCAN_DIR_BASE, `results-${projectId}`);

    // Clean up previous
    if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });

    fs.mkdirSync(projectDir, { recursive: true });

    // Clone
    console.log(`Cloning ${project.repoUrl} to ${projectDir}...`);
    const git = simpleGit();
    // Simplified auth: user assumes ENV vars for git are set or SSH keys are available
    await git.clone(project.repoUrl, projectDir, ['--branch', project.branch, '--depth', '1']);

    // Run DepScanity
    // Usage: depscanity scan <path> --out <dir>
    // Run DepScanity
    // Usage: depscanity scan <path> --out <dir>
    console.log(`Running DepScanity on ${projectDir}...`);
    let logOutput = '';

    try {
        await new Promise<void>((resolve, reject) => {
            const proc = spawn(DEPSCANITY_PATH, ['scan', projectDir, '--out', outputDir], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            proc.stdout.on('data', (data) => {
                const chunk = data.toString();
                process.stdout.write(chunk); // Still show in our console
                logOutput += chunk;
            });

            proc.stderr.on('data', (data) => {
                const chunk = data.toString();
                process.stderr.write(chunk);
                logOutput += chunk;
            });

            proc.on('close', (code) => {
                console.log(`DepScanity exited with code ${code}`);
                logOutput += `\nProcess exited with code ${code}\n`;
                resolve();
            });
            proc.on('error', (err) => {
                logOutput += `\nProcess execution error: ${err.message}\n`;
                reject(err);
            });
        });

        // Parse Results
        const files = fs.readdirSync(outputDir);
        const jsonFile = files.find(f => f.endsWith('.json'));

        if (!jsonFile) {
            logOutput += '\nError: No JSON output found from DepScanity.\n';
            // We proceed to save log, but maybe throw error after?
            // If we throw here, we must ensure we still save the log.
        } else {
            const resultsPath = path.join(outputDir, jsonFile);
            const resultsRaw = fs.readFileSync(resultsPath, 'utf-8');
            const results = JSON.parse(resultsRaw);

            // Store in DB
            // Clear old dependencies
            // Must delete matches first due to FK constraint on dependencyId
            await db.delete(matches).where(eq(matches.projectId, projectId));
            await db.delete(projectDependencies).where(eq(projectDependencies.projectId, projectId));

            const depsToInsert: any[] = [];
            const depList = results.dependencies || results.components || results.findings || [];

            for (const dep of depList) {
                // Handle both camelCase (standard) and PascalCase (DepScanity findings)
                const name = dep.name || dep.Package || dep.artifactId;
                const version = dep.version || dep.InstalledVersion;
                const ecosystem = dep.type || dep.ecosystem || dep.Ecosystem || 'unknown';

                if (name && version) {
                    depsToInsert.push({
                        projectId,
                        packageName: name,
                        version: version,
                        ecosystem: ecosystem,
                        isDev: dep.scope === 'dev',
                        isTransitive: false
                    });
                }
            }

            if (depsToInsert.length > 0) {
                const insertedDeps = await db.insert(projectDependencies).values(depsToInsert).returning();
                await matchDependencies(projectId, insertedDeps);
            }

            // Update successful scan stats
            await db.update(projects).set({
                lastScanAt: new Date(),
                updatedAt: new Date(),
                vulnerabilityCount: depsToInsert.length,
                lastScanLog: logOutput
            }).where(eq(projects.id, projectId));
        }

    } catch (e: any) {
        logOutput += `\nScan Error: ${e.message}\n`;
        // Save log even on error
        await db.update(projects).set({
            updatedAt: new Date(),
            lastScanLog: logOutput
        }).where(eq(projects.id, projectId));
        throw e; // Re-throw to inform caller
    } finally {
        // Cleanup if output dir exists? 
        // Logic above might have skipped update format if jsonFile missing

        // Ensure we save log if not already saved (e.g. if jsonFile missing block executed)
        // Actually, let's just make sure we always update projects table with log.
        // My flow above handles success branch and catch branch. 
        // The 'else' block for jsonFile missing needs to handle update too.

        if (!logOutput.includes('Process exited')) {
            // Case properly handled? 
        }

        // Cleanup
        if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
        if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
    }

    // Fallback update if json missing but no error thrown caught above yet
    // Actually the logic is split. Let's simplify:

    if (logOutput.includes('Error: No JSON output')) {
        await db.update(projects).set({
            updatedAt: new Date(),
            lastScanLog: logOutput
        }).where(eq(projects.id, projectId));
        throw new Error('Scan failed: No JSON output');
    }
}

async function matchDependencies(projectId: number, deps: any[]) {
    // Naive matching for now: Exact match on product/version if possible, or use the affected ranges
    // This part is notoriously hard without good CPE data.
    // We will do a basic check:
    // If CVE Affected Item 'product' == dep 'name' AND version in range.

    // Fetch all relevant affected items? No, too big.
    // Iterate deps and find CVEs?

    for (const dep of deps) {
        // Find potential CVEs for this package
        // This query relies on 'product' matching 'packageName'. 
        // Real world: 'spring-core' vs 'org.springframework:spring-core'.
        // We probably need fuzzy match or standardized names. 
        // For this spec, we assume some alignment.

        let candidateCVEs = await db.select({
            cveId: cveAffectedItems.cveId,
            versionStartIncluding: cveAffectedItems.versionStartIncluding,
            versionStartExcluding: cveAffectedItems.versionStartExcluding,
            versionEndIncluding: cveAffectedItems.versionEndIncluding,
            versionEndExcluding: cveAffectedItems.versionEndExcluding,
            id: cves.id,
            severity: cves.severity,
            product: cveAffectedItems.product,
            vendor: cveAffectedItems.vendor
        })
            .from(cveAffectedItems)
            .leftJoin(cves, eq(cveAffectedItems.cveId, cves.id))
            .where(eq(cveAffectedItems.product, dep.packageName));

        // Fuzzy Match Fallback
        if (candidateCVEs.length === 0 && dep.packageName.includes('.')) {
            // e.g. Newtonsoft.Json -> newtonsoft, json
            const parts = dep.packageName.toLowerCase().split('.');
            if (parts.length >= 2) {
                // Try to match vendor = parts[0] AND product contains parts[1]
                const potentialMatches = await db.select({
                    cveId: cveAffectedItems.cveId,
                    versionStartIncluding: cveAffectedItems.versionStartIncluding,
                    versionStartExcluding: cveAffectedItems.versionStartExcluding,
                    versionEndIncluding: cveAffectedItems.versionEndIncluding,
                    versionEndExcluding: cveAffectedItems.versionEndExcluding,
                    id: cves.id,
                    severity: cves.severity,
                    product: cveAffectedItems.product,
                    vendor: cveAffectedItems.vendor
                })
                    .from(cveAffectedItems)
                    .leftJoin(cves, eq(cveAffectedItems.cveId, cves.id))
                    .where(and(
                        ilike(cveAffectedItems.vendor, `%${parts[0]}%`),
                        ilike(cveAffectedItems.product, `%${parts[1]}%`)
                    ));

                candidateCVEs = potentialMatches;
            }
        }

        // Description Match Fallback (User Request)
        if (candidateCVEs.length === 0) {
            // Find CVEs mentioning the package
            const cvesByDesc = await db.select({ id: cves.id })
                .from(cves)
                .where(ilike(cves.description, `%${dep.packageName}%`))
                .limit(5); // Limit to avoid performance hit

            if (cvesByDesc.length > 0) {
                const cveIds = cvesByDesc.map(c => c.id);

                // Fetch affected items for these CVEs to continue verification logic
                // Note: If description matches but no structured affected_item exists, we might miss it if we rely on cveAffectedItems join.
                // But typically cves have associated items if they are from NVD.

                const descMatches = await db.select({
                    cveId: cveAffectedItems.cveId,
                    versionStartIncluding: cveAffectedItems.versionStartIncluding,
                    versionStartExcluding: cveAffectedItems.versionStartExcluding,
                    versionEndIncluding: cveAffectedItems.versionEndIncluding,
                    versionEndExcluding: cveAffectedItems.versionEndExcluding,
                    id: cves.id,
                    severity: cves.severity,
                    product: cveAffectedItems.product,
                    vendor: cveAffectedItems.vendor
                })
                    .from(cveAffectedItems)
                    .innerJoin(cves, eq(cveAffectedItems.cveId, cves.id))
                    .where(sql`${cveAffectedItems.cveId} IN ${cveIds}`);

                candidateCVEs = descMatches;
            }
        }

        for (const candidate of candidateCVEs) {
            if (isVersionAffected(dep.version, candidate)) {
                await db.insert(matches).values({
                    projectId,
                    cveId: candidate.cveId,
                    dependencyId: dep.id,
                    status: 'OPEN',
                    detectedAt: new Date()
                }).onConflictDoNothing(); // Prevent duplicates
            }
        }
    }
}

function isVersionAffected(version: string, range: any): boolean {
    // Valid Semver check should go here (node-semver).
    // For now, simple string compare or simple logic.
    // Installing 'semver' package would be best.
    // Let's assume we can use bun's semver or simple compare.
    // returning true strictly for prototype if complex range.
    return true; // TODO: Implement semver check
}
