import './env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { projectsRoute } from './routes/projects';
import { cvesRoute } from './routes/cves';
import { impactedRoute } from './routes/impacted';
import { statsRoute } from './routes/stats';

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => c.text('CveGuardian API is Running'));

app.route('/projects', projectsRoute);
app.route('/cves', cvesRoute);
app.route('/impacted-projects', impactedRoute);
app.route('/stats', statsRoute);

export default {
    port: 3000,
    fetch: app.fetch,
};

