export interface PCBBomItemsInput {
	id?: string | undefined
	pcbId?: string | undefined
	inventoryId?: string | undefined
	inventoryName?: string | undefined
	qtyPerBoard?: number | undefined
	designators?: string | undefined
	valueSpec?: string | undefined
	allowSubstitutes?: boolean | undefined
	comment?: string | undefined
}

export class PCBBomItemsClass implements PCBBomItemsInput {
	id: string | undefined
	pcbId: string | undefined
	inventoryId: string | undefined
	inventoryName: string | undefined
	qtyPerBoard: number | undefined
	designators: string | undefined
	valueSpec: string | undefined
	allowSubstitutes: boolean | undefined
	comment: string | undefined

	constructor(model: PCBBomItemsInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
