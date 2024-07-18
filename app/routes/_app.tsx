import { Outlet, Link } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import account from '~/assests/account.svg';
import home from '~/assests/home.svg';
import history from '~/assests/history.svg';
import edit from '~/assests/edit.svg';
import { db } from '~/services/db.server';
import { booklist, booklist_follower } from 'db/schema';
import { useEffect, useState } from 'react';
import { eq, or } from 'drizzle-orm';
import { User } from '~/types/user.server';
import { booklistcontext, booklistBookidContext } from '~/services/contexts';
import bookshelf from '~/assests/bookshelf.svg';
import search from '~/assests/search.svg';

export let loader = async ({ request }: LoaderFunctionArgs) => {
	const logindata = (await authenticator.isAuthenticated(
		request,
	)) as User | null;
	if (!logindata) return { logindata: logindata, booklists: [] };
	const booklists = await db
		.select()
		.from(booklist)
		.leftJoin(booklist_follower, eq(booklist.id, booklist_follower.booklist_id))
		.where(
			or(
				eq(booklist_follower.follower_id, logindata.id),
				eq(booklist.creator_id, logindata.id),
			),
		);
	return { logindata: logindata, booklists: booklists };
};

export default function Layout() {
	const { logindata, booklists } = useLoaderData<typeof loader>();
	const [booklistOpen, setBooklistOpen] = useState(false);
	const [booklistBookid, setBooklistBookid] = useState(0);
	const [searchString, setSearchString] = useState('');

	useEffect(() => {
		const search = new URLSearchParams(window.location.search);
		let string: string[] = [];
		search.forEach((value, key) => {
			string.push(`${key}=${value}`);
		});
		let searchString = string.join(' ').replace('text=', '');
		setSearchString(searchString);
	}, []);
	return (
		<div className='flex flex-col h-dvh w-full'>
			{booklistOpen ? (
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-10 shadow-lg flex-col flex md:min-w-[20vw] min-w-[60vw] justify-center items-center *:m-2'>
					<h1>選擇要加入的書單</h1>
					<button
						className='absolute text-lg right-0 top-0'
						onClick={() => setBooklistOpen(false)}
					>
						{' '}
						X{' '}
					</button>
					<hr className='bg-gray-800 w-2/3' />
					<div className='flex w-full m-2 justify-center items-center flex-col'>
						{booklists.map((data, index) => {
							return (
								<div
									key={index}
									className='flex justify-between w-1/2'
								>
									<p>{data?.booklist?.title || ''}</p>
									<button
										onClick={() => {
											const formdata = new FormData();
											formdata.append(
												'booklist_id',
												data?.booklist?.id.toString() || '',
											);
											formdata.append('book_id', booklistBookid.toString());
											formdata.append('type', 'book');
											fetch('/api/booklist', {
												method: 'PATCH',
												body: formdata,
											});
											setBooklistOpen(false);
										}}
									>
										add
									</button>
								</div>
							);
						})}
					</div>
				</div>
			) : null}
			<div className='flex w-full h-12 lg:h-14 bg-gray-600 align-middle justify-center'>
				<div className='h-12 w-12 lg:h-14 lg:w-16 relative'>
					<Link to={'/account'}>
						<img
							// @ts-ignore
							src={logindata?.photoURL || account}
							alt='User Profile'
							className='object-cover lg:h-14 lg:w-16'
						/>
					</Link>
					<div className='w-16'></div>
				</div>
				<div className='grid grid-cols-6 grid-rows-1 w-full h-full bg-blue-800 *:justify-center *:flex *:items-center '>
					<form
						className='bg-blue-200 grid-cols-subgrid col-span-6 *:m-2 lg:*:m-4'
						onSubmit={(e) => {
							e.preventDefault();
							if (searchString === '') return console.log('empty');
							let temp = searchString.split(' ');
							const searchTarget: {
								tag?: string;
								author?: string;
								text?: string;
							} = Object.assign(
								{},
								...temp.map((e) => {
									if (e.startsWith('tag=')) {
										return {
											tag: e.replace('tag=', ''),
										};
									} else if (e.startsWith('author=')) {
										return {
											author: e.replace('author=', ''),
										};
									}
									return {
										text: e,
									};
								}),
							);
							const search = new URLSearchParams();
							Object.entries(searchTarget || {}).forEach(([key, value]) => {
								search.append(key, value || '');
							});
							window.location.href = `/search?${search.toString()}`;
						}}
					>
						<input
							type='text'
							placeholder='Search'
							className='w-full'
							value={searchString}
							onChange={(e) => {
								setSearchString(e.target.value);
							}}
						/>
						<button>
							<img
								className='object-cover h-8 w-8 lg:h-12 lg:w-12 p-2'
								src={search}
								alt='Search'
							/>
						</button>
					</form>
				</div>
			</div>
			<div className='flex flex-col-reverse lg:flex-row overflow-hidden flex-grow lg:h-[calc(100dvh-3.5rem)] h-dvh'>
				<div className='flex lg:flex-col overflow-hidden space-between align-middle justify-center flex-row *:m-2 lg:h-[calc(100vh-3.5rem)] h-16 w-full lg:w-16 bg-gray-500'>
					{(logindata
						? [
								{
									name: 'Home',
									src: '/home',
									icon: home,
								},
								{
									name: 'History',
									src: '/history',
									icon: history,
								},
								{
									name: 'BookShelf',
									src: '/booklist',
									icon: bookshelf,
								},
								{
									name: 'Edit',
									src: '/edit',
									icon: edit,
								},
								{
									name: 'account',
									src: '/account',
									icon: account,
								},
						  ]
						: [
								{
									name: 'Home',
									src: '/home',
									icon: home,
								},
								{
									name: 'Login',
									src: '/account',
									icon: account,
								},
						  ]
					).map((item, index) => {
						return (
							<Link
								to={item.src}
								key={index}
								className='flex flex-col items-center justify-center hover:bg-gray-400 hover:shadow-lg shadow-black rounded-md *:rounded-md select-none w-12'
							>
								<img
									src={item.icon}
									alt='ICON'
									className='object-cover h-8 w-8 lg:h-12 lg:w-12 p-2'
								/>
								<p className='text-sm'>{item.name}</p>
							</Link>
						);
					})}
				</div>
				<div
					className={
						'w-full h-full flex-grow lg:w-[calc(100%-4rem)] overflow-y-auto overflow-x-hidden'
					}
				>
					<booklistcontext.Provider
						value={{
							booklistOpen: booklistOpen,
							setBooklistOpen: setBooklistOpen,
						}}
					>
						<booklistBookidContext.Provider
							value={{
								bookId: booklistBookid,
								setBookId: setBooklistBookid,
							}}
						>
							<Outlet />
						</booklistBookidContext.Provider>
					</booklistcontext.Provider>
				</div>
			</div>
		</div>
	);
}
