import { Block } from '@blocknote/core';

export type Content = string[];

export type Page = {
	content: Content;
	title?: string;
	pageIndex: number;
};
export type Chapter = {
	title?: string;
	pages: Page[];
	chapterIndex: number;
};
export type Book = {
	title: string;
	chapters: Chapter[];
	bookId: string;
};
export type FullBookData = {
	book:
		| Book
		| {
				title: string;
				bookId: string;
		  };
	author: string;
	coverLink: string;
	description: string;
	tags: string[];
	bookId: number;
};
