import { useEffect, useState, type FormEvent } from 'react'
import type { CreateProductionOrderItemInput } from '~/api/productionApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { ProductionOrderItemsClass } from '~/types/production/ProductionOrderItemsClass'
import InventorySelect from '~/components/inventory/inventory-select'

interface ProductionOrdersFormProps {
	productionOrderId: string
	productionOrderItem?: ProductionOrderItemsClass
	onSubmit: (data: CreateProductionOrderItemInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Production order item could not be created'
}

const inputClass =
	'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'

export default function ProductionOrdersForm({
	productionOrderId,
	productionOrderItem,
	onSubmit,
}: ProductionOrdersFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [qtyPerBoard, setQtyPerBoard] = useState<number>(1)
	const [requiredQtyTotal, setRequiredQtyTotal] = useState<number>(1)
	const [consumedQty, setConsumedQty] = useState<number>(0)
	const [designators, setDesignators] = useState<string>('')
	const [allowSubstitute, setAllowSubstitute] = useState<boolean>(false)
	const [status, setStatus] = useState<'ok' | 'low' | 'missing' | undefined>('ok')
	const [inventory, setInventory] = useState<string | undefined>(undefined)
	const [isEdit, setIsEdit] = useState(false)
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (productionOrderItem) {
			setQtyPerBoard(productionOrderItem.qtyPerBoard ?? 1)
			setRequiredQtyTotal(productionOrderItem.requiredQtyTotal ?? 1)
			setConsumedQty(productionOrderItem.consumedQty ?? 0)
			setDesignators(productionOrderItem.designators ?? '')
			setAllowSubstitute(productionOrderItem.allowSubstitute ?? false)
			setStatus(productionOrderItem.status ?? 'ok')
			setInventory(productionOrderItem.inventoryId)
			setIsEdit(true)
		}
	}, [productionOrderItem])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsSubmitting(true)

		try {
			await onSubmit({
				productionOrderId,
				qtyPerBoard,
				requiredQtyTotal,
				consumedQty,
				designators: designators.trim() || undefined,
				allowSubstitute,
				status,
				...(!isEdit && { inventoryId: inventory }),
			})

			dispatch(
				showAlert({
					message: isEdit ? 'Production order item updated successfully' : 'Production order item created successfully',
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
				<label className='mb-1 block text-xs font-medium text-gray-600'>Quantity Per Board</label>
				<input
					type='number'
					placeholder='Quantity Per Board'
					className={inputClass}
					value={qtyPerBoard}
					onChange={e => setQtyPerBoard(Number(e.target.value))}
					min={1}
					required
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Required Total Quantity</label>
				<input
					type='number'
					placeholder='Required Total Quantity'
					className={inputClass}
					value={requiredQtyTotal}
					onChange={e => setRequiredQtyTotal(Number(e.target.value))}
					min={1}
					required
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Consumed Quantity</label>
				<input
					type='number'
					placeholder='Consumed Quantity'
					className={inputClass}
					value={consumedQty}
					onChange={e => setConsumedQty(Number(e.target.value))}
					min={0}
					required
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Designators</label>
				<input
					type='text'
					placeholder='Designators'
					className={inputClass}
					value={designators}
					onChange={e => setDesignators(e.target.value)}
				/>
			</div>

			{!isEdit && <InventorySelect getItem={setInventory} itemId={inventory} />}

			<div className='flex items-center gap-2'>
				<input
					type='checkbox'
					id='allowSubstitute'
					checked={allowSubstitute}
					onChange={e => setAllowSubstitute(e.target.checked)}
					className='h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500'
				/>
				<label htmlFor='allowSubstitute' className='text-sm font-medium text-gray-600'>
					Allow Substitutes
				</label>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Status</label>
				<select
					className={inputClass}
					value={status}
					onChange={e => setStatus(e.target.value as 'ok' | 'low' | 'missing' | undefined)}>
					<option value='ok'>OK</option>
					<option value='low'>Low</option>
					<option value='missing'>Missing</option>
				</select>
			</div>

			<button
				type='submit'
				className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
				disabled={isSubmitting}>
				{isSubmitting
					? isEdit
						? 'Updating...'
						: 'Adding...'
					: isEdit
						? 'Update Item'
						: 'Add Production Order Item'}
			</button>
		</form>
	)
}
