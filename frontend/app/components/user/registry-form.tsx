import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useRegisterMutation } from '~/api/userApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Registration failed'
}

export default function RegistryForm() {
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const [register] = useRegisterMutation()

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const form = event.currentTarget
		const formData = new FormData(form)

		const username = String(formData.get('username') ?? '').trim()
		const password = String(formData.get('password') ?? '').trim()
		const name = String(formData.get('name') ?? '').trim()
		const surname = String(formData.get('surname') ?? '').trim()
		const email = String(formData.get('email') ?? '').trim()

		if (!username || !password) {
			dispatch(showAlert({ message: 'Username and password are required', severity: 'error' }))
			return
		}

		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			dispatch(showAlert({ message: 'Invalid email format', severity: 'error' }))
			return
		}
		if (!name || !surname) {
			dispatch(showAlert({ message: 'Name and surname are required', severity: 'error' }))
			return
		}

		setIsLoading(true)

		try {
			await register({ username, password, name, surname, email }).unwrap()

			dispatch(showAlert({ message: 'Account created successfully', severity: 'success' }))

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
					<label htmlFor='register-username' className='mb-1 block text-xs font-medium text-gray-600'>
						Username
					</label>

					<input
						type='text'
						name='username'
						id='register-username'
						required
						autoComplete='username'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<div>
					<label htmlFor='register-name' className='mb-1 block text-xs font-medium text-gray-600'>
						Name
					</label>

					<input
						type='text'
						name='name'
						id='register-name'
						required
						autoComplete='name'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<div>
					<label htmlFor='register-surname' className='mb-1 block text-xs font-medium text-gray-600'>
						Surname
					</label>

					<input
						type='text'
						name='surname'
						id='register-surname'
						required
						autoComplete='surname'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<div>
					<label htmlFor='register-email' className='mb-1 block text-xs font-medium text-gray-600'>
						Email
					</label>

					<input
						type='email'
						name='email'
						id='register-email'
						required
						autoComplete='email'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<div>
					<label htmlFor='register-password' className='mb-1 block text-xs font-medium text-gray-600'>
						Password
					</label>

					<input
						type='password'
						name='password'
						id='register-password'
						required
						autoComplete='new-password'
						className='block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='flex w-full justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer'>
					{isLoading ? 'Creating account...' : 'Register'}
				</button>
			</form>
		</div>
	)
}
