ALTER TABLE "booklist" DROP CONSTRAINT "booklist_user_id_account_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chapter" DROP CONSTRAINT "chapter_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "follow" DROP CONSTRAINT "follow_follower_id_account_user_id_fk";
--> statement-breakpoint
ALTER TABLE "history" DROP CONSTRAINT "history_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "like" DROP CONSTRAINT "like_book_id_book_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist" ADD CONSTRAINT "booklist_user_id_account_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."account"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter" ADD CONSTRAINT "chapter_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_account_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."account"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "like" ADD CONSTRAINT "like_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
