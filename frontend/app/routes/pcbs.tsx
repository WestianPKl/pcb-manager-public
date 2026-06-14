import type { Route } from './+types/pcbs'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline, mdiOpenInNew } from '@mdi/js'
import { PCBClass } from '~/types/pcb/PCBClass'
import {
	useGetPCBsQuery,
	useCreatePCBMutation,
	useUpdatePCBMutation,
	useDeletePCBMutation,
	useUploadPCBImagesMutation,
	type CreatePCBInput,
} from '~/api/pcbApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import { Link } from 'react-router'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import PCBForm from '~/components/pcb/pcb-form'
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
	if (apiError.message) return apiError.message
	return 'PCB operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [{ title: 'PCB Manager - PCBs' }, { name: 'description', content: 'PCB Manager - PCBs' }]
}

export default function PCBs() {
	const [isAdd, setIsAdd] = useState(false)
	const [updatePCBData, setUpdatePCBData] = useState<PCBClass>(new PCBClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createPCB] = useCreatePCBMutation()
	const [updatePCB] = useUpdatePCBMutation()
	const [deletePCB] = useDeletePCBMutation()
	const [uploadPCBImages] = useUploadPCBImagesMutation()

	const { data: pcbsResult, isLoading: isPCBsLoading } = useGetPCBsQuery({})
	const pcbs = pcbsResult?.data ?? []
	const tc = useTableControls(pcbs)

	const canRead = dispatch(checkPermissionAction('pcb', 'READ'))
	const canWrite = dispatch(checkPermissionAction('pcb', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('pcb', 'DELETE'))

	if (isPCBsLoading) {
		return <LoadingSpinner />
	}

	async function handleAdd(data: CreatePCBInput, topImg?: File, bottomImg?: File) {
		const created = await createPCB(data).unwrap()
		if ((topImg || bottomImg) && created.id) {
			const formData = new FormData()
			if (topImg) formData.append('top', topImg)
			if (bottomImg) formData.append('bottom', bottomImg)
			await uploadPCBImages({ id: created.id, formData }).unwrap()
		}
	}

	async function handleEdit(data: CreatePCBInput, pcbId: string | undefined, topImg?: File, bottomImg?: File) {
		await updatePCB({ body: data, id: pcbId ?? '' }).unwrap()
		if ((topImg || bottomImg) && pcbId) {
			const formData = new FormData()
			if (topImg) formData.append('top', topImg)
			if (bottomImg) formData.append('bottom', bottomImg)
			await uploadPCBImages({ id: pcbId, formData }).unwrap()
		}
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) return
		deletePCB(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'PCB deleted successfully', severity: 'success' }))
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
				title='PCBs'
				subtitle='Browse and manage PCB designs.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add PCB'
			/>

			{pcbs.length === 0 ? (
				<EmptyState message='No PCBs found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Revision', key: 'revision', sortable: true },
						{ label: 'Project', key: 'project', sortable: true },
						{ label: 'Comment', key: 'comment', sortable: true },
						{ label: 'Verified', key: 'verified', sortable: true },
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
					{tc.paginatedData.map(pcb => (
						<tr key={pcb.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{pcb.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>
								<Link to={`/pcb-details/${pcb.id}`} className='text-teal-600 hover:underline'>
									{pcb.name}
								</Link>
							</td>
							<td className='px-5 py-3 text-gray-600'>{pcb.revision ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{pcb.projectName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{pcb.comment ?? '—'}</td>
							<td className='px-5 py-3 text-gray-600'>{pcb.verified ? 'Yes' : 'No'}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(pcb.createdAt, true)}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(pcb.updatedAt, true)}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										<Link
											to={`/pcb-details/${pcb.id}`}
											className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600 cursor-pointer'
											title='View details'>
											<Icon path={mdiOpenInNew} size={0.65} />
										</Link>
										{canWrite && (
											<button
												title='Edit PCB'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdatePCBData(pcb)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete PCB'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(pcb.id)
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
				<Dialog title='Add PCB' onClose={() => setIsAdd(false)}>
					<PCBForm
						onSubmit={async (data, topImg, bottomImg) => {
							await handleAdd(data, topImg, bottomImg)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update PCB' onClose={() => setIsUpdate(false)}>
					<PCBForm
						onSubmit={async (data, topImg, bottomImg) => {
							await handleEdit(data, updatePCBData.id, topImg, bottomImg)
							setIsUpdate(false)
						}}
						pcb={updatePCBData}
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
