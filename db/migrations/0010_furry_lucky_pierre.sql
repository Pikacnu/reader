CREATE TABLE IF NOT EXISTS "reader_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"text_direction" text DEFAULT 'ltr',
	"background_color" text DEFAULT '#ffffff',
	"font_size" integer DEFAULT 16,
	"text_leading" integer DEFAULT 2
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reader_setting" ADD CONSTRAINT "reader_setting_user_id_account_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."account"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
