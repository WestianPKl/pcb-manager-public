import { useEffect, useState, type FormEvent } from 'react'
import type { CreateProductionOrdersInput, ProductionOrdersStatus } from '~/api/productionApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { ProductionOrdersClass } from '~/types/production/ProductionOrdersClass'
import PCBSelect from '~/components/pcb/pcb-select'

interface ProductionOrdersFormProps {
	productionOrder?: ProductionOrdersClass
	onSubmit: (data: CreateProductionOrdersInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Production order could not be created'
}

export default function ProductionOrdersForm({ productionOrder, onSubmit }: ProductionOrdersFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [quantity, setQuantity] = useState<number>(1)
	const [status, setStatus] = useState<ProductionOrdersStatus>('planned')
	const [pcb, setPcb] = useState<string | undefined>(undefined)
	const [isEdit, setIsEdit] = useState(false)
	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (productionOrder) {
			setQuantity(productionOrder.quantity ?? 1)
			setStatus(productionOrder.status ?? 'planned')
			setPcb(productionOrder.pcbId ?? undefined)
			setIsEdit(true)
		}
	}, [productionOrder])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		setErrors({})
		setIsSubmitting(true)

		try {
			await onSubmit({
				quantity,
				status,
				pcbId: pcb,
			})

			dispatch(
				showAlert({
					message: isEdit ? 'Production order updated successfully' : 'Production order created successfully',
					severity: 'success',
				}),
			)
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Quantity</label>
				<input
					type='number'
					placeholder='Quantity'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={quantity}
					onChange={e => setQuantity(Number(e.target.value))}
					required
				/>
				{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Status</label>
				<select
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={status}
					onChange={e => setStatus(e.target.value as ProductionOrdersStatus)}>
					<option value='planned'>Planned</option>
					<option value='ready'>Ready</option>
					<option value='reserved'>Reserved</option>
					<option value='in_assembly'>In Assembly</option>
					<option value='produced'>Produced</option>
					<option value='cancelled'>Cancelled</option>
				</select>
			</div>

			<PCBSelect getItem={setPcb} itemId={pcb} />

			<button
				type='submit'
				className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
				disabled={isSubmitting}>
				{isSubmitting
					? isEdit
						? 'Updating...'
						: 'Adding...'
					: isEdit
						? 'Update Production Order'
						: 'Add Production Order'}
			</button>
		</form>
	)
}
