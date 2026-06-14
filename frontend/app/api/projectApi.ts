import { api, transformApiError, type PagedResponse, type SearchInput } from './api'
import { ProjectClass } from '~/types/project/ProjectClass'

export type CreateProjectInput = {
	name?: string
	description?: string
}

export type UpdateProjectInput = Partial<CreateProjectInput>

export const projectApi = api.injectEndpoints({
	endpoints: build => ({
		getProjects: build.query<PagedResponse<ProjectClass>, SearchInput>({
			query: body => ({
				url: 'projects/search',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			providesTags: ['Project'],
		}),

		getProject: build.query<ProjectClass, string>({
			query: id => `projects/${id}`,
			transformErrorResponse: transformApiError,
			providesTags: ['Project'],
		}),

		createProject: build.mutation<ProjectClass, CreateProjectInput>({
			query: body => ({
				url: 'projects',
				method: 'POST',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Project'],
		}),

		updateProject: build.mutation<ProjectClass, { body: UpdateProjectInput; id: string }>({
			query: ({ body, id }) => ({
				url: `projects/${id}`,
				method: 'PUT',
				body,
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Project'],
		}),

		deleteProject: build.mutation<ProjectClass, string>({
			query: id => ({
				url: `projects/${id}`,
				method: 'DELETE',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Project'],
		}),

		regenerateProjectClaim: build.mutation<ProjectClass, string>({
			query: id => ({
				url: `projects/${id}/regenerate-claim`,
				method: 'POST',
			}),
			transformErrorResponse: transformApiError,
			invalidatesTags: ['Project'],
		}),
	}),
})

export const {
	useGetProjectsQuery,
	useGetProjectQuery,
	useCreateProjectMutation,
	useUpdateProjectMutation,
	useDeleteProjectMutation,
	useRegenerateProjectClaimMutation,
} = projectApi
