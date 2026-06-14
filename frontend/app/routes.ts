import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
	layout('./routes/app-layout.tsx', [
		index('./routes/home.tsx'),

		layout('./routes/unprotected-layout.tsx', [
			route('login', './routes/login.tsx'),
			route('register', './routes/register.tsx'),
			route('password-reset-link', './routes/user-password-reset-link.tsx'),
			route('reset-password/:token', './routes/user-password-reset.tsx'),
		]),

		layout('./routes/protected-layout.tsx', [
			route('logout', './routes/logout.tsx'),
			route('devices', './routes/devices.tsx'),
			route('projects', './routes/projects.tsx'),
			route('inventories', './routes/inventories.tsx'),
			route('inventory-packages', './routes/inventory-packages.tsx'),
			route('inventory-types', './routes/inventory-types.tsx'),
			route('inventory-shops', './routes/inventory-shops.tsx'),
			route('inventory-surface-mounts', './routes/inventory-surface-mounts.tsx'),
			route('pcbs', './routes/pcbs.tsx'),
			route('pcb-details/:id', './routes/pcb-details.tsx'),
			route('production-orders', './routes/production-orders.tsx'),
			route('production-order-details/:id', './routes/production-order-details.tsx'),
			route('user-profile', './routes/user-profile.tsx'),

			layout('./routes/admin-layout.tsx', [
				route('permission-access-levels', './routes/permission-access-levels.tsx'),
				route('permission-functionalities', './routes/permission-functionalities.tsx'),
				route('permissions', './routes/permissions.tsx'),
			]),
		]),
	]),
] satisfies RouteConfig
