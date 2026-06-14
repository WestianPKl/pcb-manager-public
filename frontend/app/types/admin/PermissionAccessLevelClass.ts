export interface PermissionAccessLevelInput {
	id?: string | undefined
	accessLevel?: number | undefined
	name?: string | undefined
}

export class PermissionAccessLevelClass implements PermissionAccessLevelInput {
	id: string | undefined
	accessLevel: number | undefined
	name: string | undefined

	constructor(model: PermissionAccessLevelInput = {}) {
		if (model) {
			Object.assign(this, model)
			this.id = model.accessLevel?.toString()
		}
	}
}
