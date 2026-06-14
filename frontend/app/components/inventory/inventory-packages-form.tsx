import { useEffect, useState, type FormEvent } from 'react'
import type { CreateInventoryPackageInput } from '~/api/inventoryApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { InventoryPackageClass } from '~/types/inventory/InventoryPackageClass'

interface InventoryPackageFormProps {
	inventoryPackage?: InventoryPackageClass
	onSubmit: (data: CreateInventoryPackageInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Inventory package could not be created'
}

export default function InventoryPackageForm({ inventoryPackage, onSubmit }: InventoryPackageFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [name, setName] = useState<string>('')
	const [isEdit, setIsEdit] = useState(false)
	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (inventoryPackage) {
			setName(inventoryPackage.name ?? '')
			setIsEdit(true)
		}
	}, [inventoryPackage])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!name.trim()) {
			setErrors({ name: 'Name is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			await onSubmit({
				name: name.trim(),
			})

			dispatch(
				showAlert({
					message: isEdit ? 'Inventory package updated successfully' : 'Inventory package created successfully',
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
					placeholder='Inventory package name'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					aria-invalid={Boolean(errors.name)}
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
				{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
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
						? 'Update Inventory Package'
						: 'Add Inventory Package'}
			</button>
		</form>
	)
}
