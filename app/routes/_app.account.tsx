import { useLoaderData } from '@remix-run/react';
import { Form } from '@remix-run/react';
import { LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { account } from 'db/schema';
import { eq } from 'drizzle-orm';
import { useRef, useState } from 'react';

export let loader = async ({ request }: LoaderFunctionArgs) => {
	const logindata = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	const about_me = (
		await db
			.select({ about_me: account.about_me })
			.from(account)
			.where(eq(account.id, logindata.id))
	)[0];
	if (logindata) {
		return Object.assign(logindata, about_me);
	}
	return redirect('/login');
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{
			//@ts-ignore
			title: `Laganto -  ${data?.displayName || ''}`,
		},
	];
};

export default function Account() {
	const data = useLoaderData<
		User & {
			about_me: string;
		}
	>();
	const [setAboutMe, setSetAboutMe] = useState(false);
	const [aboutMeData, setAboutMeData] = useState(data.about_me);
	return (
		<div className=''>
			<div className='w-full flex items-center justify-center m-10 ml-0'>
				<img
					alt='avatar_img'
					src={data.photoURL}
					className='object-cover w-16 h-16 rounded-full shadow-xl'
				></img>
				{}
			</div>
			<hr />
			<div className='grid xl:grid-cols-4 md:grid-cols-2'>
				{[
					{
						name: 'Name',
						value: data.displayName,
					},
					{
						name: 'Email',
						value: data.email,
					},
					{
						name: 'Linked Accounts',
						value: data.link_account,
					},
					{
						name: 'Permissions',
						value: data.permissions,
					},
				].map((data, index) => (
					<div
						className='w-auto m-4 flex flex-col'
						key={index}
					>
						<div className='flex flex-row items-center *:m-2'>
							<p>{data.name}</p>
							<p>
								{!Array.isArray(data.value)
									? data.value
									: data.value.map((item, index) => {
											return (
												<p
													className='bg-green-200 rounded-lg pl-1 pr-1'
													key={index}
												>
													{item}
												</p>
											);
									  })}
							</p>
						</div>
						<hr className='' />
					</div>
				))}
			</div>
			<div className='flex flex-col m-4 *:mt-4 '>
				<h1>About me</h1>
				{!setAboutMe ? (
					<p>{aboutMeData}</p>
				) : (
					<textarea
						onChange={(e) => {
							setAboutMeData(e.target.value);
						}}
						value={aboutMeData}
						className='flex-grow bg-zinc-400 border-2 border-black rounded-lg '
					></textarea>
				)}
				<button
					onClick={() => {
						if (setAboutMe) {
							fetch('/api/account', {
								method: 'POST',
								body: JSON.stringify({
									about_me: aboutMeData,
								}),
							});
						}
						setSetAboutMe(!setAboutMe);
					}}
				>
					{!setAboutMe ? 'Edit' : 'Save'}
				</button>
			</div>
			<div className='flex w-full justify-center *:pl-2 *:pr-2 *:rounded-lg'>
				<Form
					action='/auth/logout'
					className='bg-red-400 '
				>
					<button>Logout</button>
				</Form>
			</div>
		</div>
	);
}
