<template>
    <div class="setup-page">
        <main class="setup-shell">
            <header class="setup-header">
                <div class="setup-logo">
                    <img :src="SVG_ICONS.logo_icons.logo_init" alt="Diary Logo Init">
                </div>
                <div>
                    <h1>安装引导</h1>
                    <p>完成数据库配置与初始化，后续项目配置请到系统配置页维护。</p>
                </div>
            </header>

            <NCard v-if="isLoadingStatus" class="setup-panel" :bordered="false">
                <NSkeleton text :repeat="3"/>
            </NCard>

            <template v-else>
                <NCard class="setup-panel" :bordered="false">
                    <template #header>
                        <div class="setup-panel-title">
                            <Database :size="18"/>
                            当前状态
                        </div>
                    </template>
                    <div class="status-row">
                        <NTag :type="status.isInitialized ? 'success' : 'warning'" :bordered="false">
                            {{ status.isInitialized ? '已初始化' : '未初始化' }}
                        </NTag>
                        <span>初始化后会生成锁文件 <code>{{ status.lockFileName }}</code>。</span>
                    </div>
                    <p class="setup-note">
                        如果后续需要重新执行初始化，请先删除后台根目录中的 <code>{{ status.lockFileName }}</code> 文件。
                    </p>
                </NCard>

                <NCard class="setup-panel" v-if="!status.isInitialized" :bordered="false">
                    <template #header>
                        <div class="setup-panel-title">
                            <Settings2 :size="18"/>
                            数据库配置
                        </div>
                    </template>
                    <NForm label-placement="top" :show-require-mark="false" @submit.prevent="saveConfig">
                        <NGrid :cols="2" :x-gap="14" :y-gap="8" responsive="screen">
                            <NFormItemGi label="主机">
                                <NInput id="db-host" v-model:value="databaseConfig.host"/>
                            </NFormItemGi>
                            <NFormItemGi label="用户名">
                                <NInput id="db-user" v-model:value="databaseConfig.user"/>
                            </NFormItemGi>
                            <NFormItemGi label="密码">
                                <NInput id="db-password" v-model:value="databaseConfig.password" type="password" show-password-on="click"/>
                            </NFormItemGi>
                            <NFormItemGi label="端口">
                                <NInputNumber id="db-port" v-model:value="databaseConfig.port" :min="1" style="width: 100%"/>
                            </NFormItemGi>
                            <NFormItemGi label="时区" :span="2">
                                <NInput id="db-timezone" v-model:value="databaseConfig.timezone" placeholder="可留空"/>
                            </NFormItemGi>
                        </NGrid>
                        <div class="setup-actions">
                            <NButton
                                type="primary"
                                attr-type="submit"
                                :loading="isSavingConfig"
                                :disabled="!isConfigValid"
                            >
                                保存配置
                            </NButton>
                        </div>
                    </NForm>

                    <NAlert class="setup-alert" type="info" :bordered="false">
                        会同步写入：<code>{{ status.configFiles.join('、') }}</code>
                    </NAlert>
                    <NAlert v-if="saveMessage" class="setup-alert" type="success" :bordered="false">
                        {{ saveMessage }}
                    </NAlert>
                </NCard>

                <NCard class="setup-panel" v-if="!status.isInitialized" :bordered="false">
                    <template #header>
                        <div class="setup-panel-title">
                            <RefreshCw :size="18"/>
                            重启说明
                        </div>
                    </template>
                    <div class="restart-list">
                        <p v-for="tip in status.restartTips" :key="tip">{{ tip }}</p>
                    </div>
                </NCard>

                <NCard class="setup-panel" :bordered="false">
                    <template #header>
                        <div class="setup-panel-title">
                            <Rocket :size="18"/>
                            {{ status.isInitialized ? '初始化结果' : '初始化数据库' }}
                        </div>
                    </template>
                    <NAlert v-if="!status.isInitialized" type="warning" :bordered="false">
                        <p>
                            初始化会清空原有 <code>diary</code> 数据库内容。
                        </p>
                        <p>
                            初始化会创建 <code>diary</code> 数据库，并写入基础表结构。首次注册的用户会自动成为管理员。
                        </p>
                    </NAlert>
                    <NAlert
                        v-if="initMessage"
                        class="setup-alert"
                        :type="isInitSuccess ? 'success' : 'error'"
                        :bordered="false"
                    >
                        {{ initMessage }}
                    </NAlert>
                    <div class="setup-actions" v-if="!status.isInitialized">
                        <NButton
                            type="primary"
                            :loading="isInitializing"
                            :disabled="isInitializing"
                            @click="runInit"
                        >
                            开始初始化
                        </NButton>
                    </div>
                    <div class="setup-actions" v-else>
                        <NButton type="primary" @click="goToRegister">前往注册</NButton>
                    </div>
                </NCard>
            </template>
        </main>
    </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, reactive, ref} from "vue"
import {useRouter} from "vue-router"

import setupApi from "@/api/setupApi"
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts"
import {useProjectStore} from "@/pinia/useProjectStore"
import {useStatisticStore} from "@/pinia/useStatisticStore"
import {deleteAuthorization, getAuthorization, popMessage} from "@/utility"
import {
    NAlert,
    NButton,
    NCard,
    NForm,
    NFormItemGi,
    NGrid,
    NInput,
    NInputNumber,
    NSkeleton,
    NTag
} from "naive-ui"
import {Database, RefreshCw, Rocket, Settings2} from "@lucide/vue"

const projectStore = useProjectStore()
const statisticStore = useStatisticStore()

const router = useRouter()

interface SetupStatus {
    isInitialized: boolean
    lockFileName: string
    configFiles: string[]
    restartTips: string[]
}

const isLoadingStatus = ref(true)
const isSavingConfig = ref(false)
const isInitializing = ref(false)
const saveMessage = ref('')
const initMessage = ref('')
const isInitSuccess = ref(false)

const status = reactive<SetupStatus>({
    isInitialized: false,
    lockFileName: 'DATABASE_LOCK',
    configFiles: [],
    restartTips: []
})

const databaseConfig = reactive({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    timezone: ''
})

const isConfigValid = computed(() => {
    return databaseConfig.host.trim().length > 0 &&
        databaseConfig.user.trim().length > 0 &&
        Number.isInteger(Number(databaseConfig.port)) &&
        Number(databaseConfig.port) > 0
})

onMounted(() => {
    document.title = '日记 - 安装引导'
    loadStatus()
})

function applyStatusResponse(responseData: Awaited<ReturnType<typeof setupApi.status>>['data']) {
    status.isInitialized = responseData.isInitialized
    status.lockFileName = responseData.lockFileName
    status.configFiles = responseData.configFiles
    status.restartTips = responseData.restartTips

    if (responseData.config) {
        Object.assign(databaseConfig, responseData.config.databaseConfig)
    }
}

function clearLocalSessionIfSetupNotInitialized(isInitialized: boolean) {
    if (isInitialized || !getAuthorization()) {
        return
    }
    deleteAuthorization()
    statisticStore.removeCategoryAllFromLocalStorage()
    projectStore.isMenuShowed = false
}

function loadStatus() {
    isLoadingStatus.value = true
    setupApi
        .status()
        .then(res => {
            applyStatusResponse(res.data)
            clearLocalSessionIfSetupNotInitialized(res.data.isInitialized)
        })
        .catch(err => {
            const message = err?.message || '读取安装状态失败'
            popMessage('danger', message, undefined, 4)
        })
        .finally(() => {
            isLoadingStatus.value = false
        })
}

function saveConfig() {
    if (!isConfigValid.value || isSavingConfig.value) {
        return
    }

    isSavingConfig.value = true
    saveMessage.value = ''
    setupApi
        .saveConfig({
            databaseConfig: {
                host: databaseConfig.host.trim(),
                user: databaseConfig.user.trim(),
                password: databaseConfig.password,
                port: Number(databaseConfig.port),
                timezone: databaseConfig.timezone.trim()
            }
        })
        .then(res => {
            saveMessage.value = res.message
            popMessage('success', res.message)
            applyStatusResponse({
                ...status,
                config: res.data
            })
        })
        .catch(err => {
            const message = err?.message || '保存配置失败'
            popMessage('danger', message)
        })
        .finally(() => {
            isSavingConfig.value = false
        })
}

function runInit() {
    if (isInitializing.value) {
        return
    }

    isInitializing.value = true
    initMessage.value = ''
    setupApi
        .init()
        .then(res => {
            status.isInitialized = true
            initMessage.value = `${res.message}，已创建锁文件 ${res.data.lockFileName}。`
            isInitSuccess.value = res.success
            if (!isInitSuccess.value) {
                popMessage('danger', res.message, undefined, 2)
            } else {
                popMessage('success', res.message)
            }
        })
        .catch(err => {
            const message = err?.message || '初始化失败'
            initMessage.value = message
            popMessage('danger', message, undefined, 2)
        })
        .finally(() => {
            isInitializing.value = false
        })
}

function goToRegister() {
    window.dispatchEvent(new Event('setup-completed'))
    router.replace({name: 'Register'})
}
</script>

<style scoped lang="scss">
@use "setup-wizard" as *;
</style>
