export interface InventoryPackageInput {
	id?: string | undefined
	name?: string | undefined
}

export class InventoryPackageClass implements InventoryPackageInput {
	id: string | undefined
	name: string | undefined

	constructor(model: InventoryPackageInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
