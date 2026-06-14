import type { Route } from './+types/pcb-details'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline, mdiArrowLeft } from '@mdi/js'
import { PCBBomItemsClass } from '~/types/pcb/PCBBomItemsClass'
import {
	useGetPCBQuery,
	useGetPCBBomItemsQuery,
	useCreatePCBBomItemMutation,
	useUpdatePCBBomItemMutation,
	useDeletePCBBomItemMutation,
	type CreatePCBBomItemInput,
} from '~/api/pcbApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { toStorageUrl } from '~/utils/url'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import PCBBomItemsForm from '~/components/pcb/pcb-bom-form'
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
	if (apiError.message) return apiError.message
	return 'PCB BOM operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [{ title: 'PCB Manager - PCB Details' }, { name: 'description', content: 'PCB Manager - PCB Details' }]
}

export default function PCBDetails() {
	const { id } = useParams<{ id: string }>()
	const pcbId = id ?? ''

	const [isAdd, setIsAdd] = useState(false)
	const [updateBomItemData, setUpdateBomItemData] = useState<PCBBomItemsClass>(new PCBBomItemsClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

	const dispatch = useAppDispatch()

	const [createPCBBomItem] = useCreatePCBBomItemMutation()
	const [updatePCBBomItem] = useUpdatePCBBomItemMutation()
	const [deletePCBBomItem] = useDeletePCBBomItemMutation()

	const { data: pcb, isLoading: isPCBLoading } = useGetPCBQuery(pcbId)
	const { data: bomItems = [], isLoading: isBomItemsLoading } = useGetPCBBomItemsQuery(pcbId)
	const tc = useTableControls(bomItems)

	const canRead = dispatch(checkPermissionAction('pcb', 'READ'))
	const canWrite = dispatch(checkPermissionAction('pcb', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('pcb', 'DELETE'))

	if (isPCBLoading || isBomItemsLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreatePCBBomItemInput) {
		return createPCBBomItem(data).unwrap()
	}

	function handleEdit(data: CreatePCBBomItemInput, itemId: string | undefined) {
		return updatePCBBomItem({ body: data, id: itemId ?? '' }).unwrap()
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) return
		deletePCBBomItem(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'BOM item deleted successfully', severity: 'success' }))
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
				<Link to='/pcbs' className='inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline'>
					<Icon path={mdiArrowLeft} size={0.65} />
					Back to PCBs
				</Link>
			</div>

			{pcb && (
				<div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
					<div className='mb-3 flex items-center gap-3'>
						<h2 className='text-lg font-semibold text-gray-800'>{pcb.name}</h2>
						{pcb.revision && (
							<span className='rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700'>
								Rev {pcb.revision}
							</span>
						)}
						{pcb.verified && (
							<span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>Verified</span>
						)}
					</div>
					{pcb.comment && <p className='text-sm text-gray-500'>{pcb.comment}</p>}
					<div className='mt-3 flex gap-4'>
						{pcb.topUrl && (
							<div>
								<p className='mb-1 text-xs text-gray-400'>Top</p>
								<img
									src={toStorageUrl(pcb.topUrl!) + '?w=400&h=400&format=webp'}
									alt='PCB top'
									className='h-48 w-48 rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity'
									onClick={() => setLightboxUrl(toStorageUrl(pcb.topUrl!))}
								/>
							</div>
						)}
						{pcb.bottomUrl && (
							<div>
								<p className='mb-1 text-xs text-gray-400'>Bottom</p>
								<img
									src={toStorageUrl(pcb.bottomUrl!) + '?w=400&h=400&format=webp'}
									alt='PCB bottom'
									className='h-48 w-48 rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity'
									onClick={() => setLightboxUrl(toStorageUrl(pcb.bottomUrl!))}
								/>
							</div>
						)}
					</div>
				</div>
			)}

			<PageHeader
				title='BOM Items'
				subtitle='Bill of Materials for this PCB.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add BOM item'
			/>

			{bomItems.length === 0 ? (
				<EmptyState message='No BOM items found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Component', key: 'inventoryId', sortable: true },
						{ label: 'Qty/Board', key: 'qtyPerBoard', sortable: true },
						{ label: 'Designators', key: 'designators', sortable: true },
						{ label: 'Value/Spec', key: 'valueSpec', sortable: true },
						{ label: 'Allow Sub.', key: 'allowSubstitutes', sortable: true },
						{ label: 'Comment', key: 'comment', sortable: true },
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
							<td className='px-5 py-3 text-gray-600'>{item.designators ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{item.valueSpec ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{item.allowSubstitutes ? 'Yes' : 'No'}</td>
							<td className='px-5 py-3 text-gray-600'>{item.comment ?? '—'}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit BOM item'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateBomItemData(item)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete BOM item'
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
				<Dialog title='Add BOM Item' onClose={() => setIsAdd(false)}>
					<PCBBomItemsForm
						pcbId={pcbId}
						onSubmit={async data => {
							await handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update BOM Item' onClose={() => setIsUpdate(false)}>
					<PCBBomItemsForm
						pcbId={pcbId}
						pcbBomItem={updateBomItemData}
						onSubmit={async data => {
							await handleEdit(data, updateBomItemData.id)
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
			{lightboxUrl && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/75'
					onClick={() => setLightboxUrl(null)}>
					<img
						src={lightboxUrl}
						alt='PCB preview'
						className='max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl'
						onClick={e => e.stopPropagation()}
					/>
				</div>
			)}
		</div>
	)
}
