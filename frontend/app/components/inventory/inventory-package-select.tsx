import { useGetInventoryPackagesQuery } from '~/api/inventoryApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface InventoryPackageSelectProps {
	getItem?: (item: string | undefined) => void
	itemId: string | undefined
	disabled?: boolean
}

export default function InventoryPackageSelect({ getItem, itemId, disabled }: InventoryPackageSelectProps) {
	const { data: inventoryPackages = [], isLoading: isInventoryPackagesLoading } = useGetInventoryPackagesQuery()

	if (isInventoryPackagesLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>Package</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const packageId = e.target.value
					if (getItem) {
						getItem(packageId)
					}
				}}>
				<option value=''>No package</option>
				{inventoryPackages?.map(p => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</div>
	)
}
