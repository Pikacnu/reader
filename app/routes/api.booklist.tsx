import { ActionFunctionArgs, redirect, MetaFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { booklist, booklist_book } from 'db/schema';
import { and, eq, or } from 'drizzle-orm';
import { createSearchParams } from '@remix-run/react';

export const action = async ({ request }: ActionFunctionArgs) => {
	const userdata = (await authenticator.isAuthenticated(request)) as User;
	const formdata = await request.formData();
	if (!userdata) {
		return new Response('Unauthorized', { status: 401 });
	}
	switch (request.method) {
		case 'POST':
			const title = formdata.get('title') as string;
			if (!title || title.length > 50 || title.length < 1) {
				return new Response('Invalid title', { status: 400 });
			}
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
			const id = parseInt(formdata.get('id') as string);
			if (!id) {
				return new Response('Invalid id', { status: 400 });
			}
			await db
				.delete(booklist)
				.where(and(eq(booklist.creator_id, userdata.id), eq(booklist.id, id)));
			break;
		case 'PATCH':
			const bookid = parseInt(formdata.get('book_id') as string);
			const booklistId = parseInt(formdata.get('booklist_id') as string);
			if (!booklistId) {
				return new Response('Invalid booklist_id', { status: 400 });
			}

			const isAuthor = (
				await db
					.select()
					.from(booklist)
					.where(
						and(
							eq(booklist.id, booklistId),
							eq(booklist.creator_id, userdata.id),
						),
					)
			)[0];
			if (!isAuthor) {
				return new Response('Unauthorized', { status: 401 });
			}
			if (formdata.get('type') === 'book') {
				if (!bookid) {
					return new Response('Invalid id', { status: 400 });
				}
				await db
					.insert(booklist_book)
					.values({
						booklist_id: booklistId,
						book_id: bookid,
					})
					.onConflictDoNothing();
				break;
			}
			if (formdata.get('type') === 'public') {
				const id = parseInt(formdata.get('booklist_id') as string);
				if (!id) {
					return new Response('Invalid id', { status: 400 });
				}
				await db
					.update(booklist)
					.set({ public: true })
					.where(
						and(eq(booklist.creator_id, userdata.id), eq(booklist.id, id)),
					);
				return new Response(null, { status: 200 });
				break;
			}
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
