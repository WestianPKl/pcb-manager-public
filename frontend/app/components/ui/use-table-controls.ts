import { useMemo, useState } from 'react'

export type SortDir = 'asc' | 'desc'

export interface TableControls<T> {
	filterQuery: string
	setFilterQuery: (q: string) => void
	sortKey: string
	sortDir: SortDir
	toggleSort: (key: string) => void
	page: number
	setPage: (p: number) => void
	pageSize: number
	totalCount: number
	totalPages: number
	paginatedData: T[]
}

export function useTableControls<T extends object>(data: T[], options?: { pageSize?: number }): TableControls<T> {
	const pageSize = options?.pageSize ?? 10

	const [filterQuery, setFilterQueryRaw] = useState('')
	const [sortKey, setSortKey] = useState('')
	const [sortDir, setSortDir] = useState<SortDir>('asc')
	const [page, setPageRaw] = useState(1)

	function setFilterQuery(q: string) {
		setFilterQueryRaw(q)
		setPageRaw(1)
	}

	function toggleSort(key: string) {
		if (sortKey === key) {
			setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortKey(key)
			setSortDir('asc')
		}
		setPageRaw(1)
	}

	function setPage(p: number) {
		setPageRaw(p)
	}

	const filtered = useMemo(() => {
		if (!filterQuery.trim()) return data
		const q = filterQuery.toLowerCase()
		return data.filter(row => JSON.stringify(row).toLowerCase().includes(q))
	}, [data, filterQuery])

	const sorted = useMemo(() => {
		if (!sortKey) return filtered
		return [...filtered].sort((a, b) => {
			const av = (a as Record<string, unknown>)[sortKey] ?? ''
			const bv = (b as Record<string, unknown>)[sortKey] ?? ''
			const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
			return sortDir === 'asc' ? cmp : -cmp
		})
	}, [filtered, sortKey, sortDir])

	const totalCount = sorted.length
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
	const safePage = Math.min(page, totalPages)

	const paginatedData = useMemo(() => {
		const start = (safePage - 1) * pageSize
		return sorted.slice(start, start + pageSize)
	}, [sorted, safePage, pageSize])

	return {
		filterQuery,
		setFilterQuery,
		sortKey,
		sortDir,
		toggleSort,
		page: safePage,
		setPage,
		pageSize,
		totalCount,
		totalPages,
		paginatedData,
	}
}
