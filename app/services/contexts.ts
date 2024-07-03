import { createContext } from 'react';

export let booklistcontext = createContext<{
	booklistOpen: boolean;
	setBooklistOpen: React.Dispatch<React.SetStateAction<boolean>> | (() => {});
}>({
	booklistOpen: false,
	setBooklistOpen: () => {
		(prev: boolean) => prev;
	},
});

export let booklistBookidContext = createContext<{
	bookId: number;
	setBookId: React.Dispatch<React.SetStateAction<number>> | (() => {});
}>({
	bookId: 0,
	setBookId: () => {
		(prev: number) => prev;
	},
});
