<template>
  <div class="batch-trend-chart art-custom-card">
    <div class="card-header">
      <div class="title-section">
        <span class="title">批次创建趋势</span>
        <span class="subtitle">近6个月批次数量趋势</span>
      </div>
    </div>
    <div class="card-body">
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useECharts } from '@/utils/echarts/useECharts'
import type { EChartsOption } from 'echarts'
import { useSettingStore } from '@/store/modules/setting'

interface TrendData {
  month: string
  batchCount: number
  taskCount: number
}

const props = defineProps({
  trendData: { type: Array as () => TrendData[], default: () => [] }
})

const chartRef = ref<HTMLDivElement>()
const { setOptions, removeResize, resize } = useECharts(chartRef as Ref<HTMLDivElement>)

const settingStore = useSettingStore()
const menuOpen = computed(() => settingStore.menuOpen)

watch(menuOpen, () => {
  const delays = [100, 200, 300]
  delays.forEach((delay) => {
    setTimeout(resize, delay)
  })
})

const initChart = () => {
  const months = props.trendData.map(item => item.month)
  const batchCounts = props.trendData.map(item => item.batchCount)
  const taskCounts = props.trendData.map(item => item.taskCount)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8ebf1',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      data: ['批次数量', '完成任务'],
      bottom: 0,
      textStyle: {
        color: '#666',
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#e8ebf1'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '批次数量',
        type: 'bar',
        data: batchCounts,
        barWidth: '35%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '完成任务',
        type: 'bar',
        data: taskCounts,
        barWidth: '35%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#a5b4fc' },
              { offset: 1, color: '#818cf8' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  setOptions(option)
}

watch(() => props.trendData, () => {
  if (props.trendData.length > 0) {
    initChart()
  }
}, { deep: true })

onMounted(() => {
  if (props.trendData.length > 0) {
    initChart()
  }
})

onUnmounted(() => {
  removeResize()
})
</script>

<style lang="scss" scoped>
.batch-trend-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--art-main-bg-color);
  border-radius: calc(var(--custom-radius) + 4px);
  overflow: hidden;

  .card-header {
    padding: 18px 20px 10px;
    
    .title-section {
      .title {
        display: block;
        font-size: 16px;
        font-weight: 500;
        color: var(--art-text-gray-900);
      }
      
      .subtitle {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--art-gray-500);
      }
    }
  }

  .card-body {
    flex: 1;
    padding: 0 10px 10px;
    
    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
    }
  }
}
</style>
