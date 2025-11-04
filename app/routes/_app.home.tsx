import type { MetaFunction } from '@remix-run/node';
import { LoaderFunctionArgs } from '@remix-run/node';
import { account, book, history } from 'db/schema';
import { db } from '~/services/db.server';
import { useLoaderData } from '@remix-run/react';
import BookCard from '~/compoents/bookcard';
import { eq, and, gte } from 'drizzle-orm';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction = () => {
  return [{ title: 'Laganto - Home' }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = (await authenticator.isAuthenticated(request)) as User;

  const recently_add = (
    await db
      .select()
      .from(book)
      .limit(10)
      .innerJoin(account, eq(book.author_id, account.id))
      .where(
        and(
          eq(book.published, true),
          gte(book.created_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        ),
      )
      .orderBy(book.created_at)
  ).map((data) =>
    Object.assign(data.book, { author_name: data.account.name || '' }),
  );

  const recently_update = (
    await db
      .select()
      .from(book)
      .limit(10)
      .innerJoin(account, eq(book.author_id, account.id))
      .where(
        and(
          eq(book.published, true),
          gte(book.update_at, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        ),
      )
      .orderBy(book.update_at)
  ).map((data) =>
    Object.assign(data.book, { author_name: data.account.name || '' }),
  );

  if (!user) {
    return {
      recently_add,
      recently_update,
      all: [],
      recently_read: [],
    };
  }

  const all = (
    await db
      .select()
      .from(book)
      .limit(10)
      .innerJoin(account, eq(book.author_id, account.id))
  ).map((data) =>
    Object.assign(data.book, { author_name: data.account.name || '' }),
  );

  return {
    recently_add,
    recently_update,
    recently_read: (
      await db
        .select()
        .from(history)
        .innerJoin(book, eq(book.id, history.book_id))
        .innerJoin(account, eq(book.author_id, account.id))
        .where(
          and(
            eq(book.published, true),
            gte(
              history.created_at,
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ),
            eq(history.user_id, user.id),
          ),
        )
        .orderBy(history.created_at)
    ).map((data) =>
      Object.assign(data.book, { author_name: data.account.name || '' }),
    ),
  };
};

export default function Index() {
  const { recently_add, recently_update, recently_read } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const data = [
    {
      title: t('home.recentlyRead'),
      books: [...recently_read],
    },
    {
      title: t('home.recentlyAdded'),
      books: [...recently_add],
    },
    {
      title: t('home.recentlyUpdated'),
      books: [...recently_update],
    },
    {
      title: t('home.recommended'),
      books: [],
    },
    {
      title: t('home.popular'),
      books: [],
    },
    {
      title: t('home.all'),
      books: [],
    },
  ];
  return (
    <div className='overflow-hidden m-2 lg:m-4 bg-white dark:bg-gray-900'>
      {data.map((item, index) =>
        item.books.length ? (
          <div
            key={index}
            className='justify-center flex flex-1 flex-col mb-6'
          >
            <h1 className='text-2xl text-gray-900 dark:text-white mb-2'>
              {item.title}
            </h1>
            <hr className='border-gray-300 dark:border-gray-700' />
            <div className='mt-2 lg:m-2 *:m-2 flex overflow-auto *:min-w-max *:min-h-max'>
              {item.books.map((e, i) => {
                return (
                  <BookCard
                    key={i * index * 10}
                    title={e?.title || ''}
                    tags={e?.tags || []}
                    cover={e?.cover || ''}
                    author={e?.author_name || ''}
                    src={`/book/${e?.id}`}
                  />
                );
              })}
            </div>
          </div>
        ) : null,
      )}
      <div className='h-16 items-center justify-center flex text-gray-600 dark:text-gray-400'>
        {t('home.noContent')}
      </div>
    </div>
  );
}
