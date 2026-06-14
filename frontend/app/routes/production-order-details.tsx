import type { Route } from './+types/production-order-details'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline, mdiArrowLeft } from '@mdi/js'
import { ProductionOrderItemsClass } from '~/types/production/ProductionOrderItemsClass'
import {
	useGetProductionOrderQuery,
	useGetProductionOrderItemsQuery,
	useCreateProductionOrderItemMutation,
	useUpdateProductionOrderItemMutation,
	useDeleteProductionOrderItemMutation,
	type CreateProductionOrderItemInput,
} from '~/api/productionApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import { useParams, Link } from 'react-router'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import ProductionOrderItemsForm from '~/components/production/production-orders-item-form'
import { showAlert } from '~/stores/application-store'
import type { ApiError } from '~/api/api'
import { checkPermissionAction } from '~/stores/account-actions'
import LoadingSpinner from '~/components/ui/loading-spinner'
import NoPermission from '~/components/ui/no-permission'
import PageHeader from '~/components/ui/page-header'
import EmptyState from '~/components/ui/empty-state'
import DataTable from '~/components/ui/data-table'
import { useTableControls } from '~/components/ui/use-table-controls'

const STATUS_LABELS: Record<string, string> = {
	planned: 'Planned',
	ready: 'Ready',
	reserved: 'Reserved',
	in_assembly: 'In Assembly',
	produced: 'Produced',
	cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
	planned: 'bg-gray-100 text-gray-700',
	ready: 'bg-blue-100 text-blue-700',
	reserved: 'bg-yellow-100 text-yellow-700',
	in_assembly: 'bg-teal-100 text-teal-700',
	produced: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-700',
}

const ITEM_STATUS_COLORS: Record<string, string> = {
	ok: 'bg-green-100 text-green-700',
	low: 'bg-yellow-100 text-yellow-700',
	missing: 'bg-red-100 text-red-700',
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Production order item operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - Production Order Details' },
		{ name: 'description', content: 'PCB Manager - Production Order Details' },
	]
}

export default function ProductionOrderDetails() {
	const { id } = useParams<{ id: string }>()
	const orderId = id ?? ''

	const [isAdd, setIsAdd] = useState(false)
	const [updateItemData, setUpdateItemData] = useState<ProductionOrderItemsClass>(new ProductionOrderItemsClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createProductionOrderItem] = useCreateProductionOrderItemMutation()
	const [updateProductionOrderItem] = useUpdateProductionOrderItemMutation()
	const [deleteProductionOrderItem] = useDeleteProductionOrderItemMutation()

	const { data: order, isLoading: isOrderLoading } = useGetProductionOrderQuery(orderId)
	const { data: items = [], isLoading: isItemsLoading } = useGetProductionOrderItemsQuery(orderId)
	const tc = useTableControls(items)

	const canRead = dispatch(checkPermissionAction('production', 'READ'))
	const canWrite = dispatch(checkPermissionAction('production', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('production', 'DELETE'))

	if (isOrderLoading || isItemsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateProductionOrderItemInput) {
		return createProductionOrderItem(data).unwrap()
	}

	function handleEdit(data: CreateProductionOrderItemInput, itemId: string | undefined) {
		const { qtyPerBoard, requiredQtyTotal, consumedQty, designators, allowSubstitute, status } = data
		return updateProductionOrderItem({
			body: { qtyPerBoard, requiredQtyTotal, consumedQty, designators, allowSubstitute, status },
			id: itemId ?? '',
		}).unwrap()
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) return
		deleteProductionOrderItem(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Production order item deleted successfully', severity: 'success' }))
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
			<div className='mb-4'>
				<Link
					to='/production-orders'
					className='inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline'>
					<Icon path={mdiArrowLeft} size={0.65} />
					Back to Production Orders
				</Link>
			</div>

			{order && (
				<div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
					<div className='flex items-center gap-3'>
						<h2 className='text-lg font-semibold text-gray-800'>{order.pcbName ?? 'PCB #' + order.pcbId}</h2>
						{order.status && (
							<span
								className={
									'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
									(STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700')
								}>
								{STATUS_LABELS[order.status] ?? order.status}
							</span>
						)}
					</div>
					<p className='mt-1 text-sm text-gray-500'>Quantity: {order.quantity}</p>
				</div>
			)}

			<PageHeader
				title='Order Items'
				subtitle='Components required for this production order.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add item'
			/>

			{items.length === 0 ? (
				<EmptyState message='No items found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Component', key: 'inventoryId', sortable: true },
						{ label: 'Qty/Board', key: 'qtyPerBoard', sortable: true },
						{ label: 'Required Total', key: 'requiredQtyTotal', sortable: true },
						{ label: 'Consumed Qty', key: 'consumedQty', sortable: true },
						{ label: 'Designators', key: 'designators', sortable: true },
						{ label: 'Allow Sub.', key: 'allowSubstitute', sortable: true },
						{ label: 'Status', key: 'status', sortable: true },
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
					{tc.paginatedData.map(item => (
						<tr key={item.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{item.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{item.inventoryName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{item.qtyPerBoard}</td>
							<td className='px-5 py-3 text-gray-600'>{item.requiredQtyTotal}</td>
							<td className='px-5 py-3 text-gray-600'>{item.consumedQty ?? 0}</td>
							<td className='px-5 py-3 text-gray-600'>{item.designators ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{item.allowSubstitute ? 'Yes' : 'No'}</td>
							<td className='px-5 py-3'>
								{item.status && (
									<span
										className={
											'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
											(ITEM_STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-700')
										}>
										{item.status}
									</span>
								)}
							</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit item'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateItemData(item)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete item'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(item.id)
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
				<Dialog title='Add Order Item' onClose={() => setIsAdd(false)}>
					<ProductionOrderItemsForm
						productionOrderId={orderId}
						onSubmit={async data => {
							await handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update Order Item' onClose={() => setIsUpdate(false)}>
					<ProductionOrderItemsForm
						productionOrderId={orderId}
						productionOrderItem={updateItemData}
						onSubmit={async data => {
							await handleEdit(data, updateItemData.id)
							setIsUpdate(false)
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
