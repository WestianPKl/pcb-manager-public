import { useGetInventoryShopsQuery } from '~/api/inventoryApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface InventoryShopSelectProps {
	getItem?: (itemId: string | undefined) => void
	itemId: string | undefined
	disabled?: boolean
}

export default function InventoryShopSelect({ getItem, itemId, disabled }: InventoryShopSelectProps) {
	const { data: inventoryShops = [], isLoading: isInventoryShopsLoading } = useGetInventoryShopsQuery()

	if (isInventoryShopsLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>Shop</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const shopId = e.target.value
					if (getItem) {
						getItem(shopId)
					}
				}}>
				<option value=''>No shop</option>
				{inventoryShops?.map(s => (
					<option key={s.id} value={s.id}>
						{s.name}
					</option>
				))}
			</select>
		</div>
	)
}
