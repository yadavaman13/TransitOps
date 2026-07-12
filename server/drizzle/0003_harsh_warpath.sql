ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_role_check" CHECK ("users"."role" IN ('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'USER', 'ADMIN'));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_status_check" CHECK ("users"."status" IN ('ACTIVE', 'INACTIVE'));