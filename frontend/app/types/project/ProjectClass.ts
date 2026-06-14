export interface ProjectInput {
	id?: string | undefined
	name?: string | undefined
	description?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
}

export class ProjectClass implements ProjectInput {
	id: string | undefined
	name: string | undefined
	description: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdById: string | undefined
	updatedById: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined

	constructor(model: ProjectInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
