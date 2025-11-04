import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';

import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import styles from './tailwind.css?url';
import { useChangeLanguage } from 'remix-i18next/react';
import { i18n } from './utils/i18n.server';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18n.getLocale(request);
  return json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='zh-TW'
      className='dark'
    >
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <meta
          name='description'
          content='A reading app for book lovers'
        />
        <title>Laganto</title>
        <meta
          name='og:title'
          content='Laganto'
        />
        <script
          src='https://challenges.cloudflare.com/turnstile/v0/api.js'
          async
          defer
        ></script>
        <Meta />
        <Links />
      </head>
      <body className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200'>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-4'>
          {isRouteErrorResponse(error) ? error.status : 'Error'}
        </h1>
        <p className='text-xl'>
          {isRouteErrorResponse(error)
            ? error.statusText
            : 'An unexpected error occurred'}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const locale = data?.locale ?? 'zh-TW';
  useChangeLanguage(locale);

  return <Outlet />;
}
