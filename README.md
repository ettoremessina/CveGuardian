# CveGuardian

**CveGuardian** is a comprehensive, real-time CVE (Common Vulnerabilities and Exposures) monitoring and management system. It empowers developers and security teams to proactively track, analyze, and mitigate vulnerabilities within their software projects.

## Purpose

The primary goal of CveGuardian is to provide visibility into the security posture of your applications. By integrating dependency scanning directly into a centralized dashboard, it allows you to:
- **Track Projects**: Monitor multiple repositories from a single view.
- **Scan Dependencies**: Automatically detect vulnerabilities using the underlying scanning engine.
- **Analyze Impacts**: Quickly identify which projects are affected by specific CVEs.
- **Visualize Risk**: Get a high-level overview of critical alerts and compromised projects.

## Project Structure

This repository is a **Bun Monorepo** containing the following workspaces:

- **[Web Application](apps/web/README.md)**: The React-based frontend dashboard.
- **[API Server](apps/api/README.md)**: The Hono-based backend handling business logic and scanning.
- **[Fetcher Service](apps/fetcher/README.md)**: Background worker for syncing NVD data.
- **[Core Library](packages/core/README.md)**: Shared database schemas and utilities.

## Prerequisites

### DepScanity
This project relies on **DepScanity** for dependency analysis.
The `DepScanity` executable is **voluntary and not committed** to this repository.

To run scans effectively, you must compile it manually:
1.  Clone the source from: [https://github.com/ettoremessina/DepScanity](https://github.com/ettoremessina/DepScanity)
2.  Compile the project (refer to the DepScanity repository for instructions).
3.  Place the compiled executable in `tools/DepScanity/`.

## Configuration

This project uses environment variables for configuration.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` and fill in your secrets (Database URL, API Keys, etc.).


