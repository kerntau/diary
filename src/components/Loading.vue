<template>
    <!--加载动画-->
    <div v-if="loading" class="loading">
        <div class="loading-1 loading-item"></div>
        <div class="loading-2 loading-item"></div>
        <div class="loading-3 loading-item"></div>
        <div class="loading-4 loading-item"></div>
    </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
    loading: boolean
}>(), {
    loading: false
})
</script>

<style scoped lang="scss">
.loading{
    box-sizing: border-box;
    height: 34px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    .loading-item{
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: var(--diary-accent);
        opacity: 0.36;
        transform: scale(0.86);
        animation: loading-dot 1s infinite ease-in-out;
    }
    .loading-1{
        animation-delay: 0s;
    }
    .loading-2{
        animation-delay: 0.12s;
    }
    .loading-3{
        animation-delay: 0.24s;
    }
    .loading-4{
        animation-delay: 0.36s;
    }
}

@keyframes loading-dot {
    0%, 80%, 100% {
        opacity: 0.32;
        transform: scale(0.86);
    }
    40% {
        opacity: 1;
        transform: scale(1.18);
    }
}

@media (prefers-reduced-motion: reduce) {
    .loading .loading-item{
        animation: none;
        opacity: 0.7;
        transform: none;
    }
}

</style>
