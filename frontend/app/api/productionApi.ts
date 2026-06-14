import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { ProductionOrdersClass } from '~/types/production/ProductionOrdersClass'
import { ProductionOrderItemsClass } from '~/types/production/ProductionOrderItemsClass'

export type ProductionOrdersStatus =
	| 'planned'
	| 'ready'
	| 'reserved'
	| 'in_assembly'
	| 'produced'
	| 'cancelled'
	| undefined

export type CreateProductionOrdersInput = {
	pcbId?: string
	quantity?: number
	status?: ProductionOrdersStatus
}

export type UpdateProductionOrdersInput = Partial<CreateProductionOrdersInput>

export type CreateProductionOrderItemInput = {
	productionOrderId: string
	inventoryId?: string
	qtyPerBoard?: number
	requiredQtyTotal?: number
	consumedQty?: number
	allowSubstitute?: boolean
	designators?: string
	status?: 'ok' | 'low' | 'missing' | undefined
}

export type UpdateProductionOrderItemInput = {
	qtyPerBoard?: number
	requiredQtyTotal?: number
	consumedQty?: number
	designators?: string
	allowSubstitute?: boolean
	status?: 'ok' | 'low' | 'missing' | undefined
}

export const productionApi = api.injectEndpoints({
	endpoints: build => ({
		getProductionOrders: build.query<PagedResponse<ProductionOrdersClass>, SearchInput>({
			query: body => ({
				url: 'production/search',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['ProductionOrders'],
		}),

		getProductionOrder: build.query<ProductionOrdersClass, string>({
			query: id => `production/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['ProductionOrders'],
		}),

		createProductionOrder: build.mutation<ProductionOrdersClass, CreateProductionOrdersInput>({
			query: body => ({
				url: 'production',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrders'],
		}),

		updateProductionOrder: build.mutation<ProductionOrdersClass, { body: UpdateProductionOrdersInput; id: string }>({
			query: ({ body, id }) => ({
				url: `production/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrders'],
		}),

		deleteProductionOrder: build.mutation<ProductionOrdersClass, string>({
			query: id => ({
				url: `production/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrders'],
		}),

		consumeProductionOrder: build.mutation<ProductionOrdersClass, string>({
			query: id => ({
				url: `production/${id}/consume`,
				method: 'POST',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrders', 'Inventory'],
		}),

		getProductionOrderItems: build.query<ProductionOrderItemsClass[], string>({
			query: orderId => `production/${orderId}/items`,
			transformErrorResponse: transformApiError,
			providesTags: ['ProductionOrderItems'],
		}),

		createProductionOrderItem: build.mutation<ProductionOrderItemsClass, CreateProductionOrderItemInput>({
			query: ({ productionOrderId, ...body }) => ({
				url: `production/${productionOrderId}/items`,
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrderItems'],
		}),

		updateProductionOrderItem: build.mutation<
			ProductionOrderItemsClass,
			{ body: UpdateProductionOrderItemInput; id: string }
		>({
			query: ({ body, id }) => ({
				url: `production/items/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrderItems'],
		}),

		deleteProductionOrderItem: build.mutation<ProductionOrderItemsClass, string>({
			query: id => ({
				url: `production/items/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['ProductionOrderItems'],
		}),
	}),
})

export const {
	useGetProductionOrdersQuery,
	useGetProductionOrderQuery,
	useCreateProductionOrderMutation,
	useUpdateProductionOrderMutation,
	useDeleteProductionOrderMutation,
	useConsumeProductionOrderMutation,
	useGetProductionOrderItemsQuery,
	useCreateProductionOrderItemMutation,
	useUpdateProductionOrderItemMutation,
	useDeleteProductionOrderItemMutation,
} = productionApi
