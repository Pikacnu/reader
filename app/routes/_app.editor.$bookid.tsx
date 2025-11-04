import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import View from '~/compoents/blocknote/blocknote';
import { BlockNoteEditor } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { User } from '~/types/user.server';
import { db } from '~/services/db.server';
import { chapter, book } from 'db/schema';
import { eq, and } from 'drizzle-orm';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { useLightMode } from '~/context/light_toggle_context';

interface Chapter {
  title: string;
  text: any[];
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { bookid } = params;
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect('/login');
  }
  const bookdata = (
    await db
      .select()
      .from(book)
      .where(
        and(eq(book.id, parseInt(bookid || '0')), eq(book.author_id, user.id)),
      )
  )[0];
  if (!bookdata) return redirect('/edit');
  const chpaters = await db
    .select({
      title: chapter.title,
      content: chapter.content,
    })
    .from(chapter)
    .where(eq(chapter.book_id, parseInt(bookid || '0')));
  if (chpaters.length === 0) {
    return { chapters: null, book_id: bookid };
  }
  const chapters = chpaters.map((data) => {
    return {
      title: data.title || '',
      text: data.content || [],
    };
  });
  return { chapters: chapters, book_id: bookid };
};

export default function Editor() {
  const { chapters, book_id } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { isLightMode, toggleLightMode } = useLightMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chapterList, setChapterList] = useState<Chapter[]>(
    chapters
      ? chapters
      : [
          {
            title: t('editor.chapter', { number: 1 }),
            text: [''],
          },
        ],
  );
  const [editing, setEditing] = useState(0);
  const [editorLoad, setEditorLoad] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editor = useRef<BlockNoteEditor | null>();
  const time = useRef(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date().getTime() - time.current > 1_000 * 60 * 1) {
        time.current = new Date().getTime();
        const texts = blockToText();
        setChapterList((prev) => [
          ...prev.slice(0, editing),
          {
            title: prev[editing].title,
            text: texts || [''],
          },
          ...prev.slice(editing + 1, prev.length),
        ]);
        setIsSaving(true);
        fetch('/api/book/content/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chapters: [
              ...chapterList.slice(0, editing),
              {
                title: chapterList[editing].title,
                text: texts || [''],
              },
              ...chapterList.slice(editing + 1, chapterList.length),
            ],
            book_id: book_id,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
          })
          .catch((error) => {
            console.error('保存失敗:', error);
          })
          .finally(() => {
            setIsSaving(false);
          });
      }
    }, 1 * 60 * 1_000);
    return () => {
      clearInterval(interval);
    };
  }, [chapterList, editing]);

  const blockToText = useCallback(() => {
    //@ts-ignore 4
    return (
      editor.current?.document.length === 1
        ? editor.current?.document
        : editor.current?.document.slice(0, editor.current?.document.length - 1)
    ).map((e) =>
      // @ts-ignore
      e.content.length === 0
        ? ''
        : // @ts-ignore
        e.content[0].text.includes('\n')
        ? // @ts-ignore
          e.content[0].text.split('\n')
        : // @ts-ignore
          e.content[0].text,
    );
  }, [editorLoad]);

  // 切換章節
  const switchChapter = useCallback(
    (index: number) => {
      if (editing === index) return;
      const texts = blockToText();

      // 先保存當前章節內容並獲取更新後的列表
      setChapterList((prev) => {
        const updatedList = [
          ...prev.slice(0, editing),
          {
            title: prev[editing].title,
            text: texts || [''],
          },
          ...prev.slice(editing + 1, prev.length),
        ];

        // 使用更新後的列表來切換章節
        setTimeout(() => {
          editor.current?.removeBlocks(editor.current?.document);
          updatedList[index].text.map((text) =>
            editor.current?.insertBlocks(
              [
                {
                  type: 'paragraph',
                  content: [text],
                },
              ],
              editor.current.document[
                editor.current.document.length === 0
                  ? 0
                  : editor.current.document.length - 1
              ],
            ),
          );
        }, 0);

        return updatedList;
      });

      setEditing(index);
      // 切換章節時自動保存，所以清除未保存狀態
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    },
    [editing, blockToText],
  );

  // 添加新章節
  const addChapter = useCallback(() => {
    if (chapterList.length === 0) {
      return setChapterList([
        {
          title: t('editor.chapter', { number: 1 }),
          text: editor.current?.document || [''],
        },
      ]);
    }
    const texts = blockToText();
    setChapterList((prev) => [
      ...prev.slice(0, editing),
      {
        title: prev[editing].title,
        text: texts || [''],
      },
      ...prev.slice(editing + 1, prev.length),
      {
        title: t('editor.chapter', { number: chapterList.length + 1 }),
        text: [''],
      },
    ]);
    setEditing(chapterList.length);
    setHasUnsavedChanges(true);
    editor.current?.removeBlocks(editor.current?.document);
  }, [chapterList, editing, blockToText, t]);

  // 刪除章節
  const deleteChapter = useCallback(
    (index: number) => {
      if (chapterList.length <= 1) {
        alert(t('editor.minChapterWarning'));
        return;
      }
      if (
        !confirm(t('editor.deleteConfirm', { title: chapterList[index].title }))
      ) {
        return;
      }
      setChapterList((prev) => prev.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
      if (editing >= chapterList.length - 1) {
        setEditing(Math.max(0, chapterList.length - 2));
      }
    },
    [chapterList, editing, t],
  );

  // 更新章節標題
  const updateChapterTitle = useCallback((index: number, newTitle: string) => {
    setChapterList((prev) => [
      ...prev.slice(0, index),
      {
        title: newTitle,
        text: prev[index].text,
      },
      ...prev.slice(index + 1, prev.length),
    ]);
    setHasUnsavedChanges(true);
  }, []);

  // 手動保存
  const handleManualSave = useCallback(async () => {
    setIsSaving(true);
    const texts = blockToText();
    const updatedChapters = [
      ...chapterList.slice(0, editing),
      {
        title: chapterList[editing].title,
        text: texts || [''],
      },
      ...chapterList.slice(editing + 1, chapterList.length),
    ];

    try {
      const response = await fetch('/api/book/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapters: updatedChapters,
          book_id: book_id,
        }),
      });

      if (!response.ok) {
        throw new Error(t('editor.saveFailed'));
      }

      const result = await response.json();
      console.log(t('editor.saveSuccess'), result);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setChapterList(updatedChapters);
      alert(t('editor.saveSuccess'));
    } catch (error) {
      console.error('保存錯誤:', error);
      alert(t('editor.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [chapterList, editing, book_id, blockToText, t]);

  return (
    <div className='flex h-screen w-full bg-gray-50 dark:bg-gray-900'>
      {/* 側邊欄 - 章節列表 */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
      >
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
            {t('editor.chapterList')}
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto p-2'>
          {chapterList.map((item, index) => (
            <div
              key={index}
              className={`group mb-2 rounded-lg transition-all ${
                index === editing
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className='p-3 flex items-center justify-between'>
                <input
                  type='text'
                  value={item.title}
                  onChange={(e) => updateChapterTitle(index, e.target.value)}
                  onClick={() => switchChapter(index)}
                  className='flex-1 bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer'
                />
                <button
                  onClick={() => deleteChapter(index)}
                  className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2 text-lg'
                  title={t('editor.deleteChapter')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='p-2 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={addChapter}
            className='w-full py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors'
          >
            ＋ {t('editor.addChapter')}
          </button>
        </div>
      </div>

      {/* 主編輯區域 */}
      {/* 主編輯區域 */}
      <div className='flex-1 flex flex-col'>
        {/* 頂部工具列 */}
        <div className='h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              title={
                isSidebarOpen
                  ? t('editor.hideSidebar')
                  : t('editor.showSidebar')
              }
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>

            <div className='text-sm text-gray-600 dark:text-gray-300'>
              <span className='font-medium'>{chapterList[editing]?.title}</span>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            {/* 保存狀態 */}
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {isSaving ? (
                <span className='flex items-center'>
                  <span className='animate-spin mr-2'>⏳</span>
                  {t('editor.saving')}
                </span>
              ) : hasUnsavedChanges ? (
                <span className='text-orange-500 dark:text-orange-400'>
                  {t('editor.unsavedChanges')}
                </span>
              ) : lastSaved ? (
                <span className='text-green-600 dark:text-green-400'>
                  {t('editor.saved', { time: lastSaved.toLocaleTimeString() })}
                </span>
              ) : null}
            </div>

            {/* 主題切換按鈕 */}
            <button
              onClick={toggleLightMode}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl'
              title={t('editor.toggleTheme')}
            >
              {isLightMode ? '🌙' : '☀️'}
            </button>

            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className='px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors'
            >
              {isSaving ? t('editor.saving') : t('editor.save')}
            </button>
          </div>
        </div>

        {/* 編輯器 */}
        <div className='flex-1 overflow-auto bg-white dark:bg-gray-900'>
          <div className='max-w-4xl mx-auto py-8 px-6'>
            <Suspense>
              <View
                // @ts-ignore
                defaultdata={chapterList[editing].text.map((text) => {
                  return {
                    type: 'paragraph',
                    content: [text],
                  };
                })}
                getEditor={(data) => {
                  editor.current = data;
                  setEditorLoad(true);
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
