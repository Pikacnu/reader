import jsdom from 'jsdom';
import * as fs from 'fs';

export async function getSearchBook(searchTarget, limit = 10, start = 1) {
	let books = [];
	let dupe = 0;
	let page = start;
	let pagelimit = limit + start;
	console.log(`Fetching ${searchTarget} from ${start} to ${pagelimit}`);
	const get = async (page, index, errorcount = 0) => {
		if (errorcount >= 3) throw new Error('Max retry reached');
		try {
			const request = await fetch(`${searchTarget}/total/${page}`, {
				method: 'GET',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
				},
			});

			if (request.status !== 200) throw new Error('Max page reached');
			const html = await request.text();
			const { window } = new jsdom.JSDOM(html);
			window.document.querySelectorAll('div.novel-item').forEach((a) => {
				const link = a?.querySelector('a')?.href;
				const title = a?.querySelector('div.novel-item-title')?.textContent;
				const info = {
					title: title?.replace('\n', '') || '',
					link: link || '',
				};
				if (
					books.some(
						(a) => a.link === info.link && a.title !== '' && info.title !== '',
					)
				)
					dupe += 1;
				books.push(info);
			});
		} catch (e) {
			await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
			await get(page, 0, errorcount + 1);
		}
		if (dupe >= 20) throw new Error('Too many duplicates');
	};

	while (page <= pagelimit) {
		const count = Math.min(pagelimit - page, 10);
		//console.log(`Fetching ${page} to ${page + count}`);
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
	console.log(`Fetched ${books.length} books`);
	return books;
}

export async function getBookInfo(link) {
	const novelLink = link.split('/').pop();
	const bookPageRequest = await fetch(`https://czbooks.net/n/${novelLink}`, {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
		},
	});
	const html = await bookPageRequest.text();
	const { window } = new jsdom.JSDOM(html);
	const data = window.document
		?.getElementById('chapter-list')
		?.querySelectorAll('a');

	//book info
	const title = window.document?.querySelector('span.title')?.textContent;
	const author_name =
		window.document?.querySelector('span.author>a')?.textContent;
	const author_link = window.document?.querySelector('span.author>a')?.href;
	const update_time = new Date(
		window.document
			?.querySelector('div.state>table>tbody')
			?.childNodes.item(6)
			?.childNodes.item(3).textContent,
	);
	let tags = [];
	window.document
		?.querySelector('ul.hashtag')
		?.querySelectorAll('li.item')
		.forEach((e) =>
			tags.push({
				name: e.textContent,
				link: e.querySelector('a')?.href,
			}),
		);
	const cover = window.document
		?.querySelector('div.thumbnail')
		?.children.item(0)?.src;
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

export async function getBookContent(link, chapter = 0) {
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
	const author_link = window.document?.querySelector('span.author>a')?.href;
	const update_time = new Date(
		window.document
			?.querySelector('div.state>table>tbody')
			?.childNodes.item(6)
			?.childNodes.item(3).textContent,
	);
	let tags = [];
	window.document
		?.querySelector('ul.hashtag')
		?.querySelectorAll('li.item')
		.forEach((e) =>
			tags.push({
				name: e.textContent,
				link: e.querySelector('a')?.href,
			}),
		);
	const cover = window.document
		?.querySelector('div.thumbnail')
		?.children.item(0)?.src;
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

	let chapterLinks = [];
	data?.forEach((a) => chapterLinks.push(a.href));
	const get = async (a) => {
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
	let lists = [];
	while (chapterLinks.length > 0) {
		const current = chapterLinks.splice(0, 30);
		let list = await Promise.all(current.map(get));
		lists = lists.concat(list);
	}
	return Object.assign(bookinfo, { content: lists });
}

export async function getBookChapters(link, chapter = 0) {
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

	let chapterLinks = [];
	data?.forEach((a) => chapterLinks.push(a.href));
	const get = async (a) => {
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
	let lists = [];
	while (chapterLinks.length > 0) {
		const current = chapterLinks.splice(0, 30);
		let list = await Promise.all(current.map(get));
		lists = lists.concat(list);
	}
	return lists;
}

(async () => {
	/*
	const tags = await new Promise((resolve, reject) => {
		fs.readFile('./cz_all_type.json', 'utf-8', (err, data) => {
			if (err) reject(err);
			resolve(JSON.parse(data));
		});
	});
	const books = [];
	for (const tag of tags) {
		const data = await getSearchBook(tag, 20000, 1);
		books.push(data);
	}
	console.log('Fetched book info');
	console.log('Saving to file');
	//remove duplicates in books
	const flat = books.flat();
	console.log('Total Books Count:' + flat.length);
	const booklinks = [];
	const booklist = flat.filter((a) => {
		if (booklinks.includes(a.link)) return false;
		booklinks.push(a.link);
		return true;
	});
	console.log('Unique Books Count:' + booklist.length);
	fs.writeFileSync('./cz_all_books.json', JSON.stringify(booklist));
	fs.writeFileSync('./cz_all_books_link.txt', JSON.stringify(booklinks));
	console.log('Saved to file');*/

	const booklist = await new Promise((resolve, reject) => {
		fs.readFile('./cz_all_books.json', 'utf-8', (err, data) => {
			if (err) reject(err);
			resolve(JSON.parse(data));
		});
	});

	console.log('Fetching book info');
	let currentCount = 0;
	fs.mkdirSync('../cz_temp', { recursive: true });
	while (currentCount < booklist.length) {
		const count = Math.min(booklist.length - currentCount, 10);
		console.log(`Fetching ${currentCount} to ${currentCount + count}`);
		try {
			await Promise.all(
				Array(count)
					.fill(0)
					.map((_, i) => currentCount + i)
					.map((i) => getBookInfo(booklist[i].link)),
			).then((a) => {
				booklist.splice(currentCount, count, ...a);
			});
		} catch (error) {
			console.log(error);
		}
		currentCount += count;
	}

	try {
		fs.writeFileSync('../cz_all_books_info_a.json', JSON.stringify(booklist));
	} catch (e) {
		console.log(e);
		fs.writeFile(
			'../cz_all_books_info_a.json',
			JSON.stringify(booklist),
			() => {},
		);
	}
	console.log('Saved book info');

	const books_with_author = booklist.reduce(
		(acc, e) => {
			acc.find((a) => a.author === e.author_name)
				? acc.find((a) => a.author === e.author_name).books.push(e)
				: acc.push({ author: e.author_name, books: [e] });
			return acc;
		},
		[
			{
				author: booklist[0].author_name,
				books: [],
			},
		],
	);
	if (!fs.existsSync('./cz_all_authors')) {
		fs.mkdirSync('./cz_all_authors');
	}
	try {
		fs.writeFileSync(
			'./cz_all_authors/cz_all_authors.json',
			JSON.stringify(books_with_author),
		);
	} catch (e) {
		console.log(e);
		fs.writeFile(
			'./cz_all_authors/cz_all_authors.json',
			JSON.stringify(books_with_author),
			() => {},
		);
	}
	books_with_author.forEach((author, index) => {
		try {
			fs.writeFileSync(
				`./cz_all_authors/${index}.json`,
				JSON.stringify(author),
			);
		} catch (e) {
			console.log(e);
			fs.writeFile(
				`./cz_all_authors/${index}.json`,
				JSON.stringify(author),
				() => {},
			);
		}
	});
})();
