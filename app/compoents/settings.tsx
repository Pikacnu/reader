import { useLightMode } from '~/context/light_toggle_context';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function SettingsPanel() {
  const { isLightMode, toggleLightMode } = useLightMode();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.cookie = `i18next=${lng}; path=/; max-age=31536000`;
  };

  return (
    <div className='relative'>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
        aria-label='Settings'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className='absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-20'>
            <div className='p-4 space-y-4'>
              {/* Theme Toggle */}
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  {isLightMode
                    ? t('settings.lightMode')
                    : t('settings.darkMode')}
                </span>
                <button
                  onClick={toggleLightMode}
                  className='relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  style={{
                    backgroundColor: isLightMode ? '#3B82F6' : '#6B7280',
                  }}
                >
                  <span
                    className='inline-block w-4 h-4 transform bg-white rounded-full transition-transform'
                    style={{
                      transform: isLightMode
                        ? 'translateX(24px)'
                        : 'translateX(4px)',
                    }}
                  />
                </button>
              </div>

              {/* Language Selector */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  {t('settings.language')}
                </label>
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className='w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='zh-TW'>繁體中文</option>
                  <option value='zh-CN'>简体中文</option>
                  <option value='en'>English</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
