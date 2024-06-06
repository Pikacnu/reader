CREATE TABLE IF NOT EXISTS "booklist_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"booklist_id" integer,
	"book_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_book" ADD CONSTRAINT "booklist_book_booklist_id_booklist_id_fk" FOREIGN KEY ("booklist_id") REFERENCES "public"."booklist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist_book" ADD CONSTRAINT "booklist_book_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "booklist" DROP COLUMN IF EXISTS "book_id";