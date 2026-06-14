import { api, transformApiError } from './api'
import type { UserClass, UserPublic } from '~/types/user/UserClass'

export type UserCredentials = {
	username?: string
	password: string
	name?: string
	surname?: string
	email: string
}

export type UpdateUserInput = Partial<{
	username: string
	password: string
	name: string
	surname: string
	email: string
	avatar?: string | Blob | File
}>

type AuthResponse = {
	accessToken: string
	user: UserClass
}

type UserResponse = {
	user: UserClass
}

export const userApi = api.injectEndpoints({
	endpoints: build => ({
		logout: build.mutation<void, void>({
			query: () => ({
				url: 'auth/logout',
				method: 'POST',
			}),
			transformResponse: () => undefined,
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		login: build.mutation<UserPublic & { accessToken: string }, UserCredentials>({
			query: credentials => ({
				url: 'auth/login',
				method: 'POST',
				body: credentials,
			}),
			transformResponse: (response: AuthResponse): UserPublic & { accessToken: string } => ({
				id: response.user.id,
				username: response.user.username,
				name: response.user.name,
				surname: response.user.surname,
				email: response.user.email,
				permissions: response.user.permissions,
				accessToken: response.accessToken,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		register: build.mutation<UserPublic & { accessToken: string }, UserCredentials>({
			query: credentials => ({
				url: 'auth/register',
				method: 'POST',
				body: credentials,
			}),
			transformResponse: (response: AuthResponse): UserPublic & { accessToken: string } => ({
				id: response.user.id,
				username: response.user.username,
				name: response.user.name,
				surname: response.user.surname,
				email: response.user.email,
				accessToken: response.accessToken,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		getUsers: build.query<UserPublic[], void>({
			query: () => 'admin/users',
			transformResponse: (response: UserClass[]): UserPublic[] =>
				response.map(user => ({
					id: user.id,
					username: user.username,
					name: user.name,
					surname: user.surname,
					email: user.email,
				})),
			transformErrorResponse: transformApiError,
			providesTags: ['User'],
		}),

		getUser: build.query<UserPublic, string>({
			query: id => ({
				url: `auth/auth/${id}`,
				method: 'GET',
			}),
			transformResponse: (response: UserResponse): UserPublic => ({
				id: response.user.id,
				username: response.user.username,
				name: response.user.name,
				surname: response.user.surname,
				email: response.user.email,
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['User'],
		}),

		getData: build.query<UserClass, void>({
			query: () => ({
				url: 'auth/me',
				method: 'GET',
			}),
			transformResponse: (response: UserResponse): UserClass => response.user,
			transformErrorResponse: transformApiError,
			providesTags: ['User'],
		}),

		updateUser: build.mutation<UserPublic, { body: UpdateUserInput; id: string }>({
			query: ({ body, id }) => ({
				url: `auth/auth/${id}`,
				method: 'PUT',
				body,
			}),
			transformResponse: (response: UserResponse): UserPublic => ({
				id: response.user.id,
				username: response.user.username,
				name: response.user.name,
				surname: response.user.surname,
				email: response.user.email,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		updateProfile: build.mutation<UserPublic, { username?: string; name?: string; surname?: string; email?: string }>({
			query: body => ({
				url: 'auth/profile',
				method: 'PUT',
				body,
			}),
			transformResponse: (response: UserResponse): UserPublic => ({
				id: response.user.id,
				username: response.user.username,
				name: response.user.name,
				surname: response.user.surname,
				email: response.user.email,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		updateAvatar: build.mutation<{ avatar: string; avatarBig: string }, FormData>({
			query: body => ({
				url: 'auth/avatar',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['User'],
		}),

		updatePassword: build.mutation<void, { currentPassword: string; newPassword: string }>({
			query: body => ({
				url: 'auth/password',
				method: 'PUT',
				body,
			}),
			transformResponse: () => undefined,
			transformErrorResponse: transformApiError,
		}),

		passwordResetToken: build.mutation<{ email: string }, any>({
			query: (body: any) => ({
				url: 'auth/forgot-password',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: { email: string } }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),

		passwordReset: build.mutation<{ email: string }, any>({
			query: (body: any) => ({
				url: 'auth/reset-password',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: { email: string } }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),
	}),
})

export const {
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useUpdateProfileMutation,
	useUpdateAvatarMutation,
	useUpdatePasswordMutation,
	useGetDataQuery,
	useGetUsersQuery,
	useGetUserQuery,
	useUpdateUserMutation,
	usePasswordResetTokenMutation,
	usePasswordResetMutation,
} = userApi

export const {
	endpoints: { login, register, getData, logout },
} = userApi
