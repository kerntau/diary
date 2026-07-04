<template>
    <transition
        enter-active-class="animated-fast fadeIn"
        leave-active-class="animated-fast faceOut"
    >
        <div v-if="htmlContent" class="register-tip mb-6" v-html="htmlContent"/>
    </transition>
</template>


<script lang="ts" setup>
defineProps({
    htmlContent: {
        type: String,
    }
})

</script>

<style lang="scss">
.register-tip {
    width: 100%;
    padding: 16px;
    font-size: 13px;
    border: 1px solid var(--diary-border);
    border-radius: var(--diary-radius);
    background: var(--diary-surface-muted);
    color: var(--diary-ink);
    line-height: 1.55;
    hr{
        margin: 10px 0;
        border: 0;
        border-bottom: 1px solid var(--diary-border);
    }

    h1,h2,h3,h4,h5,h6{
        text-align: center;
        margin: 0 0 12px;
        color: var(--diary-ink);
        font-size: 17px;
        font-weight: 760;
    }
    p{
        margin: 8px 0;
        color: var(--diary-muted);
    }
    ol{
        padding: 10px;
        margin-left: 30px;
        li{}
    }
    a{
        color: var(--diary-accent);
        &:hover{
            color: var(--diary-accent-pressed);
        }
    }
}
</style>
