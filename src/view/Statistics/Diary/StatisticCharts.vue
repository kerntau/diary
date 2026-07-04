<template>
    <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated faceOut"
    >
        <div class="statistic-charts" v-if="isShow">
            <StatisticPanel title="写作分类">
                <div class="statistic-group">
                    <ChartBar :data="statisticStore.dataArrayCategory" title=""/>
                    <ChartPie :data="statisticStore.dataArrayCategory" title=""/>
                    <div class="info-list">
                        <div class="info-list-item" v-for="year in statisticStore.dataArrayCategorySorted">
                            <div class="key">{{ year.name }}</div>
                            <div class="value">{{ year.value }}</div>
                        </div>
                    </div>
                </div>
            </StatisticPanel>
            
            <StatisticPanel title="年度记录">
                <div class="statistic-group">
                    <ChartBar :data="statisticStore.dataArrayYear" title=""/>
                    <ChartPie :data="statisticStore.dataArrayYear" title=""/>
                    <div class="info-list">
                        <div class="info-list-item" v-for="year in statisticStore.dataArrayYear">
                            <div class="key">{{ year.name }}</div>
                            <div class="value">{{ year.value }}</div>
                        </div>
                    </div>
                </div>
            </StatisticPanel>

            <StatisticPanel title="温度趋势">
                <StatisticWeather/>
            </StatisticPanel>
        </div>
    </transition>
</template>

<script lang="ts" setup>
import ChartPie from "@/components/charts/ChartPie.vue"
import ChartBar from "@/components/charts/ChartBar.vue"
import StatisticPanel from "@/view/Statistics/StatisticPanel.vue"
import StatisticWeather from "@/view/Statistics/Weather/StatisticWeather.vue";
import {onMounted, ref} from "vue";
import { useStatisticStore } from "@/pinia/useStatisticStore.ts";

const statisticStore = useStatisticStore()

const isShow = ref(false)
onMounted(() => {
    isShow.value = true
})

</script>

<style scoped lang="scss">
@use "statistic-charts" as *;
</style>
