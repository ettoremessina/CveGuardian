import { pgTable, serial, text, timestamp, boolean, integer, jsonb, primaryKey, unique } from 'drizzle-orm/pg-core';

// Projects Table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  repoUrl: text('repo_url').notNull(),
  branch: text('branch').notNull().default('main'),
  description: text('description'),
  lastScanAt: timestamp('last_scan_at'),
  lastScanLog: text('last_scan_log'),
  vulnerabilityCount: integer('vulnerability_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vulnerabilities (CVEs) Table
export const cves = pgTable('cves', {
  id: text('id').primaryKey(), // CVE-YYYY-NNNN
  description: text('description'),
  severity: text('severity'), // CRITICAL, HIGH, MEDIUM, LOW
  score: integer('score'), // Scaled x10 maybe? or float stored as text? float is better or numeric. Let's use real/double? Drizzle has exact types.
  // Actually, NVD gives CVSS v3.1 score (0.0 - 10.0). `real` is fine.
  cvssScore: text('cvss_score'), // Storing as text to preserve precision if needed, or convert to number at runtime.
  publishedAt: timestamp('published_at'),
  lastModifiedAt: timestamp('last_modified_at'),
  sourceData: jsonb('source_data'), // Full JSON from NVD
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// CPEs or Affected Packages (Normalized) - Simplified for this spec
// The spec says "Maintain relationship between CVEs and affected package versions"
// We will store "AffectedItems" which links CVE to a Package/Product + Version Range.
export const cveAffectedItems = pgTable('cve_affected_items', {
  id: serial('id').primaryKey(),
  cveId: text('cve_id').references(() => cves.id).notNull(),
  vendor: text('vendor'),
  product: text('product'),
  versionStartIncluding: text('version_start_including'),
  versionStartExcluding: text('version_start_excluding'),
  versionEndIncluding: text('version_end_including'),
  versionEndExcluding: text('version_end_excluding'),
  cpe: text('cpe'),
});

// Dependencies found in Projects
export const projectDependencies = pgTable('project_dependencies', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  packageName: text('package_name').notNull(),
  version: text('version').notNull(),
  ecosystem: text('ecosystem').notNull(), // npm, pip, go, etc.
  isDev: boolean('is_dev').default(false),
  isTransitive: boolean('is_transitive').default(false),
  parentScroll: text('parent_path'), // Path in dependency tree if useful
  createdAt: timestamp('created_at').defaultNow(),
});

// Analysis Results (Matches)
// Links Project to CVE via Dependency
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  cveId: text('cve_id').references(() => cves.id).notNull(),
  dependencyId: integer('dependency_id').references(() => projectDependencies.id, { onDelete: 'cascade' }),
  status: text('status').default('OPEN'), // OPEN, ACKNOWLEDGED, IGNORED
  notes: text('notes'),
  detectedAt: timestamp('detected_at').defaultNow(),
}, (t) => ({
  unq: unique('matches_unique_constraint').on(t.projectId, t.dependencyId, t.cveId),
}));
