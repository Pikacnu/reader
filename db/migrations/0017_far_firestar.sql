ALTER TABLE "register" RENAME COLUMN "token" TO "password";--> statement-breakpoint
ALTER TABLE "register" DROP CONSTRAINT "register_token_unique";--> statement-breakpoint
ALTER TABLE "register" ADD CONSTRAINT "register_password_unique" UNIQUE("password");