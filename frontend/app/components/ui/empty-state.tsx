export default function EmptyState({ message }: { message: string }) {
	return <div className='rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400'>{message}</div>
}
