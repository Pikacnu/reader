import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Reader from '~/compoents/reader';
import { db } from '~/services/db.server';
import { chapter } from 'db/schema';
import { eq } from 'drizzle-orm';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	];
};

export const loader = async () => {
	return {
		pages: await db
			.select({
				content: chapter.content,
				title: chapter.title,
				pageIndex: chapter.chapter_id,
			})
			.from(chapter)
			.where(eq(chapter.book_id, 6)),
	};
};

export default function Index() {
	const data = useLoaderData<typeof loader>();
	console.log(data);
	return (
		<div className='w-full h-full m-0'>
			<Reader
				chapter={data}
			></Reader>
		</div>
	);
}
