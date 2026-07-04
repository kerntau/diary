<template>
    <div class="account-page" :style="`min-height: ${projectStore.insets.windowsHeight}px`">
        <transition
            enter-active-class="animated-fast fadeIn"
            leave-active-class="animated-fast faceOut"
        >
            <section class="account-card" aria-labelledby="fetch-password-title">
                <header class="account-header">
                    <div class="account-logo">
                        <img :src="SVG_ICONS.logo_icons.logo_change_password" alt="Diary Logo">
                    </div>
                    <div>
                        <h1 id="fetch-password-title" class="account-title">找回密码</h1>
                        <p class="account-subtitle">私人部署应用需要管理员协助重置</p>
                    </div>
                </header>
                <div class="account-tip">
                    <RegisterTip :html-content="fetchPasswordTip"/>
                </div>
                <div class="account-links">
                    <RouterLink to="/login">登录</RouterLink>
                </div>
            </section>
        </transition>
    </div>
</template>


<script lang="ts" setup>
import RegisterTip from "./RegisterTip.vue";

import {useProjectStore} from "@/pinia/useProjectStore.ts";
const projectStore = useProjectStore()
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {computed} from "vue";

const fetchPasswordTip = computed(() => `
            <h3>如果你忘记密码</h3>
            <p>请联系系统管理员重置密码。</p>
            <p>之后用重置的密码登录，再修改密码即可。</p>
        `)

</script>

<style scoped lang="scss">
@use "account-page" as *;
</style>
