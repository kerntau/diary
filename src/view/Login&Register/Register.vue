<template>
    <div class="account-page" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <section class="account-card" v-if="show" aria-labelledby="register-title">
                <header class="account-header">
                    <div class="account-logo">
                        <img :src="SVG_ICONS.logo_icons.logo_register" alt="Diary Logo">
                    </div>
                    <div>
                        <h1 id="register-title" class="account-title">注册</h1>
                        <p class="account-subtitle">创建你的私人日记账户</p>
                    </div>
                </header>
                <div class="account-tip" v-if="projectConfig.register_tip">
                    <RegisterTip :html-content="projectConfig.register_tip"/>
                </div>

                <NForm class="account-body" label-placement="top" :show-require-mark="false" @submit.prevent="regSubmit">
                    <NFormItem
                        label="邀请码"
                        :validation-status="invitationVerified ? undefined : 'error'"
                        :feedback="invitationVerified ? (!isInvitationRequired ? '首个注册用户可留空，并将自动成为管理员。' : undefined) : labelInvitation"
                    >
                        <NInput
                            v-model:value="invitationCode"
                            input-id="invitation"
                            :placeholder="isInvitationRequired ? '输入邀请码' : '首个注册用户可留空'"
                        />
                    </NFormItem>
                    <NFormItem label="昵称" :validation-status="nicknameVerified ? undefined : 'error'" :feedback="nicknameVerified ? undefined : labelUsername">
                        <NInput v-model:value="nickname" input-id="nickname" placeholder="你的日记署名"/>
                    </NFormItem>
                    <NFormItem label="邮箱" :validation-status="emailVerified ? undefined : 'error'" :feedback="emailVerified ? undefined : labelEmail">
                        <NInput v-model:value="email" input-id="email" placeholder="name@example.com"/>
                    </NFormItem>
                    <NFormItem label="密码" :validation-status="password1Verified ? undefined : 'error'" :feedback="password1Verified ? undefined : labelPassword1">
                        <NInput v-model:value="password1" input-id="password1" type="password" show-password-on="click"/>
                    </NFormItem>
                    <NFormItem label="确认密码" :validation-status="password2Verified ? undefined : 'error'" :feedback="password2Verified ? undefined : labelPassword2">
                        <NInput v-model:value="password2" input-id="password2" type="password" show-password-on="click"/>
                    </NFormItem>
                </NForm>
                <footer class="account-actions">
                    <NButton type="primary" block :disabled="!verified" @click.prevent="regSubmit">注册</NButton>
                </footer>
                <div class="account-links">
                    <RouterLink to="/login">已有账户，去登录</RouterLink>
                </div>
            </section>
        </transition>
    </div>
</template>


<script lang="ts" setup>
import userApi from "@/api/userApi.ts"
import RegisterTip from "./RegisterTip.vue";

import {useProjectStore} from "@/pinia/useProjectStore.ts";
import {useSystemConfigStore} from "@/pinia/useSystemConfigStore.ts";
const projectStore = useProjectStore()
const systemConfigStore = useSystemConfigStore()
import {computed, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {popMessage} from "@/utility.ts";
import {UserRegisterEntity} from "@/entity/User.ts";
import setupApi from "@/api/setupApi.ts";
import {NButton, NForm, NFormItem, NInput} from "naive-ui";

const router = useRouter()
const projectConfig = computed(() => systemConfigStore.config)

const show = ref(false)

const labelInvitation = ref('邀请码')
const labelEmail = ref('邮箱')
const labelPassword1 = ref('密码')
const labelPassword2 = ref('再次确认密码')
const labelUsername = ref('昵称')
const nickname = ref('')
const email = ref('')
const password1 = ref('')
const password2 = ref('')
const invitationCode=  ref('')
const invitationVerified=  ref(false)
const nicknameVerified=  ref(false)
const emailVerified=  ref(false)
const password1Verified=  ref(false)
const password2Verified=  ref(false)
const isInvitationRequired = ref(true)


onMounted(()=>{
    show.value = true
    document.title = '日记 - 注册' // 变更标题
    setupApi
        .status()
        .then(res => {
            isInvitationRequired.value = res.data.hasRegisteredUsers
        })
        .catch(() => {
            isInvitationRequired.value = true
        })
})

const verified = computed(()=> {
    return emailVerified.value
        && nicknameVerified.value
        && password1Verified.value
        && password2Verified.value
})

function  regSubmit() {
    if (verified.value) {
        let requestData: UserRegisterEntity = {
            nickname: nickname.value,
            invitationCode: invitationCode.value,
            email: email.value,
            password: password1.value,
        }

        userApi
            .register(requestData)
            .then(res => {
                popMessage('success', `${res.message}，正在前往登录`, () => router.push({name: 'Login'}))}, 5)
            .catch(err => {
                popMessage('danger', err.message, ()=>{}, 5)
            })
    }
}

watch(invitationCode, () => {
    if (!isInvitationRequired.value || invitationCode.value.length > 0) {
        labelInvitation.value = "邀请码"
        invitationVerified.value = true
    } else {
        labelInvitation.value = "邀请码不能为空"
        invitationVerified.value = false
    }
})

watch(isInvitationRequired, () => {
    if (!isInvitationRequired.value || invitationCode.value.length > 0) {
        labelInvitation.value = "邀请码"
        invitationVerified.value = true
    } else {
        labelInvitation.value = "邀请码不能为空"
        invitationVerified.value = false
    }
}, {immediate: true})
watch(nickname, () => {
    if (nickname.value.length > 0) {
        labelUsername.value = "昵称"
        nicknameVerified.value = true
    } else {
        labelUsername.value = "昵称不能为空"
        nicknameVerified.value = false
    }
})
watch(email, () => {
    if (/(\w|\d)+@(\w|\d)+\.\w+/i.test(email.value)) {
        labelEmail.value = "邮箱"
        emailVerified.value = true
    } else {
        labelEmail.value = "输入的邮箱不正确，请重新输入"
        emailVerified.value = false
    }
})
watch(password1, () => {
    if (password1.value.length > 0) {
        labelPassword1.value = "密码"
        password1Verified.value = true
    } else {
        labelPassword1.value = "密码不能为空"
        password1Verified.value = false
    }
})
watch(password2, () => {
    if (password1.value === password2.value && password1Verified.value) {
        labelPassword2.value = "再次确认密码"
        password2Verified.value = true
    } else {
        labelPassword2.value = "两次密码不一致"
        password2Verified.value = false
    }
})
</script>

<style scoped lang="scss">
@use "account-page" as *;
</style>
