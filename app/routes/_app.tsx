import { Outlet, Link } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import account from '~/assests/account.svg';
import home from '~/assests/home.svg';
import history from '~/assests/history.svg';
import edit from '~/assests/edit.svg';

export let loader = async ({ request }: LoaderFunctionArgs) => {
	const logindata = await authenticator.isAuthenticated(request);
	return { logindata: logindata };
};

export default function Layout() {
	const { logindata } = useLoaderData<typeof loader>();
	return (
		<div className='flex flex-col h-dvh w-full'>
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
				<div className='grid grid-cols-6 grid-rows-1 w-full h-full bg-blue-800 *:justify-center *:flex *:items-center opacity-0'>
					<div className='bg-blue-200 grid-cols-subgrid col-span-6 *:m-2 lg:*:m-4'>
						<input
							type='text'
							placeholder='Search'
							className='w-full'
						/>
						<img
							src=''
							alt='Search'
						/>
					</div>
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
									className='object-cover h-8 w-8 lg:h-12 lg:w-12'
								/>
								<p className='text-sm'>{item.name}</p>
							</Link>
						);
					})}
				</div>
				<div
					className={
						'w-full h-dvh flex-grow lg:w-[calc(100%-4rem)] overflow-y-auto overflow-x-hidden'
					}
				>
					<Outlet />
				</div>
			</div>
		</div>
	);
}
