import BookCard, { BookData } from './bookcard';

export default function BookShelf({ books }: { books: BookData[] }) {
	return (
		<div className='grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2'>
			{books.map((book, index) => {
				return (
					<BookCard
						title={book.title}
						author={book.author}
						key={index}
						src={book.src}
						tags={book.tags}
						cover={book.cover}
					/>
				);
			})}
		</div>
	);
}
