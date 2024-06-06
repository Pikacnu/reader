import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import BookShelf from '~/compoents/bookshelf';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { booklist_book, book, account } from 'db/schema';
import { eq } from 'drizzle-orm';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userdata = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	if (!userdata) {
		return userdata;
	}
	const id = parseInt(params.id || '0');
	const booklist = await db
		.select()
		.from(booklist_book)
		.rightJoin(book, eq(booklist_book.book_id, book.id))
		.rightJoin(account, eq(book.author_id, account.id))
		.where(eq(booklist_book.booklist_id, id));
	console.log(booklist);
	if (booklist.length === 0) {
		return redirect('/404');
	}
	const bookdata = booklist.map((book, index) => {
		return {
			title: book?.book?.title || '',
			author: book?.account.name || '',
			cover: book?.book?.cover || '',
			src: `/book/${book?.book?.id}`,
		};
	});
	return { bookdata, id: id };
};
export default function App() {
	const { bookdata, id } = useLoaderData<typeof loader>();
	return (
		<div className='flex-flex-col w-full'>
			<div className='flex flex-row justify-between'>
				<h1 className='text-2xl'>書單</h1>
				<div>
					<button
						onClick={() => {
							const formdata = new FormData();
							formdata.append('id', id.toString());
							fetch('/api/booklist', {
								method: 'DELETE',
								body: formdata,
							});
						}}
					>
						Delete
					</button>
				</div>
			</div>
			<BookShelf books={bookdata} />
		</div>
	);
}
