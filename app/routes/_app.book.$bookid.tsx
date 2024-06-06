import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import BookInfo from '~/compoents/bookinfo';
import { db } from '~/services/db.server';
import { book, account, chapter } from '~/../db/schema';
import { eq } from 'drizzle-orm';
import sad from '~/assests/sad.svg';
import { booklistcontext } from '~/services/contexts';
import { useContext } from 'react';

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
	const chapters = await db
		.select({
			title: chapter.title,
			content: chapter.content,
			chapter_id: chapter.chapter_id,
		})
		.from(chapter)
		.where(eq(chapter.book_id, parseInt(bookid || '0')));

	if (chapters.length === 0) {
		return {
			bookid,
			bookdata: bookdata[0],
			author_id: bookdata[1],
			avater: bookdata[2],
		};
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
	return (
		<div className='flex flex-col w-full'>
			<div className='flex flex-row-reverse mr-4'>
				<button
					onClick={() => {
						setBooklistOpen(true);
					}}
				>
					add to booklist
				</button>
			</div>
			<BookInfo
				bookinfo={bookdata}
				author_link={'/user/' + author_id}
				author_avatar={avater}
			/>
		</div>
	);
}
