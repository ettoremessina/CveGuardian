ALTER TABLE "matches" DROP CONSTRAINT "matches_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_dependency_id_project_dependencies_id_fk";
--> statement-breakpoint
ALTER TABLE "project_dependencies" DROP CONSTRAINT "project_dependencies_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_scan_log" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vulnerability_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_dependency_id_project_dependencies_id_fk" FOREIGN KEY ("dependency_id") REFERENCES "public"."project_dependencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dependencies" ADD CONSTRAINT "project_dependencies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_unique_constraint" UNIQUE("project_id","dependency_id","cve_id");