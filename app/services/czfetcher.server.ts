import jsdom from 'jsdom';

export async function getSearchBook(
	searchTarget: string,
	limit = 10,
	start = 1,
) {
	let books = new Map();
	let page = start;
	let pagelimit = limit+start;
	console.log(`Fetching ${searchTarget} from ${start} to ${pagelimit}`);
	const get = async (page: number, index: number, errorcount: number = 0) => {
		if (errorcount >= 3) throw new Error('Max retry reached');
		try {
			const request = await fetch(
				`https://czbooks.net/s/${searchTarget}/${page}`,
				{
					method: 'GET',
					headers: {
						'User-Agent':
							'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
					},
				},
			);
			if (request.status !== 200) throw new Error('Max page reached');
			const html = await request.text();
			const { window } = new jsdom.JSDOM(html);
			window.document.querySelectorAll('div.novel-item').forEach((a) => {
				const link = a?.querySelector('a')?.href;
				const title = a?.querySelector('div.novel-item-title')?.textContent;
				books.set(title?.replace('\n', ''), link);
			});
		} catch (e) {
			await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
			await get(page, errorcount + 1);
		}
	};

	while (page <= pagelimit) {
		const count = pagelimit > page + 10 ? page + 10 : pagelimit;
		console.log(`Fetching ${page} to ${count}`);
		try {
			await Promise.all(
				Array(count)
					.fill(0)
					.map((_, i) => page + i)
					.map((page, i) => get(page, i)),
			);
		} catch (e) {
			break;
		}
		page += count;
	}
	return books;
}

export async function getBookInfo(link: string) {
	const novelLink = link.split('/').pop();
	const bookPageRequest = fetch(`https://czbooks.net/n/${novelLink}`, {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
		},
	});
	const html = await (await bookPageRequest).text();
	const { window } = new jsdom.JSDOM(html);
	const data = window.document
		?.getElementById('chapter-list')
		?.querySelectorAll('a');

	//book info
	const title = window.document?.querySelector('span.title')?.textContent;
	const author_name =
		window.document?.querySelector('span.author>a')?.textContent;
	const author_link = (
		window.document?.querySelector('span.author>a') as HTMLLinkElement
	)?.href;
	const update_time = new Date(
		window.document
			?.querySelector('div.state>table>tbody')
			?.childNodes.item(6)
			?.childNodes.item(3).textContent as string,
	);
	let tags: {
		name: string | null;
		link: string | undefined;
	}[] = [];
	window.document
		?.querySelector('ul.hashtag')
		?.querySelectorAll('li.item')
		.forEach((e) =>
			tags.push({
				name: e.textContent,
				link: e.querySelector('a')?.href,
			}),
		);
	const cover = (
		window.document
			?.querySelector('div.thumbnail')
			?.children.item(0) as HTMLImageElement
	)?.src as string;
	const description = window.document
		.querySelector('div.description')
		?.textContent?.split('\n')
		.filter((a) => a !== '');

	//show info
	const bookinfo = {
		link: 'https:' + link,
		title: title,
		author_name: author_name,
		author_link: 'https:' + author_link,
		update_time: update_time,
		tags: tags,
		cover: cover,
		description: description,
	};
	return bookinfo;
}

export async function getBookContent(link: string, chapter = 0) {
	const novelLink = link.split('/').pop();
	const bookPageRequest = fetch(`https://czbooks.net/n/${novelLink}`, {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
		},
	});
	const html = await (await bookPageRequest).text();
	const { window } = new jsdom.JSDOM(html);
	const data = window.document
		?.getElementById('chapter-list')
		?.querySelectorAll('a');

	//book info
	const title = window.document?.querySelector('span.title')?.textContent;
	const author_name =
		window.document?.querySelector('span.author>a')?.textContent;
	const author_link = (
		window.document?.querySelector('span.author>a') as HTMLLinkElement
	)?.href;
	const update_time = new Date(
		window.document
			?.querySelector('div.state>table>tbody')
			?.childNodes.item(6)
			?.childNodes.item(3).textContent as string,
	);
	let tags: {
		name: string | null;
		link: string | undefined;
	}[] = [];
	window.document
		?.querySelector('ul.hashtag')
		?.querySelectorAll('li.item')
		.forEach((e) =>
			tags.push({
				name: e.textContent,
				link: e.querySelector('a')?.href,
			}),
		);
	const cover = (
		window.document
			?.querySelector('div.thumbnail')
			?.children.item(0) as HTMLImageElement
	)?.src as string;
	const description = window.document
		.querySelector('div.description')
		?.textContent?.split('\n')
		.filter((a) => a !== '');

	//show info
	const bookinfo = {
		link: 'https:' + link,
		title: title,
		author_name: author_name,
		author_link: 'https:' + author_link,
		update_time: update_time,
		tags: tags,
		cover: 'https:' + cover,
		description: description,
	};
	//bar

	let chapterLinks: string[] = [];
	data?.forEach((a) => chapterLinks.push(a.href));
	const get = async (a: string) => {
		const chapterRequest = await fetch(`https:${a}`, {
			method: 'GET',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
			},
		});
		const html = await chapterRequest.text();
		const { window } = new jsdom.JSDOM(html);
		const content = window.document.querySelector('.content')?.textContent;
		return content?.split('\n').filter((a) => a !== '') || [];
	};
	let lists: string[][] = [];
	while (chapterLinks.length > 0) {
		const current = chapterLinks.splice(0, 30);
		let list: string[][] = await Promise.all(current.map(get));
		lists = lists.concat(list);
	}
	return Object.assign(bookinfo, { content: lists });
}

export function createUser(
	authorname: string,
	authorlink: string,
	bookinfo: any,
) {
	return {
		name: authorname,
		email: authorname + '@czbooks.net',
		link_avatar: 'https://czbooks.net/favicon.ico',
		permissions: 'user',
		about_me: 'Auto Generated User',
	};
}
/*
(async () => {
	const searchTarget = '早安';
	const books = await getSearchBook(searchTarget, -1);
	console.log(books);
	fs.writeFileSync(
		`./${searchTarget}_info.txt`,
		JSON.stringify([...books], null, 4),
	);
	
	for (const [title, link] of books) {
		if (
			fs.existsSync(
				`./${searchTarget}/${title.replace(' ', '_').replace('/', '_')}.txt`,
			)
		) {
			console.log(`Skipping ${title.replace(' ', '_').replace('/', '_')}`);
			continue;
		}
		console.log(`Fetching ${title}`);
		const bookdata = await getBookContent(link);
		const content = bookdata.content;
		fs.mkdir(`./${searchTarget}`, (err) => {});
		fs.writeFileSync(
			`./${searchTarget}/${title.replace(' ', '_').replace('/', '_')}.txt`,
			content.map((e) => e.join('\n')).join('\n'),
		);
		fs.writeFileSync(
			`./${searchTarget}/${title.replace(' ', '_').replace('/', '_')}_info.txt`,
			content.map((e) => e.join('\n')).join('\n'),
		);
	}
})();
*/
