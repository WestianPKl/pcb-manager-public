export interface InventoryInput {
	id?: string | undefined
	name?: string | undefined
	manufacturerNumber?: string | undefined
	parameters?: JSON | undefined
	comment?: string | undefined
	lowThreshold?: number | undefined
	inventoryTypeId?: string | undefined
	inventoryPackageId?: string | undefined
	inventorySurfaceMountId?: string | undefined
	inventoryShopId?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	quantity?: number | undefined
	inventoryTypeName?: string | undefined
	inventoryPackageName?: string | undefined
	inventorySurfaceMountName?: string | undefined
	inventoryShopName?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
}

export class InventoryClass implements InventoryInput {
	id: string | undefined
	name: string | undefined
	manufacturerNumber: string | undefined
	parameters: JSON | undefined
	lowThreshold: number | undefined
	comment: string | undefined
	inventoryTypeId: string | undefined
	inventoryPackageId: string | undefined
	inventorySurfaceMountId: string | undefined
	inventoryShopId: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdById: string | undefined
	updatedById: string | undefined
	quantity: number | undefined
	inventoryTypeName: string | undefined
	inventoryPackageName: string | undefined
	inventorySurfaceMountName: string | undefined
	inventoryShopName: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined

	constructor(model: InventoryInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
