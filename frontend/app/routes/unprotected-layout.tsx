import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '~/stores/hooks'
import { selectUser } from '~/stores/account-store'

export default function UnprotectedLayout() {
	const location = useLocation()
	const user = useAppSelector(selectUser)

	if (user) {
		return (
			<Navigate
				to='/'
				replace
				state={{
					from: location.pathname + location.search,
				}}
			/>
		)
	}

	return <Outlet />
}
