CREATE TABLE IF NOT EXISTS "register" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "register_email_unique" UNIQUE("email"),
	CONSTRAINT "register_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "link_laganto" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "register" ADD CONSTRAINT "register_user_id_account_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."account"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
