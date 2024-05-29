import { LoaderFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { SocialsProvider } from 'remix-auth-socials';
import discord from '~/assests/discord.svg';
import github from '~/assests/github.svg';
import google from '~/assests/google.svg';
import { authenticator } from '~/services/auth.server';

interface SocialButtonProps {
	provider: SocialsProvider;
	label: string;
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
			<button className=' flex flex-row items-center justify-center space-x-4'>
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

export const loader = async ({request}:LoaderFunctionArgs) => {
  const logindata = await authenticator.isAuthenticated(request,{
    successRedirect:'/home',
  });
  return logindata;
}

export default function Login() {
	return (
		<div className='h-screen flex justify-center items-center bg-zinc-300'>
			<div className='flex flex-col *:m-4  items-center justify-center relative w-2/3 h-2/3 shadow-xl bg-white rounded-xl'>
				<h1 className='text-3xl font-bold'>Login</h1>
				<div>
					<SocialButton
						provider={SocialsProvider.DISCORD}
						label='Login with Discord'
					/>
					<SocialButton
						provider={SocialsProvider.GITHUB}
						label='Login with Github'
					/>
					<SocialButton
						provider={SocialsProvider.GOOGLE}
						label='Login with Google'
					/>
				</div>
			</div>
		</div>
	);
}
