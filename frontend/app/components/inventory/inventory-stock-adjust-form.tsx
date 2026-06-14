import { useState, type FormEvent } from 'react'
import type { InventoryStockInput, InventoryStockReason } from '~/api/inventoryApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'

interface InventoryStockAdjustFormProps {
	inventoryId: string
	onSubmit: (data: InventoryStockInput) => Promise<unknown>
}

const REASON_OPTIONS: { value: InventoryStockReason; label: string }[] = [
	{ value: 'initial', label: 'Initial' },
	{ value: 'purchase', label: 'Purchase' },
	{ value: 'production', label: 'Production' },
	{ value: 'correction', label: 'Correction' },
	{ value: 'adjustment', label: 'Adjustment' },
]

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Failed to adjust stock'
}

export default function InventoryStockAdjustForm({ inventoryId, onSubmit }: InventoryStockAdjustFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [quantity, setQuantity] = useState<number | ''>('')
	const [note, setNote] = useState('')
	const [reason, setReason] = useState<InventoryStockReason>('adjustment')
	const [errors, setErrors] = useState<{ quantity?: string }>({})
	const dispatch = useAppDispatch()

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (quantity === '') {
			setErrors({ quantity: 'Quantity is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			await onSubmit({
				inventoryId,
				quantity,
				note: note.trim() || undefined,
				reason,
			})
			dispatch(showAlert({ message: 'Stock adjusted successfully', severity: 'success' }))
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Quantity to remove</label>
				<input
					type='number'
					min={1}
					placeholder='e.g. 5'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					aria-invalid={Boolean(errors.quantity)}
					value={quantity}
					onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
					required
				/>
				{errors.quantity && <p className='mt-1 text-xs text-red-500'>{errors.quantity}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Reason</label>
				<select
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={reason ?? ''}
					onChange={e => setReason(e.target.value as InventoryStockReason)}>
					{REASON_OPTIONS.map(opt => (
						<option key={opt.value} value={opt.value ?? ''}>
							{opt.label}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Note</label>
				<input
					type='text'
					placeholder='Optional note'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={note}
					onChange={e => setNote(e.target.value)}
				/>
			</div>

			<button
				type='submit'
				disabled={isSubmitting}
				className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60'>
				{isSubmitting ? 'Saving…' : 'Adjust Stock'}
			</button>
		</form>
	)
}
