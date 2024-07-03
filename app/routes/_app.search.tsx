import { LoaderFunctionArgs, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { book, account } from 'db/schema';
import { db } from '~/services/db.server';
import { and, arrayContains, or, eq, like } from 'drizzle-orm';
import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const searchparms = new URLSearchParams(request.url.split('?')[1]);
	const text = searchparms.get('text');
	const tag = searchparms.get('tag')?.split(',');
	const author = searchparms.get('author');
	const page = parseInt(searchparms.get('page') || '0');
	let searchTarget = '';
	if (text) searchTarget += text;
	const bookinfo = await db
		.select()
		.from(book)
		.leftJoin(account, eq(book.author_id, account.id))
		.where(
			and(
				eq(book.published, true),
				and(
					or(
						like(book.description, `%${text}%`),
						like(book.title, `%${text}%`),
					),
					and(
						...(author ? [eq(account.name, author)] : []),
						...(tag?.length ? [arrayContains(book.tags, tag)] : []),
					),
				),
			),
		);
	const result = bookinfo
		.map((book) => ({
			link: `/book/	${book.book.id}`,
			title: book.book.title,
			author_name: book.account?.name || '',
			cover: book.book.cover,
			tags: book.book.tags,
			created_at: book.book.created_at,
			update_at: book.book.update_at,
			allow_comments: book.book.allow_comments,
			published: book.book.published,
		}))
		.slice(page * 10, page * 10 + 10);
	return { data: result, hostlink: process.env.HOST_LINK };
};

export default function Search() {
	const { data, hostlink } = useLoaderData<typeof loader>();
	const [page, setPage] = useState('');
	useEffect(() => {
		setPage(
			`${hostlink}/search${
				window.location.search.includes('page=')
					? window.location.search.replace(
							/page=\d*/,
							`
							page=${(
								parseInt(
									new URLSearchParams(window.location.href).get('page') || '0',
								) + 1
							).toString()}`,
					  )
					: window.location.search + `&page=1`
			}`,
		);
	}, []);
	return (
		<div className='m-4 mb-16'>
			<h1 className='text-2xl'>Search Result:</h1>
			<div className='grid grid-cols-4 *:outline *:m-4'>
				{data.map((book: any, index: number) => (
					<Link
						key={index}
						to={book.link}
						className='flex'
					>
						<img
							src={book.cover}
							className='w-1/2 object-scale-down'
							alt=''
						/>
						<div className='flex flex-col items-center justify-center'>
							<p>{book.title}</p>
							<p>{book.author_name}</p>
							<div className='flex flex-wrap *:border-2 m-2'>
								{book.tags.map((tag: any) => (
									<p key={tag.name}>{tag.name}</p>
								))}
							</div>
						</div>
					</Link>
				))}
			</div>
			<div className='m-4'>
				<Link to={page}>Next</Link>
			</div>
		</div>
	);
}
