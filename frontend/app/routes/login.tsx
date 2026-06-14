import LoginForm from '~/components/user/login-form'
import { Icon } from '@mdi/react'
import { mdiLogin } from '@mdi/js'

export default function Login() {
	return (
		<div className='flex min-h-[70vh] flex-col items-center justify-center gap-8'>
			<div className='text-center'>
				<div className='mb-4 flex justify-center'>
					<span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-500/30'>
						<Icon path={mdiLogin} size={1.2} className='text-white' />
					</span>
				</div>
				<h1 className='text-3xl font-bold text-gray-900'>Welcome back</h1>
				<p className='mt-1.5 text-sm text-gray-500'>Sign in to your account</p>
			</div>
			<LoginForm />
		</div>
	)
}
