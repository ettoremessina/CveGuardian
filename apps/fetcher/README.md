# CveGuardian Fetcher

Background service for synchronizing CVE data.

## Purpose
The **Fetcher** is responsibly for keeping the local vulnerability database up-to-date.
- **NVD Synchronization**: Periodically fetches new and updated CVEs from the National Vulnerability Database.
- **Scheduled Jobs**: Runs as a cron/interval job to ensure real-time accuracy of vulnerability data.
