import type { Route } from './+types/devices'
import { Icon } from '@mdi/react'
import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { DeviceClass } from '~/types/device/DeviceClass'
import {
	useGetDevicesQuery,
	useCreateDeviceMutation,
	useUpdateDeviceMutation,
	useDeleteDeviceMutation,
	type CreateDeviceInput,
} from '~/api/deviceApi'
import { useAppDispatch } from '~/stores/hooks'
import { useState } from 'react'
import Dialog from '~/components/ui/dialog'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import DeviceForm from '~/components/device/device-form'
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

	return 'Device operation failed'
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'PCB Manager - devices' },
		{
			name: 'description',
			content: 'PCB Manager - devices description',
		},
	]
}

export default function Devices() {
	const [isAdd, setIsAdd] = useState(false)
	const [updateDeviceData, setUpdateDeviceData] = useState<DeviceClass>(new DeviceClass())
	const [isUpdate, setIsUpdate] = useState(false)
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
	const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined)

	const dispatch = useAppDispatch()

	const [createDevice] = useCreateDeviceMutation()
	const [updateDevice] = useUpdateDeviceMutation()
	const [deleteDevice] = useDeleteDeviceMutation()

	const { data: devicesResult, isLoading: isDevicesLoading } = useGetDevicesQuery({})
	const devices = devicesResult?.data ?? []
	const tc = useTableControls(devices)

	const canRead = dispatch(checkPermissionAction('devices', 'READ'))
	const canWrite = dispatch(checkPermissionAction('devices', 'WRITE'))
	const canDelete = dispatch(checkPermissionAction('devices', 'DELETE'))

	if (isDevicesLoading) {
		return <LoadingSpinner />
	}

	function handleAdd(data: CreateDeviceInput) {
		createDevice(data)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Device added successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleEdit(data: CreateDeviceInput, deviceId: string | undefined) {
		updateDevice({ body: data, id: deviceId ?? '' })
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Device updated successfully', severity: 'success' }))
			})
			.catch((error: any) => {
				dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
			})
	}

	function handleDelete(id: string | undefined) {
		if (id === undefined) {
			return
		}

		deleteDevice(id)
			.unwrap()
			.then(() => {
				dispatch(showAlert({ message: 'Device deleted successfully', severity: 'success' }))
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
				title='Devices'
				subtitle='Browse and manage available devices.'
				onAdd={canWrite ? () => setIsAdd(true) : undefined}
				addLabel='+ Add device'
			/>

			{devices.length === 0 ? (
				<EmptyState message='No devices found.' />
			) : (
				<DataTable
					columns={[
						{ label: 'ID', key: 'id', sortable: true },
						{ label: 'Name', key: 'name', sortable: true },
						{ label: 'Description', key: 'description', sortable: true },
						{ label: 'Serial number', key: 'serialNumber', sortable: true },
						{ label: 'PCB', key: 'pcb.name', sortable: true },
						'Created by',
						'Updated by',
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
					{tc.paginatedData.map(device => (
						<tr key={device.id} className='bg-white transition-colors hover:bg-teal-50'>
							<td className='px-5 py-3 text-gray-600'>{device.id}</td>
							<td className='px-5 py-3 font-medium text-gray-800'>{device.name}</td>
							<td className='px-5 py-3 text-gray-600'>{device.description}</td>
							<td className='px-5 py-3 text-gray-600'>{device.serialNumber}</td>
							<td className='px-5 py-3 text-gray-600'>{device.pcbName ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500'>{device.createdBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500'>{device.updatedBy ?? '—'}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(device.createdAt, true)}</td>
							<td className='px-5 py-3 text-gray-500 tabular-nums'>{formatLocalDateTime(device.updatedAt, true)}</td>
							<td className='px-5 py-3'>
								<div className='flex items-center justify-end'>
									<div className='inline-flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200'>
										{canWrite && (
											<button
												title='Edit device'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
												onClick={() => {
													setUpdateDeviceData(device)
													setIsUpdate(true)
												}}>
												<Icon path={mdiPencilOutline} size={0.65} />
											</button>
										)}
										{canDelete && (
											<button
												title='Delete device'
												className='flex items-center justify-center px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer'
												onClick={() => {
													setPendingDeleteId(device.id)
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
				<Dialog title='Add device' onClose={() => setIsAdd(false)}>
					<DeviceForm
						onSubmit={async data => {
							handleAdd(data)
							setIsAdd(false)
						}}
					/>
				</Dialog>
			)}
			{isUpdate && (
				<Dialog title='Update device' onClose={() => setIsUpdate(false)}>
					<DeviceForm
						onSubmit={async data => {
							handleEdit(data, updateDeviceData.id)
							setIsUpdate(false)
						}}
						device={updateDeviceData}
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
