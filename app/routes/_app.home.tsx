import type { MetaFunction } from '@remix-run/node';
import { LoaderFunctionArgs } from '@remix-run/node';
import { account, book, history } from 'db/schema';
import { db } from '~/services/db.server';
import { useLoaderData } from '@remix-run/react';
import BookCard from '~/compoents/bookcard';
import { eq, and, gte } from 'drizzle-orm';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';

export const meta: MetaFunction = () => {
	return [{ title: 'Laganto - Home' }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = (await authenticator.isAuthenticated(request)) as User;

	const recently_add = (
		await db
			.select()
			.from(book)
			.innerJoin(account, eq(book.author_id, account.id))
			.where(
				and(
					eq(book.published, true),
					gte(book.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
				),
			)
			.orderBy(book.created_at)
	).map((data) =>
		Object.assign(data.book, { author_name: data.account.name || '' }),
	);

	const recently_update = (
		await db
			.select()
			.from(book)
			.innerJoin(account, eq(book.author_id, account.id))
			.where(
				and(
					eq(book.published, true),
					gte(book.update_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
				),
			)
			.orderBy(book.update_at)
	).map((data) =>
		Object.assign(data.book, { author_name: data.account.name || '' }),
	);

	if (!user) {
		return {
			recently_add,
			recently_update,
			recently_read: [],
		};
	}

	return {
		recently_add,
		recently_update,
		recently_read: (
			await db
				.select()
				.from(history)
				.innerJoin(book, eq(book.id, history.book_id))
				.innerJoin(account, eq(book.author_id, account.id))
				.where(
					and(
						eq(book.published, true),
						gte(
							history.created_at,
							new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
						),
						eq(history.user_id, user.id),
					),
				)
				.orderBy(history.created_at)
		).map((data) =>
			Object.assign(data.book, { author_name: data.account.name || '' }),
		),
	};
};

export default function Index() {
	const { recently_add, recently_update, recently_read } =
		useLoaderData<typeof loader>();
	const data = [
		{
			title: 'Recently Read',
			books: [...recently_read],
		},
		{
			title: 'Recently Added',
			books: [...recently_add],
		},
		{
			title: 'Recently Updated',
			books: [...recently_update],
		},
		{
			title: 'Recommended',
			books: [],
		},
		{
			title: 'Popular',
			books: [],
		},
	];
	return (
		<div className='overflow-y-hidden m-2 lg:m-4'>
			{data.map((item, index) =>
				item.books.length ? (
					<div
						key={index}
						className=' justify-center overflow-y-hidden overflow-x-auto'
					>
						<h1 className='text-2xl'>{item.title}</h1>
						<hr />
						<div className='h-60 mt-2 lg:m-2 flex fle-row overflow-hidden justify-start flex-shrink'>
							{item.books.map((e, i) => {
								return (
									<BookCard
										key={i * index * 10}
										title={e.title || ''}
										tags={e.tags || []}
										cover={e.cover || ''}
										author={e.author_name}
										src={`/book/${e.id}`}
									/>
								);
							})}
						</div>
					</div>
				) : null,
			)}
		</div>
	);
}
