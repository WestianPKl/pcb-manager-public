import { createAppSlice } from './createAppSlice'
import type { PayloadAction } from '@reduxjs/toolkit'

type AlertSeverity = 'success' | 'info' | 'warning' | 'error'

interface IApplicationState {
	message: string[] | string
	severity: AlertSeverity
	isActive: boolean
	timeout: number
}

const DEFAULT_ALERT_TIMEOUT = 5000

const initialState: IApplicationState = {
	message: '',
	severity: 'success',
	isActive: false,
	timeout: DEFAULT_ALERT_TIMEOUT,
}

export const applicationSlice = createAppSlice({
	name: 'application',
	initialState,
	reducers: create => ({
		showAlert: create.reducer(
			(
				state,
				action: PayloadAction<{
					message: string | string[]
					severity: AlertSeverity
					timeout?: number
				}>,
			) => {
				state.message = action.payload.message
				state.severity = action.payload.severity
				state.isActive = true
				state.timeout = action.payload.timeout ?? DEFAULT_ALERT_TIMEOUT
			},
		),
		hideAlert: create.reducer(state => {
			state.isActive = false
			state.message = ''
			state.severity = 'success'
			state.timeout = DEFAULT_ALERT_TIMEOUT
		}),
	}),
	selectors: {
		selectTimeout: (state: IApplicationState) => state.timeout,
		selectIsActive: (state: IApplicationState) => state.isActive,
		selectMessage: (state: IApplicationState) => state.message,
		selectSeverity: (state: IApplicationState) => state.severity,
	},
})

export const { showAlert, hideAlert } = applicationSlice.actions
export const { selectTimeout, selectIsActive, selectMessage, selectSeverity } = applicationSlice.selectors
