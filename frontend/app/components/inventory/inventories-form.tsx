import { useEffect, useState, type FormEvent } from 'react'
import type { CreateInventoryInput } from '~/api/inventoryApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { InventoryClass } from '~/types/inventory/InventoryClass'
import InventoryTypeSelect from '~/components/inventory/inventory-type-select'
import InventoryPackageSelect from '~/components/inventory/inventory-package-select'
import InventoryShopSelect from '~/components/inventory/inventory-shop-select'
import InventorySurfaceMountSelect from '~/components/inventory/inventory-surface-mount-select'

interface InventoryFormProps {
	inventory?: InventoryClass
	onSubmit: (data: CreateInventoryInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Inventory could not be created'
}

export default function InventoryForm({ inventory, onSubmit }: InventoryFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [name, setName] = useState<string>('')
	const [manufacturerNumber, setManufacturerNumber] = useState<string>('')
	const [parameters, setParameters] = useState<string>('')
	const [lowThreshold, setLowThreshold] = useState<number | ''>('')
	const [comment, setComment] = useState<string>('')
	const [type, setType] = useState<string | undefined>(undefined)
	const [packageItem, setPackageItem] = useState<string | undefined>(undefined)
	const [shop, setShop] = useState<string | undefined>(undefined)
	const [surfaceMount, setSurfaceMount] = useState<string | undefined>(undefined)
	const [isEdit, setIsEdit] = useState(false)
	const [errors, setErrors] = useState<{ name?: string; parameters?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (inventory) {
			setName(inventory.name ?? '')
			setManufacturerNumber(inventory.manufacturerNumber ?? '')
			setParameters(inventory.parameters ? JSON.stringify(inventory.parameters) : '')
			setLowThreshold(inventory.lowThreshold ?? '')
			setComment(inventory.comment ?? '')
			setType(inventory.inventoryTypeId ?? undefined)
			setPackageItem(inventory.inventoryPackageId ?? undefined)
			setShop(inventory.inventoryShopId ?? undefined)
			setSurfaceMount(inventory.inventorySurfaceMountId ?? undefined)
			setIsEdit(true)
		}
	}, [inventory])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!name.trim()) {
			setErrors({ name: 'Name is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			let parsedParameters: Record<string, unknown> | undefined
			if (parameters.trim()) {
				try {
					parsedParameters = JSON.parse(parameters.trim())
				} catch {
					setErrors({ parameters: 'Parameters must be valid JSON' })
					setIsSubmitting(false)
					return
				}
			}

			await onSubmit({
				name: name.trim(),
				manufacturerNumber: manufacturerNumber.trim(),
				parameters: parsedParameters,
				lowThreshold: lowThreshold === '' ? undefined : lowThreshold,
				comment: comment.trim(),
				inventoryTypeId: type,
				inventoryPackageId: packageItem,
				inventoryShopId: shop,
				inventorySurfaceMountId: surfaceMount,
			})

			dispatch(
				showAlert({
					message: isEdit ? 'Inventory updated successfully' : 'Inventory created successfully',
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
				<label className='mb-1 block text-xs font-medium text-gray-600'>Name</label>
				<input
					type='text'
					placeholder='Inventory name'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					aria-invalid={Boolean(errors.name)}
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
				{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Manufacturer Number</label>
				<input
					type='text'
					placeholder='Manufacturer number'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={manufacturerNumber}
					onChange={e => setManufacturerNumber(e.target.value)}
				/>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Parameters</label>
				<input
					type='text'
					placeholder='Parameters (JSON)'
					className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-100 ${errors.parameters ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-teal-400'}`}
					value={parameters}
					onChange={e => setParameters(e.target.value)}
				/>
				{errors.parameters && <p className='mt-1 text-xs text-red-500'>{errors.parameters}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Low Threshold</label>
				<input
					type='number'
					placeholder='Low threshold'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={lowThreshold}
					onChange={e => setLowThreshold(e.target.value === '' ? '' : Number(e.target.value))}
				/>
			</div>

			<InventoryTypeSelect getItem={setType} itemId={type} />
			<InventoryPackageSelect getItem={setPackageItem} itemId={packageItem} />
			<InventoryShopSelect getItem={setShop} itemId={shop} />
			<InventorySurfaceMountSelect getItem={setSurfaceMount} itemId={surfaceMount} />

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
				{isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update Inventory' : 'Add Inventory'}
			</button>
		</form>
	)
}
