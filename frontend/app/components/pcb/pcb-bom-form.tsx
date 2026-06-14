import { useEffect, useState, type FormEvent } from 'react'
import type { CreatePCBBomItemInput } from '~/api/pcbApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { PCBBomItemsClass } from '~/types/pcb/PCBBomItemsClass'
import InventorySelect from '~/components/inventory/inventory-select'

interface PCBBomItemsFormProps {
	pcbId: string
	pcbBomItem?: PCBBomItemsClass
	onSubmit: (data: CreatePCBBomItemInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'PCB BOM item could not be created'
}

export default function PCBBomItemsForm({ pcbId, pcbBomItem, onSubmit }: PCBBomItemsFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [qtyPerBoard, setQtyPerBoard] = useState<number>(1)
	const [designators, setDesignators] = useState<string>('')
	const [valueSpec, setValueSpec] = useState<string>('')
	const [allowSubstitutes, setAllowSubstitutes] = useState<boolean>(false)
	const [selectedInventory, setSelectedInventory] = useState<string | undefined>(undefined)
	const handleInventorySelect = (id: string | undefined) => setSelectedInventory(id)
	const [comment, setComment] = useState<string>('')
	const [isEdit, setIsEdit] = useState(false)
	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (pcbBomItem) {
			setQtyPerBoard(pcbBomItem.qtyPerBoard ?? 1)
			setDesignators(pcbBomItem.designators ?? '')
			setValueSpec(pcbBomItem.valueSpec ?? '')
			setAllowSubstitutes(pcbBomItem.allowSubstitutes ?? false)
			setSelectedInventory(pcbBomItem.inventoryId ?? undefined)
			setComment(pcbBomItem.comment ?? '')
			setIsEdit(true)
		}
	}, [pcbBomItem])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		setErrors({})
		setIsSubmitting(true)

		try {
			await onSubmit({
				pcbId,
				qtyPerBoard,
				designators: designators.trim(),
				valueSpec: valueSpec.trim(),
				allowSubstitute: allowSubstitutes,
				inventoryId: selectedInventory,
				comment: comment.trim(),
			})

			dispatch(
				showAlert({
					message: isEdit ? 'PCB BOM item updated successfully' : 'PCB BOM item created successfully',
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
					placeholder='Quantity per board'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					aria-invalid={Boolean(errors.name)}
					value={qtyPerBoard}
					onChange={e => setQtyPerBoard(Number(e.target.value))}
					required
				/>
				{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Designators</label>
				<input
					type='text'
					placeholder='Designators'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={designators}
					onChange={e => setDesignators(e.target.value)}
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Value/Specification</label>
				<input
					type='text'
					placeholder='Value/Specification'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={valueSpec}
					onChange={e => setValueSpec(e.target.value)}
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Allow Substitutes</label>
				<input
					type='checkbox'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					checked={allowSubstitutes}
					onChange={e => setAllowSubstitutes(e.target.checked)}
				/>
			</div>

			<InventorySelect getItem={handleInventorySelect} itemId={selectedInventory} />

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Comment</label>
				<textarea
					placeholder='Comment'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={comment}
					onChange={e => setComment(e.target.value)}
				/>
			</div>

			<button
				type='submit'
				className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
				disabled={isSubmitting}>
				{isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update PCB BOM Item' : 'Add PCB BOM Item'}
			</button>
		</form>
	)
}
