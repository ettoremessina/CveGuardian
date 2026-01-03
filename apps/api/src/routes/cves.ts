import { Hono } from 'hono';
import { db, cves } from '@cve-guardian/core';
import { desc, eq, sql, and, gte, ilike, count } from 'drizzle-orm';

export const cvesRoute = new Hono();

cvesRoute.get('/', async (c) => {
    const { severity, cveId, publishedAfter, page = '1', limit = '10' } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const filters = [];

    if (severity) {
        filters.push(eq(cves.severity, severity));
    }
    if (cveId) {
        filters.push(ilike(cves.id, `%${cveId}%`));
    }
    if (publishedAfter) {
        filters.push(gte(cves.publishedAt, new Date(publishedAfter)));
    }
    const { description } = c.req.query();
    if (description) {
        filters.push(ilike(cves.description, `%${description}%`));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const results = await db.select()
        .from(cves)
        .where(whereClause)
        .orderBy(desc(cves.publishedAt))
        .limit(limitNum)
        .offset(offset);

    const [totalResult] = await db.select({ count: count() })
        .from(cves)
        .where(whereClause);

    return c.json({
        data: results,
        meta: {
            total: totalResult.count,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalResult.count / limitNum)
        }
    });
});

cvesRoute.get('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.select().from(cves).where(eq(cves.id, id));
    if (!result.length) return c.json({ error: 'Not found' }, 404);
    return c.json(result[0]);
});
