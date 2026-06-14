export default function PageHeader({
	title,
	subtitle,
	onAdd,
	addLabel,
}: {
	title: string
	subtitle?: string
	onAdd?: () => void
	addLabel?: string
}) {
	return (
		<div className='mb-8 flex items-center justify-between'>
			<div className='border-l-4 border-teal-500 pl-4'>
				<h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
				{subtitle && <p className='mt-1 text-sm text-gray-500'>{subtitle}</p>}
			</div>
			{onAdd && (
				<button
					className='inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95 cursor-pointer'
					onClick={onAdd}>
					{addLabel ?? '+ Add'}
				</button>
			)}
		</div>
	)
}
