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
	link_laganto: boolean('link_laganto').default(false),
	system: boolean('system').default(false),
	password: text('password'),
});

export const register = pgTable('register', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	password: text('password').notNull().unique(),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

export const book = pgTable('book', {
	id: serial('id').primaryKey(),
	author_id: integer('author_id').references(() => account.id, {
		onDelete: 'cascade',
	}),
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
	cz_link: text('cz_link'),
});

export const chapter = pgTable(
	'chapter',
	{
		id: serial('id').primaryKey(),
		book_id: integer('book_id').references(() => book.id, {
			onDelete: 'cascade',
		}),
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
	book_id: integer('book_id').references(() => book.id, {
		onDelete: 'cascade',
	}),
	user_id: integer('user_id').references(() => account.id, {
		onDelete: 'cascade',
	}),
	content: text('content').default(''),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
	update_at: timestamp('update_at', { withTimezone: false }).defaultNow(),
});

export const like = pgTable('like', {
	id: serial('id').primaryKey(),
	book_id: integer('book_id').references(() => book.id, {
		onDelete: 'cascade',
	}),
	user_id: integer('user_id').references(() => account.id, {
		onDelete: 'cascade',
	}),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

export const follow = pgTable('follow', {
	id: serial('id').primaryKey(),
	follower_id: integer('follower_id').references(() => account.id, {
		onDelete: 'cascade',
	}),
	following_id: integer('following_id').references(() => account.id, {
		onDelete: 'cascade',
	}),
	created_at: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

export const history = pgTable(
	'history',
	{
		id: serial('id').primaryKey(),
		book_id: integer('book_id').references(() => book.id, {
			onDelete: 'cascade',
		}),
		user_id: integer('user_id').references(() => account.id, {
			onDelete: 'cascade',
		}),
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
	user_id: integer('user_id').references(() => account.id),
	text_direction: text('text_direction', { enum: ['ltr', 'rtl'] }).default(
		'ltr',
	),
	background_color: text('background_color').default('#ffffff'),
	font_size: integer('font_size').default(16),
	text_leading: integer('text_leading').default(2),
});

export const booklist = pgTable(
	'booklist',
	{
		id: serial('id').primaryKey(),
		creator_id: integer('user_id').references(() => account.id, {
			onDelete: 'cascade',
		}),
		title: text('title').default('Untitled'),
		public: boolean('public').default(false),
	},
	(table) => ({
		unq: unique().on(table.creator_id, table.title),
	}),
);

export const booklist_follower = pgTable('booklist_follower', {
	id: serial('id').primaryKey(),
	booklist_id: integer('booklist_id').references(() => booklist.id, {
		onDelete: 'cascade',
	}),
	follower_id: integer('follower_id').references(() => account.id),
});

export const booklist_book = pgTable(
	'booklist_book',
	{
		id: serial('id').primaryKey(),
		booklist_id: integer('booklist_id').references(() => booklist.id, {
			onDelete: 'cascade',
		}),
		book_id: integer('book_id').references(() => book.id, {
			onDelete: 'cascade',
		}),
	},
	(table) => ({
		unq: unique().on(table.booklist_id, table.book_id),
	}),
);
