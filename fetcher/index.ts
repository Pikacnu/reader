import express from 'express';
import jsdom from 'jsdom';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { chapter } from 'db/schema';
dotenv.config();

interface book {
	link: string;
	index: number;
	bookid: number;
}
const migrationsClient = postgres(process.env.SQL_CONNECTION_LINK || '', {
	max: 1,
});
const db = drizzle(migrationsClient);
const app = express();

async function getBookChapters(link: string, bookid: number) {
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

	let chapterLinks: book[] = [];
	data?.forEach((a, i) =>
		chapterLinks.push({
			link: a.href,
			index: i,
			bookid: bookid,
		}),
	);
	return chapterLinks;
}

const getContent = async (a: string) => {
	const chapterRequest = await fetch(`https:${a}`, {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
		},
	});
	const html = await chapterRequest.text();
	if (chapterRequest.status !== 200) return console.log('Error');
	const { window } = new jsdom.JSDOM(html);
	const content = window.document.querySelector('.content')?.textContent;
	if (content === null) return [];
	return content?.split('\n').filter((a) => a !== '') || [];
};

class processBook {
	bookList: book[];

	constructor() {
		this.bookList = [];
	}
	addChapters(booklist: book[]) {
		const temp = this.bookList.concat(booklist);
		this.bookList = temp.sort((a, b) => a.index - b.index);
		return;
	}
	addChapter(book: book) {
		if (this.bookList.some((e) => e.index === book.index)) return;
		this.bookList.push(book);
		this.bookList = this.bookList.sort((a, b) => a.index - b.index);
		return;
	}
	async addBook(link: string, bookid: number) {
		if (this.bookList.some((e) => e.bookid === bookid)) return;
		const chapters = await getBookChapters(link, bookid);
		this.addChapters(chapters);
	}
	async process(chain?: boolean) {
		const book = this.bookList.shift();
		if (book === undefined) return;
		const content = await getContent(book.link);
		if (content?.length === 0) return;
		if (content === undefined) return;
		await db.insert(chapter).values({
			book_id: book.bookid,
			title: `Chapter ${book.index}`,
			content: content,
			chapter_id: book.index,
		});
		if (chain) this.process(chain);
		return;
	}
	async getState(bookid: number) {
		if (this.bookList.some((e) => e.bookid === bookid))
			return this.bookList
				.filter((e) => e.bookid === bookid)
				.map((e) => e.index);
		return [];
	}
}

const bookProcessor = new processBook();

app.get('/state/:bookid', (req, res) => {
	const bookid = parseInt(req.params.bookid || '0');
	const state = bookProcessor.getState(bookid);
	res.send(state);
});

app.get('/add/:link/:bookid', (req, res) => {
	const link = req.params.link;
	const bookid = parseInt(req.params.bookid || '0');
	bookProcessor.addBook(link, bookid);
	res.send('Added');
});

app.listen(3100, () => {
	console.log('Server running');
});

bookProcessor.process(true);
