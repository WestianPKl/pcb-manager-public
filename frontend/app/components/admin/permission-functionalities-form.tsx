import { useEffect, useState, type FormEvent } from 'react'
import type { CreatePermissionFunctionalityInput } from '~/api/adminApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import { PermissionFunctionalityClass } from '~/types/admin/PermissionFunctionalityClass'

interface PermissionFunctionalityFormProps {
	permissionFunctionality?: PermissionFunctionalityClass
	onSubmit: (data: CreatePermissionFunctionalityInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Permission functionality could not be created'
}

export default function PermissionFunctionalityForm({
	permissionFunctionality,
	onSubmit,
}: PermissionFunctionalityFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [name, setName] = useState<string | undefined>()
	const [description, setDescription] = useState<string | undefined>()
	const [edit, isEdit] = useState(false)

	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (permissionFunctionality) {
			setName(permissionFunctionality.name)
			setDescription(permissionFunctionality.description)
			isEdit(true)
		}
	}, [permissionFunctionality])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const name = String(formData.get('name') ?? '').trim()
		const description = String(formData.get('description') ?? '').trim()
		if (!name) {
			setErrors({ name: 'Name is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			const data = {
				name,
				description,
			}

			await onSubmit(data)

			dispatch(
				showAlert({
					message: edit
						? 'Permission functionality updated successfully'
						: 'Permission functionality created successfully',
					severity: 'success',
				}),
			)
			form.reset()
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<form onSubmit={handleSubmit} className='flex flex-col gap-3'>
				<div>
					<label className='mb-1 block text-xs font-medium text-gray-600'>Name</label>
					<input
						type='text'
						name='name'
						placeholder='Category name'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						aria-invalid={Boolean(errors.name)}
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
					{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
				</div>

				<div>
					<label className='mb-1 block text-xs font-medium text-gray-600'>Description</label>
					<textarea
						name='description'
						placeholder='Category description'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</div>

				<button
					type='submit'
					className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
					disabled={isSubmitting}>
					{isSubmitting ? (edit ? 'Updating...' : 'Adding...') : edit ? 'Update Functionality' : 'Add Functionality'}
				</button>
			</form>
		</>
	)
}
