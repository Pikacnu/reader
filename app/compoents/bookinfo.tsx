import { Link } from '@remix-run/react';

/* eslint-disable no-mixed-spaces-and-tabs */
interface Chapter {
	title: string;
	link: string;
}
interface BookInfo {
	title: string | null;
	author: string | null;
	cover: string | null;
	tags?: string[] | null;
	chapters?: Chapter[] | null;
	description?: string | null;
	author_avatar?: string | null;
}

export default function BookInfo({
	bookinfo,
	author_link,
	author_avatar,
}: {
	bookinfo: BookInfo;
	author_link?: string;
	author_avatar?: string;
}) {
	const { title, author, cover, tags, chapters, description } = bookinfo;
	return (
		<div className='m-4 relative w-auto'>
			<div className='flex flex-col lg:flex-col'>
				<div className='grid grid-row-3 lg:grid-cols-3 min-h-[50vh] mb-8'>
					<div className='flex items-center justify-center h-full'>
						<img
							className='object-cover'
							src={cover || ''}
							alt='Book Cover'
						/>
					</div>
					<div className='flex flex-col grid-cols-subgrid row-span-2 lg:col-span-2 *:m-2'>
						<h1 className='*:inline-block'>
							Book Title : <p>{title}</p>
						</h1>
						{author_link ? (
							<Link
								className='*:inline-block'
								to={author_link}
							>
								Author : {author_avatar ? <img src={author_avatar} className=' w-4 object-scale-down inline'></img> : ''}
								<p>{author}</p>
							</Link>
						) : (
							<h2 className='*:inline-block'>
								Author : <p>{author}</p>
							</h2>
						)}
						<div className='flex'>
							<p>Tags: </p>
							<div className='flex flex-wrap '>
								{(tags ? tags : []).map((tag, index) => {
									return (
										<p
											key={index}
											className='border border-gray-200 ml-2'
										>
											{tag !== '' && tag !== undefined ? tag : ''}
										</p>
									);
								})}
							</div>
						</div>
						<div className='flex flex-col m-2 p-2 border h-full flex-grow flex-shrink'>
							<p>Description : </p>
							<p>
								{(description || '').split('\n').map((line) => {
									return <p key={line}>{line}</p>;
								})}
							</p>
						</div>
					</div>
				</div>
				<hr />
				<br />
				<div className='flex flex-col'>
					<p>Chapters</p>
					<div className='flex flex-col m-2 *:p-2'>
						{(chapters ? chapters : []).map((chapter, index) => {
							return (
								<Link
									key={index}
									to={chapter.link + `?chapterid=${index}`}
									className='
                  shadow-slate-300 hover:shadow-lg  border m-2 p-2
                  '
								>{`${chapter.title}`}</Link>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
