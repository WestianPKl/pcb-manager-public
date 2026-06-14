import { useEffect, useState, type FormEvent } from 'react'
import type { CreatePermissionAccessLevelInput } from '~/api/adminApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import { PermissionAccessLevelClass } from '~/types/admin/PermissionAccessLevelClass'

interface PermissionAccessLevelFormProps {
	permissionAccessLevel?: PermissionAccessLevelClass
	onSubmit: (data: CreatePermissionAccessLevelInput) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Permission access level could not be created'
}

export default function PermissionAccessLevelForm({ permissionAccessLevel, onSubmit }: PermissionAccessLevelFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [name, setName] = useState<string | undefined>()
	const [accessLevel, setAccessLevel] = useState<number | undefined>()
	const [edit, isEdit] = useState(false)

	const [errors, setErrors] = useState<{ name?: string }>({})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (permissionAccessLevel) {
			setName(permissionAccessLevel.name)
			setAccessLevel(permissionAccessLevel.accessLevel)
			isEdit(true)
		}
	}, [permissionAccessLevel])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const name = String(formData.get('name') ?? '').trim()
		const accessLevel = Number(formData.get('accessLevel') ?? 0)
		if (!name) {
			setErrors({ name: 'Name is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			const data = {
				name,
				accessLevel,
			}

			await onSubmit(data)

			dispatch(
				showAlert({
					message: edit
						? 'Permission access level updated successfully'
						: 'Permission access level created successfully',
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
					<label className='mb-1 block text-xs font-medium text-gray-600'>Access Level</label>
					<input
						type='number'
						name='accessLevel'
						placeholder='Access level'
						className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
						value={accessLevel}
						onChange={e => setAccessLevel(Number(e.target.value))}
						required
					/>
				</div>

				<button
					type='submit'
					className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
					disabled={isSubmitting}>
					{isSubmitting ? (edit ? 'Updating...' : 'Adding...') : edit ? 'Update Category' : 'Add Category'}
				</button>
			</form>
		</>
	)
}
