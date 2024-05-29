import { useState } from 'react';

export default function Text({
	value,
	setvalue,
	disable,
}: {
	value: string;
	setvalue: (text: string) => void;
	disable?: boolean;
}) {
	const [text, setText] = useState(value || '');
	const [editing, setEditing] = useState(false);
	return (
		<div className='w-full flex flex-row'>
			<div>
				{
					editing && disable ? (
						<input
							type='text'
							value={text}
							onChange={(e) => setText(e.currentTarget.value)}
						/>
					) : (
						<p>{text}</p>
					)
				}
			</div>
			<div>
				{disable ? (
					<button
						onClick={() => {
							setEditing(!editing);
							setvalue(text);
						}}
					>
						{editing ? `Save` : `Edit`}
					</button>
				) : (
					''
				)}
			</div>
		</div>
	);
}
