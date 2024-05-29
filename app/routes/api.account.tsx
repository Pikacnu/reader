import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { account } from 'db/schema';
import { eq } from 'drizzle-orm';
import { User } from '~/types/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method !== 'POST') return redirect('/login');

	const body = await request.json();
	if (!body) return new Response('Bad Request', { status: 400 });
	const about_me = body.about_me;
	if (!about_me) return new Response('Bad Request', { status: 400 });

	const userdata = (await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})) as User;
	if (!userdata) return redirect('/login');

	await db
		.update(account)
		.set({ about_me: about_me })
		.where(eq(account.id, userdata.id));
	return new Response('OK', { status: 200 });
};
