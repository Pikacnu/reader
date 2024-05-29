import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { chapter, book } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '~/types/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = (await authenticator.isAuthenticated(request)) as User;
	if (!user) {
		return redirect('/login');
	}
	const data = await request.json();
	const { chapters, book_id } = data;

	const bookid = parseInt(book_id);

	const bookdata = (
		await db
			.select()
			.from(book)
			.where(and(eq(book.id, bookid), eq(book.author_id, user.id)))
	)[0];
	if (!bookdata) return redirect('/edit');

	if (!chapters) return redirect('/edit');
	if (chapters.length === 0) return redirect('/');

	const originalChapters = await db
		.select()
		.from(chapter)
		.where(eq(chapter.book_id, book_id));

	const changeChapter = chapters
		.map((e: any, i: number) => {
			return Object.assign(e, { chapter_id: i });
		})
		.filter(
			(chapterdata: {
				title: string;
				content: string[];
				chapter_id: number;
			}) => {
				return !originalChapters.some(
					(originalChapter) =>
						originalChapter.title === chapterdata.title &&
						originalChapter.content === chapterdata.content &&
						originalChapter.chapter_id === chapterdata.chapter_id,
				);
			},
		);

	const updateDB = changeChapter.map(
		async (chapterdata: {
			title: string;
			text: string[];
			chapter_id: number;
		}) => {
			console.log(chapterdata, chapterdata.chapter_id);
			if (!chapterdata.title || !chapterdata.text) return;
			await db
				.insert(chapter)
				.values({
					book_id: bookid,
					title: chapterdata.title,
					content: chapterdata.text,
					chapter_id: chapterdata.chapter_id,
				})
				.onConflictDoUpdate({
					target: [chapter.book_id, chapter.chapter_id],
					set: {
						title: chapterdata.title,
						content: chapterdata.text,
						chapter_id: chapterdata.chapter_id,
					},
					targetWhere: eq(chapter.chapter_id, chapterdata.chapter_id),
				});
		},
	);

	await Promise.all(updateDB);

	/*
	const updateChapter = chapters.map(
		async (chapterdata: {
			title: string;
			content: string[];
		}) => {
			if (!chapter.title || !chapter.content) return;
			await db
				.insert(chapter)
				.values({
					book_id: chapterdata.book_id,
					title: chapterdata.title,
					content: chapterdata.content,
				})
				.onConflictDoUpdate({
					target: [chapter.book_id],
					set: {
						content: chapterdata.content,
					},
				});
		},
	);
	Promise.all(updateChapter);
  */
	return {
		success: true,
	};
};
