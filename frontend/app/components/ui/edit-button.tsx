export default function EditButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			className='mb-1 mr-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-95 cursor-pointer'
			onClick={onClick}>
			Edit
		</button>
	)
}
