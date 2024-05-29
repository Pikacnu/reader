import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect, useLoaderData } from '@remix-run/react';
import Reader from '~/compoents/reader';
import { db } from '~/services/db.server';
import { chapter, book, reader_setting } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { Chapter } from '~/types/book.server';
import { useEffect, useRef } from 'react';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const searchparams = new URLSearchParams(request.url.split('?')[1]);
	const chapterid = searchparams.get('chapterid');
	const page = searchparams.get('page');
	const bookid = parseInt(params.bookid as string);
	const user = (await authenticator.isAuthenticated(request)) as User;
	const bookdata = await db
		.select({
			book_name: book.title,
		})
		.from(book)
		.where(and(eq(book.id, bookid), eq(book.published, true)));
	if (bookdata.length === 0) {
		return redirect('/404');
	}

	const reader_data = (
		await db
			.select()
			.from(reader_setting)
			.where(eq(reader_setting.user_id, user.id))
	)[0];

	return {
		data: {
			pages: await db
				.select({
					content: chapter.content,
					title: chapter.title,
					pageIndex: chapter.chapter_id,
				})
				.from(chapter)
				.where(eq(chapter.book_id, bookid)),
		},
		book: {
			title: bookdata[0].book_name,
			id: bookid,
		},
		chapterid: chapterid,
		page: page,
		reader_data: reader_data
			? reader_data
			: {
					text_direction: null,
					background_color: null,
					font_size: null,
					text_leading: null,
			  },
	};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: `Reader - ${data?.book.title}` },
		{ name: 'description', content: '' },
	];
};

export default function Index() {
	const data = useLoaderData<typeof loader>();
	const chapterIndex = useRef(parseInt(data.chapterid || '') || 0);
	const pageIndex = useRef(parseInt(data.page || '') || 0);
	const chapterData = data.data as Chapter;
	useEffect(() => {
		window.setInterval(() => {
			fetch('/api/history', {
				method: 'POST',
				body: JSON.stringify({
					bookid: data.book.id,
					chapter: chapterIndex.current,
					page: pageIndex.current,
				}),
			})
				.then((res) => res.json())
				.then((data) => console.log(data))
				.catch((err) => console.error(err));
		}, 2 * 60 * 1000);
		return () => {
			fetch('/api/history', {
				method: 'POST',
				body: JSON.stringify({
					bookid: data.book.id,
					chapter: chapterIndex.current,
					page: pageIndex.current,
				}),
			})
				.then((res) => res.json())
				.then((data) => console.log(data))
				.catch((err) => console.error(err));
		};
	}, [data.page, data.chapterid]);
	return (
		<div className='w-full h-full m-0'>
			<Reader
				chapter={chapterData}
				chapter_index={chapterIndex}
				page_index={pageIndex}
				reader_data={data.reader_data}
			></Reader>
		</div>
	);
}
