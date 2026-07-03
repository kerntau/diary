<template>
    <ModernPage
        eyebrow="Finance"
        title="账单"
        description="账单已从日记分类中拆出，作为独立结构化交易保存。日记可以写感受，账单负责数据。"
    >
        <template #actions>
            <NButton @click="router.go(-1)">返回</NButton>
            <NButton type="primary" @click="openCreate">
                <template #icon><Plus :size="18"/></template>
                记一笔
            </NButton>
        </template>

        <div class="finance-layout">
            <div class="finance-metrics">
                <MetricTile label="收入" :value="formatMoney(summary?.income || 0)"/>
                <MetricTile label="支出" :value="formatMoney(summary?.expense || 0)"/>
                <MetricTile label="结余" :value="formatMoney(summary?.balance || 0)"/>
                <MetricTile label="记录数" :value="summary?.count || 0"/>
            </div>

            <section class="modern-panel">
                <div class="modern-panel-body finance-filters">
                    <NInput v-model:value="filters.keyword" clearable placeholder="搜索商户、分类、备注" @keyup.enter="loadData">
                        <template #prefix><Search :size="16"/></template>
                    </NInput>
                    <NSelect v-model:value="filters.type" clearable placeholder="类型" :options="typeOptions"/>
                    <NButton :loading="isLoading" @click="loadData">筛选</NButton>
                </div>
            </section>

            <section class="modern-panel">
                <div class="modern-panel-header">
                    <h2>交易记录</h2>
                    <p>收入和支出都在这里维护；不会再塞进日记正文。</p>
                </div>
                <div class="modern-panel-body">
                    <NDataTable
                        :loading="isLoading"
                        :columns="columns"
                        :data="transactions"
                        :pagination="{pageSize: 12}"
                    />
                </div>
            </section>
        </div>

        <NModal v-model:show="isEditorOpen" preset="card" :title="editingTransaction?.id ? '编辑账单' : '记一笔'" class="finance-modal">
            <NForm label-placement="top" :model="form">
                <NGrid :cols="2" :x-gap="14" :y-gap="12" responsive="screen">
                    <NFormItemGi label="日期">
                        <NDatePicker v-model:value="formDate" type="datetime" clearable style="width: 100%"/>
                    </NFormItemGi>
                    <NFormItemGi label="类型">
                        <NSelect v-model:value="form.type" :options="typeOptionsRequired"/>
                    </NFormItemGi>
                    <NFormItemGi label="金额">
                        <NInputNumber v-model:value="form.amount" :min="0" :precision="2" clearable style="width: 100%"/>
                    </NFormItemGi>
                    <NFormItemGi label="分类">
                        <NSelect
                            v-model:value="form.category"
                            filterable
                            tag
                            :options="categoryOptions"
                            placeholder="选择或输入分类"
                        />
                    </NFormItemGi>
                    <NFormItemGi label="账户/银行卡">
                        <NSelect
                            v-model:value="form.accountId"
                            clearable
                            :options="accountOptions"
                            placeholder="可选"
                            @update:value="syncAccountName"
                        />
                    </NFormItemGi>
                    <NFormItemGi label="商户/项目">
                        <NInput v-model:value="form.merchant" placeholder="例如 午餐、工资、地铁"/>
                    </NFormItemGi>
                    <NFormItemGi label="备注" :span="2">
                        <NInput v-model:value="form.note" type="textarea" :autosize="{minRows: 3, maxRows: 6}"/>
                    </NFormItemGi>
                </NGrid>
            </NForm>
            <template #footer>
                <div class="modal-actions">
                    <NButton @click="isEditorOpen = false">取消</NButton>
                    <NButton type="primary" :loading="isSaving" :disabled="!canSave" @click="saveTransaction">保存</NButton>
                </div>
            </template>
        </NModal>
    </ModernPage>
</template>

<script lang="ts" setup>
import {computed, h, onMounted, reactive, ref} from "vue"
import {useRouter} from "vue-router"
import {
    NButton,
    NDataTable,
    NDatePicker,
    NForm,
    NFormItemGi,
    NGrid,
    NInput,
    NInputNumber,
    NModal,
    NSelect,
    NTag,
    useDialog,
    useMessage
} from "naive-ui"
import {Pencil, Plus, Search, Trash2} from "@lucide/vue"

import financeApi, {FinanceCategories, FinanceSummary, FinanceTransaction} from "@/api/financeApi"
import vaultApi, {VaultCard} from "@/api/vaultApi"
import MetricTile from "@/components/ui/MetricTile.vue"
import ModernPage from "@/components/ui/ModernPage.vue"

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const isLoading = ref(false)
const isSaving = ref(false)
const isEditorOpen = ref(false)
const transactions = ref<FinanceTransaction[]>([])
const summary = ref<FinanceSummary | null>(null)
const categories = ref<FinanceCategories>({expense: [], income: []})
const cards = ref<VaultCard[]>([])
const editingTransaction = ref<FinanceTransaction | null>(null)
const formDate = ref<number | null>(Date.now())

const filters = reactive({
    keyword: '',
    type: null as null | 'expense' | 'income',
})

const form = reactive<Partial<FinanceTransaction>>({
    date: new Date().toISOString(),
    type: 'expense',
    amount: 0,
    category: '其他',
    accountId: '',
    accountName: '',
    merchant: '',
    note: '',
})

const typeOptions = [
    {label: '支出', value: 'expense'},
    {label: '收入', value: 'income'},
]
const typeOptionsRequired = typeOptions
const categoryOptions = computed(() => {
    const list = form.type === 'income' ? categories.value.income : categories.value.expense
    return list.map(item => ({label: item, value: item}))
})
const accountOptions = computed(() => cards.value.map(card => ({
    label: `${card.bankName || '银行卡'} ${card.cardNoMasked}`,
    value: card.id,
})))
const canSave = computed(() => Number(form.amount || 0) > 0 && !!form.category)

const columns = [
    {
        title: '日期',
        key: 'date',
        render(row: FinanceTransaction) {
            return new Date(row.date).toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})
        }
    },
    {
        title: '类型',
        key: 'type',
        render(row: FinanceTransaction) {
            return h(NTag, {type: row.type === 'income' ? 'success' : 'warning', bordered: false}, {default: () => row.type === 'income' ? '收入' : '支出'})
        }
    },
    {title: '分类', key: 'category'},
    {title: '商户/项目', key: 'merchant'},
    {
        title: '金额',
        key: 'amount',
        render(row: FinanceTransaction) {
            return h('strong', {class: row.type === 'income' ? 'money-income' : 'money-expense'}, `${row.type === 'income' ? '+' : '-'}${formatMoney(row.amount)}`)
        }
    },
    {title: '账户', key: 'accountName'},
    {
        title: '操作',
        key: 'actions',
        width: 150,
        render(row: FinanceTransaction) {
            return h('div', {class: 'table-actions'}, [
                h(NButton, {size: 'small', quaternary: true, onClick: () => openEdit(row)}, {icon: () => h(Pencil, {size: 15})}),
                h(NButton, {size: 'small', quaternary: true, type: 'error', onClick: () => confirmDelete(row)}, {icon: () => h(Trash2, {size: 15})}),
            ])
        }
    },
]

onMounted(loadInitialData)

async function loadInitialData() {
    await Promise.all([loadData(), loadCategories(), loadCards()])
}

async function loadData() {
    isLoading.value = true
    try {
        const [listRes, summaryRes] = await Promise.all([
            financeApi.list({
                keyword: filters.keyword || undefined,
                type: filters.type || undefined,
            }),
            financeApi.summary(),
        ])
        transactions.value = listRes.data
        summary.value = summaryRes.data
    } catch (err: any) {
        message.error(err?.message || '读取账单失败')
    } finally {
        isLoading.value = false
    }
}

async function loadCategories() {
    const res = await financeApi.categories()
    categories.value = res.data
}

async function loadCards() {
    const res = await vaultApi.list(false)
    cards.value = res.data
}

function resetForm(transaction?: FinanceTransaction) {
    editingTransaction.value = transaction || null
    formDate.value = transaction ? new Date(transaction.date).getTime() : Date.now()
    Object.assign(form, {
        date: transaction?.date || new Date().toISOString(),
        type: transaction?.type || 'expense',
        amount: transaction?.amount || 0,
        category: transaction?.category || '其他',
        accountId: transaction?.accountId || '',
        accountName: transaction?.accountName || '',
        merchant: transaction?.merchant || '',
        note: transaction?.note || '',
    })
}

function openCreate() {
    resetForm()
    isEditorOpen.value = true
}

function openEdit(transaction: FinanceTransaction) {
    resetForm(transaction)
    isEditorOpen.value = true
}

function syncAccountName(value: number | '') {
    const card = cards.value.find(item => item.id === value)
    form.accountName = card ? `${card.bankName} ${card.cardNoMasked}` : ''
}

async function saveTransaction() {
    isSaving.value = true
    try {
        const payload = {
            ...form,
            date: formDate.value ? new Date(formDate.value).toISOString() : new Date().toISOString(),
        }
        if (editingTransaction.value?.id) {
            await financeApi.update({...payload, id: editingTransaction.value.id})
        } else {
            await financeApi.add(payload)
        }
        message.success('账单已保存')
        isEditorOpen.value = false
        await loadData()
    } catch (err: any) {
        message.error(err?.message || '保存失败')
    } finally {
        isSaving.value = false
    }
}

function confirmDelete(row: FinanceTransaction) {
    dialog.error({
        title: '删除账单',
        content: `确定删除 ${row.merchant || row.category} ${formatMoney(row.amount)} 吗？`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => deleteTransaction(row.id),
    })
}

async function deleteTransaction(id: number) {
    try {
        await financeApi.delete(id)
        message.success('账单已删除')
        await loadData()
    } catch (err: any) {
        message.error(err?.message || '删除失败')
    }
}

function formatMoney(value: number) {
    return new Intl.NumberFormat('zh-CN', {style: 'currency', currency: 'CNY', maximumFractionDigits: 2}).format(Number(value || 0))
}
</script>

<style scoped lang="scss">
.finance-layout{
    display: grid;
    gap: 16px;
}
.finance-metrics{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}
.finance-filters{
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 160px auto;
    gap: 12px;
    align-items: center;
}
.modal-actions{
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.finance-modal{
    max-width: 760px;
}
:deep(.money-income){
    color: var(--diary-success);
}
:deep(.money-expense){
    color: var(--diary-danger);
}
:deep(.table-actions){
    display: flex;
    gap: 4px;
}
@media (max-width: 768px) {
    .finance-metrics{
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .finance-filters{
        grid-template-columns: 1fr;
    }
}
</style>
