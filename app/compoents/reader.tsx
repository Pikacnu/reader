/* eslint-disable no-mixed-spaces-and-tabs */
import { Chapter } from '~/types/book.server';
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  MutableRefObject,
} from 'react';

interface ReaderProps {
  chapter: Chapter;
  chapter_index: MutableRefObject<number>;
  page_index: MutableRefObject<number>;
  reader_data: {
    text_direction: TextDirection | null;
    background_color: string | null;
    font_size: number | null;
    text_leading: number | null;
  };
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

export default function Reader({
  chapter,
  chapter_index,
  page_index,
  reader_data,
}: ReaderProps) {
  const [contorlPanelOpen, setContorlPanelOpen] = useState(false);
  const [device, setDevice] = useState(DeviceType.undefind);
  const [deviceWidth, setDeviceWidth] = useState(1920);
  const [deviceHeight, setDeviceHeight] = useState(1080);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(page_index.current || 0);
  const [textDirection, setTextDirection] = useState<TextDirection>(
    reader_data.text_direction || 'ltr',
  );
  const [bgcolor, setBgColor] = useState(
    reader_data.background_color || '#FFFFFF',
  );
  const [currentChapter, setCurrentChapter] = useState(
    chapter_index.current || 0,
  );
  const changeChapterCheck = useRef(0);
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
  const [fontsize, setFontsize] = useState(reader_data.font_size || 16);
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
  const [textLeading, setTextLeading] = useState(reader_data.text_leading || 2);
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
  const sampleTextLead = useMemo(() => `${textLeading}em`, [textLeading]);
  const textcoverter = useCallback((text: string, direction: TextDirection) => {
    const textConverterTable = new Map<string, string>();
    if (direction === 'rtl') return text;
    return text === ''
      ? ''
      : text.split('').reduce((acc, cur) => {
          const converted = textConverterTable.get(cur);
          return acc + (converted ? converted : cur);
        });
  }, []);

  const pages = useMemo(() => {
    const verticalTextCount =
      Math.floor(deviceHeight / textHeight) *
        (textDirection === 'ltr' ? 1.7 : 0.9) +
      (textDirection === 'ltr' ? -10 : 2);
    const horizontalTextCount =
      Math.floor(deviceWidth / textWidth) * (textDirection === 'ltr' ? 1 : 4);
    const lines: string[] = [chapter.pages[currentChapter]].reduce(
      (acc, cur) => {
        let currentLine = cur.content.reduce(
          (acc, cur) => {
            if (
              cur.length >
              (textDirection === 'ltr'
                ? verticalTextCount
                : horizontalTextCount)
            ) {
              const lines = cur.split('').reduce(
                (acc, cur) => {
                  if (
                    acc[acc.length - 1].length <
                    (textDirection === 'ltr'
                      ? verticalTextCount
                      : horizontalTextCount)
                  ) {
                    acc[acc.length - 1] += cur;
                    return acc;
                  }
                  return [...acc, cur];
                },
                [''],
              );
              return [...acc, ...lines];
            }
            return [...acc, cur];
          },
          [''],
        );

        return [...acc, ...currentLine];
      },
      [''],
    );
    const pages: string[][] = lines.reduce(
      (acc, cur) => {
        if (acc.length === 0) return [[cur]];

        const lastPage = acc[acc.length - 1];
        if (
          lastPage.length <
          (textDirection !== 'ltr'
            ? verticalTextCount
            : horizontalTextCount * 1.7)
        ) {
          lastPage.push(cur);
          return acc;
        }
        return [...acc, [cur]];
      },
      [['']],
    );
    return pages;
  }, [
    chapter,
    deviceWidth,
    deviceHeight,
    textWidth,
    textHeight,
    fontsize,
    currentChapter,
  ]);

  useEffect(() => {
    setDevice(
      window.innerWidth < 640
        ? DeviceType.mobile
        : window.innerWidth < 1920
        ? DeviceType.tablet
        : DeviceType.desktop,
    );
    setTimeout(() => {
      sizeSet();
    }, 1000);
  }, []);

  useEffect(() => {
    const showtip = () => {
      if (changeChapterCheck.current === 0) {
        document.getElementById('changeChapter')?.setAttribute('hidden', '');
      } else {
        document.getElementById('changeChapter')?.removeAttribute('hidden');
      }
    };
    const handleKeydown = (e: KeyboardEvent) => {
      // changeChapterCheck
      // default 0
      // -1 -> need to press again to change chapter prev
      // 1 -> need to press again to change chapter next
      if (e.key === Input.Prev) {
        if (currentPage === 0 && currentChapter === 0) return;

        if (currentChapter >= 0 && currentPage === 0) {
          if (changeChapterCheck.current !== -1) {
            changeChapterCheck.current -= 1;
            return showtip();
          }
          changeChapterCheck.current = 0;
          document.getElementById('changeChapter')?.setAttribute('hidden', '');
          setCurrentPage(0);
          setCurrentChapter((prev) => prev - 1);
          if (page_index.current) page_index.current = 0;
          if (chapter_index.current) chapter_index.current = currentChapter - 1;
        }

        if (currentPage !== 0) {
          if (page_index.current) page_index.current = currentPage - 1;
          return setCurrentPage((prev) => prev - 1);
        }
        if (changeChapterCheck.current !== -1) {
          changeChapterCheck.current -= 1;
          return showtip();
        }

        return;
      }

      if (e.key === Input.Next) {
        if (
          chapter.pages.length === currentChapter + 1 &&
          !(currentPage === pages.length - 1)
        ) {
          if (page_index.current) page_index.current = currentPage + 1;
          return setCurrentPage((prev) => prev + 1);
        }
        if (
          currentPage === pages.length - 1 &&
          chapter.pages.length !== currentChapter + 1
        ) {
          if (changeChapterCheck.current !== 1) {
            changeChapterCheck.current += 1;
            return showtip();
          }
          changeChapterCheck.current = 0;
          document.getElementById('changeChapter')?.setAttribute('hidden', '');
          setCurrentPage(0);
          setCurrentChapter((prev) => prev + 1);
          if (page_index.current) page_index.current = 0;
          if (chapter_index.current) chapter_index.current = currentChapter + 1;
          return;
        }
        if (currentPage === pages.length - 1) return;
        return setCurrentPage((prev) => prev + 1);
      }

      if (e.key === Input.Control) return setContorlPanelOpen((prev) => !prev);
    };

    const handleClick = (event: PointerEvent) => {
      //@ts-ignore
      handleKeydown({ key: event.currentTarget?.id || '' } as KeyboardEvent);
    };

    document.addEventListener('keydown', handleKeydown);

    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        handleKeydown({ key: Input.Next } as KeyboardEvent);
      } else if (e.deltaY > 0) {
        // scroll down
        handleKeydown({ key: Input.Prev } as KeyboardEvent);
      }
    };

    document.addEventListener('wheel', handleScroll);

    const elements = document.getElementsByClassName('Touch');
    for (const element of elements) {
      //@ts-ignore
      element.addEventListener('click', handleClick);
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('wheel', handleScroll);
      const elements = document.getElementsByClassName('Touch');
      for (const element of elements) {
        //@ts-ignore
        element.removeEventListener('click', handleClick);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pages, textWidth, textHeight, deviceHeight, device]);

  const sizeSet = useCallback(() => {
    setDeviceWidth(window.innerWidth);
    setDeviceHeight(window.innerHeight);
    let text = document.getElementById('textsize')?.getBoundingClientRect();
    setTextWidth(
      Math.floor(
        ((text?.width || 0) / 2 + ((text?.left || 0) + (text?.right || 0))) / 2,
      ),
    );
    setTextHeight(
      Math.floor(
        ((text?.height || 0) / 2 + ((text?.bottom || 0) + (text?.top || 0))) /
          2,
      ),
    );
  }, []);

  useEffect(() => {
    window.addEventListener('resize', () => {
      sizeSet();
    });
    return () => {
      window.removeEventListener('resize', () => {
        sizeSet();
      });
    };
  });
  useEffect(() => {
    sizeSet();
  }, [deviceHeight, deviceWidth, textHeight, textWidth, fontsize, textLeading]);
  return (
    <div
      className='flex flex-col w-full h-svh overflow-hidden'
      style={{ backgroundColor: bgcolor, color: textcolor, fontSize: fontsize }}
    >
      <div
        className='absolute bg-yellow-400 m-2 p-2 rounded-full z-50'
        id='changeChapter'
        hidden
      >
        即將更換章節
      </div>
      <div
        id='textsize'
        className='flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0'
        style={
          textDirection === 'ltr'
            ? {
                marginLeft: sampleTextLead,
                marginRight: sampleTextLead,
              }
            : {
                marginTop: sampleTextLead,
                marginBottom: sampleTextLead,
              }
        }
      >
        <p>你好</p>
        <p>世界</p>
      </div>

      <div
        id='textsize-en-s'
        className='flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0'
        style={
          textDirection === 'ltr'
            ? {
                marginLeft: sampleTextLead,
                marginRight: sampleTextLead,
              }
            : {
                marginTop: sampleTextLead,
                marginBottom: sampleTextLead,
              }
        }
      >
        <p>rr</p>
        <p>rr</p>
      </div>
      <div
        id='textsize-en-b'
        className='flex w-min h-min absolute invisible pr-8 pl-8 *:m-0 *:p-0'
        style={
          textDirection === 'ltr'
            ? {
                marginLeft: sampleTextLead,
                marginRight: sampleTextLead,
              }
            : {
                marginTop: sampleTextLead,
                marginBottom: sampleTextLead,
              }
        }
      >
        <p>RR</p>
        <p>RR</p>
      </div>
      <div className='flex-shrink flex-grow flex relative'>
        {device !== DeviceType.desktop ? (
          <>
            <div className='w-full h-full *:w-1/3 *:h-full absolute flex flex-row'>
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
          className={`[&>p]:text-${textDirection} self-lr mt-4 w-full flex flex-warp ${
            textDirection === 'rtl' ? 'flex-col' : 'flex-col-reverse'
          }`}
        >
          {pages[currentPage].map((item, index) => {
            const text = textcoverter(item.toString(), textDirection);
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
          })}
        </div>
      </div>
      <div
        className={`flex flex-row h-8 items-center justify-center *:m-2 text-lg`}
      >
        {/*
				{device !== DeviceType.desktop ? (
					<button
						onClick={() => {
							if (currentPage === pages.length - 1) return;
							setCurrentPage(currentPage + 1);
						}}
					>
						next
					</button>
				) : (
					<></>
				)}*/}
        <p>
          {currentPage + 1}/{pages.length}
        </p>
        {/*
				{device !== DeviceType.desktop ? (
					<button
						onClick={() => {
							if (currentPage === 0) return;
							setCurrentPage(currentPage - 1);
						}}
					>
						prev
					</button>
				) : (
					<></>
				)}*/}
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
