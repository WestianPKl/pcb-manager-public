import type { Route } from './+types/production-orders'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline, mdiOpenInNew } from '@mdi/js'
import { ProductionOrdersClass } from '~/types/production/ProductionOrdersClass'
import {
	useGetProductionOrdersQuery,
	useCreateProductionOrderMutation,
	useUpdateProductionOrderMutation,
	useDeleteProductionOrderMutation,
	type CreateProductionOrdersInput,
} from '~/api/productionApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import { Link } from 'react-router'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import ProductionOrdersForm from '~/components/production/production-orders-form'
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

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'Production order operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - Production Orders' },
		{ name: 'description', content: 'PCB Manager - Production Orders' },
	]
}

export default function ProductionOrders() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateOrderData, setUpdateOrderData] = useState<ProductionOrdersClass>(new ProductionOrdersClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createProductionOrder] = useCreateProductionOrderMutation()
	const [updateProductionOrder] = useUpdateProductionOrderMutation()
	const [deleteProductionOrder] = useDeleteProductionOrderMutation()

	const { data: ordersResult, isLoading } = useGetProductionOrdersQuery({})
	const orders = ordersResult?.data ?? []
	const tc = useTableControls(orders)

	const canRead = dispatch(checkPermissionAction('production', 'READ'))
	const canWrite = dispatch(checkPermissionAction('production', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('production', 'DELETE'))

	if (isLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateProductionOrdersInput) {
		return createProductionOrder(data).unwrap()
	}

	function handleEdit(data: CreateProductionOrdersInput, orderId: string | undefined) {
		return updateProductionOrder({ body: data, id: orderId ?? '' }).unwrap()
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) return
		deleteProductionOrder(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Production order deleted successfully', severity: 'success' }))
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
				title='Production Orders'
				subtitle='Manage production orders.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add order'
			/>

			{orders.length === 0 ? (
				<EmptyState message='No production orders found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'PCB', key: 'pcbId', sortable: true },
						{ label: 'Quantity', key: 'quantity', sortable: true },
						{ label: 'Status', key: 'status', sortable: true },
						{ label: 'Created at', key: 'createdAt', sortable: true },
						{ label: 'Updated at', key: 'updatedAt', sortable: true },
						{ label: 'Actions', align: 'right' as const },
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
					{tc.paginatedData.map(order => (
						<tr key={order.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{order.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>
								<Link to={'/production-order-details/' + order.id} className='text-teal-600 hover:underline'>
									{order.pcbName ?? 'PCB #' + order.pcbId}
								</Link>
							</td>
							<td className='px-5 py-3 text-gray-600'>{order.quantity}</td>
							<td className='px-5 py-3'>
								{order.status && (
									<span
										className={
											'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
											(STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700')
										}>
										{STATUS_LABELS[order.status] ?? order.status}
									</span>
								)}
							</td>
							<td className='px-5 py-3 text-gray-600'>
								{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
							</td>
							<td className='px-5 py-3 text-gray-600'>
								{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}
							</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										<Link
											to={'/production-order-details/' + order.id}
											title='View details'
											className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600'>
											<Icon path={mdiOpenInNew} size={0.65} />
										</Link>
										{canWrite && (
											<button
												title='Edit order'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateOrderData(order)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete order'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(order.id)
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
				<Dialog title='Add Production Order' onClose={() => setIsAdd(false)}>
					<ProductionOrdersForm
						onSubmit={async data => {
							await handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update Production Order' onClose={() => setIsUpdate(false)}>
					<ProductionOrdersForm
						productionOrder={updateOrderData}
						onSubmit={async data => {
							await handleEdit(data, updateOrderData.id)
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
