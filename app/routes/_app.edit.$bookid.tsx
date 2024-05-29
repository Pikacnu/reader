import { LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/services/db.server';
import { book, chapter } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { useRef, useState } from 'react';
import BookInfo from './../compoents/bookinfo';
import { User } from '~/types/user.server';
import { Link } from '@remix-run/react';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const logindata = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	if (!logindata) {
		return { bookdata: null, userdata: null, chapters: null };
	}
	const bookid = parseInt(params.bookid as string);
	if (!bookid) return { bookdata: null, userdata: null, chapters: null };
	const bookdata = (
		await db
			.select()
			.from(book)
			.where(and(eq(book.id, bookid), eq(book.author_id, logindata.id)))
	)[0];
	if (!bookdata) return { bookdata: null, userdata: null, chapters: null };
	const chapters = await db
		.select({
			title: chapter.title,
			content: chapter.content,
		})
		.from(chapter)
		.where(eq(chapter.book_id, bookid));
	if (chapters.length === 0) {
		return { bookdata, userdata: logindata, chapters: null };
	}
	return { bookdata, userdata: logindata, chapters: chapters };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{
			title: `Laganto - Edit - ${data?.bookdata?.title || ''}`,
		},
	];
};

export default function EditBook() {
	const { bookdata, userdata, chapters } = useLoaderData<typeof loader>();
	const [title, setTitle] = useState(bookdata?.title);
	const [cover, setCover] = useState(bookdata?.cover);
	const coverClass = useRef<string | null>(null);
	const [tags, setTags] = useState(bookdata?.tags?.join(','));
	const [published, setPublished] = useState(bookdata?.published);
	const [allowComment, setAllowComment] = useState(bookdata?.allow_comments);
	const [description, setDescription] = useState(bookdata?.description);
	return (
		<div>
			<div
				className='bg-green-200 absolute'
				hidden
			>
				<p className='bg-red-200'></p>
				<p className='bg-red-700'></p>
			</div>

			{bookdata ? (
				<div className='flex flex-row w-full'>
					<div className='flex flex-col w-1/3 item-center'>
						{[
							{
								nane: 'title',
								default: title,
								setvalue: setTitle,
							},
							{
								nane: 'cover',
								default: cover,
								setvalue: (cover: string) => {
									setCover(cover);
									if (
										cover.match(
											/^(http|https):\/\/[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,4}/,
										)
									) {
										coverClass.current = 'outline-green-300';
										return;
									}
									coverClass.current = 'outline-red-300';
								},
							},
							{
								nane: 'tags',
								default: tags,
								setvalue: setTags,
							},
							{
								nane: 'description',
								default: description,
								setvalue: setDescription,
							},
						].map((data, index) => (
							<div
								className='flex flex-col *:w-full *:outline-1  *:m-2'
								key={index}
							>
								<label>{data.nane}</label>
								<input
									className={`bg-gray-200 p-2 rounded-lg ${
										data.nane === 'cover'
											? coverClass.current
											: 'outline-teal-300'
									}`}
									type='text'
									value={data.default || ''}
									onChange={(e) => {
										data.setvalue(e.currentTarget.value);
									}}
								/>
								<hr />
							</div>
						))}
						<div className='*:m-2'>
							<div className='grid md:grid-cols-2'>
								<button
									className={`bg-${published ? 'green' : 'red'}-200`}
									onClick={() => setPublished((prev) => !prev)}
								>
									{published ? 'Published' : 'Unpublished'}
								</button>
								<button
									className={`bg-${allowComment ? 'green' : 'red'}-200`}
									onClick={() => setAllowComment((prev) => !prev)}
								>
									{allowComment ? 'Allow Comment' : 'Disallow Comment'}
								</button>
							</div>
							<div className='grid md:grid-cols-2 *:text-center'>
								<button
									onClick={() => {
										fetch(`/api/book`, {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
											},
											redirect: 'follow',
											body: JSON.stringify({
												id: bookdata.id,
												title: title,
												cover: cover,
												tags: tags,
												description: description,
												author_id: userdata.id,
												published: published,
												allow_comments: allowComment,
											}),
										}).then((res) => {
											if (res.redirected) {
												window.location.href = res.url;
												return;
											}
											res.json().then((data) => {
												if (data.success === true) alert('Saved');
											});
										});
									}}
								>
									Save BookInfo
								</button>
								<Link to={`/editor/${bookdata.id}`}>Edit Chapter</Link>
							</div>
							<button
								className='w-full bg-red-700 text-black p-2 rounded-md'
								onClick={() => {
									fetch(`/api/book`, {
										method: 'DELETE',
										headers: {
											'Content-Type': 'application/json',
										},
										redirect: 'follow',
										body: JSON.stringify({
											id: bookdata.id,
										}),
									}).then((res) => {
										if (res.redirected) {
											window.location.href = res.url;
											return;
										}
										res.json().then((data) => {
											if (data.success === true) alert('Deleted');
											window.location.href = '/edit';
										});
									});
								}}
							>
								DELETE BOOK
							</button>
						</div>
					</div>
					<div className='w-2/3'>
						<BookInfo
							bookinfo={{
								title: title || '',
								cover: cover || '',
								tags: tags?.split(',') || [],
								description: description || '',
								author: userdata.displayName || '',
								chapters:
									chapters?.map((e) => ({ title: e.title || '', link: '' })) ||
									[],
							}}
						/>
					</div>
				</div>
			) : (
				<div>Book not found</div>
			)}
		</div>
	);
}
