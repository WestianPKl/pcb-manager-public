import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { PCBClass } from '~/types/pcb/PCBClass'
import { PCBBomItemsClass } from '~/types/pcb/PCBBomItemsClass'

export type CreatePCBInput = {
	name?: string
	revision?: string
	comment?: string
	verified?: boolean
	projectId: string
}

export type UpdatePCBInput = Partial<CreatePCBInput>

export type CreatePCBBomItemInput = {
	pcbId: string
	inventoryId?: string
	qtyPerBoard?: number
	designators?: string
	valueSpec?: string
	allowSubstitute?: boolean
	comment?: string
}

export type UpdatePCBBomItemInput = Partial<Omit<CreatePCBBomItemInput, 'pcbId'>>

export const pcbApi = api.injectEndpoints({
	endpoints: build => ({
		getPCBs: build.query<PagedResponse<PCBClass>, SearchInput>({
			query: body => ({
				url: 'pcb/search',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['PCB'],
		}),

		getPCB: build.query<PCBClass, string>({
			query: id => `pcb/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['PCB'],
		}),

		createPCB: build.mutation<PCBClass, CreatePCBInput>({
			query: body => ({
				url: 'pcb',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCB'],
		}),

		updatePCB: build.mutation<PCBClass, { body: UpdatePCBInput; id: string }>({
			query: ({ body, id }) => ({
				url: `pcb/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCB'],
		}),

		deletePCB: build.mutation<PCBClass, string>({
			query: id => ({
				url: `pcb/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCB'],
		}),

		getPCBBomItems: build.query<PCBBomItemsClass[], string>({
			query: pcbId => `pcb/${pcbId}/bom`,
			transformErrorResponse: transformApiError,
			providesTags: ['PCBBomItems'],
		}),

		createPCBBomItem: build.mutation<PCBBomItemsClass, CreatePCBBomItemInput>({
			query: ({ pcbId, ...body }) => ({
				url: `pcb/${pcbId}/bom`,
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCBBomItems'],
		}),

		updatePCBBomItem: build.mutation<PCBBomItemsClass, { body: UpdatePCBBomItemInput; id: string }>({
			query: ({ body, id }) => ({
				url: `pcb/bom/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCBBomItems'],
		}),

		deletePCBBomItem: build.mutation<PCBBomItemsClass, string>({
			query: id => ({
				url: `pcb/bom/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCBBomItems'],
		}),

		uploadPCBImages: build.mutation<{ top?: string; bottom?: string }, { id: string; formData: FormData }>({
			query: ({ id, formData }) => ({
				url: `pcb/${id}/images`,
				method: 'POST',
				body: formData,
				formData: true,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PCB'],
		}),
	}),
})

export const {
	useGetPCBsQuery,
	useGetPCBQuery,
	useCreatePCBMutation,
	useUpdatePCBMutation,
	useDeletePCBMutation,
	useGetPCBBomItemsQuery,
	useCreatePCBBomItemMutation,
	useUpdatePCBBomItemMutation,
	useDeletePCBBomItemMutation,
	useUploadPCBImagesMutation,
} = pcbApi
