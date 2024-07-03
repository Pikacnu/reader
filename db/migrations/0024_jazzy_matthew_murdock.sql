ALTER TABLE "booklist_book" DROP CONSTRAINT "booklist_book_book_id_book_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_book" ADD CONSTRAINT "booklist_book_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
