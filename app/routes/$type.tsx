import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Link } from '@remix-run/react';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const content = [
		{
			type: 'about',
			title: '關於',
			content: [
				{
					title: '關於',
					content: '這是一個全端閱讀器的計畫，慢慢做ww',
				},
			],
		},
		{
			type: 'terms',
			title: '使用條款',
			content: [
				{
					title: '使用者條款',
					content: ['平台保留所有資料使用   、 編輯 、 分發等權利'],
				},
			],
		},
		{
			type: 'contact',
			title: '聯絡我們',
			content: [
				{
					title: 'Pikacnu',
					content: ['DC : Pikacnu', 'Email : pika@pikacnu.com'],
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
				<div className=''></div>
				<div className='flex flex-row'>
					{[
						{
							name: '主頁',
							src: '/',
						},
						{
							name: '關於',
							src: '/about',
						},
						{
							name: '使用者條款',
							src: '/terms',
						},
						{
							name: '聯絡我們',
							src: '/contact',
						},
					].map((item, index) => {
						return (
							<Link
								key={index * 10}
								className='p-4 text-white'
								to={item.src}
							>
								{item.name}
							</Link>
						);
					})}
				</div>
			</div>
			<div className=' flex flex-col items-center w-full h-full'>
				{content?.content.map((e, index) => (
					<div
						key={index}
						className='flex flex-col text-white items-center bg-gray-500 w-full h-full'
					>
						<h2 className='text-lg w-full bg-slate-400 text-black text-center p-8'>
							{e.title}
						</h2>
						{Array.isArray(e.content) ? (
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
							<p>{e.content}</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
