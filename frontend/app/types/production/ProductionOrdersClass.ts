export interface ProductionOrdersInput {
	id?: string | undefined
	pcbId?: string | undefined
	pcbName?: string | undefined
	pcbRevision?: string | undefined
	quantity?: number | undefined
	status?: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
}

export class ProductionOrdersClass implements ProductionOrdersInput {
	id: string | undefined
	pcbId: string | undefined
	pcbName: string | undefined
	pcbRevision: string | undefined
	quantity: number | undefined
	status: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdById: string | undefined
	updatedById: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined

	constructor(model: ProductionOrdersInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
