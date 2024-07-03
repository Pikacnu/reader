import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import BookInfo from '~/compoents/bookinfo';
import { db } from '~/services/db.server';
import { book, account, chapter } from '~/../db/schema';
import { eq } from 'drizzle-orm';
import sad from '~/assests/sad.svg';
import { booklistcontext, booklistBookidContext } from '~/services/contexts';
import { useContext, useEffect } from 'react';
import bookmark_add from '~/assests/bookmark_add.svg';
import jsdom from 'jsdom';

async function getBookChapters(link: string, chapter = 0) {
	const novelLink = link.split('/').pop();
	const bookPageRequest = fetch(`https://czbooks.net/n/${novelLink}`, {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
		},
	});
	const html = await (await bookPageRequest).text();
	const { window } = new jsdom.JSDOM(html);
	const data = window.document
		?.getElementById('chapter-list')
		?.querySelectorAll('a');

	let chapterLinks: string[] = [];
	data?.forEach((a) => chapterLinks.push(a.href));
	const get = async (a: string) => {
		const chapterRequest = await fetch(`https:${a}`, {
			method: 'GET',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
			},
		});
		const html = await chapterRequest.text();
		if (chapterRequest.status !== 200) return console.log('Error');
		const { window } = new jsdom.JSDOM(html);
		const content = window.document.querySelector('.content')?.textContent;
		if (content === null) return [];
		return content?.split('\n').filter((a) => a !== '') || [];
	};

	let lists: any[] = [];
	while (chapterLinks.length > 0) {
		const current = chapterLinks.splice(0, 1);
		let list = await Promise.all(current.map(async (e) => await get(e)));
		lists = lists.concat(list);
		console.log(lists.length);
		await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
	}
	return lists;
}

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

	if (chapters.length === 0 && bookdata.cz_link === '') {
		return {
			bookid,
			bookdata: bookdata[0],
			author_id: bookdata[1],
			avater: bookdata[2],
		};
	}
	if (chapters.length === 0 && bookdata[0].cz_link !== '') {
		console.log('Getting Chapters');
		getBookChapters(bookdata[0].cz_link).then((data) => {
			data.forEach(async (e, i) => {
				console.log(parseInt(bookid || '0'), i);
				const result = await db
					.insert(chapter)
					.values({
						book_id: parseInt(bookid || '0'),
						title: `Chapter ${i}`,
						content: e,
						chapter_id: i,
					})
					.onConflictDoUpdate({
						target: [chapter.book_id, chapter.chapter_id],
						set: {
							content: e,
						},
					})
					.returning();
				console.log(result);
			});
		});
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
