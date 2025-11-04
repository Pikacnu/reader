import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-row'>
      {[
        {
          name: t('nav.home'),
          src: '/',
        },
        {
          name: t('nav.about'),
          src: '/about',
        },
        {
          name: t('nav.terms'),
          src: '/terms',
        },
        {
          name: t('nav.contact'),
          src: '/contact',
        },
      ].map((item, index) => {
        return (
          <Link
            key={index * 10}
            className='p-4 text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-white transition-colors'
            to={item.src}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
