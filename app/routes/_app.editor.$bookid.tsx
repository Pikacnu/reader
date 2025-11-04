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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chapterList, setChapterList] = useState<Chapter[]>(
    chapters
      ? chapters
      : [
          {
            title: 'Chapter 1',
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
          title: 'Chapter 1',
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
        title: `Chapter ${chapterList.length + 1}`,
        text: [''],
      },
    ]);
    setEditing(chapterList.length);
    setHasUnsavedChanges(true);
    editor.current?.removeBlocks(editor.current?.document);
  }, [chapterList, editing, blockToText]);

  // 刪除章節
  const deleteChapter = useCallback(
    (index: number) => {
      if (chapterList.length <= 1) {
        alert('至少需要保留一個章節');
        return;
      }
      if (!confirm(`確定要刪除「${chapterList[index].title}」嗎？`)) {
        return;
      }
      setChapterList((prev) => prev.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
      if (editing >= chapterList.length - 1) {
        setEditing(Math.max(0, chapterList.length - 2));
      }
    },
    [chapterList, editing],
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
        throw new Error('保存失敗');
      }

      const result = await response.json();
      console.log('保存成功:', result);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setChapterList(updatedChapters);
      alert('保存成功！');
    } catch (error) {
      console.error('保存錯誤:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  }, [chapterList, editing, book_id, blockToText]);

  return (
    <div className='flex h-screen w-full bg-gray-50'>
      {/* 側邊欄 - 章節列表 */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className='p-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>章節列表</h2>
        </div>

        <div className='flex-1 overflow-y-auto p-2'>
          {chapterList.map((item, index) => (
            <div
              key={index}
              className={`group mb-2 rounded-lg transition-all ${
                index === editing
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <div className='p-3 flex items-center justify-between'>
                <input
                  type='text'
                  value={item.title}
                  onChange={(e) => updateChapterTitle(index, e.target.value)}
                  onClick={() => switchChapter(index)}
                  className='flex-1 bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer'
                />
                <button
                  onClick={() => deleteChapter(index)}
                  className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2 text-lg'
                  title='刪除章節'
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='p-2 border-t border-gray-200'>
          <button
            onClick={addChapter}
            className='w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
          >
            ＋ 新增章節
          </button>
        </div>
      </div>

      {/* 主編輯區域 */}
      <div className='flex-1 flex flex-col'>
        {/* 頂部工具列 */}
        <div className='h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title={isSidebarOpen ? '隱藏側邊欄' : '顯示側邊欄'}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>

            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{chapterList[editing]?.title}</span>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            {/* 保存狀態 */}
            <div className='text-xs text-gray-500'>
              {isSaving ? (
                <span className='flex items-center'>
                  <span className='animate-spin mr-2'>⏳</span>
                  保存中...
                </span>
              ) : hasUnsavedChanges ? (
                <span className='text-orange-500'>有未保存的變更</span>
              ) : lastSaved ? (
                <span className='text-green-600'>
                  已保存 {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>

            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* 編輯器 */}
        <div className='flex-1 overflow-auto bg-white'>
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
