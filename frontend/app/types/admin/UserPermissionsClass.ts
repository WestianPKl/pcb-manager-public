export interface UserPermissionClassInput {
	userId?: string | undefined
	permissionId?: string | undefined
}

export class UserPermissionClass implements UserPermissionClassInput {
	userId: string | undefined
	permissionId: string | undefined

	constructor(model: UserPermissionClassInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
