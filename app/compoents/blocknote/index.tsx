import { createContext, useState, useEffect } from 'react';
import { Block } from '@blocknote/core';
import View from './blocknote';

export const text = createContext(undefined as Block[] | undefined);

export default function BlockNote() {
  useEffect(()=>{
    
  })
	const [data, setData] = useState<Block[] | undefined>(undefined);
	return (
		<text.Provider value={data}>
			<View Change={setData}></View>
		</text.Provider>
	);
}