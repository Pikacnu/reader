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
