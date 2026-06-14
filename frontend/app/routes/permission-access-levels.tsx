import type { Route } from './+types/permission-access-levels'
import { PermissionAccessLevelClass } from '~/types/admin/PermissionAccessLevelClass'
import {
	useCreatePermissionAccessLevelMutation,
	useDeletePermissionAccessLevelMutation,
	useGetPermissionAccessLevelsQuery,
	useUpdatePermissionAccessLevelMutation,
	type CreatePermissionAccessLevelInput,
} from '~/api/adminApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import PermissionAccessLevelForm from '~/components/admin/permission-access-levels-form'
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
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { useTableControls } from '~/components/ui/use-table-controls'

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Permission access level operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - permission access levels' },
		{
			name: 'description',
			content: 'PCB Manager description',
		},
	]
}

export default function PermissionAccessLevels() {
	const [isAdd, setIsAdd] = useState(false)
	const [updatePermissionAccessLevelData, setUpdatePermissionAccessLevelData] = useState<PermissionAccessLevelClass>(
		new PermissionAccessLevelClass(),
	)
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<number | undefined>(undefined)
	const dispatch = useAppDispatch()

	const [createPermissionAccessLevel] = useCreatePermissionAccessLevelMutation()
	const [updatePermissionAccessLevel] = useUpdatePermissionAccessLevelMutation()
	const [deletePermissionAccessLevel] = useDeletePermissionAccessLevelMutation()

	const { data: permissionAccessLevels = [], isLoading: isPermissionAccessLevelsLoading } =
		useGetPermissionAccessLevelsQuery()
	const tc = useTableControls(permissionAccessLevels)

	const canRead = dispatch(checkPermissionAction('admin', 'READ'))
	const canWrite = dispatch(checkPermissionAction('admin', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('admin', 'DELETE'))

	if (isPermissionAccessLevelsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreatePermissionAccessLevelInput) {
		createPermissionAccessLevel(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission access level added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreatePermissionAccessLevelInput, permissionAccessLevelId: number | undefined) {
		updatePermissionAccessLevel({ body: data, id: permissionAccessLevelId ?? 0 })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission access level updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: number | undefined) {
		if (id === undefined) {
			return
		}

		deletePermissionAccessLevel(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission access level deleted successfully', severity: 'success' }))
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
				title='Permission Access Levels'
				subtitle='Browse and manage available permission access levels.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add Permission Access Level'
			/>

			{permissionAccessLevels.length === 0 ? (
				<EmptyState message='No permission access levels found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Access Level', key: 'accessLevel', sortable: true },
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
					{tc.paginatedData.map(pal => (
						<tr key={pal.accessLevel} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 font-medium text-gray-800'>{pal.name}</td>
							<td className='px-5 py-3 text-gray-600'>{pal.accessLevel}</td>
							<td className='px-5 py-3 text-right'>
								<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
									{canWrite && (
										<button
											title='Edit access level'
											onClick={() => {
												setUpdatePermissionAccessLevelData(pal)
												setIsUpdate(true)
											}}
											className='flex items-center px-2.5 py-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'>
											<Icon path={mdiPencilOutline} size={0.65} />
										</button>
									)}
									{canDelete && (
										<button
											title='Delete access level'
											onClick={() => {
												setPendingDeleteId(pal.accessLevel)
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
				<Dialog title='Add permission access level' onClose={() => setIsAdd(false)}>
					<PermissionAccessLevelForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update permission access level' onClose={() => setIsUpdate(false)}>
					<PermissionAccessLevelForm
						onSubmit={async data => {
							handleEdit(data, updatePermissionAccessLevelData.accessLevel)
							setIsUpdate(false)
						}}
						permissionAccessLevel={updatePermissionAccessLevelData}
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
