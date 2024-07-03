CREATE TABLE IF NOT EXISTS "test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book" DROP CONSTRAINT "book_author_id_account_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_author_id_account_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."account"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
