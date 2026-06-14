import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { usePasswordResetMutation } from '~/api/userApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'

type LocationState = {
	from?: string
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Password reset failed'
}

export default function PasswordResetForm({ token }: { token: string }) {
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useAppDispatch()
	const [passwordReset] = usePasswordResetMutation()

	const state = location.state as LocationState | null

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const password = String(formData.get('password') ?? '').trim()

		if (!password) {
			dispatch(showAlert({ message: 'Password is required', severity: 'error' }))
			return
		}

		setIsLoading(true)

		try {
			await passwordReset({ token: token, password }).unwrap()
			dispatch(showAlert({ message: 'Password reset successful', severity: 'success' }))

			form.reset()
			navigate('/login', { replace: true })
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='w-96 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100'>
			<form onSubmit={handleSubmit} className='space-y-5 p-8'>
				<div>
					<label htmlFor='login-password' className='mb-1 block text-xs font-medium text-gray-600'>
						New Password
					</label>

					<input
						type='password'
						name='password'
						id='login-password'
						required
						autoComplete='new-password'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='flex w-full justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer'>
					{isLoading ? 'Resetting...' : 'Reset Password'}
				</button>
			</form>
		</div>
	)
}
