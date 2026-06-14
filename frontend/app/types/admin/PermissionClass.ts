import { UserClass } from '../user/UserClass'

export interface PermissionInput {
	id?: string | undefined
	name?: string | undefined
	functionalityId?: string | undefined
	accessLevelId?: number | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
	functionality?: string | undefined
	accessLevel?: string | undefined
	users?: UserClass[] | undefined
}

export class PermissionClass implements PermissionInput {
	id: string | undefined
	name: string | undefined
	functionalityId: string | undefined
	accessLevelId: number | undefined
	createdById: string | undefined
	updatedById: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined
	functionality: string | undefined
	accessLevel: string | undefined
	users: UserClass[] | undefined

	constructor(model: PermissionInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
