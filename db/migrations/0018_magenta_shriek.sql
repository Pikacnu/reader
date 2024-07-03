ALTER TABLE "booklist_book" DROP CONSTRAINT "booklist_book_booklist_id_booklist_id_fk";
--> statement-breakpoint
ALTER TABLE "booklist_follower" DROP CONSTRAINT "booklist_follower_booklist_id_booklist_id_fk";
--> statement-breakpoint
ALTER TABLE "register" DROP CONSTRAINT "register_user_id_account_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_book" ADD CONSTRAINT "booklist_book_booklist_id_booklist_id_fk" FOREIGN KEY ("booklist_id") REFERENCES "public"."booklist"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_follower" ADD CONSTRAINT "booklist_follower_booklist_id_booklist_id_fk" FOREIGN KEY ("booklist_id") REFERENCES "public"."booklist"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "register" DROP COLUMN IF EXISTS "user_id";