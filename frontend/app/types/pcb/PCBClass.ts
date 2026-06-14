export interface PCBInput {
	id?: string | undefined
	projectId?: string | undefined
	projectName?: string | undefined
	name?: string | undefined
	revision?: string | undefined
	topUrl?: string | undefined
	bottomUrl?: string | undefined
	comment?: string | undefined
	verified?: boolean | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
}

export class PCBClass implements PCBInput {
	id: string | undefined
	projectId: string | undefined
	projectName: string | undefined
	name: string | undefined
	revision: string | undefined
	topUrl: string | undefined
	bottomUrl: string | undefined
	comment: string | undefined
	verified: boolean | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdById: string | undefined
	updatedById: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined

	constructor(model: PCBInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
