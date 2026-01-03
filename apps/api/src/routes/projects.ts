import { Hono } from 'hono';
import { db, projects } from '@cve-guardian/core';
import { eq, desc } from 'drizzle-orm';
import { scanProject } from '../services/scanner';

export const projectsRoute = new Hono();

// GET /projects
projectsRoute.get('/', async (c) => {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return c.json(allProjects);
});

// POST /projects
projectsRoute.post('/', async (c) => {
    const body = await c.req.json();
    const { name, repoUrl, branch } = body;

    const result = await db.insert(projects).values({
        name,
        repoUrl,
        branch: branch || 'main',
    }).returning();

    return c.json(result[0], 201);
});

// PUT /projects/:id
projectsRoute.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    const result = await db.update(projects).set({
        ...body,
        updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning();

    return c.json(result[0]);
});

// DELETE /projects/:id
projectsRoute.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await db.delete(projects).where(eq(projects.id, id));
    return c.json({ success: true });
});

// POST /projects/:id/scan
projectsRoute.post('/:id/scan', async (c) => {
    const id = Number(c.req.param('id'));

    // Trigger scan asynchronously or await?
    // Spec says "Real-time" but scans are slow. 
    // For web UI responsiveness, we usually return Accepted, but logic often simpler if we await.
    // We will await for the prototype.

    try {
        await scanProject(id);
        const updated = await db.select().from(projects).where(eq(projects.id, id));
        return c.json({ success: true, project: updated[0] });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// GET /projects/:id/dependencies
projectsRoute.get('/:id/dependencies', async (c) => {
    const id = Number(c.req.param('id'));
    const { projectDependencies } = await import('@cve-guardian/core');
    const { eq } = await import('drizzle-orm');

    const deps = await db.select().from(projectDependencies).where(eq(projectDependencies.projectId, id));
    return c.json(deps);
});
