import request from "../request.ts"

export interface FinanceTransaction {
    id: number
    date: string
    type: 'expense' | 'income'
    amount: number
    category: string
    accountId?: number | ''
    accountName: string
    merchant: string
    note: string
    createdAt: string
    updatedAt: string
    migratedFrom?: string
}

export interface FinanceSummary {
    income: number
    expense: number
    balance: number
    count: number
    months: Array<{month: string, income: number, expense: number, count: number}>
}

export interface FinanceCategories {
    expense: string[]
    income: string[]
}

export default {
    list(params: {type?: string, keyword?: string, from?: string, to?: string} = {}): Promise<{success: boolean, data: FinanceTransaction[], message: string}> {
        return request('get', params, null, 'finance/transactions') as Promise<{success: boolean, data: FinanceTransaction[], message: string}>
    },
    add(transaction: Partial<FinanceTransaction>): Promise<{success: boolean, data: FinanceTransaction, message: string}> {
        return request('post', null, transaction, 'finance/transactions') as Promise<{success: boolean, data: FinanceTransaction, message: string}>
    },
    update(transaction: Partial<FinanceTransaction> & {id: number}): Promise<{success: boolean, data: FinanceTransaction, message: string}> {
        return request('patch', null, transaction, 'finance/transactions') as Promise<{success: boolean, data: FinanceTransaction, message: string}>
    },
    delete(id: number): Promise<{success: boolean, data: null, message: string}> {
        return request('delete', null, {id}, 'finance/transactions') as Promise<{success: boolean, data: null, message: string}>
    },
    summary(): Promise<{success: boolean, data: FinanceSummary, message: string}> {
        return request('get', null, null, 'finance/summary') as Promise<{success: boolean, data: FinanceSummary, message: string}>
    },
    categories(): Promise<{success: boolean, data: FinanceCategories, message: string}> {
        return request('get', null, null, 'finance/categories') as Promise<{success: boolean, data: FinanceCategories, message: string}>
    },
    saveCategories(categories: FinanceCategories): Promise<{success: boolean, data: FinanceCategories, message: string}> {
        return request('patch', null, categories, 'finance/categories') as Promise<{success: boolean, data: FinanceCategories, message: string}>
    },
}
