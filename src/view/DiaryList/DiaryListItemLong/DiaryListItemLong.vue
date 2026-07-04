<template>
    <div :class="['article', {active: isActive},]" :style="diaryArticleItemStyle">
        <div
            @click="emit('click')"
            class="article-header"
        >
            <div class="date" v-if="props.isShowDate">{{ props.diary.dateString }}</div>
            <div class="metas">
                <div class="weather">
                <img v-if="props.diary.weather"
                     :src="SVG_ICONS.weather_icons[props.diary.weather + suffix]"
                     :alt="props.diary.weather">
            </div>
            <div class="week" v-if="props.isShowWeek">{{ props.diary.weekday }}</div>
            <div class="category" :style="diaryItemCategoryTextStyle" >{{ props.diary.categoryString }}</div>
            </div>
        </div>

        <div class="article-body" v-if="projectStore.isHideContent">
            <div class="title">{{ props.diary.title.replace(/[^，。 \n]/g, '*') }}</div>
            <div class="content" v-html="props.diary.contentHtml?.replace(/[^，。 \n]/g, '*')"/>
        </div>
        <div class="article-body" v-else>
            <div class="title">{{ props.diary.title }}</div>
            <div class="markdown" 
                v-if="props.diary.is_markdown === 1" 
                v-html="contentMarkDownHtml"/>
            <DiaryListTodo 
                v-else-if="props.diary.category === 'todo'" 
                :diary="props.diary"/>
            <div class="content" 
                v-else 
                v-html="props.diary.contentHtml"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {parseMarkdown} from "@/utility/markedHighlight.ts";
import {computed} from "vue";
import {useRoute} from "vue-router";
import SVG_ICONS from "@/assets/icons/SVG_ICONS.ts";
import {EntityDiaryFromServerLocal} from "../Diary.ts";
import DiaryListTodo from "./DiaryListTodo.vue";

import {useStatisticStore} from "@/pinia/useStatisticStore.ts";
const statisticStore = useStatisticStore()

import {useProjectStore} from "@/pinia/useProjectStore.ts";
const projectStore = useProjectStore()

const route = useRoute()

const emit = defineEmits<{
    (e: 'click'): void
}>()


const props = withDefaults(defineProps<{
    diary: EntityDiaryFromServerLocal,
    isShowDate?: boolean
    isShowWeek?: boolean
}>(), {
    isShowDate: true,
    isShowWeek: true
})

const isActive = computed(() => {
    return Number(route.params.id) === Number(props.diary.id)
})
const suffix = computed(()=> {
    return ''
})
const diaryArticleItemStyle = computed(()=>{
    const color = statisticStore.getCategoryColor(props.diary.category)
    return `--entry-category-color: ${color}; --entry-category-soft: ${color}1a; --entry-category-border: ${color}55;`
})
const contentMarkDownHtml = computed(()=>{
    return parseMarkdown(props.diary.content)
})
const diaryItemCategoryTextStyle = computed(()=>{
    return ''
})

</script>

<style lang="scss" scoped>
@use "./list-item-long" as *;
</style>
