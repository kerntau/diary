<template>
    <div class="mood-tag-picker">
        <NForm label-placement="top" :show-feedback="false">
            <NFormItem label="心情">
                <NSelect
                    :value="mood"
                    :options="moodOptions"
                    placeholder="选择心情"
                    @update:value="value => emit('update:mood', value)"
                />
            </NFormItem>
            <NFormItem label="标签">
                <NDynamicTags :value="tags" @update:value="value => emit('update:tags', value)"/>
            </NFormItem>
        </NForm>
    </div>
</template>

<script lang="ts" setup>
import {NDynamicTags, NForm, NFormItem, NSelect} from "naive-ui"

defineProps<{
    mood: string
    tags: string[]
}>()

const emit = defineEmits<{
    'update:mood': [value: string]
    'update:tags': [value: string[]]
}>()

const moodOptions = [
    {label: '平静', value: 'calm'},
    {label: '开心', value: 'happy'},
    {label: '疲惫', value: 'tired'},
    {label: '焦虑', value: 'anxious'},
    {label: '专注', value: 'focused'},
    {label: '感激', value: 'grateful'},
]
</script>
