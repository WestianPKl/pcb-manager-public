import { useEffect, useState, useRef, type FormEvent } from 'react'
import type { CreatePCBInput } from '~/api/pcbApi'
import { showAlert } from '~/stores/application-store'
import { useAppDispatch } from '~/stores/hooks'
import type { ApiError } from '~/api/api'
import type { PCBClass } from '~/types/pcb/PCBClass'
import ProjectSelect from '~/components/project/project-select'

interface PCBFormProps {
	pcb?: PCBClass
	onSubmit: (data: CreatePCBInput, topImg?: File, bottomImg?: File) => Promise<unknown>
}

const getErrorMessage = (error: unknown): string | string[] => {
	const apiError = error as Partial<ApiError>
	if (apiError.message) return apiError.message
	return 'PCB could not be created'
}

const toPreviewUrl = (url: string) =>
	url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}/${url}`

export default function PCBForm({ pcb, onSubmit }: PCBFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [name, setName] = useState<string>('')
	const [revision, setRevision] = useState<string>('')
	const [comment, setComment] = useState<string>('')
	const [projectId, setProjectId] = useState<string | undefined>(undefined)
	const [enteredTopImg, setEnteredTopImg] = useState<File | string | undefined>(undefined)
	const [previewTopImg, setPreviewTopImg] = useState<string | undefined>(undefined)
	const [enteredBottomImg, setEnteredBottomImg] = useState<File | string | undefined>(undefined)
	const [previewBottomImg, setPreviewBottomImg] = useState<string | undefined>(undefined)
	const [isEdit, setIsEdit] = useState(false)
	const [errors, setErrors] = useState<{ name?: string; projectId?: string }>({})
	const dispatch = useAppDispatch()

	const imgPickerTopRef = useRef<HTMLInputElement | null>(null)
	const imgPickerBottomRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (pcb) {
			setName(pcb.name ?? '')
			setRevision(pcb.revision ?? '')
			setComment(pcb.comment ?? '')
			setProjectId(pcb.projectId ?? undefined)
			setEnteredTopImg(pcb.topUrl ?? '')
			setPreviewTopImg(pcb.topUrl ? toPreviewUrl(pcb.topUrl) : undefined)
			setEnteredBottomImg(pcb.bottomUrl ?? '')
			setPreviewBottomImg(pcb.bottomUrl ? toPreviewUrl(pcb.bottomUrl) : undefined)
			setIsEdit(true)
		}
	}, [pcb])

	useEffect(() => {
		if (!enteredTopImg) {
			setPreviewTopImg(undefined)
			return
		}
		if (enteredTopImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewTopImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredTopImg)
		} else if (typeof enteredTopImg === 'string' && enteredTopImg.length > 0) {
			setPreviewTopImg(toPreviewUrl(enteredTopImg))
		}
	}, [enteredTopImg])

	useEffect(() => {
		if (!enteredBottomImg) {
			setPreviewBottomImg(undefined)
			return
		}
		if (enteredBottomImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewBottomImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredBottomImg)
		} else if (typeof enteredBottomImg === 'string' && enteredBottomImg.length > 0) {
			setPreviewBottomImg(toPreviewUrl(enteredBottomImg))
		}
	}, [enteredBottomImg])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!name.trim()) {
			setErrors({ name: 'Name is required' })
			return
		}

		if (!projectId) {
			setErrors({ projectId: 'Project is required' })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			await onSubmit(
				{ name: name.trim(), revision: revision.trim(), comment: comment.trim(), projectId },
				enteredTopImg instanceof File ? enteredTopImg : undefined,
				enteredBottomImg instanceof File ? enteredBottomImg : undefined,
			)

			dispatch(
				showAlert({
					message: isEdit ? 'PCB updated successfully' : 'PCB created successfully',
					severity: 'success',
				}),
			)
		} catch (error) {
			dispatch(showAlert({ message: getErrorMessage(error), severity: 'error' }))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Name</label>
				<input
					type='text'
					placeholder='PCB name'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					aria-invalid={Boolean(errors.name)}
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
				{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Revision</label>
				<input
					type='text'
					placeholder='Revision'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={revision}
					onChange={e => setRevision(e.target.value)}
				/>
			</div>

			<div>
				<ProjectSelect getItem={setProjectId} itemId={projectId} required />
				{errors.projectId && <p className='mt-1 text-xs text-red-500'>{errors.projectId}</p>}
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Images</label>
				<div className='flex gap-3'>
					<div className='flex flex-1 flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3'>
						<input
							type='file'
							ref={imgPickerTopRef}
							className='hidden'
							accept='.jpg,.png,.jpeg'
							onChange={e => {
								const file = e.target.files?.[0]
								if (file) setEnteredTopImg(file)
							}}
						/>
						{previewTopImg ? (
							<img src={previewTopImg} alt='Top preview' className='h-24 w-24 rounded object-cover' />
						) : (
							<div className='flex h-24 w-24 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 text-center'>
								Top image
							</div>
						)}
						<button
							type='button'
							onClick={() => imgPickerTopRef.current?.click()}
							className='w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer'>
							{previewTopImg ? 'Change' : 'Upload Top'}
						</button>
					</div>
					<div className='flex flex-1 flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3'>
						<input
							type='file'
							ref={imgPickerBottomRef}
							className='hidden'
							accept='.jpg,.png,.jpeg'
							onChange={e => {
								const file = e.target.files?.[0]
								if (file) setEnteredBottomImg(file)
							}}
						/>
						{previewBottomImg ? (
							<img src={previewBottomImg} alt='Bottom preview' className='h-24 w-24 rounded object-cover' />
						) : (
							<div className='flex h-24 w-24 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 text-center'>
								Bottom image
							</div>
						)}
						<button
							type='button'
							onClick={() => imgPickerBottomRef.current?.click()}
							className='w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer'>
							{previewBottomImg ? 'Change' : 'Upload Bottom'}
						</button>
					</div>
				</div>
			</div>

			<div>
				<label className='mb-1 block text-xs font-medium text-gray-600'>Comment</label>
				<input
					type='text'
					placeholder='Comment'
					className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
					value={comment}
					onChange={e => setComment(e.target.value)}
				/>
			</div>

			<button
				type='submit'
				className='mt-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50'
				disabled={isSubmitting}>
				{isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update PCB' : 'Add PCB'}
			</button>
		</form>
	)
}
