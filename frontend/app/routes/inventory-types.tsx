import type { Route } from './+types/inventory-types'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { InventoryTypeClass } from '~/types/inventory/InventoryTypeClass'
import {
	useGetInventoryTypesQuery,
	useCreateInventoryTypeMutation,
	useUpdateInventoryTypeMutation,
	useDeleteInventoryTypeMutation,
	type CreateInventoryTypeInput,
} from '~/api/inventoryApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import InventoryTypeForm from '~/components/inventory/inventory-types-form'
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

	return 'Inventory type operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - inventory types' },
		{
			name: 'description',
			content: 'PCB Manager - inventory types description',
		},
	]
}

export default function InventoryTypes() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateInventoryTypeData, setUpdateInventoryTypeData] = useState<InventoryTypeClass>(new InventoryTypeClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createInventoryType] = useCreateInventoryTypeMutation()
	const [updateInventoryType] = useUpdateInventoryTypeMutation()
	const [deleteInventoryType] = useDeleteInventoryTypeMutation()

	const { data: inventoryTypes = [], isLoading: isInventoryTypesLoading } = useGetInventoryTypesQuery()
	const tc = useTableControls(inventoryTypes)

	const canRead = dispatch(checkPermissionAction('inventory', 'READ'))
	const canWrite = dispatch(checkPermissionAction('inventory', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('inventory', 'DELETE'))

	if (isInventoryTypesLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateInventoryTypeInput) {
		createInventoryType(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory type added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateInventoryTypeInput, inventoryTypeId: string | undefined) {
		updateInventoryType({ body: data, id: inventoryTypeId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory type updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteInventoryType(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory type deleted successfully', severity: 'success' }))
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
				title='Inventory Types'
				subtitle='Browse and manage available inventory types.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add inventory type'
			/>

			{inventoryTypes.length === 0 ? (
				<EmptyState message='No inventory types found.' />
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
					{tc.paginatedData.map(inventoryType => (
						<tr key={inventoryType.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{inventoryType.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{inventoryType.name}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit inventory type'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateInventoryTypeData(inventoryType)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete inventory type'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(inventoryType.id)
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
				<Dialog title='Add inventory type' onClose={() => setIsAdd(false)}>
					<InventoryTypeForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update inventory type' onClose={() => setIsUpdate(false)}>
					<InventoryTypeForm
						onSubmit={async data => {
							handleEdit(data, updateInventoryTypeData.id)
							setIsUpdate(false)
						}}
						inventoryType={updateInventoryTypeData}
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
