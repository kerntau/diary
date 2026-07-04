<template>
    <section class="statistic-panel-container">
        <header v-if="title" class="statistic-panel-header">
            <h3>{{ title }}</h3>
        </header>
        <div class="statistic-panel">
            <slot/>
        </div>
    </section>
</template>

<script lang="ts" setup>
defineProps<{
    title?: string
}>()
</script>

<style scoped lang="scss">
.statistic-panel-container {
    display: grid;
    gap: 8px;
}

.statistic-panel-header {
    padding: 0 2px;

    h3 {
        margin: 0;
        color: var(--diary-ink);
        font-size: 16px;
        font-weight: 750;
        line-height: 1.3;
    }
}

.statistic-panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--diary-border);
    border-radius: var(--diary-radius);
    background: var(--diary-surface);
    box-shadow: var(--diary-hairline-shadow);
}

@media (max-width: 640px) {
    .statistic-panel {
        padding: 12px;
    }
}
</style>
