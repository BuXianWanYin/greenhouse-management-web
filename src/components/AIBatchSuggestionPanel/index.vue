<template>
  <div class="ai-batch-suggestion-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <div class="loading-text">
          <p class="main-text">AI正在分析数据并生成建议...</p>
          <p class="sub-text">预计需要1-2分钟，请稍候</p>
          <p class="timer-text" v-if="elapsedTime > 0">已等待 {{ formatElapsedTime(elapsedTime) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 无数据状态 -->
    <el-empty v-else-if="!suggestion" description="暂无AI建议">
      <el-button type="primary" @click="triggerGenerate" :loading="generating">
        <el-icon><MagicStick /></el-icon>
        生成AI种植建议
      </el-button>
    </el-empty>
    
    <!-- 有数据时的结构化展示 -->
    <template v-else>
      <!-- 顶部操作栏 -->
      <div class="panel-header">
        <span class="update-time">更新时间：{{ suggestion.createTime }}</span>
        <el-button type="primary" size="small" @click="triggerGenerate" :loading="generating">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
      
      <!-- 基本信息 -->
      <el-row :gutter="20" class="section">
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">作物名称</div>
            <div class="info-value">{{ suggestion.cropName || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">温室</div>
            <div class="info-value">{{ suggestion.pastureName || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">当前状态</div>
            <div class="info-value">
              <el-tag :type="getStatusTagType(suggestion.currentStatus)" size="small">
                {{ formatStatus(suggestion.currentStatus) }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 环境评估 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Sunny /></el-icon>
            <span>环境评估</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">温度</span>
              <span class="env-value" :class="getStatusClass(suggestion.envTemperature)">
                {{ suggestion.envTemperature || '-' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">湿度</span>
              <span class="env-value" :class="getStatusClass(suggestion.envHumidity)">
                {{ suggestion.envHumidity || '-' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">光照</span>
              <span class="env-value" :class="getStatusClass(suggestion.envIlluminance)">
                {{ suggestion.envIlluminance || '-' }}
              </span>
            </div>
          </el-col>
        </el-row>
        <div class="assessment" v-if="suggestion.envAssessment">
          <el-icon><Warning /></el-icon>
          {{ suggestion.envAssessment }}
        </div>
      </el-card>
      
      <!-- 土壤评估 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Place /></el-icon>
            <span>土壤评估</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="env-item">
              <span class="env-label">土壤温度</span>
              <span class="env-value">{{ suggestion.soilTemperature || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="env-item">
              <span class="env-label">土壤湿度</span>
              <span class="env-value" :class="getStatusClass(suggestion.soilHumidity)">
                {{ suggestion.soilHumidity || '-' }}
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="env-item">
              <span class="env-label">pH值</span>
              <span class="env-value">{{ suggestion.soilPh || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="env-item">
              <span class="env-label">电导率</span>
              <span class="env-value">{{ suggestion.soilConductivity || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="mt-10">
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">氮(N)</span>
              <span class="env-value" :class="getStatusClass(suggestion.soilNitrogen)">
                {{ suggestion.soilNitrogen || '-' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">磷(P)</span>
              <span class="env-value" :class="getStatusClass(suggestion.soilPhosphorus)">
                {{ suggestion.soilPhosphorus || '-' }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <span class="env-label">钾(K)</span>
              <span class="env-value" :class="getStatusClass(suggestion.soilPotassium)">
                {{ suggestion.soilPotassium || '-' }}
              </span>
            </div>
          </el-col>
        </el-row>
        <div class="assessment" v-if="suggestion.soilAssessment">
          <el-icon><Warning /></el-icon>
          {{ suggestion.soilAssessment }}
        </div>
      </el-card>
      
      <!-- 种植密度建议 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Grid /></el-icon>
            <span>种植密度建议</span>
          </div>
        </template>
        <el-row :gutter="16" align="middle">
          <el-col :span="8">
            <div class="density-item">
              <div class="density-label">当前密度</div>
              <div class="density-value">{{ suggestion.densityCurrent || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="2" class="density-arrow">
            <el-icon :size="20"><Right /></el-icon>
          </el-col>
          <el-col :span="8">
            <div class="density-item suggested">
              <div class="density-label">建议密度</div>
              <div class="density-value">{{ suggestion.densitySuggested || '-' }}</div>
            </div>
          </el-col>
        </el-row>
        <div class="density-reason-box" v-if="suggestion.densityReason">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ suggestion.densityReason }}</span>
        </div>
      </el-card>
      
      <!-- 产量预估 -->
      <el-card class="section-card yield-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>产量预估</span>
          </div>
        </template>
        <el-row :gutter="16" align="middle">
          <el-col :span="8">
            <div class="yield-item">
              <div class="yield-label">当前条件预计产量</div>
              <div class="yield-value current">{{ suggestion.yieldExpected || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="2" class="yield-arrow">
            <el-icon :size="24"><Right /></el-icon>
          </el-col>
          <el-col :span="8">
            <div class="yield-item">
              <div class="yield-label">优化后预计产量</div>
              <div class="yield-value optimized">{{ suggestion.yieldOptimized || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="yield-increase" v-if="suggestion.yieldIncrease">
              <el-icon><Top /></el-icon>
              {{ suggestion.yieldIncrease }}
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 措施建议 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>措施建议</span>
          </div>
        </template>
        <!-- 紧急措施 -->
        <div v-if="urgentActions.length > 0" class="action-section">
          <div class="action-level urgent">
            <el-tag type="danger" size="small">紧急</el-tag>
          </div>
          <div class="action-list">
            <div v-for="(action, index) in urgentActions" :key="'urgent-' + index" class="action-item urgent">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-content">{{ action.content }}</div>
            </div>
          </div>
        </div>
        <!-- 重要措施 -->
        <div v-if="importantActions.length > 0" class="action-section">
          <div class="action-level important">
            <el-tag type="warning" size="small">重要</el-tag>
          </div>
          <div class="action-list">
            <div v-for="(action, index) in importantActions" :key="'important-' + index" class="action-item important">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-content">{{ action.content }}</div>
            </div>
          </div>
        </div>
        <!-- 建议措施 -->
        <div v-if="suggestedActions.length > 0" class="action-section">
          <div class="action-level suggested">
            <el-tag type="info" size="small">建议</el-tag>
          </div>
          <div class="action-list">
            <div v-for="(action, index) in suggestedActions" :key="'suggested-' + index" class="action-item suggested">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-content">{{ action.content }}</div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 风险预警 -->
      <el-card class="section-card" shadow="never" v-if="riskHighList.length > 0 || riskMediumList.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><WarningFilled /></el-icon>
            <span>风险预警</span>
          </div>
        </template>
        <el-table :data="allRisks" style="width: 100%">
          <el-table-column label="级别" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.levelType" size="small">{{ scope.row.levelName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="风险" prop="risk" min-width="120" />
          <el-table-column label="影响" prop="impact" min-width="150" />
          <el-table-column label="解决方案" prop="solution" min-width="200" />
        </el-table>
      </el-card>
      
      <!-- 生长阶段管理 -->
      <el-card class="section-card" shadow="never" v-if="growthStagesList.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>生长阶段管理</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item v-for="(stage, index) in growthStagesList" :key="index" :timestamp="stage.period" placement="top">
            <el-card shadow="never">
              <h4>{{ stage.stage }}</h4>
              <p>{{ stage.tasks }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
      
      <!-- 总结 -->
      <el-card class="section-card summary-card" shadow="never" v-if="suggestion.summary">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>总结建议</span>
          </div>
        </template>
        <div class="summary-content">{{ suggestion.summary }}</div>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  Loading, MagicStick, Refresh, Sunny, Place, Grid, 
  TrendCharts, Right, Top, List, WarningFilled, Calendar, 
  Document, Warning, InfoFilled
} from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'
import type { 
  AgricultureBatchAiSuggestionResult, 
  ActionItem, 
  RiskItem, 
  GrowthStageItem 
} from '@/types/agriculture/batchAiSuggestion'

const props = defineProps<{
  batchId: number | string
}>()

const loading = ref(false)
const generating = ref(false)
const suggestion = ref<AgricultureBatchAiSuggestionResult | null>(null)
const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

// 解析JSON数组
const parseJsonArray = <T>(jsonStr: string | null | undefined): T[] => {
  if (!jsonStr) return []
  try {
    return JSON.parse(jsonStr)
  } catch {
    return []
  }
}

// 计算属性：解析各类措施
const urgentActions = computed<ActionItem[]>(() => parseJsonArray(suggestion.value?.urgentActions))
const importantActions = computed<ActionItem[]>(() => parseJsonArray(suggestion.value?.importantActions))
const suggestedActions = computed<ActionItem[]>(() => parseJsonArray(suggestion.value?.suggestedActions))

// 计算属性：解析风险
const riskHighList = computed<RiskItem[]>(() => parseJsonArray(suggestion.value?.riskHigh))
const riskMediumList = computed<RiskItem[]>(() => parseJsonArray(suggestion.value?.riskMedium))
const riskLowList = computed<RiskItem[]>(() => parseJsonArray(suggestion.value?.riskLow))

// 合并所有风险
const allRisks = computed(() => {
  const risks: (RiskItem & { levelType: string; levelName: string })[] = []
  riskHighList.value.forEach(r => risks.push({ ...r, levelType: 'danger', levelName: '高' }))
  riskMediumList.value.forEach(r => risks.push({ ...r, levelType: 'warning', levelName: '中' }))
  riskLowList.value.forEach(r => risks.push({ ...r, levelType: 'info', levelName: '低' }))
  return risks
})

// 计算属性：生长阶段
const growthStagesList = computed<GrowthStageItem[]>(() => parseJsonArray(suggestion.value?.growthStages))

// 根据文本内容判断状态类
const getStatusClass = (text: string | null | undefined) => {
  if (!text) return ''
  const lowerText = text.toLowerCase()
  if (lowerText.includes('严重') || lowerText.includes('不足') || lowerText.includes('缺乏')) {
    return 'status-danger'
  }
  if (lowerText.includes('偏低') || lowerText.includes('偏高')) {
    return 'status-warning'
  }
  if (lowerText.includes('适宜') || lowerText.includes('正常')) {
    return 'status-success'
  }
  return ''
}

// 状态映射
const statusMap: Record<string, string> = {
  '0': '未开始',
  '1': '进行中',
  '2': '已完成',
  '3': '已取消'
}

// 格式化状态显示
const formatStatus = (status: string | null | undefined) => {
  if (!status) return '-'
  return statusMap[String(status)] || status
}

// 获取状态标签类型
const getStatusTagType = (status: string | null | undefined) => {
  const s = String(status)
  if (s === '0') return 'info'
  if (s === '1') return 'success'
  if (s === '2') return 'primary'
  if (s === '3') return 'danger'
  return 'info'
}

// 计时器
const startTimer = () => {
  elapsedTime.value = 0
  timerInterval = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formatElapsedTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

// 加载建议
const loadSuggestion = async () => {
  if (!props.batchId) return
  loading.value = true
  try {
    const res = await AgricultureDecisionService.getLatestBatchSuggestion(props.batchId)
    if (res.code === 200) {
      suggestion.value = res.data
    }
  } catch (error) {
    console.error('加载AI建议失败:', error)
  } finally {
    loading.value = false
  }
}

// 触发生成
const triggerGenerate = async () => {
  if (!props.batchId) return
  generating.value = true
  startTimer()
  
  ElNotification({
    title: 'AI分析已开始',
    message: '正在调用DeepSeek AI生成建议，预计需要1-2分钟',
    type: 'success',
    duration: 5000
  })
  
  try {
    const res = await AgricultureDecisionService.triggerGenerateBatchSuggestion(props.batchId)
    if (res.code === 200) {
      // 轮询获取结果
      await pollForResult()
    } else {
      ElMessage.error(res.msg || '生成失败')
    }
  } catch (error: any) {
    console.error('生成AI建议失败:', error)
    ElMessage.error(error.message || '生成失败')
  } finally {
    generating.value = false
    stopTimer()
  }
}

// 轮询获取结果
const pollForResult = async () => {
  const maxAttempts = 24 // 最多等待2分钟 (5秒 * 24)
  let attempts = 0
  const oldCreateTime = suggestion.value?.createTime
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // 每5秒检查一次
    attempts++
    
    try {
      const res = await AgricultureDecisionService.getLatestBatchSuggestion(props.batchId)
      if (res.code === 200 && res.data) {
        // 检查是否有新数据
        if (res.data.createTime !== oldCreateTime) {
          suggestion.value = res.data
          ElNotification({
            title: 'AI分析完成',
            message: '智能建议已生成，请查看结果',
            type: 'success',
            duration: 3000
          })
          return
        }
      }
    } catch (error) {
      console.error('轮询失败:', error)
    }
  }
  
  ElMessage.warning('生成超时，请稍后刷新查看')
}

// 监听batchId变化
watch(
  () => props.batchId,
  (newId) => {
    if (newId) {
      loadSuggestion()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  stopTimer()
})

// 暴露方法
defineExpose({
  loadSuggestion,
  triggerGenerate
})
</script>

<style lang="scss" scoped>
.ai-batch-suggestion-panel {
  padding: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-content {
  text-align: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: var(--el-color-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  
  .main-text {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }
  
  .sub-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  
  .timer-text {
    margin-top: 8px;
    font-size: 14px;
    color: var(--el-color-primary);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .update-time {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.section {
  margin-bottom: 16px;
}

.info-card {
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  
  .info-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.section-card {
  margin-bottom: 16px;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
}

.env-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  
  .env-label {
    color: var(--el-text-color-secondary);
  }
  
  .env-value {
    font-weight: 500;
    
    &.status-danger {
      color: var(--el-color-danger);
    }
    
    &.status-warning {
      color: var(--el-color-warning);
    }
    
    &.status-success {
      color: var(--el-color-success);
    }
  }
}

.assessment {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--el-color-warning-light-9);
  border-radius: 6px;
  color: var(--el-color-warning-dark-2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mt-10 {
  margin-top: 10px;
}

.density-item {
  text-align: center;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  
  &.suggested {
    background: var(--el-color-success-light-9);
    border: 1px solid var(--el-color-success-light-5);
  }
  
  .density-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }
  
  .density-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.density-arrow {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.density-reason-box {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  .el-icon {
    color: var(--el-color-info);
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.yield-card {
  .yield-item {
    text-align: center;
    
    .yield-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }
    
    .yield-value {
      font-size: 24px;
      font-weight: 600;
      
      &.current {
        color: var(--el-text-color-regular);
      }
      
      &.optimized {
        color: var(--el-color-success);
      }
    }
  }
  
  .yield-arrow {
    text-align: center;
    color: var(--el-text-color-secondary);
  }
  
  .yield-increase {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-color-success);
  }
}

.action-section {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .action-level {
    margin-bottom: 8px;
  }
  
  .action-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .action-item {
    flex: 1;
    min-width: 200px;
    max-width: calc(50% - 6px);
    padding: 12px;
    border-radius: 8px;
    border-left: 4px solid;
    
    &.urgent {
      background: var(--el-color-danger-light-9);
      border-color: var(--el-color-danger);
    }
    
    &.important {
      background: var(--el-color-warning-light-9);
      border-color: var(--el-color-warning);
    }
    
    &.suggested {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-info);
    }
    
    .action-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .action-content {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}

.summary-card {
  .summary-content {
    font-size: 15px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    padding: 8px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }
}
</style>

