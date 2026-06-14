export interface InventoryStockMovementInput {
	id?: string | undefined
	inventoryId?: string | undefined
	delta?: number | undefined
	reason?: 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined
	note?: string | undefined
	createdById?: string | undefined
	createdAt?: string | undefined
	createdBy?: string | undefined
}

export class InventoryStockMovementClass implements InventoryStockMovementInput {
	id: string | undefined
	inventoryId: string | undefined
	delta: number | undefined
	reason: 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined
	note: string | undefined
	createdById: string | undefined
	createdAt: string | undefined
	createdBy: string | undefined

	constructor(model: InventoryStockMovementInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
