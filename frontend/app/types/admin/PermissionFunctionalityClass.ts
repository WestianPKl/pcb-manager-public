export interface PermissionFunctionalityInput {
	id?: string | undefined
	name?: string | undefined
	description?: string | undefined
}

export class PermissionFunctionalityClass implements PermissionFunctionalityInput {
	id: string | undefined
	name: string | undefined
	description: string | undefined

	constructor(model: PermissionFunctionalityInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
