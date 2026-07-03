<template>
    <div class="body-login-bg ios-login-bg" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <main class="ios-login-shell" v-if="show">
                <section class="ios-login-card" aria-labelledby="login-title">
                    <div class="logo-wrapper">
                        <div class="logo">
                            <img :src="SVG_ICONS.logo_icons.logo_rounded" alt="日记">
                        </div>
                    </div>

                    <div class="ios-login-heading">
                        <p>Private diary</p>
                        <h1 id="login-title">回到你的日记</h1>
                        <span>输入管理员密码后继续写作。</span>
                    </div>

                    <NForm class="ios-login-form" :show-feedback="false" @submit.prevent="loginSubmit">
                        <NFormItem label="登录密码">
                            <NInput
                                v-model:value="password"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                size="large"
                                autocomplete="current-password"
                                autofocus
                                placeholder="默认密码 diary"
                                @keyup.enter="loginSubmit"
                            >
                                <template #suffix>
                                    <NButton quaternary size="small" type="primary" @click="isPasswordVisible = !isPasswordVisible">
                                        {{ isPasswordVisible ? '隐藏' : '显示' }}
                                    </NButton>
                                </template>
                            </NInput>
                        </NFormItem>
                        <NButton
                            block
                            size="large"
                            type="primary"
                            attr-type="submit"
                            :loading="isLoggingIn"
                            :disabled="!verified"
                            @click="loginSubmit"
                        >
                            {{ loginLabel }}
                        </NButton>
                    </NForm>

                    <div :class="['footer', {center: !is_show_demo_account}]">
                        <NButton v-if="is_show_demo_account" quaternary type="primary" @click="useTestAccount">
                            试用演示账户
                        </NButton>
                    </div>
                </section>

                <div class="copyright">
                    <span class="project-name">{{ packageInfo.nameZh }}</span>
                    <span class="version ml-1">v{{ packageInfo.version }}</span>
                    <span class="ml-1">{{ packageInfo.dateModify }}</span>
                </div>
            </main>

        </transition>
    </div>
</template>

<script lang="ts" setup>
import packageInfo from "../../../package.json"

import userApi from "@/api/userApi.ts"

import {popMessage, setAuthorization} from "@/utility.ts";
import {useProjectStore} from "@/pinia/useProjectStore.ts";
import {useSystemConfigStore} from "@/pinia/useSystemConfigStore.ts";
const projectStore = useProjectStore()
const systemConfigStore = useSystemConfigStore()
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {NButton, NForm, NFormItem, NInput} from "naive-ui";

const router = useRouter()

const show = ref(false)
onMounted(()=> {
    show.value = true
    document.title = '日记 - 登录' // 变更标题
})



const password = ref('')
const isPasswordVisible = ref(false)
const loginLabel = ref('登录')
const isLoggingIn = ref(false)
const systemConfig = computed(() => systemConfigStore.config)
const is_show_demo_account = computed(() => systemConfig.value.is_show_demo_account)
const passwordVerified = computed(() => {
    return password.value.length > 0
})
const verified = computed(() => {
    return passwordVerified.value
})


function loginSubmit() {
    if (verified.value && !isLoggingIn.value){
        loginLabel.value = '登录中...'
        isLoggingIn.value = true
        let requestData = {
            password: password.value,
        }
        userApi
            .login(requestData)
            .then(res => {
                // set authorization
                setAuthorization({
                    nickname : res.data.nickname,
                    uid : res.data.uid,
                    email : res.data.email,
                    phone : res.data.phone,
                    avatar : res.data.avatar,
                    token : res.data.password,
                    group_id : res.data.group_id,
                    city : res.data.city,
                    geolocation : res.data.geolocation,
                })
                popMessage('success', res.message, () => router.push({name: 'Index'}))
                loginLabel.value = '登录成功'
            })
            .catch(err => {
                loginLabel.value = '登录失败'
                popMessage('danger', err.message, () => loginLabel.value = '登录', 5)
            })
            .finally(() => {
                isLoggingIn.value = false
            })
    } else {

    }
}

function useTestAccount() {
    password.value = systemConfig.value.demo_account_password
}


</script>
<style lang="scss" scoped>
@use "../../scss/plugin" as *;
.ios-login-bg{
    align-items: center;
    padding: 24px;
}
.ios-login-shell{
    position: relative;
    width: min(100%, 420px);
    min-height: min(620px, calc(100dvh - 48px));
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.ios-login-card{
    width: 100%;
    padding: 32px;
    border: 1px solid var(--diary-border);
    border-radius: var(--diary-radius);
    background: rgba(255, 255, 255, 0.82);
    box-shadow: var(--diary-card-shadow);
    backdrop-filter: blur(20px);
}
.ios-login-heading{
    margin-bottom: 28px;
    text-align: center;
    p{
        margin-bottom: 6px;
        color: var(--diary-accent);
        font-size: $fz-small;
        font-weight: 700;
        text-transform: uppercase;
    }
    h1{
        margin: 0;
        color: var(--diary-ink);
        font-size: 30px;
        line-height: 1.18;
        font-weight: 750;
        letter-spacing: 0;
    }
    span{
        display: block;
        margin-top: 10px;
        color: var(--diary-muted);
        font-size: $fz-main;
    }
}
.ios-login-form{
    :deep(.n-form-item-label){
        color: var(--diary-muted);
        font-weight: 600;
    }
}
.footer{
    justify-content: center;
}
.copyright{
    left: 0;
    width: 100%;
    position: fixed;
    bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: $fz-tiny;
    line-height: 1;
    color: $text-subtitle;
    a{
        color: $dark-text-subtitle;

        &:hover{
            color: $color-main;
            text-decoration: underline;
        }
    }
    .version{
        color: $dark-text-subtitle;
    }
    .project-name{
        font-weight: bold;
    }
    .valid-date{
    }
    .version{
    }
    .password{
        color: $dark-text-subtitle;
        @extend .btn-like;
        &:hover{
            color: $color-main;
        }
    }
}
@media (prefers-color-scheme: dark) {
    .ios-login-card{
        background: rgba(28, 28, 30, 0.82);
    }
}
@media (max-width: $grid-separate-width-sm) {
    .ios-login-bg{
        padding: 16px;
    }
    .ios-login-card{
        padding: 24px;
    }
}
</style>


