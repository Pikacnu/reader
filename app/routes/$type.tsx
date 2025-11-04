import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Link } from '@remix-run/react';
import Navbar from '~/compoents/navbar';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const content: Array<{
    type: string;
    title: string;
    content: Array<{
      title: string;
      content: string[];
      numberic?: boolean;
    }>;
  }> = [
    {
      type: 'about',
      title: '關於',
      content: [
        {
          title: '關於',
          content: [
            '這是一個以小說閱讀/撰寫為主的平台',
            '平台開發依然在進行中',
            '歡迎提供使用意見與想法',
          ],
          numberic: false,
        },
      ],
    },
    {
      type: 'terms',
      title: '使用條款',
      content: [
        {
          title: '一般使用者條款',
          content: [
            '此條款生肖於任何使用此產品的使用者',
            '使用本產品過程中，網路供應商與提供商將會部分收集使用者資料並用於分析、處理、與防護',
            '使用本產品過程中，不得將任何內容以任何形式再製與散播',
            '使用本產品過程中，不得進行任何違法行為',
          ],
          numberic: true,
        },
        {
          title: '帳號使用者條款',
          content: [
            '此條款生肖於任何使用此產品的使用者',
            '本條款基於 一般使用者條款 並加以擴充',
            '在使用過程中，同意平台已收集使用者行為與紀錄用於分析並且推薦內容',
            '在連結帳號時，即同意本平台存取該平台帳號內容並且同意本平台寄送郵件等通知',
          ],
        },
        {
          title: '內容提供者條款',
          content: [
            '此條款生肖於任何使用此產品的使用者',
            '本條款基於 一般使用者條款 與 帳號使用者條款 並加以擴充',
            '在提供內容時，即同意本平台使用該內容進行分析與推薦',
            '提供內容時，須遵守善良風俗與法律規定，並且必要時加上警語',
            '內容不得包含違法內容。其餘內容皆已平台處置判斷為主，若有爭議，平台有權刪除內容',
            '內容提供者有權利要求刪除內容，但平台有權利拒絕',
          ],
        },
      ],
    },
    {
      type: 'contact',
      title: '聯絡我',
      content: [
        {
          title: '主要開發者',
          content: [
            'Discord ID : Pikacnu',
            'Email : pika@mail.pikacnu.com',
            'Github : Pikacnu',
          ],
        },
      ],
    },
  ];
  if (params.type)
    return { content: content.find((e) => e.type === params.type) };
  return redirect('/404');
};
export default function type() {
  const { content } = useLoaderData<typeof loader>();
  return (
    <div className='flex flex-col w-full h-[100vh] '>
      <div className='bg-gray-700'>
        <Navbar></Navbar>
      </div>
      <div className=' flex flex-col items-center w-full h-full pt-8 pb-8 overflow-y-auto bg-slate-600/50 gap-8'>
        {content?.content.map((e, index) => (
          <div
            key={index}
            className='flex flex-col text-black w-1/2 h-full *:shadow-lg *:shadow-black/20 *:p-4 *:rounded-md  *:bg-inherit gap-4 relative items-start'
          >
            <h2 className=' self-start text-start p-8 mt-0 text-2xl font-bold'>
              {e.title}
            </h2>
            <div className='flex flex-col w-11/12 gap-4'>
              {Array.isArray(e.content) ? (
                e.numberic ? (
                  <ul className=' list-decimal m-4'>
                    {e.content.map((item, index) => (
                      <li
                        className=''
                        key={index}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    {e.content.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                )
              ) : (
                <p>{e.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
