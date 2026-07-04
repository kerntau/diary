<template>
    <div class="account-page" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <section class="account-card danger" v-if="show" aria-labelledby="destroy-account-title">
                <header class="account-header">
                    <div class="account-logo">
                            <img v-if="userInfo?.avatar" :src="userInfo.avatar + '-' + projectConfig.qiniu_style_suffix || SVG_ICONS.logo_icons.logo_rounded" alt="Avatar">
                            <img v-else :src="SVG_ICONS.logo_icons.logo_avatar" alt="Avatar">
                    </div>
                    <div>
                        <h1 id="destroy-account-title" class="account-title">注销账号</h1>
                        <p class="account-subtitle">这是不可恢复的危险操作</p>
                    </div>
                </header>
                <div class="danger-summary">
                    <p>该账号的所有内容都将被删除。</p>
                    <p><strong>确认前请确保已经完成备份。</strong></p>
                </div>
                <footer class="account-actions">
                    <NButton secondary @click="router.go(-1)">取消</NButton>
                    <NButton type="error" @click.prevent="destroyAccount">确认注销账号</NButton>
                </footer>
            </section>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import {deleteAuthorization, removeDiaryConfig, getAuthorization, popMessage} from "@/utility.ts";
import {computed, onMounted, ref} from "vue";
import {useProjectStore} from "@/pinia/useProjectStore.ts";
import {useSystemConfigStore} from "@/pinia/useSystemConfigStore.ts";
import {useRouter} from "vue-router";
import userApi from "@/api/userApi.ts";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {NButton} from "naive-ui";

const projectStore = useProjectStore()
const systemConfigStore = useSystemConfigStore()
const router = useRouter()

const show = ref(false)
const userInfo = getAuthorization()
const projectConfig = computed(() => systemConfigStore.config)

onMounted(()=>{
    show.value = true
    document.title = '日记 - 注销账号' // 变更标题
})

function destroyAccount() {
    userApi
        .destroyAccount()
        .then(res => {
            deleteAuthorization()
            removeDiaryConfig()
            popMessage('success', '注销成功，3 秒后跳转到登录页面', ()=>{
                router.push({name: 'Login'})
            }, 3)
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
