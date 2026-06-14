import type { Route } from './+types/inventories'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline, mdiDatabaseEdit, mdiPlusMinus } from '@mdi/js'
import { InventoryClass } from '~/types/inventory/InventoryClass'
import {
	useGetInventoriesQuery,
	useCreateInventoryMutation,
	useUpdateInventoryMutation,
	useDeleteInventoryMutation,
	useAddInventoryStockMutation,
	useRemoveInventoryStockMutation,
	type CreateInventoryInput,
	type InventoryStockInput,
} from '~/api/inventoryApi'
import InventoryStockSetForm from '~/components/inventory/inventory-stock-set-form'
import InventoryStockAdjustForm from '~/components/inventory/inventory-stock-adjust-form'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import InventoryForm from '~/components/inventory/inventories-form'
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

	return 'Inventory operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - inventories' },
		{
			name: 'description',
			content: 'PCB Manager - inventories description',
		},
	]
}

export default function Inventories() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateInventoryData, setUpdateInventoryData] = useState<InventoryClass>(new InventoryClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)
	const [isSetStock, setIsSetStock] = useState(false)
	const [isAdjustStock, setIsAdjustStock] = useState(false)
	const [pendingStockInventoryId, setPendingStockInventoryId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createInventory] = useCreateInventoryMutation()
	const [updateInventory] = useUpdateInventoryMutation()
	const [deleteInventory] = useDeleteInventoryMutation()
	const [addInventoryStock] = useAddInventoryStockMutation()
	const [removeInventoryStock] = useRemoveInventoryStockMutation()

	const { data: inventoriesResult, isLoading: isInventoriesLoading } = useGetInventoriesQuery({})
	const inventories = inventoriesResult?.data ?? []
	const tc = useTableControls(inventories)

	const canRead = dispatch(checkPermissionAction('inventory', 'READ'))
	const canWrite = dispatch(checkPermissionAction('inventory', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('inventory', 'DELETE'))

	if (isInventoriesLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateInventoryInput) {
		createInventory(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateInventoryInput, inventoryId: string | undefined) {
		updateInventory({ body: data, id: inventoryId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleSetStock(data: InventoryStockInput) {
		return addInventoryStock(data).unwrap()
	}

	function handleAdjustStock(data: InventoryStockInput) {
		return removeInventoryStock(data).unwrap()
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteInventory(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory deleted successfully', severity: 'success' }))
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
				title='Inventories'
				subtitle='Browse and manage available inventories.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add inventory'
			/>

			{inventories.length === 0 ? (
				<EmptyState message='No inventories found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Manufacturer Number', key: 'manufacturerNumber', sortable: true },
						{ label: 'Type', key: 'inventoryTypeId', sortable: true },
						{ label: 'Package', key: 'inventoryPackageId', sortable: true },
						{ label: 'Mounting', key: 'inventorySurfaceMountId', sortable: true },
						{ label: 'Shop', key: 'inventoryShopId', sortable: true },
						{ label: 'Parameters', key: 'parameters', sortable: true },
						{ label: 'Stock', key: 'stock', sortable: true },
						{ label: 'Low Threshold', key: 'lowThreshold', sortable: true },
						{ label: 'Comment', key: 'comment', sortable: true },
						{ label: 'Created by', key: 'createdBy', sortable: true },
						{ label: 'Updated by', key: 'updatedBy', sortable: true },
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
					{tc.paginatedData.map(inventory => (
						<tr key={inventory.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{inventory.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{inventory.name}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.manufacturerNumber}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.inventoryTypeName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.inventoryPackageName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.inventorySurfaceMountName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.inventoryShopName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>
								{inventory.parameters ? JSON.stringify(inventory.parameters) : '—'}
							</td>
							<td className='px-5 py-3 tabular-nums font-medium text-gray-800'>{inventory.quantity ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.lowThreshold}</td>
							<td className='px-5 py-3 text-gray-600'>{inventory.comment}</td>
							<td className='px-5 py-3 text-gray-500'>{inventory.createdBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500'>{inventory.updatedBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(inventory.createdAt, true)}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(inventory.updatedAt, true)}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit inventory'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateInventoryData(inventory)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}{' '}
										{canWrite && (
											<button
												title='Set stock'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600 cursor-pointer'
												onClick={() => {
													setPendingStockInventoryId(inventory.id)
													setIsSetStock(true)
												}}>
												<Icon path={mdiDatabaseEdit} size={0.65} />
											</button>
										)}
										{canWrite && (
											<button
												title='Adjust stock'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-600 cursor-pointer'
												onClick={() => {
													setPendingStockInventoryId(inventory.id)
													setIsAdjustStock(true)
												}}>
												<Icon path={mdiPlusMinus} size={0.65} />
											</button>
										)}{' '}
										{canDelete && (
											<button
												title='Delete inventory'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(inventory.id)
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
				<Dialog title='Add inventory' onClose={() => setIsAdd(false)}>
					<InventoryForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update inventory' onClose={() => setIsUpdate(false)}>
					<InventoryForm
						onSubmit={async data => {
							handleEdit(data, updateInventoryData.id)
							setIsUpdate(false)
						}}
						inventory={updateInventoryData}
					/>
				</Dialog>
			)}
			{isSetStock && pendingStockInventoryId !== undefined && (
				<Dialog
					title='Set Stock'
					onClose={() => {
						setIsSetStock(false)
						setPendingStockInventoryId(undefined)
					}}>
					<InventoryStockSetForm
						inventoryId={pendingStockInventoryId}
						onSubmit={async data => {
							await handleSetStock(data)
							setIsSetStock(false)
							setPendingStockInventoryId(undefined)
						}}
					/>
				</Dialog>
			)}
			{isAdjustStock && pendingStockInventoryId !== undefined && (
				<Dialog
					title='Adjust Stock'
					onClose={() => {
						setIsAdjustStock(false)
						setPendingStockInventoryId(undefined)
					}}>
					<InventoryStockAdjustForm
						inventoryId={pendingStockInventoryId}
						onSubmit={async data => {
							await handleAdjustStock(data)
							setIsAdjustStock(false)
							setPendingStockInventoryId(undefined)
						}}
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
