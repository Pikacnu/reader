import React, { useEffect, useState } from 'react';

const Editor = function Editor({
	setText,
	text,
}: {
	setText: React.Dispatch<React.SetStateAction<string[]>>;
	text: string[];
}) {
	const [editing, setEditing] = useState(0);
	const [editString, setEditString] = useState('');
	const save = (e: KeyboardEvent | { key: string }) => {
		if (e.key === 'Enter' || e.key === 'Escape') {
			if (editing > text.length) setEditing(text.length);
			if (editString === '') return;
			if (editing === text.length) {
				setText((prev) => [...prev, editString]);
				setEditString('');
			} else {
				setText((prev) => [
					...prev.slice(0, editing),
					editString,
					...prev.slice(editing + 1, prev.length),
				]);
				text[editing + 1]
					? setEditString(text[editing + 1])
					: setEditString('');
			}
			setEditing((prev) => {
				return prev === editing ? prev + 1 : text.length - 1;
			});
			return;
		}
		if (e.key === 'ArrowUp') {
			//up
			if (editing === 0) return;
			if (editString !== '') {
				setText((prev) => [
					...prev.slice(0, editing),
					editString,
					...prev.slice(editing + 1, prev.length),
				]);
			}

			setEditing((prev) => {
				return prev === 0 ? 0 : prev - 1;
			});
			setEditString(text[editing - 1]);
			return;
		}
		if (e.key === 'ArrowDown') {
			save({ key: 'Enter' });
			return;
		}
	};
	useEffect(() => {
		//make input focus
		document.getElementById('editing')?.focus();
		document.addEventListener('keydown', save);
		setText(text);
		return () => {
			document.removeEventListener('keydown', save);
		};
	});

	return (
		<div className='overflow-hidden w-full h-full relative flex flex-col'>
			{[...text, ''].map((item, index) => {
				return (
					<>
						{index === editing ? (
							<input
								autoComplete='off'
								id='editing'
								type='text'
								className='w-full bg-yellow-200'
								value={editString}
								key={index}
								onChange={(e) => {
									setEditString(e.currentTarget.value);
								}}
							/>
						) : (
							<button
								key={index}
								onClick={(e) => {
									//save current edit
									setText((prev) => [
										...prev.slice(0, editing),
										editString,
										...prev.slice(editing + 1, prev.length),
									]);

									setEditing(index);
									setEditString(e.currentTarget.innerText);
									console.log(index);
								}}
							>
								<p className='w-full text-start select-none'>{item}</p>
							</button>
						)}
					</>
				);
			})}
			<button
				onClick={() => {
					save({ key: 'Enter' });
					setEditing(text.length);
					setEditString('');
				}}
			>
				<p>+</p>
			</button>
		</div>
	);
};

export default Editor;
