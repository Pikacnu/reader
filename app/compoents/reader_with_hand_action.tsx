/* eslint-disable no-mixed-spaces-and-tabs */
import { Chapter } from '~/types/book.server';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';

interface ReaderProps {
  chapter: Chapter;
}

enum TextDirection {
  ltr = 'ltr',
  rtl = 'rtl',
}

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
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const device = useRef(DeviceType.undefind);
  function setDevice(type: DeviceType) {
    device.current = type;
  }

  const pages = useMemo(() => chapter.pages, [chapter]);

  // Page State
  const [pageCount, setPageCount] = useState(pages.length);
  const [currentPage, setCurrentPage] = useState(0);

  // Display Settings
  const [textDirection, setTextDirection] = useState<TextDirection>(
    TextDirection.ltr,
  );
  const [bgcolor, setBgColor] = useState('#FFFFFF');

  const textcolor = useMemo(() => {
    const hex = bgcolor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 2 + 2), 16);
    const b = parseInt(hex.substring(4, 4 + 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }, [bgcolor]);
  // Font Settings
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
  // Search Settings
  const [searching, setSearching] = useState(false);
  const [searchingText, setSearchingText] = useState('');
  // Text Leading Settings
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

  // Device Detection

  useEffect(() => {
    setDevice(
      window.innerWidth < 640
        ? DeviceType.mobile
        : window.innerWidth < 1024
        ? DeviceType.tablet
        : DeviceType.desktop,
    );
  }, []);

  // Keyboard and Touch Input Handling

  const cursorTrace = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === Input.Prev) {
        if (currentPage <= 0) return setCurrentPage(0);
        return setCurrentPage((prev) => prev - 1);
      }
      if (e.key === Input.Next) {
        if (currentPage >= pageCount - 1) return setCurrentPage(pageCount - 1);
        setCurrentPage((prev) => prev + 1);
      }
      if (e.key === Input.Control) return setControlPanelOpen((prev) => !prev);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      cursorTrace.current = [{ x: touch.clientX, y: touch.clientY }];
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      cursorTrace.current.push({ x: touch.clientX, y: touch.clientY });
    };
    const handleTouchEnd = () => {
      const trace = cursorTrace.current;
      if (trace.length < 2) return;
      const lastPoint = trace[trace.length - 1];
      const firstPoint = trace[0];
      const deltaX = lastPoint.x - firstPoint.x;
      const deltaY = lastPoint.y - firstPoint.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const threshold = window.innerWidth * 0.2;
      if (textDirection === TextDirection.ltr) {
        if (absDeltaX > absDeltaY && absDeltaX > threshold) {
          if (deltaX > 0) {
            // Swipe Right
            if (currentPage === pageCount - 1) return;
            setCurrentPage((prev) => prev + 1);
          } else {
            // Swipe Left
            if (currentPage === 0) return;
            setCurrentPage((prev) => prev - 1);
          }
        }
      } else {
        if (absDeltaY > absDeltaX && absDeltaY > threshold) {
          if (deltaY > 0) {
            // Swipe Down
            if (currentPage === 0) return;
            setCurrentPage((prev) => prev - 1);
          } else {
            // Swipe Up
            if (currentPage === pageCount - 1) return;
            setCurrentPage((prev) => prev + 1);
          }
        }
      }
      cursorTrace.current = [];
    };

    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        // scroll up
        handleKeydown({ key: Input.Next } as KeyboardEvent);
      } else if (e.deltaY > 0) {
        // scroll down
        handleKeydown({ key: Input.Prev } as KeyboardEvent);
      }
    };

    document.addEventListener('keydown', handleKeydown);

    document.addEventListener('wheel', handleScroll);

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('wheel', handleScroll);
    };
  }, [currentPage, pageCount, controlPanelOpen]);
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
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight - 32;
    const reader = document.getElementById('reader');
    const readerWidth =
      reader?.getBoundingClientRect().width || document.body.clientWidth;
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

  useEffect(() => {
    const handleResize = () => {
      changeSize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [changeSize]);

  const lastChangeTimeStamp = useRef(0);

  const changeBgColor = useCallback(() => {
    return (color: string) => {
      const now = Date.now();
      if (now - lastChangeTimeStamp.current < 100) return;
      console.log('Change BG Color to', color);
      lastChangeTimeStamp.current = now;
      setBgColor(color);
    };
  }, [])();

  return (
    <div
      className='flex flex-col w-full h-[100vh]'
      style={{ backgroundColor: bgcolor, color: textcolor, fontSize: fontsize }}
    >
      <div className='flex-shrink flex-grow flex relative w-full overflow-hidden'>
        <div
          id='reader'
          className='flex flex-col h-full justify-start w-max overflow-visible'
        >
          <div
            className={`[&>p]:text-${textDirection} self-lr flex flex-row m-4 ${
              textDirection === 'ltr'
                ? 'w-auto h-full flex-col-reverse'
                : 'w-full h-auto flex-col'
            } *:m-0`}
            style={{
              transform: `translate${
                textDirection === 'ltr'
                  ? `X(${clientWidth * (currentPage + 1) - readerWidth}px)`
                  : `Y(${-clientHeight * currentPage}px)`
              }`,
            }}
          >
            {pages.map((page) =>
              page.content.map((item, index) => {
                const text = textcoverter(item, textDirection);
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
          controlPanelOpen ? '' : 'hidden'
        } absolute bottom-0 left-0 right-0`}
      >
        <button
          onClick={() =>
            setTextDirection(
              textDirection === TextDirection.ltr
                ? TextDirection.rtl
                : TextDirection.ltr,
            )
          }
        >
          {textDirection}
        </button>
        <input
          type='color'
          value={bgcolor}
          className='all-unset w-8 h-8'
          onChange={(e) => {
            changeBgColor(e.target.value);
          }}
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
