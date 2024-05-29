import { Link } from '@remix-run/react';

export interface BookData {
	title: string;
	author: string;
	cover: string;
	src: string;
	tags?: string[];
}

export default function BookCard(bookprops: BookData) {
	const { title, author, cover, src, tags } = bookprops;
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<Link
				className={`flex flex-col lg:min-w-48 min-w-8 p-4 border-gray-200 border *:m-0
				md:flex-row md:w-96 md:h-48 w-32 h-48 md:*:p-2 
				shadow-slate-300 hover:shadow-xl hover:border-0`}
				to={src}
			>
				<div className='h-2/3 w-full min-w-24 md:w-1/2 md:h-full'>
					<img
						className='h-full w-full object-cover overflow-hidden '
						src={cover}
						alt={`${title} Cover`}
					/>
				</div>
				<div className='grid grid-rows-4 md:w-1/2'>
					<p>{title}</p>
					<p>{author}</p>
					<div className='h-min grid-rows-subgrid row-span-2 flex flex-wrap overflow-hidden'>
						{tags?.slice(0, 6).map((tag, index) => {
							return (
								<p
									key={index}
									className='border  border-gray-200'
								>
									{tag}
								</p>
							);
						})}
					</div>
				</div>
			</Link>
		</div>
	);
}
