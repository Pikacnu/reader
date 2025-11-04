import { Link } from '@remix-run/react';
import Navbar from '~/compoents/navbar';

export default function test() {
  return (
    <div className='flex flex-col w-full h-dvh bg-black/60'>
      <Navbar />
      <div className='w-full flex-grow bg-blue-600 bg-opacity-70 grid-rows-subgrid row-span-4 flex flex-col items-start pl-20 *:p-4 justify-center h-full'>
        <p className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 m-2'>
          Laganto
        </p>
        <p className='text-xl text-gray-200 opacity-80'>
          一個專為愛好閱讀與創作的使用者設計的線上平台，提供直式與橫式閱讀模式，並支援高度自訂的閱讀體驗。
        </p>
        <div className='flex flex-row'>
          <Link
            to='/home'
            className='bg-blue-300 px-4 py-2 rounded-xl hover:bg-blue-400 transition-colors'
          >
            開始使用
          </Link>
        </div>
      </div>
      <div className='h-full w-full bg-black relative'>
        <div className='flex flex-col bg-emerald-600 bg-opacity-90 p-6 text-white '>
          <h2 className='text-2xl font-bold mb-4'>什麼是 Laganto?</h2>
          <div className='mb-6 bg-black bg-opacity-30 p-4 rounded-lg'>
            <p className='mb-2'>
              Laganto
              是一個專為愛好閱讀與創作的使用者設計的線上平台，提供直式與橫式閱讀模式，並支援高度自訂的閱讀體驗。
            </p>
            <p className='mb-2'>
              您可以在平台上編輯自己的作品，並分享給其他人閱讀。
            </p>
            <p>此外，還能建立書單，快速分享多本書籍，並輕鬆管理閱讀清單。</p>
          </div>
          <hr className='border-emerald-800 my-4' />
          <h2 className='text-2xl font-bold  mb-4'>為什麼選擇 Laganto?</h2>
          <div className='bg-black bg-opacity-30 p-4 rounded-lg'>
            <p className='mb-2'>
              我們提供簡單易用的編輯器，讓您輕鬆創作並分享作品。
            </p>
            <p className='mb-2'>
              平台以閱讀器為核心，適配各種裝置，提供流暢的閱讀體驗。
            </p>
            <p className='mb-2'>自動記錄閱讀進度，讓您隨時銜接上次的閱讀。</p>
            <p>內建強大的搜尋功能，幫助您快速找到相關內容。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
