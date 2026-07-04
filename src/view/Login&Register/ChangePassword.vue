<template>
    <div class="account-page" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <section class="account-card" v-if="show" aria-labelledby="change-password-title">
                <header class="account-header">
                    <div class="account-logo">
                            <img :src="SVG_ICONS.logo_icons.logo_change_password" alt="Diary Logo">
                    </div>
                    <div>
                        <h1 id="change-password-title" class="account-title">修改密码</h1>
                        <p class="account-subtitle">保存后会退出当前登录状态</p>
                    </div>
                </header>
                <NForm class="account-body" label-placement="top" :show-require-mark="false" @submit.prevent="changePasswordSubmit">
                    <NFormItem label="新密码">
                        <NInput v-model:value="password1" input-id="password1" type="password" show-password-on="click"/>
                    </NFormItem>
                    <NFormItem
                        label="确认密码"
                        :validation-status="passwordVerified || password2.length < 1 ? undefined : 'error'"
                        :feedback="passwordVerified || password2.length < 1 ? undefined : labelCheckPassword"
                    >
                        <NInput v-model:value="password2" input-id="password2" type="password" show-password-on="click"/>
                    </NFormItem>
                </NForm>
                <footer class="account-actions">
                    <NButton secondary @click="router.go(-1)">返回</NButton>
                    <NButton type="primary" :disabled="!passwordVerified" @click.prevent="changePasswordSubmit">确定修改</NButton>
                </footer>
                <div class="account-links">
                    <RouterLink to="/login">登录</RouterLink>
                </div>
            </section>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import userApi from "@/api/userApi.ts"

import {deleteAuthorization, popMessage} from "@/utility.ts";
import {useProjectStore} from "@/pinia/useProjectStore.ts";
const projectStore = useProjectStore()
import {computed, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {NButton, NForm, NFormItem, NInput} from "naive-ui";

const router = useRouter()


const show = ref(false)
const labelCheckPassword = ref("再次确认密码")
const password1 = ref("")
const password2 = ref("")

onMounted(()=>{
    show.value = true
    document.title = '日记 - 修改密码' // 变更标题
})


function changePasswordSubmit() {
    if (passwordVerified) {
        let requestData = {
            password: password1.value,
        }
        userApi
            .changePassword(requestData)
            .then(res => {
                popMessage('success', `${res.message}，正在前往登录`, () => {
                    deleteAuthorization()
                    router.go(-1)
                }, 2)
            })
            .catch(err => {
                popMessage('danger', err.message, () => {}, 3)
            })
    }
}

watch(password2, () => {
    if (passwordVerified.value) {
        labelCheckPassword.value = "再次确认密码"
    } else {
        labelCheckPassword.value = "两次密码不一致"
    }
})

const passwordVerified  = computed(()=>{
    return (password1.value.length > 0 && password1.value === password2.value)
})
</script>

<style scoped lang="scss">
@use "account-page" as *;
</style>
