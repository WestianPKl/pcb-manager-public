export default function DeleteButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			className='rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95 cursor-pointer'
			onClick={onClick}>
			Delete
		</button>
	)
}
