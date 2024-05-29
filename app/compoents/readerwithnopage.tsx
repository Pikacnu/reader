/* eslint-disable no-mixed-spaces-and-tabs */
import { Chapter } from '~/types/book.server';
import { useCallback, useMemo, useState, useEffect } from 'react';

interface ReaderProps {
	chapter: Chapter;
}
type TextDirection = 'ltr' | 'rtl';
enum DeviceType {
	mobile = 'mobile',
	tablet = 'tablet',
	desktop = 'desktop',
	undefind = 'undefined',
}
enum Input {
	Control = 'Control',
	Prev = 'ArrowRight',
	Next = 'ArrowLeft',
}
export default function Reader({ chapter }: ReaderProps) {
	const [contorlPanelOpen, setContorlPanelOpen] = useState(false);
	const [device, setDevice] = useState(DeviceType.undefind);
	const pages = useMemo(() => chapter.pages, [chapter]);
	const [pageCount, setPageCount] = useState(pages.length);
	const [currentPage, setCurrentPage] = useState(0);
	const [textDirection, setTextDirection] = useState<TextDirection>('ltr');
	const [bgcolor, setBgColor] = useState('#FFFFFF');
	const complementaryColor = useCallback((color: string) => {
		const hex = color.replace('#', '');
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 2 + 2), 16);
		const b = parseInt(hex.substring(4, 4 + 2), 16);
		const yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return yiq >= 128 ? '#000000' : '#FFFFFF';
	}, []);
	const textcolor = useMemo(
		() => complementaryColor(bgcolor),
		[complementaryColor, bgcolor],
	);
	const fontMaxSize = 24;
	const fontMinSize = 12;
	const [fontsize, setFontsize] = useState(16);
	const changeFontsize = useCallback((size: number) => {
		setFontsize(
			size > fontMaxSize
				? fontMaxSize
				: size < fontMinSize
				? fontMinSize
				: size,
		);
	}, []);
	const [searching, setSearching] = useState(false);
	const [searchingText, setSearchingText] = useState('');
	const [textLeading, setTextLeading] = useState(2);
	const textLeadingMax = 4.5;
	const textLeadingMin = 1.0;
	const changeTextLeading = useCallback((size: number) => {
		setTextLeading(
			size > textLeadingMax
				? textLeadingMax
				: size < textLeadingMin
				? textLeadingMin
				: size,
		);
	}, []);
	const textLead = useMemo(() => `${textLeading / 2}em`, [textLeading]);
	const textcoverter = useCallback((text: string, direction: TextDirection) => {
		const textConverterTable = new Map<string, string>();
		if (direction === 'rtl') return text;
		return text.split('').reduce((acc, cur) => {
			const converted = textConverterTable.get(cur);
			return acc + (converted ? converted : cur);
		});
	}, []);
	useEffect(() => {
		setDevice(
			window.innerWidth < 640
				? DeviceType.mobile
				: window.innerWidth < 1024
				? DeviceType.tablet
				: DeviceType.desktop,
		);
	}, []);
	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === Input.Prev) {
				if (currentPage === 0) return;
				return setCurrentPage((prev) => prev - 1);
			}
			if (e.key === Input.Next) {
				if (currentPage === pageCount - 1) return;
				setCurrentPage((prev) => prev + 1);
			}
			if (e.key === Input.Control) return setContorlPanelOpen((prev) => !prev);
		};
		const handleClick = (event: MouseEvent) => {
			handleKeydown({
				key: (event.currentTarget as HTMLElement)?.id || undefined,
			} as KeyboardEvent);
		};

		document.addEventListener('keydown', handleKeydown);
		const elements = document.getElementsByClassName('Touch');
		for (const element of elements) {
			(element as HTMLElement).addEventListener('click', handleClick);
		}
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			const elements = document.getElementsByClassName('Touch');
			for (const element of elements) {
				(element as HTMLElement).removeEventListener('click', handleClick);
			}
		};
	}, [currentPage, pageCount, contorlPanelOpen]);
	const [clientWidth, setClientWidth] = useState(0);
	const [readerWidth, setReaderWidth] = useState(0);
	const [clientHeight, setClientHeight] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const wait = useCallback(async (ms: number) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(true);
			}, ms);
		});
	}, []);
	const changeSize = useCallback(() => {
		if (!loaded) return;
		const clientWidth = screen.width;
		const clientHeight = screen.height;
		const reader = document.getElementById('reader');
		const readerWidth = reader?.getBoundingClientRect().width || 10000000;
		const readerHeight =
			reader?.scrollHeight ||
			reader?.getBoundingClientRect().height ||
			10000000;
		const pageCount =
			textDirection === 'ltr'
				? Math.ceil(readerWidth / clientWidth)
				: Math.ceil(readerHeight / clientHeight);
		setPageCount(pageCount);
		setClientWidth(clientWidth);
		setReaderWidth(readerWidth);
		setClientHeight(clientHeight);
		console.log(clientWidth, readerWidth);
	}, [loaded, textDirection]);

	useEffect(() => {
		if (!loaded)
			wait(1000 * 0.5).then(() => {
				setLoaded(true);
				changeSize();
			});
		changeSize();
	}, [wait, changeSize, textDirection, loaded]);
	useEffect(() => {
		changeSize();
	}, [changeSize, loaded, fontsize, textLeading]);
	return (
		<div
			className='flex flex-col w-full h-[100vh]'
			style={{ backgroundColor: bgcolor, color: textcolor, fontSize: fontsize }}
		>
			<div className='flex-shrink flex-grow flex relative w-full overflow-hidden'>
				{device !== DeviceType.desktop ? (
					<>
						<div className='w-full h-full *:w-1/3 *:h-full absolute flex flex-row z-10'>
							<div
								id={Input.Next}
								className='Touch'
							></div>
							<div
								id={Input.Control}
								className='Touch'
							></div>
							<div
								id={Input.Prev}
								className='Touch'
							></div>
						</div>
					</>
				) : (
					<></>
				)}
				<div
					id='reader'
					className='flex flex-col h-full justify-start w-auto'
				>
					<div
						className={`text-${textDirection} flex flex-row m-4 ${
							textDirection === 'ltr'
								? 'w-auto h-full flex-col-reverse'
								: 'w-full h-auto flex-col'
						} *:m-0`}
						style={{
							transform: `translate${
								textDirection === 'ltr'
									? `X(${
											device === DeviceType.mobile
												? clientWidth * (currentPage + 1) - readerWidth
												: clientWidth *
														(currentPage === 0
															? currentPage
															: currentPage / (3 / 2)) -
												  readerWidth / 2
									  }px)`
									: `Y(${-clientHeight * currentPage}px)`
							}`,
						}}
					>
						{pages.map((page) =>
							page.content.map((item, index) => {
								const text = textcoverter(
									typeof item === 'string' ? item : item.toString(),
									textDirection,
								);
								return (
									<p
										key={index}
										style={Object.assign(
											searching && searchingText
												? {
														backgroundColor: text.includes(searchingText)
															? textcolor
															: 'transparent',
														color: text.includes(searchingText)
															? bgcolor
															: textcolor,
												  }
												: {},
											textDirection === 'ltr'
												? {
														marginLeft: textLead,
														marginRight: textLead,
												  }
												: {
														marginTop: textLead,
														marginBottom: textLead,
												  },
										)}
									>
										{text}
									</p>
								);
							}),
						)}
					</div>
				</div>
			</div>
			<div
				className={`flex flex-row h-8 items-center justify-center *:m-2 text-lg`}
			>
				<p>
					{currentPage + 1}/{pageCount}
				</p>
			</div>
			<div
				className={`flex flex-row w-full justify-center *:ml-2 *:mr-2 p-2 text-lg bg-slate-400 flex-wrap ${
					contorlPanelOpen ? '' : 'hidden'
				}`}
			>
				<button
					onClick={() =>
						setTextDirection(textDirection === 'ltr' ? 'rtl' : 'ltr')
					}
				>
					{textDirection}
				</button>
				<input
					type='color'
					value={bgcolor}
					className='all-unset w-8 h-8'
					onChange={(e) => setBgColor(e.target.value)}
				/>
				<input
					type='range'
					value={fontsize}
					min={fontMinSize}
					max={fontMaxSize}
					className='w-16 h-8'
					onChange={(e) => changeFontsize(Number(e.target.value))}
				/>
				<div>
					<input
						type='text'
						value={searchingText}
						onChange={(e) => setSearchingText(e.target.value)}
						className='w-32 bg-transparent border-b-2 border-gray-500'
					/>
					<button
						onClick={() => {
							setSearching((prev) => !prev);
						}}
						className='w-16'
					>
						{searching ? 'searching' : 'search'}
					</button>
				</div>
				<input
					type='range'
					value={textLeading}
					min={textLeadingMin}
					max={textLeadingMax}
					step={0.1}
					onChange={(e) => changeTextLeading(Number(e.target.value))}
				/>
			</div>
		</div>
	);
}
