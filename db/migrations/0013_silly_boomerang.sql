CREATE TABLE IF NOT EXISTS "booklist_follower" (
	"id" serial PRIMARY KEY NOT NULL,
	"booklist_id" integer,
	"follower_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_follower" ADD CONSTRAINT "booklist_follower_booklist_id_booklist_id_fk" FOREIGN KEY ("booklist_id") REFERENCES "public"."booklist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_follower" ADD CONSTRAINT "booklist_follower_follower_id_account_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."account"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
