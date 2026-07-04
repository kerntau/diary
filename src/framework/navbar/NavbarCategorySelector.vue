<template>
    <div class="navbar-category-filter">
        <div class="navbar-category-list-container">
            <div class="navbar-category-list">
                <button
                    :class="['navbar-category-chip', {active: isCategoryActive(item.name_en)}]"
                    v-for="(item, index) in useStatisticStore().categoryAll"
                    :key="item.name_en"
                    type="button"
                    :title="`筛选${item.name}`"
                    @click="toggleCategory(item, index)"
                >
                    <span class="dot" :style="dotStyle(item)"></span>
                    <span>{{ item.name }}</span>
                </button>

                <button
                    :class="['navbar-category-chip', 'share-item', {active: projectStore.isFilterShared}]"
                    type="button"
                    title="只看公开日记"
                    @click="toggleFilterShared"
                >
                    <span class="dot"></span>
                    <span>公开</span>
                </button>

                <button class="navbar-category-action" type="button" title="反选分类" @click="reverseCategorySelect">反选</button>
                <button class="navbar-category-action" type="button" title="清空分类筛选" @click="selectCategoryNone">清空</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia/useProjectStore.ts";
import {CategoryEntity} from "@/entity/Category.ts";
import {useStatisticStore} from "@/pinia/useStatisticStore.ts";
import {ref} from "vue";

const projectStore = useProjectStore()
const isAnimating = ref<number | null>(null)

function toggleFilterShared(){
    projectStore.SET_IS_FILTERED_SHARED(!projectStore.isFilterShared)
    projectStore.isListNeedBeReload = true
}
function toggleCategory(category: CategoryEntity, index: number){
    // Trigger animation
    isAnimating.value = index
    setTimeout(() => {
        isAnimating.value = null
    }, 300) // Match animation duration

    let idx = projectStore.filteredCategories.indexOf(category.name_en)
    if ( idx > -1) {
        projectStore.filteredCategories.splice(idx, 1)
    } else {
        projectStore.filteredCategories.push(category.name_en)
    }
    projectStore.SET_FILTERED_CATEGORIES(projectStore.filteredCategories)
    projectStore.isListNeedBeReload = true
}

function selectCategoryNone() {
    projectStore.SET_FILTERED_CATEGORIES([])
    projectStore.isListNeedBeReload = true
}
function reverseCategorySelect() {
    let tempCategories: string[] = useStatisticStore().categoryAll.map(item => item.name_en)
    projectStore.filteredCategories.forEach(item => {
        tempCategories.splice(tempCategories.indexOf(item), 1)
    })
    projectStore.SET_FILTERED_CATEGORIES(tempCategories)
    projectStore.isListNeedBeReload = true
}


// DOT STYLE
function isCategoryActive(categoryName: string) {
    return projectStore.filteredCategories.includes(categoryName)
}

function dotStyle(category: CategoryEntity) {
    return `background-color: ${category.color}; box-shadow: 0 0 0 3px ${category.color}24;`
}
</script>

<style lang="scss" scoped>
.navbar-category-filter{
    display: flex;
    align-items: center;
    min-width: 0;
}

.navbar-category-list-container{
    display: flex;
    min-width: 0;
}

.navbar-category-list{
    align-items: center;
    display: flex;
    gap: 6px;
    min-width: 0;
    height: 45px;
    overflow: hidden;
}

.navbar-category-chip,
.navbar-category-action{
    min-height: 32px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--diary-muted);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    letter-spacing: 0;
    transition:
        background-color var(--diary-transition),
        border-color var(--diary-transition),
        color var(--diary-transition);
}

.navbar-category-chip{
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;

    &.share-item{
        .dot{
            background: var(--diary-muted-2);
            box-shadow: 0 0 0 3px rgba(142, 142, 147, 0.16);
        }
    }

    &:hover{
        background: rgba(0, 122, 255, 0.09);
        color: var(--diary-ink);
    }

    &.active{
        border-color: rgba(0, 122, 255, 0.26);
        background: rgba(0, 122, 255, 0.12);
        color: var(--diary-accent);
    }
}

.dot{
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    flex: 0 0 auto;
}

.navbar-category-action{
    min-width: 0;
    padding: 0 7px;
    color: var(--diary-muted-2);
    font-size: 12px;

    &:hover{
        background: var(--diary-surface-muted);
        color: var(--diary-ink);
    }
}

@media (max-width: 1280px) {
    .navbar-category-action,
    .share-item{
        display: none;
    }
}
</style>
