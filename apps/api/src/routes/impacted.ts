import { Hono } from 'hono';
import { db, matches, projects, cves } from '@cve-guardian/core';
import { eq, desc, ilike } from 'drizzle-orm';

export const impactedRoute = new Hono();

impactedRoute.get('/', async (c) => {
    // Return all matches extended with Project and CVE info
    const baseQuery = db.select({
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
        .innerJoin(cves, eq(matches.cveId, cves.id));

    const params = c.req.query();
    let query = baseQuery;

    if (params.projectId && params.projectId !== 'all') {
        const pid = parseInt(params.projectId);
        if (!isNaN(pid)) {
            query = query.where(eq(matches.projectId, pid));
        }
    }

    if (params.cveId) {
        query = query.where(ilike(cves.id, `%${params.cveId}%`));
    }

    if (params.severity) {
        query = query.where(eq(cves.severity, params.severity));
    }

    const results = await query.orderBy(desc(matches.detectedAt));

    return c.json(results);
});
