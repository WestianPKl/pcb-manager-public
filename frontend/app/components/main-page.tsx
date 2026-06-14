import { Link } from 'react-router'
import { Icon } from '@mdi/react'
import { mdiDatabase, mdiChip, mdiFactory, mdiAccessPoint, mdiArrowRight } from '@mdi/js'
import { useAppSelector } from '~/stores/hooks'
import { selectUser } from '~/stores/account-store'

const TILES = [
	{
		to: '/pcbs',
		icon: mdiChip,
		label: 'PCBs',
		description: 'Browse PCB designs and their bill of materials.',
		color: 'bg-blue-500',
		ring: 'ring-blue-200',
		text: 'text-blue-600',
		bg: 'bg-blue-50',
	},
	{
		to: '/production-orders',
		icon: mdiFactory,
		label: 'Production',
		description: 'Manage production orders and assembly status.',
		color: 'bg-teal-500',
		ring: 'ring-teal-200',
		text: 'text-teal-600',
		bg: 'bg-teal-50',
	},
	{
		to: '/inventories',
		icon: mdiDatabase,
		label: 'Inventory',
		description: 'Track components, stock levels and movements.',
		color: 'bg-cyan-500',
		ring: 'ring-cyan-200',
		text: 'text-cyan-600',
		bg: 'bg-cyan-50',
	},
	{
		to: '/devices',
		icon: mdiAccessPoint,
		label: 'Devices',
		description: 'Manufactured devices and their serial numbers.',
		color: 'bg-sky-500',
		ring: 'ring-sky-200',
		text: 'text-sky-600',
		bg: 'bg-sky-50',
	},
]

export default function MainPage() {
	const userFromStore = useAppSelector(selectUser)

	return (
		<div>
			{!userFromStore?.id ? (
				<div className='overflow-hidden rounded-2xl border border-teal-200 shadow-md'>
					<div className='relative h-48 w-full bg-teal-900'>
						<img src='/banner.png' alt='PCB Manager banner' className='h-full w-full object-cover opacity-80' />
						<div className='absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent' />
					</div>
					<div className='bg-gradient-to-br from-teal-50 to-teal-100 px-8 py-7 text-center'>
						<h2 className='text-2xl font-bold text-teal-900 mb-2'>Welcome to PCB Manager</h2>
						<p className='text-teal-700 mb-6'>
							Sign in to monitor your devices and real-time data in one central location.
						</p>
						<div className='flex gap-3 justify-center'>
							<Link
								to='/login'
								className='inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95'>
								Sign In
							</Link>
							<Link
								to='/register'
								className='inline-flex items-center gap-2 rounded-lg border-2 border-teal-600 px-6 py-2.5 text-sm font-semibold text-teal-600 transition-all hover:bg-teal-50'>
								Sign Up
							</Link>
						</div>
					</div>
				</div>
			) : (
				<div>
					<div className='mb-6'>
						<h1 className='text-xl font-bold text-gray-900'>
							Welcome back, {userFromStore.name ?? userFromStore.username}
						</h1>
						<p className='mt-1 text-sm text-gray-500'>Here's a quick overview of the system.</p>
					</div>

					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						{TILES.map(tile => (
							<Link
								key={tile.to}
								to={tile.to}
								className={`group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:ring-2 ${tile.ring}`}>
								<div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tile.color} shadow-sm`}>
									<Icon path={tile.icon} size={0.85} className='text-white' />
								</div>
								<div className='flex-1'>
									<p className='text-sm font-semibold text-gray-900'>{tile.label}</p>
									<p className='mt-0.5 text-xs text-gray-500 leading-relaxed'>{tile.description}</p>
								</div>
								<div className={`inline-flex items-center gap-1 text-xs font-medium ${tile.text}`}>
									Open <Icon path={mdiArrowRight} size={0.5} />
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
