<template>
    <div class="export-category-list">
        <button
            type="button"
            :class="['export-category-item', {active: isSelected(item.name_en)}]"
            v-for="(item, index) in useStatisticStore().categoryAll" :key="index"
            :title="item.name"
            :aria-pressed="isSelected(item.name_en)"
            @click="toggleCategory(item.name_en)"
        >
            <div v-if="projectStore.navbarCategoryShowStyle === EnumNavbarCategoryShowStyle.dot"
                 class="dot"
                 :style="dotStyle(item.name_en)"></div>
            <div v-else class="name" :style="itemStyle(item.name_en)">{{ item.name }}</div>
        </button>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia/useProjectStore";
import {useStatisticStore} from "@/pinia/useStatisticStore";
import {EnumNavbarCategoryShowStyle} from "@/entity/Category";

const projectStore = useProjectStore()

function isSelected(nameEn: string) {
    return projectStore.filteredCategories.indexOf(nameEn) > -1
}

function toggleCategory(nameEn: string) {
    const idx = projectStore.filteredCategories.indexOf(nameEn)
    if (idx > -1) {
        projectStore.filteredCategories.splice(idx, 1)
    } else {
        projectStore.filteredCategories.push(nameEn)
    }
    projectStore.SET_FILTERED_CATEGORIES(projectStore.filteredCategories)
    projectStore.isListNeedBeReload = true
}

function dotStyle(nameEn: string){
    const category = useStatisticStore().categoryObjectMap.get(nameEn)
    const color = category?.color || '#666'
    const active = isSelected(nameEn)
    if (active){
        return `border-color:${color}; background-color:${color};`
    } else {
        return `border-color:${color};`
    }
}

function itemStyle(nameEn: string){
    const category = useStatisticStore().categoryObjectMap.get(nameEn)
    const color = category?.color || '#666'
    const active = isSelected(nameEn)
    // 未选择的时候使用默认字体颜色
    if (!active){
        return `color: var(--diary-muted);`
    } else {
        return `color: ${color};`
    }
}
</script>

<style scoped lang="scss">
.export-category-list{
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 6px;
}
.export-category-item{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    min-width: 30px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--diary-radius-sm);
    background: transparent;
    cursor: pointer;
    user-select: none;
    transition:
        background-color var(--diary-transition),
        border-color var(--diary-transition),
        box-shadow var(--diary-transition);
    &:hover{
        background: var(--diary-surface-muted);
    }
    &:focus-visible{
        outline: none;
        border-color: var(--diary-accent);
        box-shadow: 0 0 0 3px var(--diary-focus);
    }
}
.dot{
    opacity: 0.8;
    background-color: transparent;
    border: 2px solid transparent;
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 8px;
    transition: all 0.2s;
    margin-right: 0;
}
.name{
    border-radius: var(--diary-radius-sm);
    padding: 4px 6px;
    opacity: 0.9;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.2;
}
</style>

