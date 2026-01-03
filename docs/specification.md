# CveGuardian - Functional & Technical Specification

## Project Overview

**CveGuardian** is a real-time CVE (Common Vulnerabilities and Exposures) monitoring system designed for software houses. It continuously monitors multiple CVE databases, correlates CVEs with project dependencies, and provides a web dashboard for vulnerability management.

The focus of the program is to cross the CVEs with the dependencies of the projects and to provide a web dashboard for vulnerability management of the projects.

It is written in Bun and the database is Postgres.

The program is divided in three parts:

1. The CVE Fetcher, that downloads the CVEs from the NVD API and stores them in the database.
2. The API server, that provides the API for the web dashboard.
3. The web dashboard, that provides the web interface for the user.

Common server side code must stay in a reusable library, to be shared between the API server and the CVE Fetcher.

Dependencies must be fetched from the projects using the scanner DepScanity (see README.md in https://github.com/ettoremessina/DepScanity to have the usage). The binarty executable is in the repository, in the folder "tools/DepScanity".

Sources of the projects are get via git clone, in a temporary folder defined in settings.

---

## 1. Functional Specification

**F1: Multi-Source CVE Fetching**
- Periodically poll NVD API (NIST National Vulnerability Database); 2 hours interval by default
- Incremental fetching using last modification timestamps
- Automatic deduplication of CVEs (code must be ready to mange CVEs from different sources in the future)
- Rate limiting and retry logic with exponential backoff

**F2: CVE Data Management**
- Normalize CVE data from different sources into unified schema (code must be ready to mange CVEs from different sources in the future)
- Store CVE metadata: ID, severity, CVSS score, affected packages, descriptions
- Track CVE lifecycle: first seen date, last updated date
- Maintain relationship between CVEs and affected package versions
- Store references and external links

**F3: Project Dependency Scanning**
- Scan project repositories for dependency files using DepScanity
- For each project, git repo and branch to use must be mandatory data of the project
- git clone must be done in a temporary folder defined in settings
- git credentials must be taken from the environment variables; this program must consider that git clone should be done with the credentials of the user that is running the program.
- Build complete dependency graph including transitive dependencies
- Store inventory of all dependencies (direct vs transitive) across all projects

**F4: CVE-to-Project Matching**
- Automatically match incoming CVEs against stored project dependencies
- Perform semantic version range checking
- Calculate impact score based on:
  - CVSS severity score
  - Whether dependency is direct or transitive
  - Project criticality
- Flag exploitable vulnerabilities

**F5: Web Dashboard**
- A left menu with 3 features:
    - CVEs
    - Projects
    - Impacts

- CVEs feature
    displays all CVEs in sortable/filterable table
    show detailed CVE information with affected packages
    filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
    filter by date range
    filter by package ecosystem

- Project feature:
    displays all projects in sortable/filterable table
    allow to add, edit and delete projects
    allow to run scan on a project
    show the last scan results

- Impacts feature:
    displays all projects impacted by each CVE in sortable/filterable table
    filter projects by CVE
    filter projects by severity (CRITICAL, HIGH, MEDIUM, LOW)
    filter projects by date range


## 2. Technical Specification

**CVE Fetcher:**
- Framework: Bun
- Language: TypeScript
- Database: Postgres 

**Backend:**
- Framework: Bun
- Language: TypeScript
- Database: Postgres 

**Frontend:**
- Framework: Bun
- Language: TypeScript

**Database:**
- Engine: Postgres
- Credentials: written in .env file
- Migration: must stay in API server and not in CVE Fetcher (that should not have any database migration code)

## 3. Instruction for Code Agent
** MCP code agent **
- use context7

## 4. Source management
- use git for source code management
- create and keep updated .gitignore file
---

## 5. Future Enhancements (do NOT implement now)

### CVE Fetcher:
- Poll GitHub Advisory Database
- Poll OSV (Open Source Vulnerabilities)
