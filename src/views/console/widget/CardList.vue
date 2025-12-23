<template>
  <ul class="card-list" :style="{ marginTop: showWorkTab ? '0' : '10px' }">
    <li class="art-custom-card" v-for="(item, index) in processedDataList" :key="index">
      <span class="des subtitle">{{ item.label }}</span>
      <span class="number box-title">
        <MoCountTo :num="item.value" :duration="800" :separator="2" />
        <span v-if="getUnit(item)" class="unit">{{ getUnit(item) }}</span>
      </span>
      <div class="change-box">
        <span class="change-text">较上周</span>
        <span
          class="change"
          :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
        >
          {{ item.change }}
        </span>
      </div>
      <i class="iconfont-sys" v-html="item.icon"></i>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import type { ConsoleTotalInfo } from '@/types/agriculture/console'

const props = defineProps({
  dataList: { type: Array<ConsoleTotalInfo>, default: () => [] }
})

const settingStore = useSettingStore()
const showWorkTab = computed(() => settingStore.showWorkTab)

// 农业统计UI配置映射表（前后端分离：后端只返回状态码，前端负责UI展示）
const agricultureConfig: Record<number, { label: string; icon: string; unit: string }> = {
  0: { label: '农场温室', icon: '&#xe632', unit: '个' },
  1: { label: '农场批次', icon: '&#xe66b', unit: '个' },
  2: { label: '农场作物', icon: '&#xe60a', unit: '种' },
  3: { label: '农场面积', icon: '&#xe6dc', unit: '亩' }
}

// 处理后端返回的数据，根据状态码映射UI配置
const processedDataList = computed(() => {
  return props.dataList.map(item => {
    if (item.status !== undefined && item.status !== null) {
      const config = agricultureConfig[item.status] || agricultureConfig[0]
      return {
        ...item,
        label: config.label,
        icon: config.icon,
        unit: config.unit
      }
    }
    return item
  })
})

// 获取单位（根据处理后的数据）
const getUnit = (item: any) => {
  if (item.unit) return item.unit
  if (item.label === '农场面积' || item.label === '温室面积' || item.label === '总面积') return '亩'
  if (item.label === '农场温室' || item.label === '温室数量') return '个'
  if (item.label === '农场作物' || item.label === '作物种类' || item.label === '农场种类') return '种'
  if (item.label === '农场批次') return '个'
  return ''
}
</script>

<style lang="scss" scoped>
  .card-list {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    width: calc(100% + var(--console-margin));
    margin-top: 0 !important;
    margin-left: calc(0px - var(--console-margin));
    background-color: transparent !important;

    li {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: calc(25% - var(--console-margin));
      height: 140px;
      padding: 0 18px;
      margin: 0 0 0 var(--console-margin);
      background: var(--art-main-bg-color);

      $icon-size: 52px;

      .iconfont-sys {
        position: absolute;
        top: 0;
        right: 20px;
        bottom: 0;
        width: $icon-size;
        height: $icon-size;
        margin: auto;
        overflow: hidden;
        font-size: 22px;
        line-height: $icon-size;
        color: var(--el-color-primary) !important;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 12px;
      }

      .des {
        display: block;
        height: 14px;
        font-size: 14px;
        line-height: 14px;
      }

      .number {
        display: inline-flex;
        align-items: baseline;
        margin-top: 10px;
        font-size: 28px;
        font-weight: 400;
      }

      .unit {
        font-size: 18px;
        margin-left: 8px;
        align-self: flex-start;
        margin-top: 4px;
      }

      .change-box {
        display: flex;
        align-items: center;
        margin-top: 10px;

        .change-text {
          display: block;
          font-size: 13px;
          color: var(--art-text-gray-600);
        }

        .change {
          display: block;
          margin-left: 5px;
          font-size: 13px;
          font-weight: bold;
        }
      }
    }
  }

  .dark {
    .card-list {
      li {
        .iconfont-sys {
          background-color: #232323 !important;
        }
      }
    }
  }
</style>
