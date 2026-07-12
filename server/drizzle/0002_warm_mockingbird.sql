ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_image" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_email_format_check" CHECK ("users"."email" ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_phone_length_check" CHECK ("users"."phone" IS NULL OR char_length("users"."phone") <= 10);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_phone_digits_check" CHECK ("users"."phone" IS NULL OR "users"."phone" ~ '^[0-9]+$');