import { Link } from '@remix-run/react';

export default function test() {
	return (
		<div className='flex flex-col w-full h-[100vh] '>
			<div className='bg-gray-700'>
				<div className=''></div>
				<div className='flex flex-row'>
					{[
						{
							'name': '主頁',
							'src': '/',
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
			<div>
				<div className='w-full h-[50vh] bg-blue-500 grid-rows-subgrid row-span-4 flex flex-col items-center justify-center'>
					<p className='text-4xl font-bold text-white'>Laganto</p>
					<div className='flex flex-row m-4'>
						<Link
							to='/home'
							className='bg-green-200 p-4 rounded-xl'
						>
							Try it now
						</Link>
					</div>
				</div>
			</div>
			<div className='h-full w-full bg-black'></div>
		</div>
	);
}
