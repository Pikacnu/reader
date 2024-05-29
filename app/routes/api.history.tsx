import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { history } from 'db/schema';

export const loader = async () => {
	return redirect('/404');
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const body = await request.json();
	const { chapter, page, bookid } = body;
	if (
		chapter === undefined ||
		page === undefined ||
		bookid == undefined ||
		isNaN(parseInt(chapter)) ||
		isNaN(parseInt(page)) ||
		isNaN(parseInt(bookid)) ||
		parseInt(chapter) < 0 ||
		parseInt(page) < 0
	) {
		return {
			status: 400,
			message: 'Invalid request',
		};
	}
	const user = (await authenticator.isAuthenticated(request)) as User;
	if (!user) {
		return {
			status: 401,
			message: 'Unauthorized',
		};
	}
	await db
		.insert(history)
		.values({
			user_id: user.id,
			book_id: parseInt(bookid),
			chapter: parseInt(chapter),
			page: parseInt(page),
		})
		.onConflictDoUpdate({
			target: [history.user_id, history.book_id],
			set: {
				chapter: parseInt(chapter || '0'),
				page: parseInt(page || '0'),
				created_at: new Date(),
			},
		});
	return {
		status: 200,
		message: 'Success',
	};
};
