import { LoaderFunctionArgs } from '@remix-run/node';
import { db } from '~/services/db.server';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { useLoaderData, Link } from '@remix-run/react';
import { booklist_follower, booklist } from 'db/schema';
import { eq, or } from 'drizzle-orm';
import { useFetcher } from '@remix-run/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userdata = (await authenticator.isAuthenticated(request)) as User;
	if (!userdata) {
		return { booklists: [] };
	}
	const booklists = await db
		.select()
		.from(booklist_follower)
		.rightJoin(booklist, eq(booklist.id, booklist_follower.booklist_id))
		.where(or(eq(booklist_follower.follower_id, userdata.id), eq(booklist.creator_id, userdata.id)));
	return { booklists };
};

export default function BookList() {
	const { booklists } = useLoaderData<typeof loader>();
	const booklist = useFetcher();
	return (
		<div>
			<div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 m-4 *:m-4'>
				{booklists.map((booklist, index) => {
					return (
						<Link className='outline outline-black rounded-lg flex flex-col items-center justify-center' to={`/booklist/${booklist.booklist.id}`}>
							<p>{booklist?.booklist?.title}</p>
						</Link>
					);
				})}
				<booklist.Form
					method='post'
					action='/api/booklist'
					className='outline outline-gray-400 p-4 shadow-xl rounded-xl text-xl flex-grow '
				>
					<input
						type='text'
						name='title'
						id='title'
						placeholder='title'
					/>
					<button onClick={
						()=>{
							
						}
					}>Create</button>
				</booklist.Form>
			</div>
		</div>
	);
}
