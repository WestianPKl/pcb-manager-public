import { useGetInventoriesQuery } from '~/api/inventoryApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface InventorySelectProps {
	getItem?: (itemId: string | undefined) => void
	itemId: string | null | undefined
	disabled?: boolean
}

export default function InventorySelect({ getItem, itemId, disabled }: InventorySelectProps) {
	const { data: inventoriesResult, isLoading: isInventoriesLoading } = useGetInventoriesQuery({})
	const inventories = inventoriesResult?.data ?? []

	if (isInventoriesLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>Inventory</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const inventoryId = e.target.value
					const selectedInventory = inventories?.find(p => p.id === inventoryId)
					if (getItem) {
						getItem(selectedInventory?.id)
					}
				}}>
				<option value=''>No inventory</option>
				{inventories?.map(p => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</div>
	)
}
