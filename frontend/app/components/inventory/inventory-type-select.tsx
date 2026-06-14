import { useGetInventoryTypesQuery } from '~/api/inventoryApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface InventoryTypeSelectProps {
	getItem?: (item: string | undefined) => void
	itemId: string | undefined
	disabled?: boolean
}

export default function InventoryTypeSelect({ getItem, itemId, disabled }: InventoryTypeSelectProps) {
	const { data: inventoryTypes = [], isLoading: isInventoryTypesLoading } = useGetInventoryTypesQuery()

	if (isInventoryTypesLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>Type</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const typeId = e.target.value
					if (getItem) {
						getItem(typeId)
					}
				}}>
				<option value=''>No type</option>
				{inventoryTypes?.map(t => (
					<option key={t.id} value={t.id}>
						{t.name}
					</option>
				))}
			</select>
		</div>
	)
}
