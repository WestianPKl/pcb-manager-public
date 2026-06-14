export interface ProductionOrderItemsInput {
	id?: string | undefined
	productionOrderId?: string | undefined
	inventoryId?: string | undefined
	inventoryName?: string | undefined
	qtyPerBoard?: number | undefined
	requiredQtyTotal?: number | undefined
	consumedQty?: number | undefined
	allowSubstitute?: boolean | undefined
	designators?: string | undefined
	status?: 'ok' | 'low' | 'missing' | undefined
}

export class ProductionOrderItemsClass implements ProductionOrderItemsInput {
	id: string | undefined
	productionOrderId: string | undefined
	inventoryId: string | undefined
	inventoryName: string | undefined
	qtyPerBoard: number | undefined
	requiredQtyTotal: number | undefined
	consumedQty: number | undefined
	allowSubstitute: boolean | undefined
	designators: string | undefined
	status: 'ok' | 'low' | 'missing' | undefined

	constructor(model: ProductionOrderItemsInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
