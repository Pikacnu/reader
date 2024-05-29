import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { book } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '~/types/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = (await authenticator.isAuthenticated(request)) as User;
	if (!user) {
		return redirect('/login');
	}
	const { id, title, cover, tags, description, published, allow_comments } =
		await request.json();
	if (!id) {
		return redirect('/edit');
	}
	const book_data = await db.select().from(book).where(eq(book.id, id));
	if (book_data.length === 0) {
		return redirect('/edit');
	}
	if (book_data[0].author_id !== user.id) {
		return redirect('/edit');
	}
	if (request.method === 'POST') {
		await db
			.update(book)
			.set({
				id: id,
				title: title,
				cover: cover === undefined ? '' : cover,
				tags: tags === undefined ? [] : tags.split(',') || [],
				description: description,
				published: published,
				allow_comments: allow_comments,
			})
			.where(and(eq(book.id, id), eq(book.author_id, user.id)));
	}
	if (request.method === 'DELETE') {
		await db
			.delete(book)
			.where(and(eq(book.id, id), eq(book.author_id, user.id)));
	}
	return {
		success: true,
	};
};
