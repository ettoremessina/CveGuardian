import './env'; // MUST BE FIRST
import cron from 'node-cron';
import { fetchCVEs, processAndStoreCVEs } from './nvd';
import { db, cves } from '@cve-guardian/core';
import { sql } from 'drizzle-orm';

async function syncNVD() {
    console.log('Starting NVD Sync...');
    let startIndex = 0;
    let totalResults = 0;

    // Determine if we do incremental or full
    const lastUpdateResult = await db.select({ maxDate: sql<Date>`max(${cves.lastModifiedAt})` }).from(cves);
    const lastUpdate = lastUpdateResult[0]?.maxDate;

    // Ensure it is a Date object (Postgres driver might return string for aggregation)
    let lastModStartDate: Date | undefined = lastUpdate ? new Date(lastUpdate) : undefined;
    if (lastModStartDate && isNaN(lastModStartDate.getTime())) {
        lastModStartDate = undefined;
    }

    const NVD_MAX_WINDOW_DAYS = 120;
    if (!lastModStartDate) {
        console.log('No existing CVEs found. Performing full initial sync.');
    } else {
        const diffDays = (new Date().getTime() - lastModStartDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > NVD_MAX_WINDOW_DAYS) {
            console.warn('Last update > 120 days. Resetting to full sync logic or need batched dated queries.');
            lastModStartDate = new Date(Date.now() - (NVD_MAX_WINDOW_DAYS * 24 * 60 * 60 * 1000));
        }
        console.log(`Incremental sync from: ${lastModStartDate.toISOString()}`);
    }

    try {
        do {
            await new Promise(r => setTimeout(r, 6000));

            const data = await fetchCVEs(startIndex, lastModStartDate);
            totalResults = data.totalResults;
            const vulnerabilities = data.vulnerabilities;

            if (!vulnerabilities || vulnerabilities.length === 0) break;

            await processAndStoreCVEs(vulnerabilities);

            startIndex += vulnerabilities.length;
            console.log(`Synced ${startIndex} / ${totalResults}`);

        } while (startIndex < totalResults);

        console.log('NVD Sync Completed.');

    } catch (e) {
        console.error('NVD Sync Failed:', e);
    }
}

// Run immediately on startup
syncNVD();

// Schedule every 2 hours
cron.schedule('0 */2 * * *', () => {
    syncNVD();
});
