import { Hono } from 'hono';
import { db, cves, projects, matches } from '@cve-guardian/core';
import { sql, eq, gt } from 'drizzle-orm';

export const statsRoute = new Hono();

statsRoute.get('/', async (c) => {
    try {
        const [cveCount] = await db.select({ count: sql<number>`count(*)` }).from(cves);
        const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);

        // Projects with at least 1 vulnerability
        const [compromisedCount] = await db.select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(gt(projects.vulnerabilityCount, 0));

        // Critical matches (where CVE severity is CRITICAL)
        const [criticalCount] = await db.select({ count: sql<number>`count(*)` })
            .from(matches)
            .innerJoin(cves, eq(matches.cveId, cves.id))
            .where(eq(cves.severity, 'CRITICAL'));

        const [highCount] = await db.select({ count: sql<number>`count(*)` })
            .from(matches)
            .innerJoin(cves, eq(matches.cveId, cves.id))
            .where(eq(cves.severity, 'HIGH'));

        const [mediumCount] = await db.select({ count: sql<number>`count(*)` })
            .from(matches)
            .innerJoin(cves, eq(matches.cveId, cves.id))
            .where(eq(cves.severity, 'MEDIUM'));

        return c.json({
            totalCves: Number(cveCount.count),
            activeProjects: Number(projectCount.count),
            compromisedProjects: Number(compromisedCount.count),
            criticalAlerts: Number(criticalCount.count),
            highAlerts: Number(highCount.count),
            mediumAlerts: Number(mediumCount.count)
        });
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to fetch stats' }, 500);
    }
});
