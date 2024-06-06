import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { db } from '~/services/db.server';
import { account, register } from 'db/schema';
import { Form, useLoaderData } from '@remix-run/react';
import { sendmail } from '~/services/mail.server';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

function makeid(length: number) {
	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const formdata = await request.formData();
	const email = formdata.get('email') as string;
	const password = formdata.get('password') as string;

	if (!email || !password) {
		return new Response('Invalid email or password', { status: 400 });
	}

	const id = makeid(20);

	let temp = crypto.createHmac('sha256', process.env.SECRET_KEY!);
	temp.update(password);
	const hash = temp.digest('hex');

	await db
		.insert(register)
		.values({
			email: email,
			password: hash,
			id: id,
		})
		.onConflictDoNothing();

	sendmail(email, id);

	return new Response(null, { status: 200 });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const searchparms = new URLSearchParams(request.url.split('?')[1]);
	const code = searchparms.get('code');
	if (!code) return { verifyState: false };
	console.log(code);

	const user = (
		await db.select().from(register).where(eq(register.id, code))
	)[0] as {
		id: string;
		email: string;
		password: string;
	};
	console.log(user);
	if (!user) return { verifyState: false };
	await db
		.insert(account)
		.values({
			email: user.email,
			password: user.password,
			link_avatar: '',
			name: 'Temp',
		})
		.onConflictDoUpdate({
			target: [account.email],
			set: {
				password: user.password,
				link_laganto: true,
			},
		});
	await db.delete(register).where(eq(register.id, code));
	return { verifyState: true };
};

export default function Register() {
	const { verifyState } = useLoaderData<typeof loader>();
	if(verifyState) window.location.href = '/login';
	return (
		<div className='flex items-center justify-center w-full h-svh '>
			<div className=' shadow-2xl p-4 rounded-lg bg-white'>
				{verifyState
					? 'Redirect to Login'
					: 'Check your email for the verification code'}
			</div>
		</div>
	);
}
