import { Form, NavLink, Outlet, useNavigation, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@mdi/react'
import {
	mdiHome,
	mdiAccessPoint,
	mdiShieldCrown,
	mdiAccountKey,
	mdiLock,
	mdiPuzzle,
	mdiTag,
	mdiCubeOutline,
	mdiStore,
	mdiLayers,
	mdiLogin,
	mdiAccountPlus,
	mdiLogout,
	mdiChevronDown,
	mdiDatabase,
	mdiDatabaseOutline,
	mdiMenu,
	mdiCheckCircle,
	mdiChip,
	mdiSolderingIron,
	mdiFolder,
} from '@mdi/js'
import { selectUser } from '~/stores/account-store'
import { useAppDispatch, useAppSelector } from '~/stores/hooks'
import { hideAlert, selectIsActive, selectMessage, selectSeverity, selectTimeout } from '~/stores/application-store'
import { checkPermissionAction } from '~/stores/account-actions'
import { toStorageUrl } from '~/utils/url'

const navLink = (isActive: boolean) =>
	isActive
		? 'flex items-center gap-3 rounded-xl bg-teal-500/25 px-3 py-2.5 text-sm font-semibold text-white transition-colors'
		: 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors'

export default function AppLayout() {
	const navigation = useNavigation()
	const navigate = useNavigate()
	const isRouteLoading = navigation.state !== 'idle'
	const isLoggingOut = navigation.state !== 'idle' && navigation.formAction === '/logout'

	const userFromStore = useAppSelector(selectUser)

	const location = useLocation()

	const [sidebarOpen, setSidebarOpen] = useState(false)

	const [inventoryOpen, setInventoryOpen] = useState(() => ['/inventor'].some(r => location.pathname.startsWith(r)))
	const [adminOpen, setAdminOpen] = useState(() => ['/permission'].some(r => location.pathname.startsWith(r)))

	const dispatch = useAppDispatch()

	const isActive = useAppSelector(selectIsActive)
	const timeout = useAppSelector(selectTimeout)
	const message = useAppSelector(selectMessage)
	const severity = useAppSelector(selectSeverity)

	const alertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (!isActive) return
		if (alertTimeout.current) clearTimeout(alertTimeout.current)
		alertTimeout.current = setTimeout(() => dispatch(hideAlert()), timeout)
		return () => {
			if (alertTimeout.current) clearTimeout(alertTimeout.current)
		}
	}, [isActive, timeout, dispatch])

	const sidebarContent = (
		<>
			<div className='flex items-center gap-3 border-b border-teal-600/30 px-5 py-5'>
				<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg'>
					<Icon path={mdiChip} size={0.85} className='text-white' />
				</div>
				<div>
					<p className='text-sm font-bold text-white'>PCB Manager</p>
					<p className='text-[10px] uppercase tracking-widest text-teal-400'>Production management</p>
				</div>
			</div>

			<nav className='flex-1 overflow-y-auto px-3 py-4'>
				<ul className='space-y-0.5'>
					<li>
						<NavLink to='/' end className={({ isActive }) => navLink(isActive)}>
							<Icon path={mdiHome} size={0.75} /> Dashboard
						</NavLink>
					</li>

					{userFromStore && dispatch(checkPermissionAction('inventory', 'READ')) && (
						<li>
							<button
								type='button'
								onClick={() => setInventoryOpen(o => !o)}
								className='flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors'>
								<span className='flex items-center gap-3'>
									<Icon path={mdiDatabase} size={0.75} /> Inventory
								</span>
								<Icon
									path={mdiChevronDown}
									size={0.7}
									className={`transition-transform duration-200 ${inventoryOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							{inventoryOpen && (
								<ul className='ml-3 mt-1 space-y-0.5 border-l border-teal-500/30 pl-3'>
									<li>
										<NavLink to='/inventories' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiDatabaseOutline} size={0.7} /> Inventories
										</NavLink>
									</li>
									<li>
										<NavLink to='/inventory-types' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiTag} size={0.7} /> Types
										</NavLink>
									</li>
									<li>
										<NavLink to='/inventory-packages' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiCubeOutline} size={0.7} /> Packages
										</NavLink>
									</li>
									<li>
										<NavLink to='/inventory-surface-mounts' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiLayers} size={0.7} /> Surface Mounts
										</NavLink>
									</li>
									<li>
										<NavLink to='/inventory-shops' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiStore} size={0.7} /> Shops
										</NavLink>
									</li>
								</ul>
							)}
						</li>
					)}

					{userFromStore && dispatch(checkPermissionAction('pcb', 'READ')) && (
						<li>
							<NavLink to='/pcbs' className={({ isActive }) => navLink(isActive)}>
								<Icon path={mdiChip} size={0.75} /> PCBs
							</NavLink>
						</li>
					)}

					{userFromStore && dispatch(checkPermissionAction('production', 'READ')) && (
						<li>
							<NavLink to='/production-orders' className={({ isActive }) => navLink(isActive)}>
								<Icon path={mdiSolderingIron} size={0.75} /> Production
							</NavLink>
						</li>
					)}

					{userFromStore && dispatch(checkPermissionAction('projects', 'READ')) && (
						<li>
							<NavLink to='/projects' className={({ isActive }) => navLink(isActive)}>
								<Icon path={mdiFolder} size={0.75} /> Projects
							</NavLink>
						</li>
					)}

					{userFromStore && dispatch(checkPermissionAction('devices', 'READ')) && (
						<li>
							<NavLink to='/devices' className={({ isActive }) => navLink(isActive)}>
								<Icon path={mdiAccessPoint} size={0.75} /> Devices
							</NavLink>
						</li>
					)}

					{userFromStore && dispatch(checkPermissionAction('admin', 'READ')) && (
						<li>
							<button
								type='button'
								onClick={() => setAdminOpen(o => !o)}
								className='flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors'>
								<span className='flex items-center gap-3'>
									<Icon path={mdiShieldCrown} size={0.75} /> Admin
								</span>
								<Icon
									path={mdiChevronDown}
									size={0.7}
									className={`transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							{adminOpen && (
								<ul className='ml-3 mt-1 space-y-0.5 border-l border-teal-500/30 pl-3'>
									<li>
										<NavLink to='/permissions' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiAccountKey} size={0.7} /> Permissions
										</NavLink>
									</li>
									<li>
										<NavLink to='/permission-functionalities' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiPuzzle} size={0.7} /> Functionalities
										</NavLink>
									</li>
									<li>
										<NavLink to='/permission-access-levels' className={({ isActive }) => navLink(isActive)}>
											<Icon path={mdiLock} size={0.7} /> Access Levels
										</NavLink>
									</li>
								</ul>
							)}
						</li>
					)}

					{!userFromStore && (
						<>
							<li>
								<NavLink to='/login' className={({ isActive }) => navLink(isActive)}>
									<Icon path={mdiLogin} size={0.75} /> Login
								</NavLink>
							</li>
							<li>
								<NavLink to='/register' className={({ isActive }) => navLink(isActive)}>
									<Icon path={mdiAccountPlus} size={0.75} /> Register
								</NavLink>
							</li>
						</>
					)}
				</ul>
			</nav>

			{userFromStore && (
				<div className='px-4 pb-3'>
					<div className='rounded-xl bg-white/5 px-3 py-2.5 border border-white/10'>
						<div className='flex items-center gap-2'>
							<Icon path={mdiCheckCircle} size={0.6} className='text-emerald-400' />
							<p className='text-xs font-semibold text-white'>System Status</p>
						</div>
						<p className='mt-0.5 text-[10px] text-emerald-400'>All systems operational</p>
					</div>
				</div>
			)}

			{userFromStore && (
				<div className='border-t border-teal-600/30 p-3'>
					<div className='flex items-center gap-2.5 rounded-xl px-3 py-2'>
						<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white overflow-hidden'>
							{userFromStore.avatar ? (
								<img
									src={toStorageUrl(userFromStore.avatar!)}
									alt='Avatar'
									width={32}
									height={32}
									className='h-full w-full object-cover'
								/>
							) : (
								<>
									{userFromStore.name?.charAt(0).toUpperCase()}
									{userFromStore.surname?.charAt(0).toUpperCase()}
								</>
							)}
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-xs font-semibold text-white'>
								{userFromStore.name && userFromStore.surname
									? userFromStore.name + ' ' + userFromStore.surname
									: userFromStore.username}
							</p>
						</div>
					</div>
					<Form method='post' action='/logout'>
						<button
							type='submit'
							disabled={isLoggingOut}
							className='mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-teal-300 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 cursor-pointer transition-colors'>
							<Icon path={mdiLogout} size={0.7} />
							{isLoggingOut ? 'Logging out' : 'Logout'}
						</button>
					</Form>
				</div>
			)}
		</>
	)

	return (
		<div className='flex min-h-screen bg-gray-50'>
			<aside className='hidden lg:flex w-64 shrink-0 flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl h-screen sticky top-0'>
				{sidebarContent}
			</aside>

			{sidebarOpen && (
				<div className='fixed inset-0 z-40 flex lg:hidden'>
					<div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={() => setSidebarOpen(false)} />
					<aside className='relative z-10 flex w-64 flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl'>
						{sidebarContent}
					</aside>
				</div>
			)}

			<div className='flex flex-1 flex-col overflow-hidden'>
				<header className='flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm'>
					<button
						type='button'
						className='rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden'
						onClick={() => setSidebarOpen(true)}>
						<Icon path={mdiMenu} size={0.85} />
					</button>

					<div className='flex flex-1 items-center justify-end gap-3'>
						{isRouteLoading && <span className='text-xs font-medium text-teal-600 animate-pulse'>Loading...</span>}

						{userFromStore && (
							<div
								className='flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors'
								onClick={() => navigate('/user-profile')}>
								<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white overflow-hidden'>
									{userFromStore.avatar ? (
										<img
											src={toStorageUrl(userFromStore.avatar!)}
											alt='Avatar'
											className='h-full w-full object-cover'
										/>
									) : (
										`${userFromStore.name?.charAt(0).toUpperCase() || ''}${userFromStore.surname?.charAt(0).toUpperCase() || ''}`
									)}
								</div>
								<div className='hidden sm:block'>
									<p className='text-xs font-semibold text-gray-900 leading-tight'>
										{userFromStore.name && userFromStore.surname
											? userFromStore.name + ' ' + userFromStore.surname
											: userFromStore.username}
									</p>
								</div>
							</div>
						)}
					</div>
				</header>

				{isRouteLoading && (
					<div className='h-0.5 w-full bg-gray-100'>
						<div className='h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] bg-teal-500' />
					</div>
				)}

				<main className='flex-1 overflow-y-auto p-6 lg:p-8'>
					<Outlet />
				</main>

				<footer className='shrink-0 border-t border-gray-200 bg-white px-8 py-3'>
					<p className='text-xs text-gray-400'>
						PCB Manager &copy; {new Date().getFullYear()} &nbsp; All rights reserved
					</p>
				</footer>
			</div>

			{isActive && (
				<div
					role='alert'
					className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-5 py-4 text-sm font-medium text-white shadow-2xl ring-1 ring-black/10 backdrop-blur-sm ${
						severity === 'success'
							? 'bg-emerald-600'
							: severity === 'error'
								? 'bg-red-600'
								: severity === 'warning'
									? 'bg-amber-500'
									: 'bg-teal-600'
					}`}>
					{Array.isArray(message) ? message.map((msg, i) => <p key={i}>{msg}</p>) : <p>{message}</p>}
				</div>
			)}
		</div>
	)
}
