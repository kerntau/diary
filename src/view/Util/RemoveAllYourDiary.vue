<template>
    <div class="account-page" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <section class="account-card danger" v-if="show" aria-labelledby="remove-diaries-title">
                <header class="account-header">
                    <div class="account-logo">
                            <img v-if="userInfo?.avatar" :src="userInfo.avatar + '-' + projectConfig.qiniu_style_suffix || SVG_ICONS.logo_icons.logo_rounded" alt="Avatar">
                            <img v-else :src="SVG_ICONS.logo_icons.logo_avatar" alt="Avatar">
                    </div>
                    <div>
                        <h1 id="remove-diaries-title" class="account-title">清空所有日记</h1>
                        <p class="account-subtitle">这是不可恢复的危险操作</p>
                    </div>
                </header>
                <div class="danger-summary">
                    <p>你的所有日记都将被删除。</p>
                    <p>总计 <strong>{{ useStatisticStore().statisticsCategory.amount }}</strong> 篇，共享日记 <strong>{{ useStatisticStore().statisticsCategory.shared }}</strong> 篇。</p>
                </div>
                <footer class="account-actions">
                    <NButton secondary @click="router.go(-1)">取消</NButton>
                    <NButton type="error" @click.prevent="removeAllDiaries">确认清空所有日记</NButton>
                </footer>
            </section>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import diaryApi from "@/api/diaryApi.ts";
import {getAuthorization, popMessage} from "@/utility.ts";
import {computed, onMounted, ref} from "vue";
import {useProjectStore} from "@/pinia/useProjectStore.ts";
import {useSystemConfigStore} from "@/pinia/useSystemConfigStore.ts";
import {useRouter} from "vue-router";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {useStatisticStore} from "@/pinia/useStatisticStore.ts";
import {NButton} from "naive-ui";
const projectStore = useProjectStore()
const systemConfigStore = useSystemConfigStore()
const router = useRouter()

const show = ref(false)
const userInfo = getAuthorization()
const projectConfig = computed(() => systemConfigStore.config)

onMounted(()=>{
    show.value = true
    document.title = '日记 - 清空日记' // 变更标题
})

function removeAllDiaries() {
    diaryApi
        .clear()
        .then(res => {
            popMessage('success', res.message, ()=>{
                router.push({name: 'List'})
            }, 2)
        })
        .catch(err => {
            popMessage('danger', err.message, ()=>{
            }, 3)
        })
}
</script>

<style scoped lang="scss">
@use "../Login&Register/account-page" as *;
</style>
