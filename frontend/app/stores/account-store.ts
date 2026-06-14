import type { PayloadAction } from '@reduxjs/toolkit'
import { createAppSlice } from './createAppSlice'
import type { UserPublic } from '~/types/user/UserClass'
import type { PermissionClass } from '~/types/admin/PermissionClass'
import type { PermissionAccessLevelClass } from '~/types/admin/PermissionAccessLevelClass'

interface AccountState {
	accessToken: string | null
	user: UserPublic | null
	permission: PermissionClass[]
	accessLevels: PermissionAccessLevelClass[]
}

const initialState: AccountState = {
	accessToken: null,
	user: null,
	permission: [],
	accessLevels: [],
}

export const accountSlice = createAppSlice({
	name: 'account',
	initialState,
	reducers: {
		setAccessToken: (state, action: PayloadAction<string | null>) => {
			state.accessToken = action.payload
		},
		setUser: (state, action: PayloadAction<UserPublic | null>) => {
			state.user = action.payload
		},
		setPermission: (state, action: PayloadAction<PermissionClass[]>) => {
			state.permission = action.payload
		},
		setAccessLevels: (state, action: PayloadAction<PermissionAccessLevelClass[]>) => {
			state.accessLevels = action.payload
		},
		clearUser: state => {
			state.accessToken = null
			state.user = null
		},
		clearPermission: state => {
			state.permission = []
		},
		clearAccessLevels: state => {
			state.accessLevels = []
		},
	},
	selectors: {
		selectAccessToken: state => state.accessToken,
		selectUser: state => state.user,
		selectPermission: state => state.permission,
		selectAccessLevels: state => state.accessLevels,
	},
})

export const {
	setAccessToken,
	setUser,
	clearUser,
	setPermission,
	clearPermission,
	setAccessLevels,
	clearAccessLevels,
} = accountSlice.actions
export const { selectAccessToken, selectUser, selectPermission, selectAccessLevels } = accountSlice.selectors
