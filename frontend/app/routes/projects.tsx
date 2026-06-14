import type { Route } from './+types/projects'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { ProjectClass } from '~/types/project/ProjectClass'
import {
	useGetProjectsQuery,
	useCreateProjectMutation,
	useUpdateProjectMutation,
	useDeleteProjectMutation,
	type CreateProjectInput,
} from '~/api/projectApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import ProjectForm from '~/components/project/project-form'
import { showAlert } from '~/stores/application-store'
import type { ApiError } from '~/api/api'
import { checkPermissionAction } from '~/stores/account-actions'
import LoadingSpinner from '~/components/ui/loading-spinner'
import NoPermission from '~/components/ui/no-permission'
import PageHeader from '~/components/ui/page-header'
import EmptyState from '~/components/ui/empty-state'
import DataTable from '~/components/ui/data-table'
import { useTableControls } from '~/components/ui/use-table-controls'
import { formatLocalDateTime } from '~/components/time'

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Project operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - projects' },
		{
			name: 'description',
			content: 'PCB Manager - projects description',
		},
	]
}

export default function Projects() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateProjectData, setUpdateProjectData] = useState<ProjectClass>(new ProjectClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createProject] = useCreateProjectMutation()
	const [updateProject] = useUpdateProjectMutation()
	const [deleteProject] = useDeleteProjectMutation()

	const { data: projectsResult, isLoading: isProjectsLoading } = useGetProjectsQuery({})
	const projects = projectsResult?.data ?? []
	const tc = useTableControls(projects)

	const canRead = dispatch(checkPermissionAction('projects', 'READ'))
	const canWrite = dispatch(checkPermissionAction('projects', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('projects', 'DELETE'))

	if (isProjectsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateProjectInput) {
		createProject(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Project added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateProjectInput, projectId: string | undefined) {
		updateProject({ body: data, id: projectId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Project updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteProject(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Project deleted successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	if (!canRead) {
		return <NoPermission />
	}

	return (
		<div>
			<PageHeader
				title='Projects'
				subtitle='Browse and manage available projects.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add project'
			/>

			{projects.length === 0 ? (
				<EmptyState message='No projects found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Description', key: 'description', sortable: true },
						'Created by',
						'Updated by',
						{ label: 'Created at', key: 'createdAt', sortable: true },
						{ label: 'Updated at', key: 'updatedAt', sortable: true },
						...(canWrite || canDelete ? [{ label: 'Actions', align: 'right' as const }] : []),
					]}
					rowCount={tc.paginatedData.length}
					filterQuery={tc.filterQuery}
					onFilterChange={tc.setFilterQuery}
					sortKey={tc.sortKey}
					sortDir={tc.sortDir}
					onSort={tc.toggleSort}
					page={tc.page}
					totalPages={tc.totalPages}
					totalCount={tc.totalCount}
					onPageChange={tc.setPage}>
					{tc.paginatedData.map(project => (
						<tr key={project.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{project.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{project.name}</td>
							<td className='px-5 py-3 text-gray-600'>{project.description}</td>
							<td className='px-5 py-3 text-gray-500'>{project.createdBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500'>{project.updatedBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(project.createdAt, true)}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(project.updatedAt, true)}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit project'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateProjectData(project)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete project'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(project.id)
													setIsDeleteConfirm(true)
												}}>
												<Icon path={mdiTrashCanOutline} size={0.65} />
											</button>
										)}
									</div>
								</div>
							</td>
						</tr>
					))}
				</DataTable>
			)}
			{isAdd && (
				<Dialog title='Add project' onClose={() => setIsAdd(false)}>
					<ProjectForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update project' onClose={() => setIsUpdate(false)}>
					<ProjectForm
						onSubmit={async data => {
							handleEdit(data, updateProjectData.id)
							setIsUpdate(false)
						}}
						project={updateProjectData}
					/>
				</Dialog>
			)}
			{isDeleteConfirm && (
				<ConfirmDialog
					onConfirm={() => {
						handleDelete(pendingDeleteId)
						setIsDeleteConfirm(false)
						setPendingDeleteId(undefined)
					}}
					onCancel={() => {
						setIsDeleteConfirm(false)
						setPendingDeleteId(undefined)
					}}
				/>
			)}
		</div>
	)
}
