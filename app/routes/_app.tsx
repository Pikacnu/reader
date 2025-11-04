import { Outlet, Link } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import account from '~/assests/account.svg';
import home from '~/assests/home.svg';
import history from '~/assests/history.svg';
import edit from '~/assests/edit.svg';
import { db } from '~/services/db.server';
import { booklist, booklist_follower } from 'db/schema';
import { useEffect, useState } from 'react';
import { eq, or } from 'drizzle-orm';
import { User } from '~/types/user.server';
import { booklistcontext, booklistBookidContext } from '~/services/contexts';
import bookshelf from '~/assests/bookshelf.svg';
import search from '~/assests/search.svg';
import { LightToggleProvider } from '~/context/light_toggle_context';
import SettingsPanel from '~/compoents/settings';
import { useTranslation } from 'react-i18next';
import { i18n } from '~/utils/i18n.server';
import Search from '~/compoents/search';

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const logindata = (await authenticator.isAuthenticated(
    request,
  )) as User | null;
  const locale = await i18n.getLocale(request);
  if (!logindata) return { logindata: logindata, booklists: [], locale };
  const booklists = await db
    .select()
    .from(booklist)
    .leftJoin(booklist_follower, eq(booklist.id, booklist_follower.booklist_id))
    .where(
      or(
        eq(booklist_follower.follower_id, logindata.id),
        eq(booklist.creator_id, logindata.id),
      ),
    );
  return { logindata: logindata, booklists: booklists, locale };
};

export default function Layout() {
  const { logindata, booklists } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [booklistOpen, setBooklistOpen] = useState(false);
  const [booklistBookid, setBooklistBookid] = useState(0);
  const [searchString, setSearchString] = useState('');

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    let string: string[] = [];
    search.forEach((value, key) => {
      string.push(`${key}=${value}`);
    });
    let searchString = string.join(' ').replace('text=', '');
    setSearchString(searchString);
  }, []);
  return (
    <LightToggleProvider>
      <div className='flex flex-col h-dvh w-full'>
        {booklistOpen ? (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 z-10 shadow-lg flex-col flex md:min-w-[20vw] min-w-[60vw] justify-center items-center *:m-2 rounded-lg border border-gray-200 dark:border-gray-700'>
            <h1 className='text-gray-900 dark:text-white'>
              {t('booklist.selectBooklist')}
            </h1>
            <button
              className='absolute text-lg right-2 top-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 w-8 h-8 rounded'
              onClick={() => setBooklistOpen(false)}
            >
              X
            </button>
            <hr className='bg-gray-800 dark:bg-gray-200 w-2/3' />
            <div className='flex w-full m-2 justify-center items-center flex-col'>
              {booklists.map((data, index) => {
                return (
                  <div
                    key={index}
                    className='flex justify-between w-1/2 text-gray-900 dark:text-white'
                  >
                    <p>{data?.booklist?.title || ''}</p>
                    <button
                      className='px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded'
                      onClick={() => {
                        const formdata = new FormData();
                        formdata.append(
                          'booklist_id',
                          data?.booklist?.id.toString() || '',
                        );
                        formdata.append('book_id', booklistBookid.toString());
                        formdata.append('type', 'book');
                        fetch('/api/booklist', {
                          method: 'PATCH',
                          body: formdata,
                        });
                        setBooklistOpen(false);
                      }}
                    >
                      {t('booklist.add')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className='flex w-full h-12 lg:h-14 bg-gray-600 dark:bg-gray-800 align-middle justify-between'>
          <div className='h-12 w-12 lg:h-14 lg:w-16 relative hover:cursor-pointer '>
            <Link to={'/account'}>
              <img
                src={logindata?.photoURL || account}
                alt='User Profile'
                className='object-cover lg:h-14 lg:w-16'
              />
            </Link>
            <div className='w-16'></div>
          </div>
          <div className='flex-1 flex items-center justify-center'>
            {/* Search Bar */}
            {/*
							<form
              className='flex items-center bg-blue-200 dark:bg-gray-700 rounded-lg w-full max-w-2xl mx-4'
              onSubmit={(e) => {
                e.preventDefault();
                if (searchString === '') return console.log('empty');
                let temp = searchString.split(' ');
                const searchTarget: {
                  tag?: string;
                  author?: string;
                  text?: string;
                } = Object.assign(
                  {},
                  ...temp.map((e) => {
                    if (e.startsWith('tag:')) {
                      return {
                        tag: e.replace('tag:', ''),
                      };
                    } else if (e.startsWith('author:')) {
                      return {
                        author: e.replace('author:', ''),
                      };
                    }
                    return {
                      text: e,
                    };
                  }),
                );
                const search = new URLSearchParams();
                Object.entries(searchTarget || {}).forEach(([key, value]) => {
                  search.append(key, value || '');
                });
                window.location.href = `/search?${search.toString()}`;
              }}
            >
              <input
                list='search-options'
                type='text'
                placeholder={t('nav.search')}
                className='w-full px-4 py-2 bg-transparent text-gray-900 dark:text-white focus:outline-none'
                value={searchString}
                onChange={(e) => {
                  setSearchString(e.target.value);
                }}
              />
              <datalist
                id='search-options'
                onChange={(e) => {
                  console.log(e);
                }}
              >
                <option value='tag:'>Tag Search</option>
                <option value='author:'>Author Search</option>
                <option value='text:'>Text Search</option>
              </datalist>
              <button className='px-2'>
                <img
                  className='object-cover h-8 w-8 lg:h-10 lg:w-10'
                  src={search}
                  alt='Search'
                />
              </button>
            </form> */}
            <Search showQuickFilters={false} />
          </div>
          <div className='flex items-center px-4'>
            <SettingsPanel />
          </div>
        </div>
        <div className='flex flex-col-reverse lg:flex-row overflow-hidden flex-grow lg:h-[calc(100dvh-3.5rem)] h-dvh'>
          <div className='flex lg:flex-col overflow-hidden space-between align-middle justify-center flex-row *:m-2 lg:h-[calc(100vh-3.5rem)] h-16 w-full lg:w-16 bg-gray-500 dark:bg-gray-800'>
            {(logindata
              ? [
                  {
                    name: t('nav.home'),
                    src: '/home',
                    icon: home,
                  },
                  {
                    name: t('nav.history'),
                    src: '/history',
                    icon: history,
                  },
                  {
                    name: t('nav.bookshelf'),
                    src: '/booklist',
                    icon: bookshelf,
                  },
                  {
                    name: t('nav.edit'),
                    src: '/edit',
                    icon: edit,
                  },
                  {
                    name: t('nav.account'),
                    src: '/account',
                    icon: account,
                  },
                ]
              : [
                  {
                    name: t('nav.home'),
                    src: '/home',
                    icon: home,
                  },
                  {
                    name: t('nav.login'),
                    src: '/account',
                    icon: account,
                  },
                ]
            ).map((item, index) => {
              return (
                <Link
                  to={item.src}
                  key={index}
                  className='flex flex-col items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-700 hover:shadow-lg shadow-black rounded-md *:rounded-md select-none w-12'
                >
                  <img
                    src={item.icon}
                    alt='ICON'
                    className='object-cover h-8 w-8 lg:h-12 lg:w-12 p-2 brightness-0 dark:brightness-100 invert dark:invert-0'
                  />
                  <p className='text-xs text-gray-900 dark:text-white'>
                    {item.name}
                  </p>
                </Link>
              );
            })}
          </div>
          <div
            className={
              'w-full h-full flex-grow lg:w-[calc(100%-4rem)] overflow-y-auto overflow-x-hidden'
            }
          >
            <booklistcontext.Provider
              value={{
                booklistOpen: booklistOpen,
                setBooklistOpen: setBooklistOpen,
              }}
            >
              <booklistBookidContext.Provider
                value={{
                  bookId: booklistBookid,
                  setBookId: setBooklistBookid,
                }}
              >
                <Outlet />
              </booklistBookidContext.Provider>
            </booklistcontext.Provider>
          </div>
        </div>
      </div>
    </LightToggleProvider>
  );
}
