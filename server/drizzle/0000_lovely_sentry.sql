CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"license_number" text NOT NULL,
	"license_expiry" timestamp with time zone NOT NULL,
	"joining_date" timestamp with time zone NOT NULL,
	"phone" text NOT NULL,
	"emergency_contact" text NOT NULL,
	"blood_group" text,
	"safety_score" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"experience_years" integer,
	"availability_status" text DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "driver_profiles_license_number_unique" UNIQUE("license_number"),
	CONSTRAINT "phone_length_check" CHECK (char_length("driver_profiles"."phone") <= 10),
	CONSTRAINT "phone_digits_check" CHECK ("driver_profiles"."phone" ~ '^[0-9]+$'),
	CONSTRAINT "license_num_len_check" CHECK (char_length("driver_profiles"."license_number") >= 5),
	CONSTRAINT "safety_score_range" CHECK ("driver_profiles"."safety_score" >= 0.00 AND "driver_profiles"."safety_score" <= 100.00),
	CONSTRAINT "experience_years_check" CHECK ("driver_profiles"."experience_years" >= 0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid,
	"vehicle_id" uuid NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"receipt" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expense_amount_check" CHECK ("expenses"."amount" > 0.00)
);
--> statement-breakpoint
CREATE TABLE "fuel_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"litres" numeric(10, 2) NOT NULL,
	"price_per_litre" numeric(10, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"station_name" text NOT NULL,
	"odometer" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "litres_check" CHECK ("fuel_logs"."litres" > 0.00),
	CONSTRAINT "price_check" CHECK ("fuel_logs"."price_per_litre" > 0.00),
	CONSTRAINT "total_cost_check" CHECK ("fuel_logs"."total_cost" >= 0.00),
	CONSTRAINT "fuel_odometer_check" CHECK ("fuel_logs"."odometer" >= 0.00)
);
--> statement-breakpoint
CREATE TABLE "maintenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"maintenance_type" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"service_center" text,
	"scheduled_date" timestamp with time zone NOT NULL,
	"completed_date" timestamp with time zone,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "maintenance_cost_check" CHECK ("maintenance"."cost" >= 0.00)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_number" text NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"cargo_name" text NOT NULL,
	"cargo_weight" numeric(10, 2) NOT NULL,
	"distance_km" numeric(10, 2) NOT NULL,
	"planned_start" timestamp with time zone NOT NULL,
	"planned_end" timestamp with time zone NOT NULL,
	"actual_start" timestamp with time zone,
	"actual_end" timestamp with time zone,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_trip_number_unique" UNIQUE("trip_number"),
	CONSTRAINT "cargo_weight_check" CHECK ("trips"."cargo_weight" > 0.00),
	CONSTRAINT "distance_check" CHECK ("trips"."distance_km" > 0.00)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" text NOT NULL,
	"vehicle_number" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"manufacture_year" integer NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"fuel_type" text NOT NULL,
	"current_odometer" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"purchase_date" timestamp with time zone NOT NULL,
	"insurance_expiry" timestamp with time zone NOT NULL,
	"pollution_expiry" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "manufacture_year_check" CHECK ("vehicles"."manufacture_year" >= 1900 AND "vehicles"."manufacture_year" <= 2100),
	CONSTRAINT "capacity_check" CHECK ("vehicles"."capacity_kg" > 0.00),
	CONSTRAINT "odometer_check" CHECK ("vehicles"."current_odometer" >= 0.00)
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "driver_profiles_user_id_idx" ON "driver_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "driver_profiles_license_num_idx" ON "driver_profiles" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "driver_profiles_availability_idx" ON "driver_profiles" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "expenses_trip_id_idx" ON "expenses" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "expenses_vehicle_id_idx" ON "expenses" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "fuel_logs_trip_id_idx" ON "fuel_logs" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "fuel_logs_vehicle_id_idx" ON "fuel_logs" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "fuel_logs_driver_id_idx" ON "fuel_logs" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "maintenance_vehicle_id_idx" ON "maintenance" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "maintenance_status_idx" ON "maintenance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_number_idx" ON "trips" USING btree ("trip_number");--> statement-breakpoint
CREATE INDEX "trips_vehicle_id_idx" ON "trips" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trips_driver_id_idx" ON "trips" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "trips_status_idx" ON "trips" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_deleted_idx" ON "users" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "vehicles_reg_number_idx" ON "vehicles" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "vehicles_status_idx" ON "vehicles" USING btree ("status");