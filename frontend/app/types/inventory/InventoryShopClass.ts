export interface InventoryShopInput {
	id?: string | undefined
	name?: string | undefined
}

export class InventoryShopClass implements InventoryShopInput {
	id: string | undefined
	name: string | undefined

	constructor(model: InventoryShopInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
