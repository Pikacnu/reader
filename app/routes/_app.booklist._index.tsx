import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { db } from '~/services/db.server';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { useLoaderData, Link } from '@remix-run/react';
import { booklist_follower, booklist } from 'db/schema';
import { eq, or } from 'drizzle-orm';
import { useFetcher } from '@remix-run/react';
import bookshelf from '~/assests/bookshelf.svg';
import { useTranslation } from 'react-i18next';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userdata = (await authenticator.isAuthenticated(request)) as User;
  if (!userdata) {
    return { booklists: [] };
  }
  const booklists = await db
    .select()
    .from(booklist_follower)
    .rightJoin(booklist, eq(booklist.id, booklist_follower.booklist_id))
    .where(
      or(
        eq(booklist_follower.follower_id, userdata.id),
        eq(booklist.creator_id, userdata.id),
      ),
    );
  return { booklists };
};

export const meta: MetaFunction = () => {
  return [{ title: 'Laganto - Book List' }, { description: 'booklist' }];
};

export default function BookList() {
  const { t } = useTranslation();
  const { booklists } = useLoaderData<typeof loader>();
  const booklist = useFetcher();
  return (
    <div>
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 m-4 *:m-4'>
        {booklists.map((booklist, index) => {
          return (
            <Link
              className='outline outline-black rounded-lg flex flex-row items-center justify-around p-2'
              to={`/booklist/${booklist.booklist.id}`}
            >
              <img
                className='object-cover w-16 overflow-hidden'
                src={bookshelf}
                alt='bookshelf'
              />
              <p>
                {t('bookList.titleLabel')}: {booklist?.booklist?.title}
              </p>
            </Link>
          );
        })}
        <booklist.Form
          method='POST'
          action='/api/booklist'
          className='outline outline-gray-400 p-4 shadow-xl rounded-xl text-xl flex flex-col'
        >
          <input
            className='bg-inherit dark:text-white max-w-min p-1 rounded-lg outline-slate-300'
            type='text'
            name='title'
            id='title'
            placeholder={t('bookList.placeholder')}
          />
          <button
            onClick={() => {}}
            className='bg-slate-400 dark:bg-slate-700 text-black dark:text-white rounded-lg mt-2 p-2 bg-opacity-40 hover:bg-opacity-80 dark:bg-opacity-40 dark:hover:bg-opacity-80'
          >
            {t('bookList.create')}
          </button>
        </booklist.Form>
      </div>
    </div>
  );
}
