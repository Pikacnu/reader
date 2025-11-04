import Search from '~/compoents/search';

// 自訂過濾器範例
const customBookFilters = [
  { prefix: 'author:', description: '作者', placeholder: '作者名稱' },
  { prefix: 'title:', description: '書名', placeholder: '書名' },
  { prefix: 'genre:', description: '類型', placeholder: '小說/散文/詩集' },
  { prefix: 'year:', description: '出版年份', placeholder: '2024' },
  { prefix: 'rating:', description: '評分', placeholder: '5' },
];

export default function SearchExamples() {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-8'>
          搜尋組件使用範例
        </h1>

        {/* 範例 1: 預設搜尋（顯示快速鍵） */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            1. 預設搜尋（顯示快速過濾器）
          </h2>
          <Search />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300'>
              {`<Search />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              預設行為，顯示所有快速過濾器按鈕
            </p>
          </div>
        </section>

        {/* 範例 2: 隱藏快速鍵 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            2. 精簡模式（隱藏快速過濾器）
          </h2>
          <Search showQuickFilters={false} />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300'>
              {`<Search showQuickFilters={false} />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              適合嵌入在頁面標題列或導航欄中，節省空間
            </p>
          </div>
        </section>

        {/* 範例 3: 自訂過濾器 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            3. 自訂過濾器
          </h2>
          <Search customFilters={customBookFilters} />
          <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <code className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre'>
              {`const customFilters = [
  { prefix: 'author:', description: '作者', placeholder: '作者名稱' },
  { prefix: 'title:', description: '書名', placeholder: '書名' },
  { prefix: 'genre:', description: '類型', placeholder: '小說/散文/詩集' },
  { prefix: 'year:', description: '出版年份', placeholder: '2024' },
  { prefix: 'rating:', description: '評分', placeholder: '5' },
];

<Search customFilters={customFilters} />`}
            </code>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              自訂過濾器選項，regex 會自動根據提供的過濾器生成
            </p>
          </div>
        </section>

        {/* 範例 4: 自訂過濾器 + 隱藏快速鍵 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            4. 自訂過濾器 + 精簡模式
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
              結合自訂過濾器與精簡模式，最大靈活性
            </p>
          </div>
        </section>

        {/* 功能說明 */}
        <section className='mt-12'>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            ✨ 新功能說明
          </h2>
          <div className='space-y-4 text-gray-700 dark:text-gray-300'>
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h3 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                🔧 動態 Regex
              </h3>
              <p className='text-sm'>
                所有過濾器的正則表達式會根據提供的{' '}
                <code className='px-1 bg-blue-100 dark:bg-blue-800 rounded'>
                  customFilters
                </code>{' '}
                或預設的{' '}
                <code className='px-1 bg-blue-100 dark:bg-blue-800 rounded'>
                  filterSuggestions
                </code>{' '}
                自動生成。 你不需要手動維護多個地方的過濾器列表！
              </p>
            </div>

            <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <h3 className='font-semibold text-green-900 dark:text-green-100 mb-2'>
                👁️ 顯示/隱藏快速過濾器
              </h3>
              <p className='text-sm'>
                使用{' '}
                <code className='px-1 bg-green-100 dark:bg-green-800 rounded'>
                  showQuickFilters
                </code>{' '}
                屬性控制是否顯示下方的快速過濾器按鈕。 適合在不同的 UI
                場景中使用。
              </p>
            </div>

            <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
              <h3 className='font-semibold text-purple-900 dark:text-purple-100 mb-2'>
                🎨 自訂過濾器
              </h3>
              <p className='text-sm'>
                透過{' '}
                <code className='px-1 bg-purple-100 dark:bg-purple-800 rounded'>
                  customFilters
                </code>{' '}
                屬性提供自己的過濾器配置。 組件會自動處理建議、轉換和搜尋邏輯。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
