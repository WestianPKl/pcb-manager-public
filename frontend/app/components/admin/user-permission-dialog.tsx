import { useState } from 'react'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { useGetPermissionQuery } from '~/api/adminApi'
import { useGetUsersQuery } from '~/api/userApi'
import { PermissionClass } from '~/types/admin/PermissionClass'
import type { UserClass } from '~/types/user/UserClass'
import LoadingSpinner from '../ui/loading-spinner'
import DataTable from '../ui/data-table'
import { useTableControls } from '../ui/use-table-controls'

export default function UserPermissionDialog({
	permissionId,
	assignPermission,
}: {
	permissionId?: string
	assignPermission?: (permissionId: string, userId: string, assign: boolean) => void
}) {
	const [selectedUserId, setSelectedUserId] = useState<string | ''>('')

	const { data: permission = new PermissionClass(), isLoading: permissionIsLoading } = useGetPermissionQuery(
		permissionId ?? '',
		{ skip: !permissionId },
	)
	const { data: users = [], isLoading: usersIsLoading } = useGetUsersQuery()
	const tc = useTableControls<UserClass>(permission.users ?? [], { pageSize: 10 })

	if (!permissionId) return null

	if (permissionIsLoading || usersIsLoading) {
		return <LoadingSpinner />
	}

	const assignedIds = new Set(permission.users?.map((u: UserClass) => u.id))
	const availableUsers = users.filter(u => !assignedIds.has(u.id))
	const userCount = permission.users?.length ?? 0

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-3'>
				<span className='text-sm text-gray-500'>Permission:</span>
				<span className='font-semibold text-gray-800'>{permission.name ?? '—'}</span>
				{permission.functionality && (
					<span className='rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700'>
						{permission.functionality}
					</span>
				)}
				{permission.accessLevel && (
					<span className='rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700'>
						{permission.accessLevel}
					</span>
				)}
				<span className='ml-auto rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600'>
					{userCount} {userCount === 1 ? 'user' : 'users'}
				</span>
			</div>

			<div className='flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 px-5 py-3'>
				<span className='text-sm font-medium text-teal-700 whitespace-nowrap'>Assign user:</span>
				<select
					value={selectedUserId}
					onChange={e => setSelectedUserId(e.target.value)}
					className='flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 disabled:opacity-50'
					disabled={availableUsers.length === 0}>
					<option value=''>{availableUsers.length === 0 ? 'All users already assigned' : '— Select user —'}</option>
					{availableUsers.map(u => (
						<option key={u.id} value={u.id}>
							{u.username} {u.email && `(${u.email})`}
						</option>
					))}
				</select>
				<button
					disabled={selectedUserId === '' || !assignPermission}
					onClick={() => {
						if (selectedUserId !== '' && assignPermission) {
							assignPermission(permission.id!, selectedUserId, true)
							setSelectedUserId('')
						}
					}}
					className='inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'>
					＋ Assign
				</button>
			</div>

			<DataTable
				columns={[
					{ key: 'index', label: '#' },
					{ key: 'username', label: 'Username', sortable: true },
					{ key: 'actions', label: 'Actions' },
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
				onPageChange={tc.setPage}
				emptyText='No users assigned to this permission.'>
				{tc.paginatedData.map((user: UserClass, index: number) => (
					<tr key={user.id ?? String(index)} className='bg-white transition-colors hover:bg-red-50'>
						<td className='px-5 py-3 text-gray-400'>{tc.page > 1 ? (tc.page - 1) * 10 + index + 1 : index + 1}</td>
						<td className='px-5 py-3'>
							<div className='flex items-center gap-2'>
								<span className='flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700'>
									{user.username?.charAt(0).toUpperCase()}
								</span>
								<span className='font-medium text-gray-800'>
									{user.username} {user.email && `(${user.email})`}
								</span>
							</div>
						</td>
						<td className='px-5 py-3 text-right'>
							<button
								onClick={() => assignPermission && assignPermission(permission.id!, user.id!, false)}
								className='inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95 cursor-pointer'>
								<Icon path={mdiClose} size={0.6} /> Revoke
							</button>
						</td>
					</tr>
				))}
			</DataTable>
		</div>
	)
}
