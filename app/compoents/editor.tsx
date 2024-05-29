import { useEffect, useState } from 'react';

const Editor = function Editor({
	setText,
}: {
	setText: (text: string[]) => void;
}) {
	const [editing, setEditing] = useState(0);
	const [editString, setEditString] = useState('');
	const [saved, setSaved] = useState<string[]>([]);
	const save = (e: KeyboardEvent | { key: string }) => {
		if (e.key === 'Enter' || e.key === 'Escape') {
			if (editing > saved.length) setEditing(saved.length);
			if (editString === '') return;
			if (editing === saved.length) {
				setSaved((prev) => [...prev, editString]);
				setEditString('');
			} else {
				setSaved((prev) => [
					...prev.slice(0, editing),
					editString,
					...prev.slice(editing + 1, prev.length),
				]);
				saved[editing + 1]
					? setEditString(saved[editing + 1])
					: setEditString('');
			}
			setEditing((prev) => {
				return prev === editing ? prev + 1 : saved.length - 1;
			});
			return;
		}
		if (e.key === 'ArrowUp') {
			//up
			if (editing === 0) return;
			if (editString !== '') {
				setSaved((prev) => [
					...prev.slice(0, editing),
					editString,
					...prev.slice(editing + 1, prev.length),
				]);
			}

			setEditing((prev) => {
				return prev === 0 ? 0 : prev - 1;
			});
			setEditString(saved[editing - 1]);
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
		setText(saved);
		return () => {
			document.removeEventListener('keydown', save);
		};
	});

	return (
		<div className='overflow-hidden w-full h-full relative flex flex-col'>
			{[...saved, ''].map((item, index) => {
				return (
					<>
						{index === editing ? (
							<input
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
									setSaved((prev) => [
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
				}}
			>
				<p>+</p>
			</button>
		</div>
	);
};

export default Editor;
