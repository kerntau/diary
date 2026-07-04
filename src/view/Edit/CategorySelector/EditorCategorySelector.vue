<template>
    <div class="edit-category-selector">
        <label class="field-label">分类</label>
        <div class="category-grid">
            <button
                type="button"
                :class="['category-chip', {active: categorySelected === category.name_en}]"
                @click="chooseCategory(category.name_en)"
                v-for="category in writingCategories"
                :key="category.name_en"
            >
                <span class="category-dot" :style="dotStyle(category)"></span>
                <span>{{ category.name }}</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {CategoryEntity} from "@/entity/Category.ts";
import {useStatisticStore} from "@/pinia/useStatisticStore.ts";

const props = withDefaults(defineProps<{
    category: string
}>(), {
    category: 'life'
})

const emit = defineEmits(['change'])

const categorySelected = ref(props.category)
const diaryCategoryNames = new Set(['life', 'work', 'idea', 'todo', 'study', 'travel'])
const writingCategories = computed(() =>
    useStatisticStore().categoryAll.filter(category => diaryCategoryNames.has(category.name_en))
)

watch(() => props.category, () => {
    categorySelected.value = props.category
})
watch(categorySelected, newValue => {
    emit('change', newValue)
})

function dotStyle(category: CategoryEntity) {
    return `background-color: ${category.color}; box-shadow: 0 0 0 3px ${category.color}24;`
}
function chooseCategory(categoryName: string) {
    categorySelected.value = categoryName
}
</script>

<style lang="scss" scoped>
@use "editor-category-selector" as *;
</style>
