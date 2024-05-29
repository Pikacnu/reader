import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { book } from 'db/schema';
import { eq } from 'drizzle-orm';
import { User } from '~/types/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = (await authenticator.isAuthenticated(request)) as User;
	if (!user) {
		return redirect('/login');
	}
	const id = (await request.json()).id;
	if (id === -1) {
		const data = (await db
			.insert(book)
			.values({
				title: 'New Book',
				author_id: user.id,
				cover: '',
				tags: [],
			})
			.returning({ id: book.id }))[0];

		return redirect(`/edit/${data.id}`);
	}
	return redirect(`/edit/${id}`);
};
