import { Link } from '@remix-run/react';
import Navbar from '~/compoents/navbar';
import { useTranslation } from 'react-i18next';

export default function test() {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col w-full h-dvh bg-black/60'>
      <Navbar />
      <div className='w-full flex-grow bg-blue-600 bg-opacity-70 grid-rows-subgrid row-span-4 flex flex-col items-start pl-20 *:p-4 justify-center h-full'>
        <p className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 m-2'>
          {t('landing.title')}
        </p>
        <p className='text-xl text-gray-200 opacity-80'>
          {t('landing.subtitle')}
        </p>
        <div className='flex flex-row'>
          <Link
            to='/home'
            className='bg-blue-300 px-4 py-2 rounded-xl hover:bg-blue-400 transition-colors'
          >
            {t('landing.getStarted')}
          </Link>
        </div>
      </div>
      <div className='h-full w-full bg-black relative'>
        <div className='flex flex-col bg-emerald-600 bg-opacity-90 p-6 text-white '>
          <h2 className='text-2xl font-bold mb-4'>{t('landing.whatIs')}</h2>
          <div className='mb-6 bg-black bg-opacity-30 p-4 rounded-lg'>
            <p className='mb-2'>{t('landing.description1')}</p>
            <p className='mb-2'>{t('landing.description2')}</p>
            <p>{t('landing.description3')}</p>
          </div>
          <hr className='border-emerald-800 my-4' />
          <h2 className='text-2xl font-bold  mb-4'>{t('landing.whyChoose')}</h2>
          <div className='bg-black bg-opacity-30 p-4 rounded-lg'>
            <p className='mb-2'>{t('landing.feature1')}</p>
            <p className='mb-2'>{t('landing.feature2')}</p>
            <p className='mb-2'>{t('landing.feature3')}</p>
            <p>{t('landing.feature4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
