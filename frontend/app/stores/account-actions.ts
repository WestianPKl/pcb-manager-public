import { type AppThunk } from './store'
import {
	setAccessToken,
	setUser,
	clearUser,
	setPermission,
	clearPermission,
	setAccessLevels,
	clearAccessLevels,
} from './account-store'
import type { UserClass, UserPublic } from '~/types/user/UserClass'
import { userApi } from '~/api/userApi'
import { api } from '~/api/api'
import type { PermissionClass } from '~/types/admin/PermissionClass'
import { adminApi } from '~/api/adminApi'

const toPublicUser = (user: UserClass | UserPublic): UserPublic => ({
	id: user.id,
	username: user.username,
	name: user.name,
	surname: user.surname,
	email: user.email,
	avatar: user.avatar,
	avatarBig: user.avatarBig,
})

export const loginAction =
	(data: (UserClass | UserPublic) & { accessToken?: string }): AppThunk<Promise<void>> =>
	async dispatch => {
		if (data.accessToken) {
			localStorage.setItem('accessToken', data.accessToken)
			dispatch(setAccessToken(data.accessToken))
		}
		dispatch(setUser(toPublicUser(data)))

		try {
			const [userData, accessLevels] = await Promise.all([
				dispatch(userApi.endpoints.getData.initiate(undefined, { forceRefetch: true })).unwrap(),
				dispatch(adminApi.endpoints.getPermissionAccessLevels.initiate()).unwrap(),
			])
			dispatch(setPermission(userData.permissions || []))
			dispatch(setAccessLevels(accessLevels || []))
			dispatch(setUser(toPublicUser(userData)))
		} catch {
			// permissions will load on next page refresh via initStore
		}
	}

export const logoutAction = (): AppThunk<Promise<void>> => async dispatch => {
	try {
		localStorage.removeItem('accessToken')
		await dispatch(userApi.endpoints.logout.initiate()).unwrap()
	} finally {
		dispatch(clearUser())
		dispatch(api.util.resetApiState())
	}
}

export const checkPermissionAction =
	(functionalityName: string, accessLevelName: string): AppThunk<boolean> =>
	(dispatch, getState) => {
		const state = getState()
		const permissions = state.account.permission

		if (!permissions) {
			return false
		}

		const accessLevels = state.account.accessLevels

		if (!accessLevels || accessLevels.length === 0) {
			return false
		}

		const accessLevelNumber = accessLevels.find(level => level.name === accessLevelName)?.accessLevel
		if (accessLevelNumber === undefined) {
			return false
		}

		const hasPermission = permissions.some((permission: PermissionClass) => {
			return (
				permission?.functionality === functionalityName && (permission?.accessLevelId ?? 0) >= accessLevelNumber
			)
		})
		return hasPermission
	}

export const initStore = (): AppThunk<Promise<UserPublic | null>> => async dispatch => {
	const request = dispatch(
		userApi.endpoints.getData.initiate(undefined, {
			forceRefetch: false,
		}),
	)
	try {
		const user = await request.unwrap()
		const accessLevels = await dispatch(adminApi.endpoints.getPermissionAccessLevels.initiate()).unwrap()

		if (user && accessLevels) {
			const publicUser = toPublicUser(user)

			dispatch(setUser(publicUser))
			dispatch(setPermission(user.permissions || []))
			dispatch(setAccessLevels(accessLevels || []))

			return publicUser
		}

		dispatch(clearUser())
		dispatch(clearPermission())
		dispatch(clearAccessLevels())

		return null
	} catch {
		dispatch(clearUser())
		dispatch(clearPermission())
		dispatch(clearAccessLevels())
		return null
	} finally {
		request.unsubscribe()
	}
}
