<template>
  <div
    class="alert-center"
    v-show="visible"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    @click.stop=""
  >
    <div class="header">
      <span class="text">预警中心</span>
      <span class="btn" @click="handleAllRead">全部已读</span>
    </div>
    <el-tabs v-model="activeTab" class="alert-tabs">
      <el-tab-pane label="全部" name="all">
        <AlertList :alerts="allAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
      <el-tab-pane :label="`设备预警 (${countMap.device || 0})`" name="device">
        <AlertList :alerts="deviceAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
      <el-tab-pane :label="`任务预警 (${countMap.task || 0})`" name="task">
        <AlertList :alerts="taskAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
      <el-tab-pane :label="`资源预警 (${countMap.resource || 0})`" name="resource">
        <AlertList :alerts="resourceAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
      <el-tab-pane :label="`质量预警 (${countMap.quality || 0})`" name="quality">
        <AlertList :alerts="qualityAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
      <el-tab-pane :label="`排班预警 (${countMap.schedule || 0})`" name="schedule">
        <AlertList :alerts="scheduleAlerts" @handle="handleAlert" @ignore="ignoreAlert" />
      </el-tab-pane>
    </el-tabs>
    <div class="btn-wrapper">
      <el-button class="view-all" @click="handleViewAll">查看全部预警</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { AgricultureAlertService } from '@/api/agriculture/alertApi'
import { AgricultureAlertResult } from '@/types/agriculture/alert'
import AlertList from './AlertList.vue'

const props = defineProps({
  value: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const show = ref(false)
const visible = ref(false)
const activeTab = ref('all')
const alertList = ref<AgricultureAlertResult[]>([])
const countMap = ref<Record<string, number>>({
  all: 0,
  device: 0,
  task: 0,
  resource: 0,
  quality: 0,
  schedule: 0
})

watch(
  () => props.value,
  () => {
    showAlertCenter(props.value)
    if (props.value) {
      loadAlerts()
      loadCount()
    }
  }
)

// 定时刷新预警数量
let refreshTimer: any = null

onMounted(() => {
  loadCount()
  // 每30秒刷新一次预警数量
  refreshTimer = setInterval(() => {
    if (props.value) {
      loadCount()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

// 计算各分类的预警列表
const allAlerts = computed(() => {
  return alertList.value.filter(alert => alert.status === 0)
})

const deviceAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.alertCategory === 'device')
})

const taskAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.alertCategory === 'task')
})

const resourceAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.alertCategory === 'resource')
})

const qualityAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.alertCategory === 'quality')
})

const scheduleAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.alertCategory === 'schedule')
})

// 加载预警列表
const loadAlerts = async () => {
  try {
    const res = await AgricultureAlertService.listAlert({ status: 0, pageNum: 1, pageSize: 50 })
    if (res.code === 200) {
      alertList.value = res.rows || []
    }
  } catch (error) {
    console.error('加载预警列表失败:', error)
  }
}

// 加载预警数量统计
const loadCount = async () => {
  try {
    const res = await AgricultureAlertService.getUnhandledCount()
    if (res.code === 200) {
      countMap.value = res.data || {}
    }
  } catch (error) {
    console.error('加载预警数量失败:', error)
  }
}

// 处理预警
const handleAlert = async (alert: AgricultureAlertResult) => {
  try {
    const res = await AgricultureAlertService.handleAlert(alert.alertId)
    if (res.code === 200) {
      ElMessage.success('处理成功')
      loadAlerts()
      loadCount()
    }
  } catch (error) {
    console.error('处理预警失败:', error)
  }
}

// 忽略预警
const ignoreAlert = async (alert: AgricultureAlertResult) => {
  try {
    const res = await AgricultureAlertService.ignoreAlert(alert.alertId)
    if (res.code === 200) {
      ElMessage.success('已忽略')
      loadAlerts()
      loadCount()
    }
  } catch (error) {
    console.error('忽略预警失败:', error)
  }
}

// 全部已读
const handleAllRead = async () => {
  const unhandledAlerts = allAlerts.value
  if (unhandledAlerts.length === 0) {
    ElMessage.info('没有未处理的预警')
    return
  }
  
  try {
    const promises = unhandledAlerts.map(alert => 
      AgricultureAlertService.handleAlert(alert.alertId)
    )
    await Promise.all(promises)
    ElMessage.success('全部标记为已读')
    loadAlerts()
    loadCount()
  } catch (error) {
    console.error('批量处理失败:', error)
  }
}

// 查看全部预警
const handleViewAll = () => {
  router.push('/agriculture/alert')
}

const showAlertCenter = (open: boolean) => {
  if (open) {
    visible.value = open
    setTimeout(() => {
      show.value = open
    }, 5)
  } else {
    show.value = open
    setTimeout(() => {
      visible.value = open
    }, 350)
  }
}
</script>

<style lang="scss" scoped>
.alert-center {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-light);

    .text {
      font-size: 16px;
      font-weight: 500;
    }

    .btn {
      font-size: 14px;
      color: var(--el-color-primary);
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .alert-tabs {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow-y: auto;
    }
  }

  .btn-wrapper {
    padding: 12px 20px;
    border-top: 1px solid var(--el-border-color-light);
    text-align: center;

    .view-all {
      width: 100%;
    }
  }
}
</style>

