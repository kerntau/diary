<template>
    <ModernPage
        eyebrow="Vault"
        title="银行卡保险箱"
        description="银行卡已从日记正文中拆出，独立加密保存。列表默认脱敏，查看完整卡号需要确认。"
    >
        <template #actions>
            <NButton @click="router.go(-1)">返回</NButton>
            <NButton type="primary" @click="openCreate">
                <template #icon><Plus :size="18"/></template>
                添加银行卡
            </NButton>
        </template>

        <div class="vault-layout">
            <NAlert type="info" :bordered="false">
                卡号使用服务端 `VAULT_SECRET` 加密保存。公网部署前请在 `.env` 中配置独立强密钥。
            </NAlert>

            <NSpin :show="isLoading">
                <div v-if="cards.length" class="vault-grid">
                    <article
                        v-for="card in cards"
                        :key="card.id"
                        class="vault-card"
                        :style="{ '--card-accent': card.color || '#007AFF' }"
                    >
                        <div class="vault-card-top">
                            <div>
                                <p>{{ card.cardType }}</p>
                                <h2>{{ card.bankName || '未命名银行卡' }}</h2>
                            </div>
                            <CreditCard :size="28"/>
                        </div>
                        <div class="vault-card-number">{{ displayCardNo(card) }}</div>
                        <div class="vault-card-meta">
                            <span v-if="card.branch">{{ card.branch }}</span>
                            <span v-if="card.creditLimit">额度 {{ formatMoney(card.creditLimit) }}</span>
                            <span v-if="card.repaymentDay">还款日 {{ card.repaymentDay }}</span>
                        </div>
                        <div class="vault-card-actions">
                            <NButton size="small" secondary @click="confirmReveal(card)">
                                <template #icon><Eye :size="16"/></template>
                                查看
                            </NButton>
                            <NButton size="small" secondary @click="copyCard(card)">
                                <template #icon><Copy :size="16"/></template>
                                复制
                            </NButton>
                            <NButton size="small" tertiary @click="openEdit(card)">
                                <template #icon><Pencil :size="16"/></template>
                                编辑
                            </NButton>
                            <NButton size="small" tertiary type="error" @click="confirmDelete(card)">
                                <template #icon><Trash2 :size="16"/></template>
                                删除
                            </NButton>
                        </div>
                    </article>
                </div>

                <ModernEmptyState
                    v-else
                    title="还没有银行卡"
                    description="用独立表单添加银行卡，不再通过写一篇特殊日记来维护资料。"
                    :icon="CreditCard"
                >
                    <template #actions>
                        <NButton type="primary" @click="openCreate">添加银行卡</NButton>
                    </template>
                </ModernEmptyState>
            </NSpin>
        </div>

        <NModal v-model:show="isEditorOpen" preset="card" :title="editingCard?.id ? '编辑银行卡' : '添加银行卡'" class="vault-modal">
            <NForm label-placement="top" :model="form">
                <NGrid :cols="2" :x-gap="14" :y-gap="12" responsive="screen">
                    <NFormItemGi label="银行名称">
                        <NInput v-model:value="form.bankName" placeholder="例如 招商银行"/>
                    </NFormItemGi>
                    <NFormItemGi label="卡类型">
                        <NSelect v-model:value="form.cardType" :options="cardTypeOptions"/>
                    </NFormItemGi>
                    <NFormItemGi label="卡号">
                        <NInput v-model:value="form.cardNo" placeholder="仅保存加密密文"/>
                    </NFormItemGi>
                    <NFormItemGi label="主题色">
                        <NColorPicker v-model:value="form.color" :show-alpha="false"/>
                    </NFormItemGi>
                    <NFormItemGi label="开户行">
                        <NInput v-model:value="form.branch"/>
                    </NFormItemGi>
                    <NFormItemGi label="额度">
                        <NInputNumber v-model:value="form.creditLimit" :min="0" clearable style="width: 100%"/>
                    </NFormItemGi>
                    <NFormItemGi label="账单日">
                        <NInput v-model:value="form.statementDay" placeholder="例如 每月 8 日"/>
                    </NFormItemGi>
                    <NFormItemGi label="还款日">
                        <NInput v-model:value="form.repaymentDay" placeholder="例如 每月 28 日"/>
                    </NFormItemGi>
                    <NFormItemGi label="备注" :span="2">
                        <NInput v-model:value="form.note" type="textarea" :autosize="{minRows: 3, maxRows: 6}"/>
                    </NFormItemGi>
                </NGrid>
            </NForm>
            <template #footer>
                <div class="modal-actions">
                    <NButton @click="isEditorOpen = false">取消</NButton>
                    <NButton type="primary" :loading="isSaving" :disabled="!form.bankName" @click="saveCard">保存</NButton>
                </div>
            </template>
        </NModal>
    </ModernPage>
</template>

<script lang="ts" setup>
import {computed, onMounted, reactive, ref} from "vue"
import {useRouter} from "vue-router"
import {
    NAlert,
    NButton,
    NColorPicker,
    NForm,
    NFormItemGi,
    NGrid,
    NInput,
    NInputNumber,
    NModal,
    NSelect,
    NSpin,
    useDialog,
    useMessage
} from "naive-ui"
import {Copy, CreditCard, Eye, Pencil, Plus, Trash2} from "@lucide/vue"

import vaultApi, {VaultCard, VaultCardInput} from "@/api/vaultApi"
import ModernEmptyState from "@/components/ui/ModernEmptyState.vue"
import ModernPage from "@/components/ui/ModernPage.vue"

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const cards = ref<VaultCard[]>([])
const revealedCards = ref<Record<number, string>>({})
const isLoading = ref(false)
const isSaving = ref(false)
const isEditorOpen = ref(false)
const editingCard = ref<VaultCard | null>(null)

const form = reactive<VaultCardInput>({
    bankName: '',
    cardType: '储蓄卡',
    cardNo: '',
    branch: '',
    statementDay: '',
    repaymentDay: '',
    creditLimit: 0,
    note: '',
    color: '#007AFF',
})

const cardTypeOptions = [
    {label: '储蓄卡', value: '储蓄卡'},
    {label: '信用卡', value: '信用卡'},
    {label: '虚拟卡', value: '虚拟卡'},
    {label: '其他', value: '其他'},
]

onMounted(loadCards)

async function loadCards() {
    isLoading.value = true
    try {
        const res = await vaultApi.list(false)
        cards.value = res.data
    } catch (err: any) {
        message.error(err?.message || '读取银行卡失败')
    } finally {
        isLoading.value = false
    }
}

function resetForm(card?: VaultCard) {
    editingCard.value = card || null
    Object.assign(form, {
        bankName: card?.bankName || '',
        cardType: card?.cardType || '储蓄卡',
        cardNo: '',
        branch: card?.branch || '',
        statementDay: card?.statementDay || '',
        repaymentDay: card?.repaymentDay || '',
        creditLimit: card?.creditLimit || 0,
        note: card?.note || '',
        color: card?.color || '#007AFF',
    })
}

function openCreate() {
    resetForm()
    isEditorOpen.value = true
}

function openEdit(card: VaultCard) {
    resetForm(card)
    isEditorOpen.value = true
}

async function saveCard() {
    isSaving.value = true
    try {
        if (editingCard.value?.id) {
            await vaultApi.update({...form, id: editingCard.value.id})
        } else {
            await vaultApi.add(form)
        }
        message.success('银行卡已保存')
        isEditorOpen.value = false
        await loadCards()
    } catch (err: any) {
        message.error(err?.message || '保存失败')
    } finally {
        isSaving.value = false
    }
}

function confirmReveal(card: VaultCard) {
    dialog.warning({
        title: '查看完整卡号',
        content: '完整卡号属于敏感信息，确认后本次页面会临时显示。',
        positiveText: '确认查看',
        negativeText: '取消',
        onPositiveClick: () => revealCard(card.id),
    })
}

async function revealCard(id: number) {
    try {
        const res = await vaultApi.list(true)
        const card = res.data.find(item => item.id === id)
        if (card?.cardNo) {
            revealedCards.value[id] = card.cardNo
            message.success('完整卡号已临时显示')
        }
    } catch (err: any) {
        message.error(err?.message || '查看失败')
    }
}

async function copyCard(card: VaultCard) {
    const value = revealedCards.value[card.id] || card.cardNoMasked
    await navigator.clipboard.writeText(value.replace(/\s/g, ''))
    message.success(revealedCards.value[card.id] ? '完整卡号已复制' : '脱敏卡号已复制')
}

function confirmDelete(card: VaultCard) {
    dialog.error({
        title: '删除银行卡',
        content: `确定删除 ${card.bankName || card.cardNoMasked} 吗？`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => deleteCard(card.id),
    })
}

async function deleteCard(id: number) {
    try {
        await vaultApi.delete(id)
        message.success('银行卡已删除')
        await loadCards()
    } catch (err: any) {
        message.error(err?.message || '删除失败')
    }
}

function displayCardNo(card: VaultCard) {
    return revealedCards.value[card.id] || card.cardNoMasked
}

function formatMoney(value: number) {
    return new Intl.NumberFormat('zh-CN', {style: 'currency', currency: 'CNY', maximumFractionDigits: 0}).format(value)
}
</script>

<style scoped lang="scss">
.vault-layout{
    display: grid;
    gap: 16px;
}
.vault-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}
.vault-card{
    min-height: 190px;
    padding: 20px;
    border-radius: var(--diary-radius);
    color: white;
    background:
        linear-gradient(135deg, color-mix(in srgb, var(--card-accent) 92%, white), color-mix(in srgb, var(--card-accent) 60%, black));
    box-shadow: var(--diary-card-shadow);
}
.vault-card-top{
    display: flex;
    justify-content: space-between;
    gap: 16px;
    p{
        margin: 0 0 6px;
        opacity: .78;
        font-size: 12px;
    }
    h2{
        margin: 0;
        font-size: 22px;
        line-height: 1.2;
        color: white;
    }
}
.vault-card-number{
    margin-top: 30px;
    font-family: "JetBrainsMonoDiary", ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: clamp(19px, 4vw, 26px);
    letter-spacing: .04em;
}
.vault-card-meta{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 26px;
    margin-top: 14px;
    span{
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(255,255,255,.18);
        font-size: 12px;
    }
}
.vault-card-actions{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
}
.modal-actions{
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.vault-modal{
    max-width: 720px;
}
</style>
