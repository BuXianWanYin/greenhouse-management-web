<template>
  <div class="console">
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
    
    <!-- 底部系统介绍 -->
    <div class="bottom-wrap art-custom-card" style="margin-bottom: 60px;">
      <div class="intro-content">
        <h2 class="box-title">关于温室种植计划管理与人员分工系统</h2>
        <p class="intro-text">{{ systemName }} 是一款专业的温室种植计划管理与人员分工系统</p>
        <p class="intro-text">系统集成了种植计划管理、批次任务管理、人员分工、作物管理、环境监测等核心功能，助力温室农业智能化管理</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <el-icon class="feature-icon"><Document /></el-icon>
            <div class="feature-content">
              <h3>种植计划管理</h3>
              <p>支持年度计划、季度计划、轮作计划等多种计划类型，实现全周期种植规划</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><UserFilled /></el-icon>
            <div class="feature-content">
              <h3>人员分工管理</h3>
              <p>灵活的人员分配机制，确保每个任务都有明确的责任人</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Crop /></el-icon>
            <div class="feature-content">
              <h3>作物信息管理</h3>
              <p>完善的作物作物库管理，支持作业流程配置和智能分析</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Monitor /></el-icon>
            <div class="feature-content">
              <h3>环境监测</h3>
              <p>实时监测温室环境数据，为种植决策提供科学依据</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardList from './widget/CardList.vue'
import TodaySales from './widget/TodaySales.vue'
import BatchTrendChart from './widget/BatchTrendChart.vue'
import RecentActivities from './widget/RecentActivities.vue'
import TodaySchedule from './widget/TodaySchedule.vue'
import QuickActions from './widget/QuickActions.vue'
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

const currentGlopTheme = computed(() => settingStore.systemThemeType)

// 系统主题风格变化时，刷新页面重写渲染 Echarts
watch(currentGlopTheme, () => {
  settingStore.reload()
})

useCommon().scrollToTop()

// 卡片数据（农业统计）
const cardList = ref<ConsoleTotalInfo[]>([])
// 批量任务统计数据
const countList = ref<ConsoleTotalInfo[]>([])
// 批次趋势数据
const batchTrendData = ref<any[]>([])
// 最近动态数据
const recentActivities = ref<any[]>([])
// 今日排班数据
const todayScheduleList = ref<any[]>([])

// 获取农业统计卡片数据
const getCardList = async () => {
  const res = await AgricultureConsoleService.listAgriculture()
  cardList.value = res.data
}

// 获取批量任务统计数据
const getCountList = async () => {
  const res = await AgricultureConsoleService.listBatchTask()
  countList.value = res.data
}

// 获取批次创建趋势数据
const getBatchTrend = async () => {
  const res = await AgricultureConsoleService.getBatchTrend()
  batchTrendData.value = res.data
}

// 获取今日排班列表
const getTodaySchedule = async () => {
  const res = await AgricultureConsoleService.getTodaySchedule()
  todayScheduleList.value = res.data
}

// 获取最近动态
const getRecentActivities = async () => {
  const res = await AgricultureConsoleService.getRecentActivities()
  recentActivities.value = res.data
}

// 监听全局 event 总线，实时更新统计数据
event.on('message', (data: ConsoleToTalData) => {
  cardList.value = data.agriculture
  countList.value = data.batchTask
})

// 页面挂载时获取所有统计数据
onMounted(() => {
  getCardList()
  getCountList()
  getBatchTrend()
  getTodaySchedule()
  getRecentActivities()
})
</script>

<style lang="scss" scoped>
.console {
  padding-bottom: 15px;

  // 主标题
  :deep(.box-title) {
    color: var(--art-gray-900) !important;
  }

  // 副标题
  :deep(.subtitle) {
    color: var(--art-gray-600) !important;
  }

  :deep(.card-list li),
  .bottom-wrap {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  // 第二行布局：任务统计 + 批次趋势
  .row-2 {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    align-items: stretch;

    :deep(.today-sales) {
      flex-shrink: 0;
    }

    .row-2-right {
      flex: 1;
      min-width: 0;
    }
  }

  // 第三行布局：最近动态 + 今日排班 + 快捷操作
  .row-3 {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    min-height: 320px;

    .col-activities {
      flex: 1;
    }

    .col-schedule {
      flex: 1;
    }

    .col-actions {
      width: 280px;
    }
  }

  .bottom-wrap {
    box-sizing: border-box;
    padding: 30px;
    margin-top: 16px;
    background: var(--art-main-bg-color);
    min-height: 400px;

    .intro-content {
      max-width: 1200px;
      margin: 0 auto;

      h2 {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 24px;
        font-weight: 600;
        color: var(--art-gray-900);
      }

      .intro-text {
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--art-gray-700);
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 30px;

        .feature-item {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          background: var(--art-bg-color);
          border-radius: 12px;
          transition: all 0.3s;
          border: 1px solid var(--art-border-color);

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
          }

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

<!-- 移动端处理 -->
<style lang="scss" scoped>
.console {
  @media screen and (max-width: $device-ipad-pro) {
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

  @media screen and (max-width: $device-ipad-vertical) {
    :deep(.card-list) {
      width: calc(100% + 15px);
      margin-left: -15px;

      li {
        width: calc(50% - 15px);
        margin: 0 0 15px 15px;
      }
    }

    .row-2 {
      flex-direction: column;

      :deep(.today-sales) {
        width: 100%;
      }

      .row-2-right {
        width: 100%;
      }
    }

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

  @media screen and (max-width: $device-phone) {
    :deep(.card-list) {
      width: 100%;
      margin: 0;

      li {
        width: 100%;
        margin: 0 0 15px;
      }
    }

    .row-2,
    .row-3 {
      gap: 12px;
    }

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
<style lang="scss" scoped>
.analysis-dashboard {
  :deep(.custom-card) {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  // 卡片头部
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

.dark {
  .analysis-dashboard {
    :deep(.custom-card) {
      box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
    }
  }
}

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
