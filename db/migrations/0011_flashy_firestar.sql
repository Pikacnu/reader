CREATE TABLE IF NOT EXISTS "booklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"book_id" text DEFAULT 'ARRAY[]::interger[]',
	"title" text DEFAULT 'Untitled',
	"public" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "author_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chapter" ALTER COLUMN "book_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "chapter" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "book_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "follow" ALTER COLUMN "follower_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "follow" ALTER COLUMN "follower_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "follow" ALTER COLUMN "following_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "follow" ALTER COLUMN "following_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "book_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "like" ALTER COLUMN "book_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "like" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "like" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "like" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reader_setting" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reader_setting" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booklist" ADD CONSTRAINT "booklist_user_id_account_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."account"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
