import { useEffect, useState, type FormEvent } from 'react'
import type { CreatePermissionInput } from '~/api/adminApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { PermissionClass } from '~/types/admin/PermissionClass'
import type { PermissionFunctionalityClass } from '~/types/admin/PermissionFunctionalityClass'
import type { PermissionAccessLevelClass } from '~/types/admin/PermissionAccessLevelClass'

interface PermissionFormProps {
	permission?: PermissionClass
	permissionFunctionalities?: PermissionFunctionalityClass[]
	permissionAccessLevels?: PermissionAccessLevelClass[]
	onSubmit: (data: CreatePermissionInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Permission could not be created'
}

export default function PermissionForm({
	permission,
	permissionFunctionalities,
	permissionAccessLevels,
	onSubmit,
}: PermissionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [name, setName] = useState('')
	const [functionalityId, setFunctionalityId] = useState('')
	const [accessLevelId, setAccessLevelId] = useState<number | ''>('')
	const [edit, setEdit] = useState(false)

	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (permission) {
			setName(permission.name ?? '')
			setFunctionalityId(permission.functionalityId ?? '')
			setAccessLevelId(permission.accessLevelId ?? '')
			setEdit(true)
		}
	}, [permission])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const name = String(formData.get('name') ?? '').trim()
		const functionalityId = String(formData.get('functionalityId') ?? '')
		const accessLevelId = Number(formData.get('accessLevelId') ?? 0)
		if (!name) {
			setErrors({ name: 'Name is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			const data = {
				name,
				functionalityId,
				accessLevelId,
			}

			await onSubmit(data)

			dispatch(
				showAlert({
					message: edit ? 'Permission updated successfully' : 'Permission created successfully',
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
						placeholder='Permission name'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						aria-invalid={Boolean(errors.name)}
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
					{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
				</div>

				<div>
					<label className='mb-1 block text-xs font-medium text-gray-600'>Functionality</label>
					<select
						name='functionalityId'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						value={functionalityId}
						onChange={e => setFunctionalityId(e.target.value)}>
						<option value=''>Select a functionality</option>
						{permissionFunctionalities?.map(func => (
							<option key={func.id} value={func.id}>
								{func.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className='mb-1 block text-xs font-medium text-gray-600'>Access Level</label>
					<select
						name='accessLevelId'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						value={accessLevelId}
						onChange={e => setAccessLevelId(Number(e.target.value))}>
						<option value=''>Select an access level</option>
						{permissionAccessLevels?.map(level => (
							<option key={level.accessLevel} value={level.accessLevel}>
								{level.name}
							</option>
						))}
					</select>
				</div>

				<button
					type='submit'
					className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
					disabled={isSubmitting}>
					{isSubmitting ? (edit ? 'Updating...' : 'Adding...') : edit ? 'Update Product' : 'Add Product'}
				</button>
			</form>
		</>
	)
}
