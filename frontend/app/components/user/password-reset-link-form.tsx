import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { usePasswordResetTokenMutation } from '~/api/userApi'
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

export default function PasswordResetLinkForm() {
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useAppDispatch()
	const [passwordResetToken] = usePasswordResetTokenMutation()

	const state = location.state as LocationState | null

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const email = String(formData.get('email') ?? '').trim()

		if (!email) {
			dispatch(showAlert({ message: 'Email is required', severity: 'error' }))
			return
		}

		setIsLoading(true)

		try {
			await passwordResetToken({ email }).unwrap()
			dispatch(showAlert({ message: 'Password reset email sent', severity: 'success' }))

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
					<label htmlFor='login-email' className='mb-1 block text-xs font-medium text-gray-600'>
						Email
					</label>

					<input
						type='email'
						name='email'
						id='login-email'
						required
						autoComplete='email'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='flex w-full justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer'>
					{isLoading ? 'Sending...' : 'Send Password Reset Email'}
				</button>
			</form>
		</div>
	)
}
