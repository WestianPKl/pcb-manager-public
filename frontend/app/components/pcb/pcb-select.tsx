import { PCBClass } from '~/types/pcb/PCBClass'
import { useGetPCBsQuery } from '~/api/pcbApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface PCBSelectProps {
	getItem?: (itemId: string | undefined) => void
	itemId: string | null | undefined
	disabled?: boolean
}

export default function PCBSelect({ getItem, itemId, disabled }: PCBSelectProps) {
	const { data: pcbsResult, isLoading: isPCBsLoading } = useGetPCBsQuery({})
	const pcbs = pcbsResult?.data ?? []

	if (isPCBsLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>PCB</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
				value={itemId ?? ''}
				onChange={e => {
					const pcbId = e.target.value
					const selectedPCB = pcbs?.find(p => p.id === pcbId)
					if (getItem) {
						getItem(selectedPCB?.id)
					}
				}}>
				<option value=''>No PCB</option>
				{pcbs?.map(p => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</div>
	)
}
