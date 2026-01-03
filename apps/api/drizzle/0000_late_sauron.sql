CREATE TABLE "cve_affected_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cve_id" text NOT NULL,
	"vendor" text,
	"product" text,
	"version_start_including" text,
	"version_start_excluding" text,
	"version_end_including" text,
	"version_end_excluding" text,
	"cpe" text
);
--> statement-breakpoint
CREATE TABLE "cves" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text,
	"severity" text,
	"score" integer,
	"cvss_score" text,
	"published_at" timestamp,
	"last_modified_at" timestamp,
	"source_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"cve_id" text NOT NULL,
	"dependency_id" integer,
	"status" text DEFAULT 'OPEN',
	"notes" text,
	"detected_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"package_name" text NOT NULL,
	"version" text NOT NULL,
	"ecosystem" text NOT NULL,
	"is_dev" boolean DEFAULT false,
	"is_transitive" boolean DEFAULT false,
	"parent_path" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"repo_url" text NOT NULL,
	"branch" text DEFAULT 'main' NOT NULL,
	"description" text,
	"last_scan_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cve_affected_items" ADD CONSTRAINT "cve_affected_items_cve_id_cves_id_fk" FOREIGN KEY ("cve_id") REFERENCES "public"."cves"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_cve_id_cves_id_fk" FOREIGN KEY ("cve_id") REFERENCES "public"."cves"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_dependency_id_project_dependencies_id_fk" FOREIGN KEY ("dependency_id") REFERENCES "public"."project_dependencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dependencies" ADD CONSTRAINT "project_dependencies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;