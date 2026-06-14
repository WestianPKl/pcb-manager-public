import { useGetProjectsQuery } from '~/api/projectApi'
import LoadingSpinner from '~/components/ui/loading-spinner'

interface ProjectSelectProps {
	getItem?: (itemId: string | undefined) => void
	itemId: string | undefined
	disabled?: boolean
	required?: boolean
}

export default function ProjectSelect({ getItem, itemId, disabled, required }: ProjectSelectProps) {
	const { data: projectsResult, isLoading } = useGetProjectsQuery({ limit: 100 })
	const projects = projectsResult?.data ?? []

	if (isLoading) {
		return <LoadingSpinner />
	}

	return (
		<div>
			<label className='mb-1 block text-xs font-medium text-gray-600'>
				Project{required && <span className='ml-0.5 text-red-500'>*</span>}
			</label>
			<select
				className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:opacity-50'
				value={itemId ?? ''}
				disabled={disabled}
				onChange={e => getItem?.(e.target.value || undefined)}>
				<option value=''>— Select project —</option>
				{projects.map(p => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</div>
	)
}
