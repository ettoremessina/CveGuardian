import { Hono } from 'hono';
import { db, matches, projects, cves } from '@cve-guardian/core';
import { eq, desc } from 'drizzle-orm';

export const impactedRoute = new Hono();

impactedRoute.get('/', async (c) => {
    // Return all matches extended with Project and CVE info
    const results = await db.select({
        matchId: matches.id,
        projectId: projects.id,
        projectName: projects.name,
        cveId: cves.id,
        severity: cves.severity,
        status: matches.status,
        detectedAt: matches.detectedAt
    })
        .from(matches)
        .innerJoin(projects, eq(matches.projectId, projects.id))
        .innerJoin(cves, eq(matches.cveId, cves.id))
        .orderBy(desc(matches.detectedAt));

    return c.json(results);
});
