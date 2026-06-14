import { PermissionClass } from '../admin/PermissionClass'

export interface UserPublic {
	id?: string | undefined
	username?: string | undefined
	email?: string | undefined
	name?: string | undefined
	surname?: string | undefined
	avatar?: string | undefined
	avatarBig?: string | undefined
	permissions?: PermissionClass[]
}

export interface UserInput extends UserPublic {
	password?: string | undefined
}

export class UserClass implements UserInput {
	id: string | undefined
	username: string | undefined
	email: string | undefined
	password?: string | undefined
	name: string | undefined
	surname: string | undefined
	avatar: string | undefined
	avatarBig: string | undefined
	permissions: PermissionClass[] | undefined

	constructor(model: UserInput = {}) {
		Object.assign(this, model)

		if (model.permissions) {
			this.permissions = model.permissions.map(permission => new PermissionClass(permission))
		}
	}
}
