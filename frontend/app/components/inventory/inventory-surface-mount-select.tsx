import { useGetInventorySurfaceMountsQuery } from '~/api/inventoryApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface InventorySurfaceMountSelectProps {
	getItem?: (itemId: string | undefined) => void
	itemId: string | undefined
	disabled?: boolean
}

export default function InventorySurfaceMountSelect({ getItem, itemId, disabled }: InventorySurfaceMountSelectProps) {
	const { data: inventorySurfaceMounts = [], isLoading: isInventorySurfaceMountsLoading } =
		useGetInventorySurfaceMountsQuery()

	if (isInventorySurfaceMountsLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>Surface Mount</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const surfaceMountId = e.target.value
					if (getItem) {
						getItem(surfaceMountId)
					}
				}}>
				<option value=''>No surface mount</option>
				{inventorySurfaceMounts?.map(s => (
					<option key={s.id} value={s.id}>
						{s.name}
					</option>
				))}
			</select>
		</div>
	)
}
