import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { booklist } from 'db/schema';
import { and, eq, or } from 'drizzle-orm';
import { createSearchParams } from '@remix-run/react';

export const action = async ({ request }: ActionFunctionArgs) => {
	const userdata = (await authenticator.isAuthenticated(request)) as User;
	const formdata = await request.formData();
	if (!userdata) {
		return new Response('Unauthorized', { status: 401 });
	}
	console.log(request.method)
	const title = formdata.get('title') as string;
	if (
		(!title || title.length > 50 || title.length < 1) &&
		request.method === 'POST'
	) {
		return new Response('Invalid title', { status: 400 });
	}
	const id = parseInt(formdata.get('id') as string);
	if (!id && request.method === 'DELETE') {
		return new Response('Invalid id', { status: 400 });
	}
	switch (request.method) {
		case 'POST':
			await db
				.insert(booklist)
				.values({
					creator_id: userdata.id,
					title: title,
					public: false,
				})
				.onConflictDoNothing();
			break;
		case 'DELETE':
			await db
				.delete(booklist)
				.where(and(eq(booklist.creator_id, userdata.id), eq(booklist.id, id)));
			break;
	}
	return new Response(null, { status: 200 });
};

export const loader = async ({ request }: ActionFunctionArgs) => {
	const booklistId = createSearchParams(request.url).get('id');
	const booklists = await db
		.select()
		.from(booklist)
		.where(
			or(
				and(
					eq(booklist.id, parseInt(booklistId || '')),
					eq(booklist.public, true),
				),
				eq(
					booklist.creator_id,
					((await authenticator.isAuthenticated(request)) as User).id,
				),
			),
		);
	return { booklists };
};
