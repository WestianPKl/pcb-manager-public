import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { PermissionFunctionalityClass } from '~/types/admin/PermissionFunctionalityClass'
import { PermissionAccessLevelClass } from '~/types/admin/PermissionAccessLevelClass'
import { PermissionClass } from '~/types/admin/PermissionClass'
import type { UserPublic } from '~/types/user/UserClass'

export type CreatePermissionFunctionalityInput = {
	name?: string
	description?: string
}

export type UpdatePermissionFunctionalityInput = Partial<CreatePermissionFunctionalityInput>

export type CreatePermissionAccessLevelInput = {
	accessLevel?: number
	name?: string
}

export type UpdatePermissionAccessLevelInput = Partial<CreatePermissionAccessLevelInput>

export type CreatePermissionInput = {
	name?: string
	functionalityId?: string
	accessLevelId?: number
}

export type UpdatePermissionInput = Partial<CreatePermissionInput>

export type AssignRevokePermissionInput = {
	userId: string
	permissionId: string
}

export const adminApi = api.injectEndpoints({
	endpoints: build => ({
		getPermissionFunctionalities: build.query<PermissionFunctionalityClass[], void>({
			query: () => 'admin/functionalities',
			transformErrorResponse: transformApiError,
			providesTags: ['PermissionFunctionality'],
		}),

		getPermissionFunctionality: build.query<PermissionFunctionalityClass, string>({
			query: id => `admin/functionalities/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['PermissionFunctionality'],
		}),

		createPermissionFunctionality: build.mutation<PermissionFunctionalityClass, CreatePermissionFunctionalityInput>({
			query: body => ({
				url: 'admin/functionalities',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionFunctionality'],
		}),

		updatePermissionFunctionality: build.mutation<
			PermissionFunctionalityClass,
			{ body: UpdatePermissionFunctionalityInput; id: string }
		>({
			query: ({ body, id }) => ({
				url: `admin/functionalities/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionFunctionality'],
		}),

		deletePermissionFunctionality: build.mutation<PermissionFunctionalityClass, string>({
			query: id => ({
				url: `admin/functionalities/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionFunctionality'],
		}),

		getPermissionAccessLevels: build.query<PermissionAccessLevelClass[], void>({
			query: () => 'admin/access-levels',
			transformErrorResponse: transformApiError,
			providesTags: ['PermissionAccessLevel'],
		}),

		getPermissionAccessLevel: build.query<PermissionAccessLevelClass, number>({
			query: id => `admin/access-levels/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['PermissionAccessLevel'],
		}),

		createPermissionAccessLevel: build.mutation<PermissionAccessLevelClass, CreatePermissionAccessLevelInput>({
			query: body => ({
				url: 'admin/access-levels',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionAccessLevel'],
		}),

		updatePermissionAccessLevel: build.mutation<
			PermissionAccessLevelClass,
			{ body: UpdatePermissionAccessLevelInput; id: number }
		>({
			query: ({ body, id }) => ({
				url: `admin/access-levels/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionAccessLevel'],
		}),

		deletePermissionAccessLevel: build.mutation<PermissionAccessLevelClass, number>({
			query: id => ({
				url: `admin/access-levels/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['PermissionAccessLevel'],
		}),

		getPermissions: build.query<PagedResponse<PermissionClass>, SearchInput>({
			query: body => ({
				url: 'admin/permissions/search',
				method: 'POST',
				body,
			}),
			transformResponse: (response: PagedResponse<PermissionClass>): PagedResponse<PermissionClass> => response,
			transformErrorResponse: transformApiError,
			providesTags: ['Permission'],
		}),

		getPermission: build.query<PermissionClass, string>({
			query: id => `admin/permissions/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['Permission'],
		}),

		getPermissionUsers: build.query<UserPublic[], string>({
			query: id => `admin/permissions/${id}/users`,
			transformErrorResponse: transformApiError,
			providesTags: ['UserPermission'],
		}),

		createPermission: build.mutation<PermissionClass, CreatePermissionInput>({
			query: body => ({
				url: 'admin/permissions',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Permission'],
		}),

		updatePermission: build.mutation<PermissionClass, { body: UpdatePermissionInput; id: string }>({
			query: ({ body, id }) => ({
				url: `admin/permissions/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Permission'],
		}),

		deletePermission: build.mutation<PermissionClass, string>({
			query: id => ({
				url: `admin/permissions/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Permission'],
		}),

		assignPermission: build.mutation<void, AssignRevokePermissionInput>({
			query: body => ({
				url: 'admin/permissions/assign',
				method: 'POST',
				body,
			}),
			transformResponse: () => undefined,
			transformErrorResponse: transformApiError,
			invalidatesTags: ['UserPermission', 'Permission'],
		}),

		revokePermission: build.mutation<void, AssignRevokePermissionInput>({
			query: body => ({
				url: 'admin/permissions/revoke',
				method: 'DELETE',
				body,
			}),
			transformResponse: () => undefined,
			transformErrorResponse: transformApiError,
			invalidatesTags: ['UserPermission', 'Permission'],
		}),

		getAdminUsers: build.query<UserPublic[], void>({
			query: () => 'admin/users',
			transformErrorResponse: transformApiError,
			providesTags: ['User'],
		}),
	}),
})

export const {
	useGetPermissionFunctionalitiesQuery,
	useGetPermissionFunctionalityQuery,
	useCreatePermissionFunctionalityMutation,
	useUpdatePermissionFunctionalityMutation,
	useDeletePermissionFunctionalityMutation,
	useGetPermissionAccessLevelsQuery,
	useGetPermissionAccessLevelQuery,
	useCreatePermissionAccessLevelMutation,
	useUpdatePermissionAccessLevelMutation,
	useDeletePermissionAccessLevelMutation,
	useGetPermissionsQuery,
	useGetPermissionQuery,
	useGetPermissionUsersQuery,
	useCreatePermissionMutation,
	useUpdatePermissionMutation,
	useDeletePermissionMutation,
	useAssignPermissionMutation,
	useRevokePermissionMutation,
	useGetAdminUsersQuery,
} = adminApi
