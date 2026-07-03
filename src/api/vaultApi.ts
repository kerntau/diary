import request from "../request.ts"

export interface VaultCard {
    id: number
    bankName: string
    cardType: string
    cardNo?: string
    cardNoMasked: string
    cardNoLast4: string
    branch: string
    statementDay: string | number
    repaymentDay: string | number
    creditLimit: number
    note: string
    color: string
    createdAt: string
    updatedAt: string
    migratedFrom?: string
}

export type VaultCardInput = Partial<VaultCard> & {
    cardNo?: string
}

export default {
    list(reveal = false): Promise<{success: boolean, data: VaultCard[], message: string}> {
        return request('get', {reveal: reveal ? 1 : 0}, null, 'vault/cards') as Promise<{success: boolean, data: VaultCard[], message: string}>
    },
    add(card: VaultCardInput): Promise<{success: boolean, data: VaultCard, message: string}> {
        return request('post', null, card, 'vault/cards') as Promise<{success: boolean, data: VaultCard, message: string}>
    },
    update(card: VaultCardInput & {id: number}): Promise<{success: boolean, data: VaultCard, message: string}> {
        return request('patch', null, card, 'vault/cards') as Promise<{success: boolean, data: VaultCard, message: string}>
    },
    delete(id: number): Promise<{success: boolean, data: null, message: string}> {
        return request('delete', null, {id}, 'vault/cards') as Promise<{success: boolean, data: null, message: string}>
    },
}
