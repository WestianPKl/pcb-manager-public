import Dialog from '~/components/ui/dialog'

export default function ConfirmDialog({
	onConfirm,
	onCancel,
	message = 'Are you sure you want to delete this item? This action cannot be undone.',
}: {
	onConfirm: () => void
	onCancel: () => void
	message?: string
}) {
	return (
		<Dialog title='Confirm deletion' onClose={onCancel}>
			<div className='flex flex-col gap-4'>
				<p className='text-sm text-gray-600'>{message}</p>
				<div className='flex justify-end gap-2'>
					<button
						onClick={onCancel}
						className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer'>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer'>
						Delete
					</button>
				</div>
			</div>
		</Dialog>
	)
}
