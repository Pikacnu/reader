import {
	LoaderFunctionArgs,
	LoaderFunction,
	MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import BookCard, { BookData } from '~/compoents/bookcard';
import BookShelf from '../compoents/bookshelf';
import { db } from '~/services/db.server';
import { account, book, history } from 'db/schema';
import { authenticator } from '~/services/auth.server';
import { asc, eq, inArray } from 'drizzle-orm';
import { User } from '~/types/user.server';
import sad from '~/assests/sad.svg';

export const loader: LoaderFunction = async ({
	request,
}: LoaderFunctionArgs) => {
	//find user and get history
	const user = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	if (!user) {
		return {};
	}

	const history_books = await db
		.select()
		.from(history)
		.where(eq(history.user_id, user.id))
		.orderBy(asc(history.created_at));

	const history_book_ids = history_books.map((history) => history.book_id);
	if (history_book_ids.length === 0) {
		return {};
	}

	const books = await db
		.select()
		.from(history)
		.innerJoin(book, inArray(book.id, history_book_ids))
		.innerJoin(account, eq(book.author_id, account.id))
		.where(eq(history.user_id, user.id));

	const result = books.map((data) => {
		const book = data.book;
		return {
			cover: book.cover,
			title: book.title,
			tags: book.tags,
			author: data.account.name,
			src: `/book/reader/${book.id}?chapter=${
				history_books.find((history) => history.book_id === book.id)?.chapter ||
				0
			}&page=${
				history_books.find((history) => history.book_id === book.id)?.page || 0
			}`,
		};
	});

	return {
		books: result,
	};
};

export const meta: MetaFunction = () => {
	return [{ title: 'Laganto - Book History' }];
};

export default function BookHistory() {
	const { books }: { books: BookData[] } = useLoaderData<typeof loader>();
	if (!books) {
		return (
			<div className='w-full h-full flex items-center justify-center'>
				<div className='shadow-lg shadow-slate-300 p-4 rounded-md flex flex-row'>
					<img
						className='object-scale-down h-32 w-32'
						src={sad}
						alt='Sad Face'
					/>
					<div className='flex items-center ml-8 text-lg'>
						<p>No Books Found</p>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className='w-full m-4'>
			<BookShelf books={books} />
		</div>
	);
}
