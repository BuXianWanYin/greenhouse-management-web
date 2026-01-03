<template>
  <div class="console">
    <!-- 控制台首页 -->
    <!-- 顶部4个卡片 -->
    <CardList :data-list="cardList"></CardList>
    
    <!-- 第二行：任务统计 + 批次趋势 -->
    <div class="row row-2">
      <TodaySales :sales-data="countList"></TodaySales>
      <div class="row-2-right">
        <BatchTrendChart :trend-data="batchTrendData" />
      </div>
    </div>
    
    <!-- 第三行：最近动态 + 今日排班 + 快捷操作 -->
    <div class="row row-3">
      <div class="col-activities">
        <RecentActivities :activities="recentActivities" />
      </div>
      <div class="col-schedule">
        <TodaySchedule :schedule-list="todayScheduleList" />
      </div>
      <div class="col-actions">
        <QuickActions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import CardList from './widget/CardList.vue'             // 顶部统计卡片列表
import TodaySales from './widget/TodaySales.vue'         // 任务统计组件
import BatchTrendChart from './widget/BatchTrendChart.vue' // 批次趋势图表
import RecentActivities from './widget/RecentActivities.vue' // 最近动态列表
import TodaySchedule from './widget/TodaySchedule.vue'   // 今日排班列表
import QuickActions from './widget/QuickActions.vue'     // 快捷操作组件

import { useSettingStore } from '@/store/modules/setting'
import { useCommon } from '@/composables/useCommon'
import { useSystemInfo } from '@/composables/useSystemInfo'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Document, UserFilled, Crop, Monitor } from '@element-plus/icons-vue'
import AgricultureConsoleService from '@/api/agriculture/consoleApi'
import type {
  ConsoleTotalInfo,
  ConsoleToTalData
} from '@/types/agriculture/console'
import event from '@/utils/event'


const settingStore = useSettingStore()
const router = useRouter()
const { getSystemName } = useSystemInfo()

// 系统名称
const systemName = computed(() => getSystemName())

// 当前全局主题
const currentGlopTheme = computed(() => settingStore.systemThemeType)

// 系统主题风格变化时，刷新页面重新渲染 Echarts
watch(currentGlopTheme, () => {
  settingStore.reload()
})

// 滚动到顶部
useCommon().scrollToTop()

// 卡片数据（农业统计：温室数、作物数、批次数、收获数量等）
const cardList = ref<ConsoleTotalInfo[]>([])

// 批次任务统计数据（待处理、进行中、已完成）
const countList = ref<ConsoleTotalInfo[]>([])

// 批次创建趋势数据（用于图表展示）
const batchTrendData = ref<any[]>([])

// 最近动态数据（用户操作记录）
const recentActivities = ref<any[]>([])

// 今日排班数据（今日工作安排）
const todayScheduleList = ref<any[]>([])


/**
 * 获取农业统计卡片数据
 * 包含：温室数量、作物数量、批次数量、收获数量等
 */
const getCardList = async () => {
  const res = await AgricultureConsoleService.listAgriculture()
  cardList.value = res.data
}

/**
 * 获取批次任务统计数据
 * 包含：待处理、进行中、已完成的任务数量
 */
const getCountList = async () => {
  const res = await AgricultureConsoleService.listBatchTask()
  countList.value = res.data
}

/**
 * 获取批次创建趋势数据
 * 用于展示近期批次创建趋势图表
 */
const getBatchTrend = async () => {
  const res = await AgricultureConsoleService.getBatchTrend()
  batchTrendData.value = res.data
}

/**
 * 获取今日排班列表
 * 展示今日的工作安排和人员分配
 */
const getTodaySchedule = async () => {
  const res = await AgricultureConsoleService.getTodaySchedule()
  todayScheduleList.value = res.data
}

/**
 * 获取最近动态
 * 展示用户的最近操作记录，包括创建、修改、删除等操作
 */
const getRecentActivities = async () => {
  const res = await AgricultureConsoleService.getRecentActivities()
  // 处理头像URL：如果不是完整URL，则拼接API基础路径
  recentActivities.value = (res.data || []).map((item: any) => ({
    ...item,
    avatar: item.avatar ? (item.avatar.startsWith('http') ? item.avatar : import.meta.env.VITE_API_URL + item.avatar) : ''
  }))
}

/**
 * 监听全局 event 总线，实时更新统计数据
 * 当其他页面触发数据更新事件时，自动刷新控制台数据
 */
event.on('message', (data: ConsoleToTalData) => {
  cardList.value = data.agriculture
  countList.value = data.batchTask
})

/**
 * 页面挂载时获取所有统计数据
 */
onMounted(() => {
  getCardList()        // 获取农业统计卡片
  getCountList()       // 获取批次任务统计
  getBatchTrend()      // 获取批次趋势
  getTodaySchedule()   // 获取今日排班
  getRecentActivities() // 获取最近动态
})
</script>

<style lang="scss" scoped>
/* ============ 控制台首页样式 ============ */
.console {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px); // 减去header、padding等高度
  padding-bottom: 15px;

  /* ---------- 全局文字样式 ---------- */
  // 主标题样式
  :deep(.box-title) {
    color: var(--art-gray-900) !important;
  }

  // 副标题样式
  :deep(.subtitle) {
    color: var(--art-gray-600) !important;
  }

  /* ---------- 卡片背景样式 ---------- */
  :deep(.card-list li),
  .bottom-wrap {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  /* ---------- 第二行布局：任务统计 + 批次趋势 ---------- */
  .row-2 {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    align-items: stretch;
    flex-shrink: 0;

    // 任务统计组件：固定大小不收缩
    :deep(.today-sales) {
      flex-shrink: 0;
    }

    // 批次趋势图表：占据剩余空间
    .row-2-right {
      flex: 1;
      min-width: 0;
    }
  }

  /* ---------- 第三行布局：最近动态 + 今日排班 + 快捷操作 ---------- */
  .row-3 {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    // 最近动态列：弹性布局，占据剩余空间
    .col-activities {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    // 今日排班列：弹性布局，占据剩余空间
    .col-schedule {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    // 快捷操作列：固定宽度
    .col-actions {
      width: 280px;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  /* ---------- 底部介绍区域 ---------- */
  .bottom-wrap {
    box-sizing: border-box;
    padding: 30px;
    margin-top: 16px;
    background: var(--art-main-bg-color);
    min-height: 400px;

    .intro-content {
      max-width: 1200px;
      margin: 0 auto;

      // 标题样式
      h2 {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 24px;
        font-weight: 600;
        color: var(--art-gray-900);
      }

      // 介绍文本样式
      .intro-text {
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--art-gray-700);
      }

      // 功能特性列表
      .feature-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 30px;

        // 单个功能项
        .feature-item {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          background: var(--art-bg-color);
          border-radius: 12px;
          transition: all 0.3s;
          border: 1px solid var(--art-border-color);

          // 悬停效果
          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
          }

          // 功能图标
          .feature-icon {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            margin-right: 16px;
            padding: 12px;
            font-size: 24px;
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
            border-radius: 12px;
          }

          // 功能内容
          .feature-content {
            flex: 1;

            h3 {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: var(--art-gray-900);
            }

            p {
              margin: 0;
              font-size: 14px;
              line-height: 1.5;
              color: var(--art-gray-600);
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.console {
  /* ---------- iPad Pro 尺寸适配 ---------- */
  @media screen and (max-width: $device-ipad-pro) {
    // 第二行：任务统计和批次趋势改为垂直排列
    .row-2 {
      flex-wrap: wrap;

      :deep(.today-sales) {
        width: 100%;
      }

      .row-2-right {
        width: 100%;
        flex: none;
      }
    }

    // 第三行：三列改为两列加一行
    .row-3 {
      flex-wrap: wrap;

      .col-activities,
      .col-schedule {
        width: calc(50% - 8px);
        flex: none;
      }

      .col-actions {
        width: 100%;
        margin-top: 16px;
      }
    }

    // 底部介绍区域高度自适应
    .bottom-wrap {
      height: auto;
      margin-top: 15px;
      padding: 20px;

      .intro-content {
        .feature-list {
          grid-template-columns: 1fr;
          gap: 15px;
        }
      }
    }
  }

  /* ---------- iPad 竖屏尺寸适配 ---------- */
  @media screen and (max-width: $device-ipad-vertical) {
    // 卡片列表：两列布局
    :deep(.card-list) {
      width: calc(100% + 15px);
      margin-left: -15px;

      li {
        width: calc(50% - 15px);
        margin: 0 0 15px 15px;
      }
    }

    // 第二行：垂直排列
    .row-2 {
      flex-direction: column;

      :deep(.today-sales) {
        width: 100%;
      }

      .row-2-right {
        width: 100%;
      }
    }

    // 第三行：垂直排列
    .row-3 {
      flex-direction: column;

      .col-activities,
      .col-schedule,
      .col-actions {
        width: 100%;
        margin-top: 0;
      }

      .col-schedule,
      .col-actions {
        margin-top: 16px;
      }
    }

    .bottom-wrap {
      height: auto;
      margin-top: 15px;
      padding: 20px;

      .intro-content {
        .feature-list {
          grid-template-columns: 1fr;
          gap: 15px;

          .feature-item {
            padding: 15px;
          }
        }
      }
    }
  }

  /* ---------- 手机尺寸适配 ---------- */
  @media screen and (max-width: $device-phone) {
    // 卡片列表：单列布局
    :deep(.card-list) {
      width: 100%;
      margin: 0;

      li {
        width: 100%;
        margin: 0 0 15px;
      }
    }

    // 减小行间距
    .row-2,
    .row-3 {
      gap: 12px;
    }

    // 底部介绍区域：紧凑布局
    .bottom-wrap {
      padding: 15px;

      .intro-content {
        .feature-list {
          grid-template-columns: 1fr;
          gap: 12px;

          .feature-item {
            padding: 12px;
            flex-direction: column;
            text-align: center;

            .feature-icon {
              margin-right: 0;
              margin-bottom: 12px;
            }
          }
        }
      }
    }
  }
}
</style>

/* ============ 分析面板样式 ============ */
<style lang="scss" scoped>
.analysis-dashboard {
  :deep(.custom-card) {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  /* ---------- 卡片头部样式 ---------- */
  :deep(.custom-card-header) {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;

    .title {
      font-size: 20px;
      font-weight: 400;
      color: var(--art-text-gray-900);
    }

    .subtitle {
      position: absolute;
      bottom: 2px;
      left: 21px;
      font-size: 13px;
      color: var(--art-gray-600);
    }
  }

  .el-card {
    border: 1px solid #e8ebf1;
    box-shadow: none;
  }

  .mt-20 {
    margin-top: 20px;
  }
}

/* ---------- 暗黑主题适配 ---------- */
.dark {
  .analysis-dashboard {
    :deep(.custom-card) {
      box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
    }
  }
}

/* ---------- 响应式布局调整 ---------- */
@media (width <=1200px) {
  .analysis-dashboard {
    .mt-20 {
      margin-top: 0;
    }

    :deep(.custom-card) {
      margin-bottom: 20px;
    }
  }
}

/* ============ 环境监测样式 ============ */
// 环境监测表格容器
.env-monitor-table {
  margin-top: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.env-monitor-table .table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

// 环境监测主容器
.env-monitor {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 0 0 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px 0 25px;

    .title {
      h4.box-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--art-gray-900);
      }

      .subtitle {
        font-size: 14px;
        color: var(--art-gray-500);
        margin-top: 4px;
      }
    }
  }

  .el-table {
    margin-top: 10px;
    font-size: 14px;
  }
}
</style>
