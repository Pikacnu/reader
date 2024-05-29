import { sql } from 'drizzle-orm';
import {
	boolean,
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	unique,
} from 'drizzle-orm/pg-core';

export const account = pgTable('account', {
	id: serial('user_id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	link_avatar: text('link_avatar').notNull(),
	permissions: text('permissions', { enum: ['admin', 'user'] }).default('user'),
	about_me: text('about_me').default(''),
	link_discord: boolean('link_discord').default(false),
	link_google: boolean('link_google').default(false),
	link_github: boolean('link_github').default(false),
});

export const book = pgTable('book', {
	id: serial('id').primaryKey(),
	author_id: serial('author_id').references(() => account.id),
	title: text('title').default('Untitled'),
	cover: text('cover'),
	description: text('description').default('No description available'),
	tags: text('tags')
		.array()
		.default(sql`ARRAY[]::text[]`),
	allow_comments: boolean('allow_comments').default(true),
	published: boolean('published').default(false),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
	update_at: timestamp('update_at', { withTimezone: false }).defaultNow(),
});

export const chapter = pgTable(
	'chapter',
	{
		id: serial('id').primaryKey(),
		book_id: serial('book_id').references(() => book.id),
		title: text('title').default('Untitled'),
		content: text('content')
			.array()
			.default(sql`ARRAY[]::text[]`),
		chapter_id: integer('chapter_id').default(0),
	},
	(table) => ({
		unq: unique().on(table.book_id, table.chapter_id),
	}),
);

export const comment = pgTable('comment', {
	id: serial('id').primaryKey(),
	book_id: serial('book_id').references(() => book.id),
	user_id: serial('user_id').references(() => account.id),
	content: text('content').default(''),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
	update_at: timestamp('update_at', { withTimezone: false }).defaultNow(),
});

export const like = pgTable('like', {
	id: serial('id').primaryKey(),
	book_id: serial('book_id').references(() => book.id),
	user_id: serial('user_id').references(() => account.id),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

export const follow = pgTable('follow', {
	id: serial('id').primaryKey(),
	follower_id: serial('follower_id').references(() => account.id),
	following_id: serial('following_id').references(() => account.id),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

export const history = pgTable(
	'history',
	{
		id: serial('id').primaryKey(),
		book_id: serial('book_id').references(() => book.id),
		user_id: serial('user_id').references(() => account.id),
		chapter: integer('chapter').default(0),
		page: integer('page').default(0),
		created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
	},
	(table) => ({
		unq: unique().on(table.book_id, table.user_id),
	}),
);

export const reader_setting = pgTable('reader_setting', {
	id: serial('id').primaryKey(),
	user_id: serial('user_id').references(() => account.id),
	text_direction: text('text_direction', { enum: ['ltr', 'rtl'] }).default(
		'ltr',
	),
	background_color: text('background_color').default('#ffffff'),
	font_size: integer('font_size').default(16),
	text_leading: integer('text_leading').default(2),
});
