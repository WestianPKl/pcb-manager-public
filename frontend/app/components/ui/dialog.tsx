import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'

const sizeClass = {
	md: 'max-w-md',
	lg: 'max-w-2xl',
	xl: 'max-w-6xl',
}

export default function Dialog({
	title,
	children,
	onClose,
	size = 'md',
}: {
	title: string
	children: React.ReactNode
	onClose: () => void
	size?: 'md' | 'lg' | 'xl'
}) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm' onClick={onClose}>
			<div
				className={`w-full ${sizeClass[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}
				onClick={e => e.stopPropagation()}>
				<div className='bg-gradient-to-r from-teal-700 to-teal-500 px-6 py-4'>
					<div className='flex items-center justify-between'>
						<h2 className='text-lg font-bold text-white'>{title}</h2>
						<button
							className='rounded-lg p-1 text-teal-200 hover:bg-teal-800 hover:text-white cursor-pointer'
							onClick={onClose}>
							<Icon path={mdiClose} size={0.85} />
						</button>
					</div>
				</div>
				<div className='p-6'>{children}</div>
			</div>
		</div>
	)
}
