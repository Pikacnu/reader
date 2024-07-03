import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import BookShelf from '~/compoents/bookshelf';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { booklist_book, book, account, booklist } from 'db/schema';
import { eq } from 'drizzle-orm';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { useState } from 'react';
import { MetaFunction } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userdata = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	if (!userdata) {
		return userdata;
	}
	const id = parseInt(params.id || '0');
	const books = await db
		.select()
		.from(booklist)
		.leftJoin(booklist_book, eq(booklist.id, booklist_book.booklist_id))
		.leftJoin(book, eq(booklist_book.book_id, book.id))
		.leftJoin(account, eq(book.author_id, account.id))
		.where(eq(booklist.id, id));
	if (books.length === 0) {
		return redirect('/404');
	}

	const isAuthor = books[0].booklist.creator_id === userdata.id;

	if (books[0].booklist_book !== null) {
		const bookdata = books.map((book, index) => {
			return {
				title: book?.book?.title || '',
				author: book?.account?.name || '',
				cover: book?.book?.cover || '',
				src: `/book/${book?.book?.id}`,
			};
		});
		return {
			bookdata,
			id: id,
			PublicState: books[0].booklist.public,
			isAuthor: isAuthor,
			name: books[0].booklist.title,
		};
	}
	return {
		bookdata: [],
		id: id,
		PublicState: books[0].booklist.public,
		isAuthor: isAuthor,
		name: books[0].booklist.title,
	};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: 'Laganto - ' + data?.name }, { description: 'booklist' }];
};

export default function App() {
	const { bookdata, id, PublicState, isAuthor, name } =
		useLoaderData<typeof loader>();
	const [IsPublic, setPublic] = useState(PublicState);
	return (
		<div className='flex-flex-col w-full'>
			<div className='flex flex-row justify-between m-4'>
				<h1 className='text-2xl'>書單 - {name}</h1>
				{isAuthor ? (
					<div className='flex flex-row *:ml-2 *:mr-2'>
						<button
							onClick={() => {
								const formdata = new FormData();
								formdata.append('booklist_id', id.toString());
								formdata.append('type', 'public');
								fetch('/api/booklist', {
									method: 'PATCH',
									body: formdata,
								}).then(async (res) => {
									res.status === 200 ? setPublic(!IsPublic) : null;
								});
							}}
						>
							{IsPublic ? 'Public' : 'Private'}
						</button>
						<button
							onClick={() => {
								const formdata = new FormData();
								formdata.append('id', id.toString());
								fetch('/api/booklist', {
									method: 'DELETE',
									body: formdata,
								});
								window.location.href = '/booklist';
							}}
						>
							Delete
						</button>
					</div>
				) : null}
			</div>
			<div className='m-4'>
				{bookdata.length > 0 ? (
					<BookShelf books={bookdata} />
				) : (
					<div>No Book Found</div>
				)}
			</div>
		</div>
	);
}
