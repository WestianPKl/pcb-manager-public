import type { Route } from './+types/permissions'
import { PermissionClass } from '~/types/admin/PermissionClass'
import {
	useAssignPermissionMutation,
	useCreatePermissionMutation,
	useDeletePermissionMutation,
	useGetPermissionAccessLevelsQuery,
	useGetPermissionFunctionalitiesQuery,
	useGetPermissionsQuery,
	useRevokePermissionMutation,
	useUpdatePermissionMutation,
	type CreatePermissionInput,
} from '~/api/adminApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import { Icon } from '@mdi/react'
import { mdiAccountGroup, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import PermissionForm from '~/components/admin/permission-form'
import UserPermissionDialog from '~/components/admin/user-permission-dialog'
import { showAlert } from '~/stores/application-store'
import type { ApiError } from '~/api/api'
import { checkPermissionAction } from '~/stores/account-actions'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
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

	return 'Permission operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - permissions' },
		{
			name: 'description',
			content: 'PCB Manager description',
		},
	]
}

export default function Permissions() {
	const [isAdd, setIsAdd] = useState(false)
	const [updatePermissionData, setUpdatePermissionData] = useState<PermissionClass>(new PermissionClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)
	const [permissionId, setPermissionId] = useState<string | undefined>(undefined)
	const [showAssignPermission, setShowAssignPermission] = useState(false)
	const dispatch = useAppDispatch()

	const [createPermission] = useCreatePermissionMutation()
	const [updatePermission] = useUpdatePermissionMutation()
	const [deletePermission] = useDeletePermissionMutation()
	const [assignPermission] = useAssignPermissionMutation()
	const [removePermission] = useRevokePermissionMutation()

	const { data: permissionsResult, isLoading: isPermissionsLoading } = useGetPermissionsQuery({})
	const permissions = permissionsResult?.data ?? []
	const { data: permissionFunctionalities = [], isLoading: isPermissionFunctionalitiesLoading } =
		useGetPermissionFunctionalitiesQuery()
	const { data: permissionAccessLevels = [], isLoading: isPermissionAccessLevelsLoading } =
		useGetPermissionAccessLevelsQuery()
	const tc = useTableControls(permissions)

	const canRead = dispatch(checkPermissionAction('admin', 'READ'))
	const canWrite = dispatch(checkPermissionAction('admin', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('admin', 'DELETE'))

	if (isPermissionsLoading || isPermissionFunctionalitiesLoading || isPermissionAccessLevelsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreatePermissionInput) {
		createPermission(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreatePermissionInput, permissionId: string | undefined) {
		updatePermission({ body: data, id: permissionId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deletePermission(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission deleted successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleAssignPermission(permissionId: string | undefined, userId: string | undefined, assign: boolean) {
		if (permissionId === undefined || userId === undefined) {
			return
		}
		if (assign) {
			assignPermission({ permissionId, userId })
				.unwrap()
				.then(() => {
					dispatch(showAlert({ message: 'Permission assigned successfully', severity: 'success' }))
				})
				.catch((error: any) => {
					dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
				})
		} else {
			removePermission({ permissionId, userId })
				.unwrap()
				.then(() => {
					dispatch(showAlert({ message: 'Permission removed successfully', severity: 'success' }))
				})
				.catch((error: any) => {
					dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
				})
		}
	}

	if (!canRead) {
		return <NoPermission />
	}

	return (
		<div>
			<PageHeader
				title='Permissions'
				subtitle='Browse and manage available permissions.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add Permission'
			/>

			{permissions.length === 0 ? (
				<EmptyState message='No permissions found.' />
			) : (
				<DataTable
					columns={[
						'Users',
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						'Functionality',
						'Access level',
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
					{tc.paginatedData.map(permission => (
						<tr key={permission.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 font-medium text-gray-800'>
								<button
									className='inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 active:scale-95 cursor-pointer'
									onClick={() => {
										setPermissionId(permission.id)
										setShowAssignPermission(true)
									}}>
									<Icon path={mdiAccountGroup} size={0.7} />
									Users
								</button>
							</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{permission.id}</td>
							<td className='px-5 py-3 text-gray-600'>{permission.name}</td>
							<td className='px-5 py-3 text-gray-600'>{permission.functionality ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{permission.accessLevel ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{permission.createdBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{permission.updatedBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{formatLocalDateTime(permission.createdAt, true)}</td>
							<td className='px-5 py-3 text-gray-600'>{formatLocalDateTime(permission.updatedAt, true)}</td>
							<td className='px-5 py-3 text-right'>
								<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
									{canWrite && (
										<button
											title='Edit permission'
											onClick={() => {
												setUpdatePermissionData(permission)
												setIsUpdate(true)
											}}
											className='flex items-center px-2.5 py-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'>
											<Icon path={mdiPencilOutline} size={0.65} />
										</button>
									)}
									{canDelete && (
										<button
											title='Delete permission'
											onClick={() => {
												setPendingDeleteId(permission.id)
												setIsDeleteConfirm(true)
											}}
											className='flex items-center px-2.5 py-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'>
											<Icon path={mdiTrashCanOutline} size={0.65} />
										</button>
									)}
								</div>
							</td>
						</tr>
					))}
				</DataTable>
			)}

			{isAdd && (
				<Dialog title='Add permission' onClose={() => setIsAdd(false)}>
					<PermissionForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
						permissionFunctionalities={permissionFunctionalities}
						permissionAccessLevels={permissionAccessLevels}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update permission' onClose={() => setIsUpdate(false)}>
					<PermissionForm
						onSubmit={async data => {
							handleEdit(data, updatePermissionData.id)
							setIsUpdate(false)
						}}
						permission={updatePermissionData}
						permissionFunctionalities={permissionFunctionalities}
						permissionAccessLevels={permissionAccessLevels}
					/>
				</Dialog>
			)}
			{showAssignPermission && (
				<Dialog
					title='Assign Permission'
					size='xl'
					onClose={() => {
						setShowAssignPermission(false)
						setPermissionId(undefined)
					}}>
					<UserPermissionDialog permissionId={permissionId} assignPermission={handleAssignPermission} />
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
