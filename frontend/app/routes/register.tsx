import RegistryForm from '~/components/user/registry-form'
import { Icon } from '@mdi/react'
import { mdiAccountPlus } from '@mdi/js'

export default function Register() {
	return (
		<div className='flex min-h-[70vh] flex-col items-center justify-center gap-8'>
			<div className='text-center'>
				<div className='mb-4 flex justify-center'>
					<span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-500/30'>
						<Icon path={mdiAccountPlus} size={1.2} className='text-white' />
					</span>
				</div>
				<h1 className='text-3xl font-bold text-gray-900'>Create account</h1>
				<p className='mt-1.5 text-sm text-gray-500'>Register to start managing tasks</p>
			</div>
			<RegistryForm />
		</div>
	)
}
