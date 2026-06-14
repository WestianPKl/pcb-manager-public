export interface InventoryTypeInput {
	id?: string | undefined
	name?: string | undefined
}

export class InventoryTypeClass implements InventoryTypeInput {
	id: string | undefined
	name: string | undefined

	constructor(model: InventoryTypeInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
