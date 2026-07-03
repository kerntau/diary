import request from "../request.ts"
import {VaultCard} from "@/api/vaultApi"
import {FinanceTransaction} from "@/api/financeApi"

export interface LegacyMigrationPreview {
    cards: VaultCard[]
    transactions: FinanceTransaction[]
    sources: {
        cardDiaryId: number | null
        billDiaryIds: number[]
    }
}

export default {
    preview(): Promise<{success: boolean, data: LegacyMigrationPreview, message: string}> {
        return request('get', null, null, 'migration/legacy/preview', 120000) as Promise<{success: boolean, data: LegacyMigrationPreview, message: string}>
    },
    importLegacy(): Promise<{success: boolean, data: {importedCards: number, importedTransactions: number}, message: string}> {
        return request('post', null, null, 'migration/legacy/import', 120000) as Promise<{success: boolean, data: {importedCards: number, importedTransactions: number}, message: string}>
    },
}
