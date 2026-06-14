export interface InventorySurfaceMountInput {
	id?: string | undefined
	name?: string | undefined
}

export class InventorySurfaceMountClass implements InventorySurfaceMountInput {
	id: string | undefined
	name: string | undefined

	constructor(model: InventorySurfaceMountInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
