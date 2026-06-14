import {
	createApi,
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '~/stores/store'
import { setAccessToken, clearUser } from '~/stores/account-store'

export type ApiError = {
	status: number | string
	message: string | string[]
}

type ApiErrorResponseData =
	| {
			message?: string | string[]
			errors?: Array<{ msg?: string; message?: string }>
	  }
	| string
	| string[]

const toStringArray = (arr: unknown[]): string[] =>
	arr.map(item => (typeof item === 'string' ? item : (item as any)?.message || 'Unknown error'))

const getErrorMessage = (data: unknown): string | string[] => {
	const responseData = data as ApiErrorResponseData

	if (typeof responseData === 'string') {
		return responseData
	}

	if (Array.isArray(responseData)) {
		return toStringArray(responseData)
	}

	if (responseData?.message) {
		if (Array.isArray(responseData.message)) {
			return toStringArray(responseData.message)
		}
		return responseData.message
	}

	if (responseData?.errors && Array.isArray(responseData.errors)) {
		return responseData.errors.map(error => error.msg || error.message || 'Unknown error')
	}

	return 'Something went wrong'
}

export const transformApiError = (response: FetchBaseQueryError): ApiError => {
	return {
		status: response.status,
		message: getErrorMessage(response.data),
	}
}

const BASE_URL = import.meta.env.VITE_API_URL
	? `${import.meta.env.VITE_API_URL}/api/v1/`
	: 'http://localhost:3000/api/v1/'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: BASE_URL,
	credentials: 'include',
	prepareHeaders: (headers, { getState }) => {
		const token = localStorage.getItem('accessToken') || (getState() as RootState).account.accessToken
		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
		}
		return headers
	},
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions,
) => {
	let result = await rawBaseQuery(args, api, extraOptions)

	if (result.error?.status === 401) {
		const refreshResult = await rawBaseQuery({ url: 'auth/refresh', method: 'POST' }, api, extraOptions)

		if (refreshResult.data) {
			const { accessToken } = refreshResult.data as { accessToken: string }
			localStorage.setItem('accessToken', accessToken)
			api.dispatch(setAccessToken(accessToken))
			result = await rawBaseQuery(args, api, extraOptions)
		} else {
			api.dispatch(clearUser())
		}
	}

	return result
}

export type Pagination = {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

export type PagedResponse<T> = {
	data: T[]
	pagination: Pagination
}

export type SearchInput = {
	name?: string
	page?: number
	limit?: number
}

export const api = createApi({
	reducerPath: 'splitApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		'Inventory',
		'InventoryType',
		'InventoryPackage',
		'InventorySurfaceMount',
		'InventoryShop',
		'PCB',
		'PCBBomItems',
		'ProductionOrders',
		'ProductionOrderItems',
		'Device',
		'Project',
		'User',
		'Permission',
		'PermissionFunctionality',
		'PermissionAccessLevel',
		'UserPermission',
	],
	endpoints: () => ({}),
})
