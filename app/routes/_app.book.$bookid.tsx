import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import BookInfo from '~/compoents/bookinfo';
import { db } from '~/services/db.server';
import { book, account, chapter } from '~/../db/schema';
import { eq } from 'drizzle-orm';
import sad from '~/assests/sad.svg';
import { booklistcontext, booklistBookidContext } from '~/services/contexts';
import { useContext, useEffect } from 'react';
import bookmark_add from '~/assests/bookmark_add.svg';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const bookid = params.bookid;
	const bookdata = ((data) => {
		if (!data) return null;
		return [
			Object.assign(data.book, {
				author: data.account.name || '',
			}),
			data.account.id,
			data.account.link_avatar,
			data.book.cz_link!,
		];
	})(
		(
			await db
				.select()
				.from(book)
				.innerJoin(account, eq(book.author_id, account.id))
				.where(eq(book.id, parseInt(bookid || '0')))
		)[0],
	) as any;
	if(!bookdata) return redirect('/404');
	const chapters = await db
		.select({
			title: chapter.title,
			content: chapter.content,
			chapter_id: chapter.chapter_id,
		})
		.from(chapter)
		.where(eq(chapter.book_id, parseInt(bookid || '0')))
		.orderBy(chapter.chapter_id);

	if (chapters.length === 0 && bookdata[3] !== '') {
		return {
			bookid,
			bookdata: bookdata[0],
			author_id: bookdata[1],
			avater: bookdata[2],
		};
	}

	if (chapters.length === 0 && bookdata[3] !== '') {
		await fetch(
			`https://${process.env.HOST_LINK!}:${
				process.env.FETCHER_SERVER_PORT
			}/add/${bookdata[3]}/${bookid!}`,
		);
	}

	return json({
		bookid: params.bookid,
		bookdata: Object.assign(bookdata[0], {
			chapters: chapters.map((e) => {
				return Object.assign(e, { link: `/book/reader/${bookid}` });
			}),
		}),
		author_id: bookdata[1],
		avater: bookdata[2],
	});
};

export default function Book() {
	const { bookid, bookdata, author_id, avater } =
		useLoaderData<typeof loader>();
	const { booklistOpen, setBooklistOpen } = useContext(booklistcontext);
	const { setBookId } = useContext(booklistBookidContext);
	if (!bookdata) {
		return (
			<div className='w-full h-full flex items-center justify-center'>
				<div className='shadow-lg shadow-slate-300 p-4 rounded-md flex flex-row'>
					<img
						className='object-scale-down h-32 w-32'
						src={sad}
						alt='Sad Face'
					/>
					<div className='flex items-center ml-8 text-lg'>
						<p>Book Not Found</p>
					</div>
				</div>
			</div>
		);
	}
	useEffect(() => {
		setBookId(parseInt(bookid || ''));
	}, []);
	return (
		<div className='flex flex-col w-full relative'>
			<BookInfo
				bookinfo={bookdata}
				author_link={'/user/' + author_id}
				author_avatar={avater}
			/>
			<div className='flex flex-row-reverse mr-4 absolute top-0 right-0 z-50'>
				<button
					className='flex flex-row items-center m-2 p-2 bg-gray-200 rounded-md shadow-md'
					onClick={() => {
						setBooklistOpen(true);
					}}
				>
					<img
						className='object-cover h-8 w-8 lg:h-12 lg:w-12 p-2'
						src={bookmark_add}
						alt='add_to_booklist'
					/>
					add to booklist
				</button>
			</div>
		</div>
	);
}
