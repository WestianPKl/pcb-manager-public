export interface DeviceInput {
	id?: string | undefined
	name?: string | undefined
	serialNumber?: string | undefined
	claimToken?: string | undefined
	claimedAt?: string | undefined
	description?: string | undefined
	pcbId?: string | undefined
	pcbName?: string | undefined
	pcbRevision?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	createdById?: string | undefined
	updatedById?: string | undefined
	createdBy?: string | undefined
	updatedBy?: string | undefined
}

export class DeviceClass implements DeviceInput {
	id: string | undefined
	name: string | undefined
	serialNumber: string | undefined
	claimToken: string | undefined
	claimedAt: string | undefined
	description: string | undefined
	pcbId: string | undefined
	pcbName: string | undefined
	pcbRevision: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdById: string | undefined
	updatedById: string | undefined
	createdBy: string | undefined
	updatedBy: string | undefined

	constructor(model: DeviceInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
