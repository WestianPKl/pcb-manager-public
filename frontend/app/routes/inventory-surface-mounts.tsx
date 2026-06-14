import type { Route } from './+types/inventory-surface-mounts'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { InventorySurfaceMountClass } from '~/types/inventory/InventorySurfaceMountClass'
import {
	useGetInventorySurfaceMountsQuery,
	useCreateInventorySurfaceMountMutation,
	useUpdateInventorySurfaceMountMutation,
	useDeleteInventorySurfaceMountMutation,
	type CreateInventorySurfaceMountInput,
} from '~/api/inventoryApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import InventorySurfaceMountForm from '~/components/inventory/inventory-surface-mounts-form'
import { showAlert } from '~/stores/application-store'
import type { ApiError } from '~/api/api'
import { checkPermissionAction } from '~/stores/account-actions'
import LoadingSpinner from '~/components/ui/loading-spinner'
import NoPermission from '~/components/ui/no-permission'
import PageHeader from '~/components/ui/page-header'
import EmptyState from '~/components/ui/empty-state'
import DataTable from '~/components/ui/data-table'
import { useTableControls } from '~/components/ui/use-table-controls'

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>

	if (apiError.message) {
		return apiError.message
	}

	return 'Inventory surface mount operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - inventory surface mounts' },
		{
			name: 'description',
			content: 'PCB Manager - inventory surface mounts description',
		},
	]
}

export default function InventorySurfaceMounts() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateInventorySurfaceMountData, setUpdateInventorySurfaceMountData] = useState<InventorySurfaceMountClass>(
		new InventorySurfaceMountClass(),
	)
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createInventorySurfaceMount] = useCreateInventorySurfaceMountMutation()
	const [updateInventorySurfaceMount] = useUpdateInventorySurfaceMountMutation()
	const [deleteInventorySurfaceMount] = useDeleteInventorySurfaceMountMutation()

	const { data: inventorySurfaceMounts = [], isLoading: isInventorySurfaceMountsLoading } =
		useGetInventorySurfaceMountsQuery()
	const tc = useTableControls(inventorySurfaceMounts)

	const canRead = dispatch(checkPermissionAction('inventory', 'READ'))
	const canWrite = dispatch(checkPermissionAction('inventory', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('inventory', 'DELETE'))

	if (isInventorySurfaceMountsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateInventorySurfaceMountInput) {
		createInventorySurfaceMount(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory surface mount added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateInventorySurfaceMountInput, InventorySurfaceMountId: string | undefined) {
		updateInventorySurfaceMount({ body: data, id: InventorySurfaceMountId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory surface mount updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteInventorySurfaceMount(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory surface mount deleted successfully', severity: 'success' }))
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
				title='Inventory Surface Mounts'
				subtitle='Browse and manage available inventory surface mounts.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add inventory surface mount'
			/>

			{inventorySurfaceMounts.length === 0 ? (
				<EmptyState message='No inventory surface mounts found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
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
					{tc.paginatedData.map(inventorySurfaceMount => (
						<tr key={inventorySurfaceMount.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{inventorySurfaceMount.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{inventorySurfaceMount.name}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit inventory surface mount'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateInventorySurfaceMountData(inventorySurfaceMount)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete inventory surface mount'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(inventorySurfaceMount.id)
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
				<Dialog title='Add inventory surface mount' onClose={() => setIsAdd(false)}>
					<InventorySurfaceMountForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update inventory surface mount' onClose={() => setIsUpdate(false)}>
					<InventorySurfaceMountForm
						onSubmit={async data => {
							handleEdit(data, updateInventorySurfaceMountData.id)
							setIsUpdate(false)
						}}
						inventorySurfaceMount={updateInventorySurfaceMountData}
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
