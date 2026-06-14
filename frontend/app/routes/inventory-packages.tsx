import type { Route } from './+types/inventory-packages'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { InventoryPackageClass } from '~/types/inventory/InventoryPackageClass'
import {
	useGetInventoryPackagesQuery,
	useCreateInventoryPackageMutation,
	useUpdateInventoryPackageMutation,
	useDeleteInventoryPackageMutation,
	type CreateInventoryPackageInput,
} from '~/api/inventoryApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import InventoryPackageForm from '~/components/inventory/inventory-packages-form'
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

	return 'Inventory package operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - inventory packages' },
		{
			name: 'description',
			content: 'PCB Manager - inventory packages description',
		},
	]
}

export default function InventoryPackages() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateInventoryPackageData, setUpdateInventoryPackageData] = useState<InventoryPackageClass>(
		new InventoryPackageClass(),
	)
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createInventoryPackage] = useCreateInventoryPackageMutation()
	const [updateInventoryPackage] = useUpdateInventoryPackageMutation()
	const [deleteInventoryPackage] = useDeleteInventoryPackageMutation()

	const { data: inventoryPackages = [], isLoading: isInventoryPackagesLoading } = useGetInventoryPackagesQuery()
	const tc = useTableControls(inventoryPackages)

	const canRead = dispatch(checkPermissionAction('inventory', 'READ'))
	const canWrite = dispatch(checkPermissionAction('inventory', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('inventory', 'DELETE'))

	if (isInventoryPackagesLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateInventoryPackageInput) {
		createInventoryPackage(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory package added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateInventoryPackageInput, InventoryPackageId: string | undefined) {
		updateInventoryPackage({ body: data, id: InventoryPackageId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory package updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteInventoryPackage(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Inventory package deleted successfully', severity: 'success' }))
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
				title='Inventory Packages'
				subtitle='Browse and manage available inventory packages.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add inventory package'
			/>

			{inventoryPackages.length === 0 ? (
				<EmptyState message='No inventory packages found.' />
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
					{tc.paginatedData.map(inventoryPackage => (
						<tr key={inventoryPackage.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{inventoryPackage.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{inventoryPackage.name}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit inventory package'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateInventoryPackageData(inventoryPackage)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete inventory package'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(inventoryPackage.id)
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
				<Dialog title='Add inventory package' onClose={() => setIsAdd(false)}>
					<InventoryPackageForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update inventory package' onClose={() => setIsUpdate(false)}>
					<InventoryPackageForm
						onSubmit={async data => {
							handleEdit(data, updateInventoryPackageData.id)
							setIsUpdate(false)
						}}
						inventoryPackage={updateInventoryPackageData}
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
