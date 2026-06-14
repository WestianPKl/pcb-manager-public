import type { Route } from './+types/user-profile'
import { Icon } from '@mdi/react'
import { mdiAccount, mdiAt, mdiLock, mdiPencil, mdiContentSave, mdiEmailOutline } from '@mdi/js'
import { UserClass } from '~/types/user/UserClass'
import {
	useGetDataQuery,
	useUpdateProfileMutation,
	useUpdateAvatarMutation,
	useUpdatePasswordMutation,
} from '~/api/userApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState, useEffect, type FormEvent } from 'react'
import { showAlert } from '~/stores/application-store'
import type { ApiError } from '~/api/api'
import LoadingSpinner from '~/components/ui/loading-spinner'
import PageHeader from '~/components/ui/page-header'
import { initStore } from '~/stores/account-actions'
import { toStorageUrl } from '~/utils/url'

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Profile operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [{ title: 'PCB Manager - profile' }, { name: 'description', content: 'PCB Manager description' }]
}

function Field({
	label,
	icon,
	type = 'text',
	value,
	onChange,
	placeholder,
	autoComplete,
}: {
	label: string
	icon: string
	type?: string
	value: string
	onChange: (v: string) => void
	placeholder?: string
	autoComplete?: string
}) {
	return (
		<div>
			<label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500'>{label}</label>
			<div className='relative'>
				<span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
					<Icon path={icon} size={0.7} />
				</span>
				<input
					type={type}
					value={value}
					onChange={e => onChange(e.target.value)}
					placeholder={placeholder}
					autoComplete={autoComplete}
					className='w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100'
				/>
			</div>
		</div>
	)
}

export default function UserProfile() {
	const { data: userProfileData = new UserClass(), isLoading: isUserLoading } = useGetDataQuery()

	const [previewImg, setPreviewImg] = useState<string | null>(
		userProfileData.avatar ? `${toStorageUrl(userProfileData.avatar)}?w=150&h=150&format=webp` : null,
	)

	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [form, setForm] = useState<UserClass>(new UserClass())
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')

	const dispatch = useAppDispatch()
	const [updateProfile] = useUpdateProfileMutation()
	const [updateAvatar] = useUpdateAvatarMutation()
	const [updatePassword] = useUpdatePasswordMutation()

	useEffect(() => {
		if (userProfileData) setForm(userProfileData)
	}, [userProfileData])

	if (isUserLoading) return <LoadingSpinner />

	const set = (field: keyof UserClass) => (v: string) => setForm(f => ({ ...f, [field]: v }))

	const initials =
		((userProfileData.name?.charAt(0) ?? '') + (userProfileData.surname?.charAt(0) ?? '') ||
			userProfileData.username?.charAt(0)) ??
		'?'

	async function handleSave(e?: FormEvent) {
		e?.preventDefault()

		const tasks: Promise<unknown>[] = []

		tasks.push(
			updateProfile({
				name: form.name ?? undefined,
				surname: form.surname ?? undefined,
				username: form.username ?? undefined,
				email: form.email ?? undefined,
			}).unwrap(),
		)

		if (avatarFile) {
			const formData = new FormData()
			formData.append('file', avatarFile)
			tasks.push(updateAvatar(formData).unwrap())
		}

		if (newPassword && currentPassword) {
			tasks.push(updatePassword({ currentPassword, newPassword }).unwrap())
		}

		try {
			await Promise.all(tasks)
			dispatch(showAlert({ message: 'Profile updated successfully', severity: 'success' }))
			dispatch(initStore())
			setCurrentPassword('')
			setNewPassword('')
			setAvatarFile(null)
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		}
	}

	return (
		<div>
			<PageHeader title='User Profile' subtitle='View and update your account details.' />

			<div className='mx-auto max-w-2xl space-y-6'>
				<div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
					<div className='bg-gradient-to-r from-teal-600 to-teal-800 px-6 py-8'>
						<div className='flex items-center gap-5'>
							<div className='relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-lg ring-4 ring-white/20'>
								{previewImg ? (
									<img src={previewImg} alt='Avatar' className='h-full w-full rounded-2xl object-cover' />
								) : (
									initials.toUpperCase()
								)}
								<input
									type='file'
									accept='image/*'
									className='absolute inset-0 opacity-0 cursor-pointer rounded-2xl'
									onChange={e => {
										const file = e.target.files?.[0]
										if (file) {
											setAvatarFile(file)
											setPreviewImg(URL.createObjectURL(file))
										}
									}}
								/>
							</div>
							<div>
								<p className='text-xl font-bold text-white'>
									{userProfileData.name && userProfileData.surname
										? `${userProfileData.name} ${userProfileData.surname}`
										: userProfileData.username}
								</p>
								<p className='mt-0.5 text-sm text-teal-200'>@{userProfileData.username}</p>
								{userProfileData.email && <p className='mt-1 text-xs text-teal-300'>{userProfileData.email}</p>}
							</div>
						</div>
					</div>
				</div>

				<form onSubmit={handleSave} className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
					<div className='flex items-center gap-2 border-b border-gray-100 px-6 py-4'>
						<Icon path={mdiPencil} size={0.75} className='text-teal-500' />
						<h2 className='text-sm font-semibold text-gray-900'>Edit Profile</h2>
					</div>

					<div className='px-6 py-5 space-y-4'>
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
							<Field
								label='First Name'
								icon={mdiAccount}
								value={form.name || ''}
								onChange={set('name')}
								placeholder='John'
								autoComplete='given-name'
							/>
							<Field
								label='Surname'
								icon={mdiAccount}
								value={form.surname || ''}
								onChange={set('surname')}
								placeholder='Doe'
								autoComplete='family-name'
							/>
						</div>

						<Field
							label='Username'
							icon={mdiAt}
							value={form.username || ''}
							onChange={set('username')}
							placeholder='johndoe'
							autoComplete='username'
						/>

						<Field
							label='Email'
							icon={mdiEmailOutline}
							type='email'
							value={form.email || ''}
							onChange={set('email')}
							placeholder='john@example.com'
							autoComplete='email'
						/>

						<div className='border-t border-gray-100 pt-4 space-y-4'>
							<p className='text-xs font-semibold uppercase tracking-wider text-gray-400'>Change Password</p>
							<Field
								label='Current Password'
								icon={mdiLock}
								type='password'
								value={currentPassword}
								onChange={setCurrentPassword}
								placeholder='Current password'
								autoComplete='current-password'
							/>
							<Field
								label='New Password'
								icon={mdiLock}
								type='password'
								value={newPassword}
								onChange={setNewPassword}
								placeholder='Leave blank to keep current password'
								autoComplete='new-password'
							/>
						</div>
					</div>

					<div className='flex justify-end border-t border-gray-100 px-6 py-4'>
						<button
							type='submit'
							className='inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95 cursor-pointer'>
							<Icon path={mdiContentSave} size={0.75} />
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
