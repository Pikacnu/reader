import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

interface SearchFilter {
  id: string;
  type: string;
  value: string;
}

interface FilterSuggestion {
  prefix: string;
  description: string;
  placeholder: string;
}

interface SearchProps {
  isInline?: boolean;
  showQuickFilters?: boolean; // 是否顯示快速過濾器按鈕
  customFilters?: FilterSuggestion[]; // 自訂過濾器選項
}

export default function Search({
  isInline = false,
  showQuickFilters = true,
  customFilters,
}: SearchProps) {
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [groupFilters, setGroupFilters] = useState(true); // 是否分組顯示過濾器
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 預設過濾器建議
  const filterSuggestions: FilterSuggestion[] = [
    {
      prefix: 'from:',
      description: t('search.filters.from'),
      placeholder: t('search.placeholders.author'),
    },
    {
      prefix: 'tag:',
      description: t('search.filters.tag'),
      placeholder: t('search.placeholders.tag'),
    },
    {
      prefix: 'text:',
      description: t('search.filters.text'),
      placeholder: t('search.placeholders.text'),
    },
    {
      prefix: 'before:',
      description: t('search.filters.before'),
      placeholder: t('search.placeholders.before'),
    },
    {
      prefix: 'after:',
      description: t('search.filters.after'),
      placeholder: t('search.placeholders.after'),
    },
  ];

  // 使用自訂過濾器或預設過濾器
  const activeFilters = customFilters || filterSuggestions;

  // 動態生成過濾器類型的正則表達式
  const getFilterTypesRegex = () => {
    const types = activeFilters.map((f) => f.prefix.slice(0, -1)).join('|');
    return types;
  };

  // 將過濾器按類型分組
  const getGroupedFilters = (): Map<string, SearchFilter[]> => {
    const grouped = new Map<string, SearchFilter[]>();
    filters.forEach((filter) => {
      const existing = grouped.get(filter.type) || [];
      grouped.set(filter.type, [...existing, filter]);
    });
    return grouped;
  };

  // 檢測是否正在輸入過濾器
  const detectFilterPrefix = (text: string): string | null => {
    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    for (const suggestion of activeFilters) {
      if (suggestion.prefix.startsWith(lastWord) && lastWord.length > 0) {
        return suggestion.prefix;
      }
    }
    return null;
  };

  // 獲取當前輸入的過濾建議
  const getCurrentSuggestions = (): FilterSuggestion[] => {
    const words = inputValue.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.length === 0) return [];

    return activeFilters.filter((suggestion) =>
      suggestion.prefix.startsWith(lastWord.toLowerCase()),
    );
  };

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 檢查是否顯示建議
    const suggestions = getCurrentSuggestions();
    setShowSuggestions(suggestions.length > 0);
    setActiveSuggestion(0);
  };

  // 處理鍵盤事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const suggestions = getCurrentSuggestions();

    if (e.key === 'Enter') {
      e.preventDefault();

      if (showSuggestions && suggestions.length > 0) {
        // 選擇建議
        applySuggestion(suggestions[activeSuggestion]);
      } else {
        // 先檢查是否有未完成的過濾器
        const trimmedValue = inputValue.trim();
        const filterTypesRegex = getFilterTypesRegex();
        const match = trimmedValue.match(
          new RegExp(`^(${filterTypesRegex}):(\\S+)$`),
        );
        if (match && match[2]) {
          // 轉換成標籤
          const newFilter: SearchFilter = {
            id: Date.now().toString(),
            type: match[1],
            value: match[2],
          };
          setFilters([...filters, newFilter]);
          setInputValue('');
        } else if (inputValue.trim() || filters.length > 0) {
          // 執行搜尋（有輸入文字或有過濾器時）
          handleSearch();
        }
      }
    } else if (e.key === ' ') {
      // 空格鍵 - 將完整的過濾器轉換成標籤
      const trimmedValue = inputValue.trim();
      const filterTypesRegex = getFilterTypesRegex();
      const match = trimmedValue.match(
        new RegExp(`^(${filterTypesRegex}):(\\S+)$`),
      );
      if (match && match[2]) {
        e.preventDefault();
        const converted = handleSpace();
        if (!converted) {
          // 如果轉換失敗，允許輸入空格
          setInputValue(inputValue + ' ');
        }
      }
      // 否則允許正常輸入空格
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (
      e.key === 'Backspace' &&
      inputValue === '' &&
      filters.length > 0
    ) {
      // 刪除最後一個過濾器
      e.preventDefault();
      removeFilter(filters[filters.length - 1].id);
    }
  };

  // 應用建議
  const applySuggestion = (suggestion: FilterSuggestion) => {
    const words = inputValue.split(' ');
    words[words.length - 1] = suggestion.prefix;
    setInputValue(words.join(' '));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // 處理空格鍵 - 將完整的過濾器轉換成標籤
  const handleSpace = () => {
    // 檢查整個輸入框的內容
    const trimmedValue = inputValue.trim();
    const filterTypesRegex = getFilterTypesRegex();
    const match = trimmedValue.match(
      new RegExp(`^(${filterTypesRegex}):(\\S+)$`),
    );

    if (match && match[2]) {
      // 創建過濾器標籤
      const newFilter: SearchFilter = {
        id: Date.now().toString(),
        type: match[1],
        value: match[2],
      };
      setFilters([...filters, newFilter]);
      setInputValue('');
      return true;
    }
    return false;
  };

  // 添加過濾器
  const addFilter = (type: string, value: string) => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type,
      value,
    };
    setFilters([...filters, newFilter]);
  };

  // 移除過濾器
  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  // 移除某個類型的所有過濾器
  const removeFiltersByType = (type: string) => {
    setFilters(filters.filter((f) => f.type !== type));
  };

  // 解析輸入並創建過濾器
  const parseInput = (text: string) => {
    const filterTypesRegex = getFilterTypesRegex();
    const regex = new RegExp(`(${filterTypesRegex}):(\\S+)`, 'g');
    let match;
    const newFilters: SearchFilter[] = [];
    let remainingText = text;

    while ((match = regex.exec(text)) !== null) {
      newFilters.push({
        id: Date.now().toString() + Math.random(),
        type: match[1],
        value: match[2],
      });
      remainingText = remainingText.replace(match[0], '').trim();
    }

    return { filters: newFilters, text: remainingText };
  };

  // 執行搜尋
  const handleSearch = () => {
    const { filters: parsedFilters, text } = parseInput(inputValue);
    const allFilters = [...filters, ...parsedFilters];

    // 構建搜尋 URL
    const params = new URLSearchParams();

    if (text) {
      params.set('text', text);
    }

    allFilters.forEach((filter) => {
      if (filter.type === 'from') {
        params.set('author', filter.value);
      } else if (filter.type === 'tag') {
        const existingTags = params.get('tag');
        params.set(
          'tag',
          existingTags ? `${existingTags},${filter.value}` : filter.value,
        );
      }
      // 可以添加更多過濾器類型
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className='relative w-full max-w-2xl mx-auto'>
      {/* 搜尋框容器 */}
      <div className='relative'>
        <div className='flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors flex-wrap'>
          {/* 過濾器標籤 - 分組或非分組顯示 */}
          {groupFilters
            ? // 分組顯示
              Array.from(getGroupedFilters()).map(([type, typeFilters]) => (
                <div
                  key={type}
                  className='flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md text-sm'
                >
                  <span className='font-semibold'>{type}:</span>
                  <div className='flex items-center gap-1 flex-wrap'>
                    {typeFilters.map((filter, index) => (
                      <span
                        key={filter.id}
                        className='flex items-center'
                      >
                        <span>{filter.value}</span>
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className='ml-1 hover:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center'
                          aria-label={`${t('search.removeFilter')} ${
                            filter.value
                          }`}
                        >
                          ×
                        </button>
                        {index < typeFilters.length - 1 && (
                          <span className='mx-1 text-blue-200'>|</span>
                        )}
                      </span>
                    ))}
                  </div>
                  {typeFilters.length > 1 && (
                    <button
                      onClick={() => removeFiltersByType(type)}
                      className='ml-1 hover:bg-blue-600 rounded px-1 text-xs'
                      aria-label={t('search.removeAllFilters', { type })}
                      title={t('search.removeAll')}
                    >
                      {t('search.removeAll')}
                    </button>
                  )}
                </div>
              ))
            : // 非分組顯示（原本的方式）
              filters.map((filter) => (
                <div
                  key={filter.id}
                  className='flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md text-sm whitespace-nowrap'
                >
                  <span className='font-semibold'>{filter.type}:</span>
                  <span>{filter.value}</span>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className='ml-1 hover:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center'
                    aria-label={t('search.removeFilter')}
                  >
                    ×
                  </button>
                </div>
              ))}

          {/* 輸入框 */}
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={filters.length === 0 ? t('search.placeholder') : ''}
            className='flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
          />

          {/* 搜尋按鈕 */}
          <button
            onClick={handleSearch}
            className='px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors'
          >
            {t('search.button')}
          </button>
        </div>

        {/* 建議下拉框 */}
        {showSuggestions && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden'>
            {getCurrentSuggestions().map((suggestion, index) => (
              <button
                key={suggestion.prefix}
                onClick={() => applySuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  index === activeSuggestion
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''
                }`}
              >
                <div className='flex items-center gap-3'>
                  <span className='font-mono font-semibold text-blue-500 dark:text-blue-400'>
                    {suggestion.prefix}
                  </span>
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {suggestion.description}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {t('search.example')}: {suggestion.prefix}
                      {suggestion.placeholder}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 快速過濾器按鈕和選項 */}
      {showQuickFilters && (
        <div className='flex flex-wrap gap-2 mt-3 items-center'>
          {activeFilters.map((suggestion) => (
            <button
              key={suggestion.prefix}
              onClick={() => {
                setInputValue(
                  inputValue + (inputValue ? ' ' : '') + suggestion.prefix,
                );
                inputRef.current?.focus();
              }}
              className='px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors'
            >
              {suggestion.prefix}
            </button>
          ))}

          {/* 分組切換按鈕 */}
          {filters.length > 0 && (
            <button
              onClick={() => setGroupFilters(!groupFilters)}
              className='ml-auto px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors flex items-center gap-1'
              title={
                groupFilters
                  ? t('search.groupTooltip')
                  : t('search.ungroupTooltip')
              }
            >
              {groupFilters ? t('search.grouped') : t('search.ungrouped')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
