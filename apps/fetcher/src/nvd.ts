import axios from 'axios';
import { db, cves, cveAffectedItems } from '@cve-guardian/core';
import { eq, sql } from 'drizzle-orm';

const NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const API_KEY = process.env.NVD_API_KEY;

export async function fetchCVEs(startIndex = 0, lastModStartDate?: Date) {
    const params: any = {
        startIndex,
        resultsPerPage: 2000, // Max allowed
    };

    if (lastModStartDate) {
        // NVD requires a specific format/window. For simplicity, we'll just use the provided date strictly.
        // Spec says "Incremental fetching using last modification timestamps"
        // Note: NVD API requires both start and end date if start is provided, and max range is 120 days.
        // For this implementation, we will fetch last 2 hours if incremental, or catch up if needed.
        // If it's a fresh run, we might need a different strategy (full sync is heavy).
        // Let's assume we pass dates if we have them.
        params.lastModStartDate = lastModStartDate.toISOString();
        params.lastModEndDate = new Date().toISOString();
    }

    const headers: any = {};
    if (API_KEY) {
        headers['apiKey'] = API_KEY;
    }

    try {
        console.log(`Fetching from NVD... StartIndex: ${startIndex}`);
        const response = await axios.get(NVD_API_URL, { params, headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching from NVD:', error);
        // Simple retry logic could go here or in the caller
        throw error;
    }
}

export async function processAndStoreCVEs(vulnerabilities: any[]) {
    console.log(`Processing ${vulnerabilities.length} CVEs...`);

    for (const item of vulnerabilities) {
        const cveData = item.cve;
        const cveId = cveData.id;
        const descriptions = cveData.descriptions || [];
        const description = descriptions.find((d: any) => d.lang === 'en')?.value || 'No description available';

        // Metrics
        const metrics = cveData.metrics || {};
        // Try V3.1, then V3.0, then V2.0
        const cvssData = metrics.cvssMetricV31?.[0]?.cvssData ||
            metrics.cvssMetricV30?.[0]?.cvssData ||
            metrics.cvssMetricV2?.[0]?.cvssData;

        const score = cvssData ? cvssData.baseScore : null;
        const severity = cvssData ? cvssData.baseSeverity : (metrics.cvssMetricV2?.[0]?.baseSeverity || 'UNKNOWN');

        // Upsert CVE
        await db.insert(cves).values({
            id: cveId,
            description,
            severity,
            cvssScore: score ? String(score) : null,
            publishedAt: new Date(cveData.published),
            lastModifiedAt: new Date(cveData.lastModified),
            sourceData: cveData,
        })
            .onConflictDoUpdate({
                target: cves.id,
                set: {
                    description,
                    severity,
                    cvssScore: score ? String(score) : null,
                    lastModifiedAt: new Date(cveData.lastModified),
                    sourceData: cveData,
                    updatedAt: new Date(),
                }
            });

        // Process Configurations for Affected Items
        // This is complex NVD logic (nodes -> cpeMatch). Simplified for this implementation.
        // We will clean up old items first (handling updates is tricky without precise diffing, full replace is safer for consistency)
        await db.delete(cveAffectedItems).where(eq(cveAffectedItems.cveId, cveId));

        if (cveData.configurations) {
            for (const config of cveData.configurations) {
                if (config.nodes) {
                    for (const node of config.nodes) {
                        if (node.cpeMatch) {
                            for (const match of node.cpeMatch) {
                                if (match.vulnerable) {
                                    // Extract Vendor/Product from CPE
                                    // CPE 2.3 format: cpe:2.3:part:vendor:product:version:update:edition:language:sw_edition:target_sw:target_hw:other
                                    const parts = match.criteria.split(':');
                                    const vendor = parts[3];
                                    const product = parts[4];

                                    await db.insert(cveAffectedItems).values({
                                        cveId,
                                        cpe: match.criteria,
                                        vendor,
                                        product,
                                        versionStartIncluding: match.versionStartIncluding,
                                        versionStartExcluding: match.versionStartExcluding,
                                        versionEndIncluding: match.versionEndIncluding,
                                        versionEndExcluding: match.versionEndExcluding
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
