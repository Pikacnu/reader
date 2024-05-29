import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
	redirect,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import BookShelf from './../compoents/bookshelf';
import { db } from '~/services/db.server';
import { book } from 'db/schema';
import { eq } from 'drizzle-orm';
import { User } from '~/types/user.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userdata: User = (await authenticator.isAuthenticated(request)) as User;
	if (!userdata) {
		return { books: null };
	}
	const book_data = await db
		.select()
		.from(book)
		.where(eq(book.author_id, userdata.id));
	if (book_data.length === 0) {
		return { books: null };
	}
	const books = book_data.map((data) => {
		return {
			cover: data.cover || '',
			title: data.title || '',
			tags: data.tags || [],
			src: `/book/edit/${data.id}`,
			author: userdata.displayName,
			id: data.id,
		};
	});
	return { books: books };
};

export const meta: MetaFunction = () => {
	return [{ title: 'Laganto - Edit Books' }];
};
export default function Edit() {
	const { books } = useLoaderData<typeof loader>();
	if (!books) {
		return (
			<div className='flex items-center justify-center w-full h-full'>
				<button
					className=' outline outline-gray-400 p-4 shadow-xl rounded-3xl text-2xl'
					onClick={() => {
						fetch(`/api/book/edit`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							redirect: 'follow',
							body: JSON.stringify({ id: -1 }),
						}).then((res) => {
							if (res.redirected) {
								window.location.href = res.url;
							}
						});
					}}
				>
					Create A Book
				</button>
			</div>
		);
	}
	return (
		<div>
			<div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 :grid-cols-6 gap-2 m-4'>
				{books.map((book, index) => {
					const { title, author, cover, src, tags, id } = book;
					return (
						<div
							className='flex items-center justify-center w-full h-full'
							key={index}
						>
							<button
								onClick={() => {
									fetch(`/api/book/edit`, {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
										},
										redirect: 'follow',
										body: JSON.stringify({ id }),
									}).then((res) => {
										if (res.redirected) {
											window.location.href = res.url;
										}
									});
								}}
								className={`flex flex-col p-4 border-gray-200 border w-32 h-48 *:m-0
				md:flex-row md:w-96 md:h-48 md:*:p-2 
				shadow-slate-300 hover:shadow-xl hover:border-0`}
							>
								<div className='h-2/3 w-full min-w-24 md:w-1/2 md:h-full'>
									<img
										className='h-full w-full object-cover overflow-hidden '
										src={cover}
										alt={`${title} Cover`}
									/>
								</div>
								<div className='grid grid-rows-4 md:w-1/2'>
									<p>{title}</p>
									<p>{author}</p>
									<div className='h-min grid-rows-subgrid row-span-2 flex flex-wrap overflow-hidden'>
										{tags?.slice(0, 6).map((tag, index) => {
											return (
												<p
													key={index}
													className='border  border-gray-200'
												>
													{tag}
												</p>
											);
										})}
									</div>
								</div>
							</button>
						</div>
					);
				})}
				<button
					className=' outline outline-gray-400 p-4 shadow-xl m-4 rounded-xl text-2xl'
					onClick={() => {
						fetch(`/api/book/edit`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							redirect: 'follow',
							body: JSON.stringify({ id: -1 }),
						}).then((res) => {
							if (res.redirected) {
								window.location.href = res.url;
							}
						});
					}}
				>
					+
				</button>
			</div>
		</div>
	);
}
