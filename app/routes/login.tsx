import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';
import { SocialsProvider } from 'remix-auth-socials';
import discord from '~/assests/discord.svg';
import github from '~/assests/github.svg';
import google from '~/assests/google.svg';
import mail from '~/assests/mail.svg';
import { authenticator } from '~/services/auth.server';
import { useRef, useState } from 'react';

interface SocialButtonProps {
	provider: SocialsProvider;
	label?: string;
}

const icons = {
	[SocialsProvider.DISCORD]: discord,
	[SocialsProvider.GITHUB]: github,
	[SocialsProvider.GOOGLE]: google,
	[SocialsProvider.TWITTER]: '',
	[SocialsProvider.FACEBOOK]: '',
	[SocialsProvider.MICROSOFT]: '',
};

const SocialButton: React.FC<SocialButtonProps> = ({ provider, label }) => (
	<div className='transition-all hover:bg-slate-200 p-2 rounded'>
		<Form
			action={`/auth/${provider}`}
			method='post'
		>
			<button className='flex flex-row items-center justify-center space-x-4'>
				<img
					className='h-8'
					src={icons[provider]}
					alt=''
				/>{' '}
				{label}
			</button>
		</Form>
	</div>
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const logindata = await authenticator.isAuthenticated(request, {
		successRedirect: '/home',
	});
	return logindata;
};

export default function Login() {
	const [type, setType] = useState<'login' | 'register'>('login');
	const [showPassword, setShowPassword] = useState(false);
	const email = useRef<HTMLInputElement | null>(null);
	const password = useRef<HTMLInputElement | null>(null);

	const register_email = useRef<HTMLInputElement | null>(null);
	const register_password = useRef<HTMLInputElement | null>(null);
	const register_confirm_password = useRef<HTMLInputElement | null>(null);

	const fetcher = useFetcher();
	return (
		<div className='h-screen flex justify-center items-center bg-zinc-300'>
			<div className='flex flex-col *:m-4  items-center justify-center relative w-2/3 h-2/3 shadow-xl bg-white rounded-xl'>
				<h1 className='text-3xl font-bold'>
					{type.charAt(0).toUpperCase() + type.slice(1)}
				</h1>
				{
					//@ts-ignore
					fetcher?.data?.logindata?.error || '' ? (
						<p className='bg-red-200 p-2 rounded-lg'>
							{
								//@ts-ignore
								fetcher.data?.logindata.error
							}
						</p>
					) : (
						''
					)
				}
				{type === 'login' ? (
					<>
						<div className='flex items-center flex-col'>
							<fetcher.Form
								className='flex flex-col *:p-2 *:shadow-lg *:rounded-lg *:m-2 [&>input]:'
								action={`/auth/email`}
								method='post'
							>
								<input
									type='text'
									placeholder='email'
									name='email'
									ref={email}
									required
								/>
								<div className='flex'>
									<input
										type={showPassword ? 'text' : 'password'}
										placeholder='password'
										name='password'
										ref={password}
										required
									/>
									<button
										onClick={(e) => {
											e.preventDefault();
											setShowPassword(!showPassword);
										}}
										className='w-10'
									>
										{showPassword ? 'H' : 'S'}
									</button>
								</div>
								<button
									onClick={(e) => {
										const useremail = email.current?.value || '';
										const userpassword = password.current?.value || '';
										if (useremail === '' || userpassword === '') {
											e.preventDefault();
										}
										if (!useremail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
											e.preventDefault();
											//@ts-ignore
											fetcher.data.logindata.error = 'Invalid Email';
										}
									}}
								>
									Login
								</button>
							</fetcher.Form>
							<div className='flex'>
								<div className='transition-all hover:bg-slate-200 p-2 rounded'>
									<button
										className='flex flex-row items-center justify-center'
										onClick={() => {
											setType('register');
										}}
									>
										<img
											src={mail}
											alt=''
											className='w-8'
										/>
									</button>
								</div>
								<SocialButton provider={SocialsProvider.DISCORD} />
								<SocialButton provider={SocialsProvider.GITHUB} />
								<SocialButton provider={SocialsProvider.GOOGLE} />
							</div>
						</div>
					</>
				) : (
					<div className='flex flex-col'>
						<Form className='flex flex-col *:m-2 *:shadow-lg m-4 *:p-2 *:rounded-md shadow-gray-800' action='/register' method='post'>
							<input
								type='text'
								placeholder='email'
								name='email'
								ref={register_email}
								required
							/>
							<div className='m-0'>
								<input
									className='flex-grow'
									type={showPassword ? 'text' : 'password'}
									placeholder='password'
									name='password'
									ref={register_password}
									required
								/>
								<button
									onClick={(e) => {
										e.preventDefault();
										setShowPassword(!showPassword);
									}}
									className='w-10'
								>
									{showPassword ? 'H' : 'S'}
								</button>
							</div>
							<input
								type='password'
								placeholder='confirm Password'
								ref={register_confirm_password}
								required
							/>

							<button
								onClick={(e) => {
									const email = register_email.current?.value || '';
									const password = register_password.current?.value || '';
									const confirm_password =
										register_confirm_password.current?.value || '';
									if (
										email === '' ||
										password === '' ||
										confirm_password === ''
									) {
										return e.preventDefault();
									}
									if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
										e.preventDefault();
										alert('Invalid Email');
									}
									if (password !== confirm_password) {
										e.preventDefault();
										alert('Password does not match');
									}
								}}
							>
								Register
							</button>
						</Form>
						<button
							onClick={() => {
								setType('login');
							}}
						>
							Back to Login
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
