import type { Route } from './+types/user-password-reset'
import PasswordResetForm from '~/components/user/password-reset-form'
import { Icon } from '@mdi/react'
import { mdiOnepassword } from '@mdi/js'

export default function UserPasswordReset({ params }: Route.ComponentProps) {
	const token = params.token

	if (!token) {
		return (
			<div className='flex min-h-[70vh] flex-col items-center justify-center gap-8'>
				<div className='text-center'>
					<div className='mb-4 flex justify-center'>
						<span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-500/30'>
							<Icon path={mdiOnepassword} size={1.2} className='text-white' />
						</span>
					</div>
					<h1 className='text-3xl font-bold text-gray-900'>Invalid Password Reset Link</h1>
					<p className='mt-1.5 text-sm text-gray-500'>
						The password reset link is missing or invalid. Please request a new one.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex min-h-[70vh] flex-col items-center justify-center gap-8'>
			<div className='text-center'>
				<div className='mb-4 flex justify-center'>
					<span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-500/30'>
						<Icon path={mdiOnepassword} size={1.2} className='text-white' />
					</span>
				</div>
				<h1 className='text-3xl font-bold text-gray-900'>Reset Your Password</h1>
				<p className='mt-1.5 text-sm text-gray-500'>Enter your new password below</p>
			</div>
			<PasswordResetForm token={token} />
		</div>
	)
}
