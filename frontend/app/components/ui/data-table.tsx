import { Icon } from '@mdi/react'
import {
	mdiChevronLeft,
	mdiChevronRight,
	mdiClose,
	mdiMagnify,
	mdiSort,
	mdiSortAscending,
	mdiSortDescending,
} from '@mdi/js'
import type { SortDir } from './use-table-controls'

type Column =
	| string
	| {
			label: string
			key?: string
			sortable?: boolean
			align?: 'left' | 'right'
	  }

interface DataTableProps {
	columns: Column[]
	children: React.ReactNode
	rowCount?: number
	emptyText?: string
	filterQuery?: string
	onFilterChange?: (q: string) => void
	filterPlaceholder?: string
	sortKey?: string
	sortDir?: SortDir
	onSort?: (key: string) => void
	page?: number
	totalPages?: number
	totalCount?: number
	onPageChange?: (page: number) => void
}

export default function DataTable({
	columns,
	children,
	rowCount,
	emptyText = 'No results match the current filter.',
	filterQuery,
	onFilterChange,
	filterPlaceholder = 'Search...',
	sortKey,
	sortDir,
	onSort,
	page = 1,
	totalPages = 1,
	totalCount,
	onPageChange,
}: DataTableProps) {
	const showFilter = onFilterChange !== undefined
	const showPagination = onPageChange !== undefined && totalPages > 1

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
		.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
		.reduce<(number | '...')[]>((acc, p, idx, arr) => {
			if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
			acc.push(p)
			return acc
		}, [])

	return (
		<div className='space-y-3'>
			{showFilter && (
				<div className='flex items-center justify-between gap-3'>
					<div className='relative w-72'>
						<span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400'>
							<Icon path={mdiMagnify} size={0.7} />
						</span>
						<input
							type='text'
							value={filterQuery}
							onChange={e => onFilterChange(e.target.value)}
							placeholder={filterPlaceholder}
							className='w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100'
						/>
						{filterQuery && (
							<button
								onClick={() => onFilterChange('')}
								className='absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer'>
								<Icon path={mdiClose} size={0.6} />
							</button>
						)}
					</div>
					{totalCount !== undefined && (
						<span className='text-xs text-gray-400'>
							{totalCount} {totalCount === 1 ? 'record' : 'records'}
						</span>
					)}
				</div>
			)}

			<div className='overflow-hidden rounded-xl border border-gray-200 shadow-sm'>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead className='bg-teal-700 text-xs uppercase tracking-wider text-white'>
							<tr>
								{columns.map((col, i) => {
									const label = typeof col === 'string' ? col : col.label
									const align = typeof col === 'string' ? 'left' : (col.align ?? 'left')
									const key = typeof col === 'string' ? undefined : col.key
									const sortable = typeof col === 'string' ? false : (col.sortable ?? !!key)
									const isActive = !!(sortable && key && sortKey === key)
									return (
										<th
											key={i}
											onClick={sortable && key && onSort ? () => onSort(key) : undefined}
											className={`px-5 py-3 font-semibold ${align === 'right' ? 'text-right' : 'text-left'} ${sortable && key ? 'cursor-pointer select-none hover:bg-teal-600 transition-colors' : ''}`}>
											<span className='inline-flex items-center gap-1'>
												{label}
												{sortable && key && (
													<Icon
														path={isActive ? (sortDir === 'asc' ? mdiSortAscending : mdiSortDescending) : mdiSort}
														size={0.6}
														className={isActive ? 'text-teal-200' : 'text-teal-400'}
													/>
												)}
											</span>
										</th>
									)
								})}
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-100'>
							{rowCount === 0 ? (
								<tr>
									<td colSpan={columns.length} className='px-5 py-10 text-center text-sm text-gray-400 italic'>
										{emptyText}
									</td>
								</tr>
							) : (
								children
							)}
						</tbody>
					</table>
				</div>
			</div>

			{(showPagination || (showFilter && totalCount !== undefined)) && (
				<div className='flex items-center justify-between'>
					<span className='text-xs text-gray-400'>
						{totalPages > 1 ? `Page ${page} of ${totalPages}` : ''}
						{totalCount !== undefined && totalPages > 1 ? ` · ${totalCount} records` : ''}
					</span>
					{showPagination && (
						<div className='flex items-center gap-1'>
							<button
								onClick={() => onPageChange(page - 1)}
								disabled={page <= 1}
								className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'>
								<Icon path={mdiChevronLeft} size={0.7} />
							</button>
							{pageNumbers.map((p, i) =>
								p === '...' ? (
									<span key={`e-${i}`} className='px-1 text-xs text-gray-400'>
										…
									</span>
								) : (
									<button
										key={p}
										onClick={() => onPageChange(p as number)}
										className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium shadow-sm transition-all cursor-pointer ${
											p === page
												? 'border-teal-600 bg-teal-600 text-white'
												: 'border-gray-200 bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600'
										}`}>
										{p}
									</button>
								),
							)}
							<button
								onClick={() => onPageChange(page + 1)}
								disabled={page >= totalPages}
								className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'>
								<Icon path={mdiChevronRight} size={0.7} />
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
