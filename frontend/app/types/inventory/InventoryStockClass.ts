export interface InventoryStockInput {
	inventoryId?: string | undefined
	inventoryName?: string | undefined
	quantity?: number | undefined
	updatedAt?: string | undefined
	updatedById?: string | undefined
	updatedBy?: string | undefined
}

export class InventoryStockClass implements InventoryStockInput {
	inventoryId: string | undefined
	inventoryName: string | undefined
	quantity: number | undefined
	updatedAt: string | undefined
	updatedById: string | undefined
	updatedBy: string | undefined

	constructor(model: InventoryStockInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
