import Search from '~/compoents/search';
import { useTranslation } from 'react-i18next';

export default function SearchExamples() {
  const { t } = useTranslation();

  // 自訂過濾器範例
  const customBookFilters = [
    {
      prefix: 'author:',
      description: t('search.filters.author'),
      placeholder: t('search.placeholders.author'),
    },
    {
      prefix: 'title:',
      description: t('search.filters.title'),
      placeholder: t('search.placeholders.title'),
    },
    {
      prefix: 'genre:',
      description: t('search.filters.genre'),
      placeholder: t('search.placeholders.genre'),
    },
    {
      prefix: 'year:',
      description: t('search.filters.year'),
      placeholder: t('search.placeholders.year'),
    },
    {
      prefix: 'rating:',
      description: t('search.filters.rating'),
      placeholder: t('search.placeholders.rating'),
    },
  ];
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-8'>
          {t('searchExamples.title')}
        </h1>

        {/* 範例 1: 預設搜尋（顯示快速鍵） */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            1. {t('searchExamples.example1.title')}
          </h2>
          <Search />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300'>
              {`<Search />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('searchExamples.example1.description')}
            </p>
          </div>
        </section>

        {/* 範例 2: 隱藏快速鍵 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            2. {t('searchExamples.example2.title')}
          </h2>
          <Search showQuickFilters={false} />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300'>
              {`<Search showQuickFilters={false} />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('searchExamples.example2.description')}
            </p>
          </div>
        </section>

        {/* 範例 3: 自訂過濾器 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            3. {t('searchExamples.example3.title')}
          </h2>
          <Search customFilters={customBookFilters} />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre'>
              {`const customFilters = [
  { prefix: 'author:', description: '${t(
    'search.filters.author',
  )}', placeholder: '${t('search.placeholders.author')}' },
  { prefix: 'title:', description: '${t(
    'search.filters.title',
  )}', placeholder: '${t('search.placeholders.title')}' },
  { prefix: 'genre:', description: '${t(
    'search.filters.genre',
  )}', placeholder: '${t('search.placeholders.genre')}' },
  { prefix: 'year:', description: '${t(
    'search.filters.year',
  )}', placeholder: '${t('search.placeholders.year')}' },
  { prefix: 'rating:', description: '${t(
    'search.filters.rating',
  )}', placeholder: '${t('search.placeholders.rating')}' },
];

<Search customFilters={customFilters} />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('searchExamples.example3.description')}
            </p>
          </div>
        </section>

        {/* 範例 4: 自訂過濾器 + 隱藏快速鍵 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            4. {t('searchExamples.example4.title')}
          </h2>
          <Search
            customFilters={customBookFilters}
            showQuickFilters={false}
          />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300'>
              {`<Search customFilters={customFilters} showQuickFilters={false} />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('searchExamples.example4.description')}
            </p>
          </div>
        </section>

        {/* 功能說明 */}
        <section className='mt-12'>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            {t('searchExamples.features.title')}
          </h2>
          <div className='space-y-4 text-gray-700 dark:text-gray-300'>
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h3 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                {t('searchExamples.features.dynamicRegex.title')}
              </h3>
              <p className='text-sm'>
                {t('searchExamples.features.dynamicRegex.description')}
              </p>
            </div>

            <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <h3 className='font-semibold text-green-900 dark:text-green-100 mb-2'>
                {t('searchExamples.features.toggleQuickFilters.title')}
              </h3>
              <p className='text-sm'>
                {t('searchExamples.features.toggleQuickFilters.description')}
              </p>
            </div>

            <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
              <h3 className='font-semibold text-purple-900 dark:text-purple-100 mb-2'>
                {t('searchExamples.features.customFilters.title')}
              </h3>
              <p className='text-sm'>
                {t('searchExamples.features.customFilters.description')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
