import {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import List from '~/assests/List.svg';
import Text from '../compoents/text';
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
	const [chapterTabOpen, setChapterTabOpen] = useState(false);
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
	useEffect(() => {
		console.log(chapterList);
	}, [chapterList]);
	const [editing, setEditing] = useState(0);
	const [editorLoad, setEditorLoad] = useState(false);
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
				}).then((res) => {
					res.json().then((data) => {
						console.log(data);
					});
				});
			}
		}, 1 * 60 * 1_000);
		return () => {
			clearInterval(interval);
		};
	}, [chapterList]);
	const blockToText = useCallback(() => {
		console.log(editor.current?.document);
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
	return (
		<div className='w-full h-full flex flex-row justify-center relative'>
			<button
				className='absolute top-0 left-0'
				onClick={() => setChapterTabOpen(!chapterTabOpen)}
			>
				<img
					className='h-8 w-8 object-cover overflow-hidden'
					src={List}
					alt='Open Chapter List'
				></img>
			</button>
			{chapterTabOpen ? (
				<>
					<div className='w-1/4 bg-yellow-200 h-full pt-8 flex flex-col'>
						{chapterList.map((item, index) => {
							return (
								<button
									key={index}
									onClick={(e) => {
										if (editing === index) return;
										e.preventDefault();
										const texts = blockToText();
										setChapterList((prev) => [
											...prev.slice(0, editing),
											{
												title: prev[editing].title,
												text: texts || [''],
											},
											...prev.slice(editing + 1, prev.length),
										]);
										setEditing(index);
										editor.current?.removeBlocks(editor.current?.document);
										item.text.map((text) =>
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
									}}
									className={
										editing === index ? 'bg-yellow-300' : 'bg-yellow-200'
									}
								>
									<Text
										value={item.title}
										disable={index === editing}
										setvalue={(text) => {
											setChapterList((prev) => [
												...prev.slice(0, index),
												{
													title: text,
													text: prev[index].text,
												},
												...prev.slice(index + 1, prev.length),
											]);
										}}
									></Text>
								</button>
							);
						})}
						<button
							className='w-full'
							onClick={() => {
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
								editor.current?.removeBlocks(editor.current?.document);
							}}
						>
							+
						</button>
					</div>
				</>
			) : (
				''
			)}
			<div className='w-3/4 h-full'>
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
	);
}
