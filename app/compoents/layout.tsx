export default function DefaultLayout({
	children,
  className
}: {
	children: React.ReactNode;
  className?: string;
}) {
	return (
		<div className='flex flex-col h-full w-full'>
			<div className='flex w-full h-12 lg:h-14 bg-gray-600 align-middle justify-center'>
				<div>
					<img
						src=''
						alt='User Profile'
						className='h-12 w-12 lg:h-14 lg:w-14 object-cover overflow-hidden '
					/>
				</div>
				<div className='grid grid-cols-6 grid-rows-1 w-full h-full bg-blue-800 *:justify-center *:flex *:items-center'>
					<div className='bg-blue-200 grid-cols-subgrid col-span-6 *:m-2 lg:*:m-4'>
						<input
							type='text'
							placeholder='Search'
							className='w-full'
						/>
						<img
							src=''
							alt='Search'
						/>
					</div>
				</div>
			</div>
			<div className="flex flex-col-reverse lg:flex-row overflow-hidden h-[calc(100vh-3rem)] lg:h-[calc(100vh-3.5rem)]">
				<div className='flex lg:flex-col space-between align-middle justify-center flex-row *:m-2 lg:h-[calc(100vh-3.5rem)] h-16 lg:w-14 w-full bg-gray-500'>
					{Array(3)
						.fill(0)
						.map((_, index) => {
							return (
								<div
									key={index}
									className='flex flex-col hover:bg-gray-400 hover:shadow-lg shadow-black rounded-md *:rounded-md select-none '
								>
									<img
										src=''
										alt='ICON'
									/>
									<p className=' '>Name</p>
								</div>
							);
						})}
				</div>
				<div className={"w-full overflow-y-auto overflow-x-hidden "+className}>{children}</div>
			</div>
		</div>
	);
}