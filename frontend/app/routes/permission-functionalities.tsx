import type { Route } from './+types/permission-functionalities'
import { PermissionFunctionalityClass } from '~/types/admin/PermissionFunctionalityClass'
import {
	useCreatePermissionFunctionalityMutation,
	useDeletePermissionFunctionalityMutation,
	useGetPermissionFunctionalitiesQuery,
	useUpdatePermissionFunctionalityMutation,
	type CreatePermissionFunctionalityInput,
} from '~/api/adminApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import PermissionFunctionalityForm from '~/components/admin/permission-functionalities-form'
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

	return 'Permission functionality operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - permission functionalities' },
		{
			name: 'description',
			content: 'PCB Manager description',
		},
	]
}

export default function PermissionFunctionalities() {
	const [isAdd, setIsAdd] = useState(false)
	const [updatePermissionFunctionalityData, setUpdatePermissionFunctionalityData] =
		useState<PermissionFunctionalityClass>(new PermissionFunctionalityClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)
	const dispatch = useAppDispatch()

	const [createPermissionFunctionality] = useCreatePermissionFunctionalityMutation()
	const [updatePermissionFunctionality] = useUpdatePermissionFunctionalityMutation()
	const [deletePermissionFunctionality] = useDeletePermissionFunctionalityMutation()

	const { data: permissionFunctionalities = [], isLoading: isPermissionFunctionalitiesLoading } =
		useGetPermissionFunctionalitiesQuery()
	const tc = useTableControls(permissionFunctionalities)

	const canRead = dispatch(checkPermissionAction('admin', 'READ'))
	const canWrite = dispatch(checkPermissionAction('admin', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('admin', 'DELETE'))

	if (isPermissionFunctionalitiesLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreatePermissionFunctionalityInput) {
		createPermissionFunctionality(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission functionality added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreatePermissionFunctionalityInput, permissionFunctionalityId: string | undefined) {
		updatePermissionFunctionality({ body: data, id: permissionFunctionalityId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission functionality updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deletePermissionFunctionality(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Permission functionality deleted successfully', severity: 'success' }))
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
				title='Permission Functionalities'
				subtitle='Browse and manage available permission functionalities.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add Permission Functionality'
			/>

			{permissionFunctionalities.length === 0 ? (
				<EmptyState message='No permission functionalities found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Description', key: 'description', sortable: true },
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
					{tc.paginatedData.map(pf => (
						<tr key={pf.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 font-medium text-gray-800'>{pf.id}</td>
							<td className='px-5 py-3 text-gray-600'>{pf.name}</td>
							<td className='px-5 py-3 text-gray-600'>{pf.description}</td>
							<td className='px-5 py-3 text-right'>
								<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
									{canWrite && (
										<button
											title='Edit functionality'
											onClick={() => {
												setUpdatePermissionFunctionalityData(pf)
												setIsUpdate(true)
											}}
											className='flex items-center px-2.5 py-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'>
											<Icon path={mdiPencilOutline} size={0.65} />
										</button>
									)}
									{canDelete && (
										<button
											title='Delete functionality'
											onClick={() => {
												setPendingDeleteId(pf.id)
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
				<Dialog title='Add permission functionality' onClose={() => setIsAdd(false)}>
					<PermissionFunctionalityForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update permission functionality' onClose={() => setIsUpdate(false)}>
					<PermissionFunctionalityForm
						onSubmit={async data => {
							handleEdit(data, updatePermissionFunctionalityData.id)
							setIsUpdate(false)
						}}
						permissionFunctionality={updatePermissionFunctionalityData}
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
