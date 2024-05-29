import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { db } from '~/services/db.server';
import { book, account } from 'db/schema';
import { eq } from 'drizzle-orm';
import { useLoaderData } from '@remix-run/react';
import BookShelf from '~/compoents/bookshelf';
import { BookData } from '~/compoents/bookcard';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const id = parseInt(params.id || '');
	const user = await db.select().from(account).where(eq(account.id, id));
	if (user.length === 0) return redirect('/404');
	const books = (
		await db
			.select({
				id: book.id,
				title: book.title,
				cover: book.cover,
				tags: book.tags,
				author: account.name,
			})
			.from(book)
			.innerJoin(account, eq(account.id, id))
			.where(eq(book.author_id, id))
	).map((e) => {
		return {
			src: `/book/${e.id}`,
			author: e.author,
			title: e.title,
			cover: e.cover,
			tags: e.tags,
		};
	});
	return { user: user[0], books };
};

export default function User() {
	const { user, books } = useLoaderData<typeof loader>();
	return (
		<div className='flex flex-col items-center m-4'>
			<div className='flex flex-row items-center justify-center'>
				<img
					src={user.link_avatar || ''}
					alt='avatar'
					className='w-16 h-16 rounded-full shadow-lg object-cover'
				/>
			</div>
			<div className='flex flex-col items-center w-full'>
				<h1 className='text-3xl'>{user.name}</h1>
				<div className='border-t-2 border-b-2 border-black w-full flex flex-col p-4 m-2'>
					<h1 className='text-2xl self-start'>關於我:</h1>
					<div className='ml-2'>
						{user.about_me
							? user.about_me.split('\n').map((text, index) => {
									return <p key={index}>{text}</p>;
							  })
							: 'No description available'}
					</div>
				</div>
			</div>
			<div className='flex m-4 flex-col'>
				<h1 className='text-2xl'>作品:</h1>
				<BookShelf books={books as BookData[]}></BookShelf>
			</div>
		</div>
	);
}
