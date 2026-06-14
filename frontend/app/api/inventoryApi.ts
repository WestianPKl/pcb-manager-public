import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { InventoryClass } from '~/types/inventory/InventoryClass'
import { InventoryTypeClass } from '~/types/inventory/InventoryTypeClass'
import { InventoryShopClass } from '~/types/inventory/InventoryShopClass'
import { InventorySurfaceMountClass } from '~/types/inventory/InventorySurfaceMountClass'
import { InventoryPackageClass } from '~/types/inventory/InventoryPackageClass'

export type InventoryStockReason = 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined

export type CreateInventoryPackageInput = {
	name?: string
}

export type UpdateInventoryPackageInput = Partial<CreateInventoryPackageInput>

export type CreateInventoryShopInput = {
	name?: string
}

export type UpdateInventoryShopInput = Partial<CreateInventoryShopInput>

export type CreateInventorySurfaceMountInput = {
	name?: string
}

export type UpdateInventorySurfaceMountInput = Partial<CreateInventorySurfaceMountInput>

export type CreateInventoryTypeInput = {
	name?: string
}

export type UpdateInventoryTypeInput = Partial<CreateInventoryTypeInput>

export type CreateInventoryInput = {
	name?: string
	manufacturerNumber?: string
	parameters?: Record<string, unknown>
	lowThreshold?: number
	comment?: string
	inventoryTypeId?: string
	inventoryPackageId?: string
	inventorySurfaceMountId?: string
	inventoryShopId?: string
}

export type UpdateInventoryInput = Partial<CreateInventoryInput>

export type InventoryStockInput = {
	inventoryId: string
	quantity: number
	note?: string
	reason?: InventoryStockReason
}

export const inventoryApi = api.injectEndpoints({
	endpoints: build => ({
		getInventories: build.query<PagedResponse<InventoryClass>, SearchInput>({
			query: body => ({
				url: 'inventory/search',
				method: 'POST',
				body: { limit: 1000, ...body },
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['Inventory'],
		}),

		getInventory: build.query<InventoryClass, string>({
			query: id => `inventory/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['Inventory'],
		}),

		createInventory: build.mutation<InventoryClass, CreateInventoryInput>({
			query: body => ({
				url: 'inventory',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Inventory'],
		}),

		updateInventory: build.mutation<InventoryClass, { body: UpdateInventoryInput; id: string }>({
			query: ({ body, id }) => ({
				url: `inventory/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Inventory'],
		}),

		deleteInventory: build.mutation<InventoryClass, string>({
			query: id => ({
				url: `inventory/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Inventory'],
		}),

		getInventoryTypes: build.query<InventoryTypeClass[], void>({
			query: () => 'inventory/types',
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryType'],
		}),

		getInventoryType: build.query<InventoryTypeClass, string>({
			query: id => `inventory/types/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryType'],
		}),

		createInventoryType: build.mutation<InventoryTypeClass, CreateInventoryTypeInput>({
			query: body => ({
				url: 'inventory/types',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryType'],
		}),

		updateInventoryType: build.mutation<InventoryTypeClass, { body: UpdateInventoryTypeInput; id: string }>({
			query: ({ body, id }) => ({
				url: `inventory/types/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryType'],
		}),

		deleteInventoryType: build.mutation<InventoryTypeClass, string>({
			query: id => ({
				url: `inventory/types/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryType'],
		}),

		getInventoryPackages: build.query<InventoryPackageClass[], void>({
			query: () => 'inventory/packages',
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryPackage'],
		}),

		getInventoryPackage: build.query<InventoryPackageClass, string>({
			query: id => `inventory/packages/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryPackage'],
		}),

		createInventoryPackage: build.mutation<InventoryPackageClass, CreateInventoryPackageInput>({
			query: body => ({
				url: 'inventory/packages',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryPackage'],
		}),

		updateInventoryPackage: build.mutation<InventoryPackageClass, { body: UpdateInventoryPackageInput; id: string }>({
			query: ({ body, id }) => ({
				url: `inventory/packages/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryPackage'],
		}),

		deleteInventoryPackage: build.mutation<InventoryPackageClass, string>({
			query: id => ({
				url: `inventory/packages/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryPackage'],
		}),

		getInventoryShops: build.query<InventoryShopClass[], void>({
			query: () => 'inventory/shops',
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryShop'],
		}),

		getInventoryShop: build.query<InventoryShopClass, string>({
			query: id => `inventory/shops/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['InventoryShop'],
		}),

		createInventoryShop: build.mutation<InventoryShopClass, CreateInventoryShopInput>({
			query: body => ({
				url: 'inventory/shops',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryShop'],
		}),

		updateInventoryShop: build.mutation<InventoryShopClass, { body: UpdateInventoryShopInput; id: string }>({
			query: ({ body, id }) => ({
				url: `inventory/shops/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryShop'],
		}),

		deleteInventoryShop: build.mutation<InventoryShopClass, string>({
			query: id => ({
				url: `inventory/shops/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventoryShop'],
		}),

		getInventorySurfaceMounts: build.query<InventorySurfaceMountClass[], void>({
			query: () => 'inventory/surface-mounts',
			transformErrorResponse: transformApiError,
			providesTags: ['InventorySurfaceMount'],
		}),

		getInventorySurfaceMount: build.query<InventorySurfaceMountClass, string>({
			query: id => `inventory/surface-mounts/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['InventorySurfaceMount'],
		}),

		createInventorySurfaceMount: build.mutation<InventorySurfaceMountClass, CreateInventorySurfaceMountInput>({
			query: body => ({
				url: 'inventory/surface-mounts',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventorySurfaceMount'],
		}),

		updateInventorySurfaceMount: build.mutation<
			InventorySurfaceMountClass,
			{ body: UpdateInventorySurfaceMountInput; id: string }
		>({
			query: ({ body, id }) => ({
				url: `inventory/surface-mounts/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventorySurfaceMount'],
		}),

		deleteInventorySurfaceMount: build.mutation<InventorySurfaceMountClass, string>({
			query: id => ({
				url: `inventory/surface-mounts/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['InventorySurfaceMount'],
		}),

		addInventoryStock: build.mutation<InventoryClass, InventoryStockInput>({
			query: ({ inventoryId, ...body }) => ({
				url: `inventory/${inventoryId}/stock/add`,
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Inventory'],
		}),

		removeInventoryStock: build.mutation<InventoryClass, InventoryStockInput>({
			query: ({ inventoryId, ...body }) => ({
				url: `inventory/${inventoryId}/stock/remove`,
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Inventory'],
		}),
	}),
})

export const {
	useGetInventoriesQuery,
	useGetInventoryQuery,
	useCreateInventoryMutation,
	useUpdateInventoryMutation,
	useDeleteInventoryMutation,
	useGetInventoryTypesQuery,
	useGetInventoryTypeQuery,
	useCreateInventoryTypeMutation,
	useUpdateInventoryTypeMutation,
	useDeleteInventoryTypeMutation,
	useGetInventoryPackagesQuery,
	useGetInventoryPackageQuery,
	useCreateInventoryPackageMutation,
	useUpdateInventoryPackageMutation,
	useDeleteInventoryPackageMutation,
	useGetInventoryShopsQuery,
	useGetInventoryShopQuery,
	useCreateInventoryShopMutation,
	useUpdateInventoryShopMutation,
	useDeleteInventoryShopMutation,
	useGetInventorySurfaceMountsQuery,
	useGetInventorySurfaceMountQuery,
	useCreateInventorySurfaceMountMutation,
	useUpdateInventorySurfaceMountMutation,
	useDeleteInventorySurfaceMountMutation,
	useAddInventoryStockMutation,
	useRemoveInventoryStockMutation,
} = inventoryApi
