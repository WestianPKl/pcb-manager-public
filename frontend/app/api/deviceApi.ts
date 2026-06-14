import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { DeviceClass } from '~/types/device/DeviceClass'

export type CreateDeviceInput = {
	name?: string
	description?: string
	serialNumber?: string
	pcbId?: string
}

export type UpdateDeviceInput = Partial<CreateDeviceInput>

export const deviceApi = api.injectEndpoints({
	endpoints: build => ({
		getDevices: build.query<PagedResponse<DeviceClass>, SearchInput>({
			query: body => ({
				url: 'devices/search',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['Device'],
		}),

		getDevice: build.query<DeviceClass, string>({
			query: id => `devices/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['Device'],
		}),

		createDevice: build.mutation<DeviceClass, CreateDeviceInput>({
			query: body => ({
				url: 'devices',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Device'],
		}),

		updateDevice: build.mutation<DeviceClass, { body: UpdateDeviceInput; id: string }>({
			query: ({ body, id }) => ({
				url: `devices/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Device'],
		}),

		deleteDevice: build.mutation<DeviceClass, string>({
			query: id => ({
				url: `devices/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Device'],
		}),

		regenerateDeviceClaim: build.mutation<DeviceClass, string>({
			query: id => ({
				url: `devices/${id}/regenerate-claim`,
				method: 'POST',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Device'],
		}),
	}),
})

export const {
	useGetDevicesQuery,
	useGetDeviceQuery,
	useCreateDeviceMutation,
	useUpdateDeviceMutation,
	useDeleteDeviceMutation,
	useRegenerateDeviceClaimMutation,
} = deviceApi
