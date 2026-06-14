import type { Route } from './+types/inventory-shops'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { InventoryShopClass } from '~/types/inventory/InventoryShopClass'
import {
	useGetInventoryShopsQuery,
	useCreateInventoryShopMutation,
	useUpdateInventoryShopMutation,
	useDeleteInventoryShopMutation,
	type CreateInventoryShopInput,
} from '~/api/inventoryApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import InventoryShopForm from '~/components/inventory/inventory-shops-form'
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

	return 'Inventory shop operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - inventory shops' },
		{
			name: 'description',
			content: 'PCB Manager - inventory shops description',
		},
	]
}

export default function InventoryShops() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateInventoryShopData, setUpdateInventoryShopData] = useState<InventoryShopClass>(new InventoryShopClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createInventoryShop] = useCreateInventoryShopMutation()
	const [updateInventoryShop] = useUpdateInventoryShopMutation()
	const [deleteInventoryShop] = useDeleteInventoryShopMutation()

	const { data: inventoryShops = [], isLoading: isInventoryShopsLoading } = useGetInventoryShopsQuery()
	const tc = useTableControls(inventoryShops)

	const canRead = dispatch(checkPermissionAction('inventory', 'READ'))
	const canWrite = dispatch(checkPermissionAction('inventory', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('inventory', 'DELETE'))

	if (isInventoryShopsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateInventoryShopInput) {
		createInventoryShop(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory shop added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateInventoryShopInput, inventoryShopId: string | undefined) {
		updateInventoryShop({ body: data, id: inventoryShopId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory shop updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteInventoryShop(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory shop deleted successfully', severity: 'success' }))
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
				title='Inventory Shops'
				subtitle='Browse and manage available inventory shops.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add inventory shop'
			/>

			{inventoryShops.length === 0 ? (
				<EmptyState message='No inventory shops found.' />
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
					{tc.paginatedData.map(inventoryShop => (
						<tr key={inventoryShop.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{inventoryShop.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{inventoryShop.name}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit inventory shop'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateInventoryShopData(inventoryShop)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete inventory shop'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(inventoryShop.id)
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
				<Dialog title='Add inventory shop' onClose={() => setIsAdd(false)}>
					<InventoryShopForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update inventory shop' onClose={() => setIsUpdate(false)}>
					<InventoryShopForm
						onSubmit={async data => {
							handleEdit(data, updateInventoryShopData.id)
							setIsUpdate(false)
						}}
						inventoryShop={updateInventoryShopData}
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
