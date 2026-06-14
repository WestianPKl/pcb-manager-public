import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppDispatch } from '~/stores/hooks'
import { checkPermissionAction } from '~/stores/account-actions'

export default function AdminLayout() {
	const location = useLocation()
	const dispatch = useAppDispatch()

	return (
		<>
			{dispatch(checkPermissionAction('admin', 'READ')) ? (
				<Outlet />
			) : (
				<Navigate to='/' state={{ from: location }} replace />
			)}
		</>
	)
}
