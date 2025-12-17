<template>
  <div class="ai-environment-suggestion-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <div class="loading-text">
          <p class="main-text">AI正在分析环境数据...</p>
          <p class="sub-text">预计需要1-2分钟</p>
        </div>
      </div>
      <el-skeleton :rows="4" animated style="margin-top: 20px;" />
    </div>

    <!-- 无数据状态 -->
    <el-empty v-else-if="!suggestion" description="暂无AI建议，点击生成按钮获取">
      <el-button type="primary" @click="handleGenerate">
        <el-icon><MagicStick /></el-icon>
        生成AI建议
      </el-button>
    </el-empty>

    <!-- 建议内容 -->
    <div v-else class="suggestion-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" size="small" @click="handleGenerate" :loading="generating">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
        <span class="update-time">更新于：{{ suggestion.createTime }}</span>
      </div>

      <!-- 环境综合评分 -->
      <el-card class="section-card score-card" shadow="never">
        <div class="score-container">
          <el-progress type="dashboard" :percentage="suggestion.overallScore || 0" :color="getScoreColor(suggestion.overallScore)">
            <template #default="{ percentage }">
              <span class="score-value">{{ percentage }}</span>
              <span class="score-label">环境评分</span>
            </template>
          </el-progress>
          <div class="score-status">
            <el-tag :type="getStatusTagType(suggestion.overallStatus)" size="large">
              {{ getStatusText(suggestion.overallStatus) }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 当前环境数据 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Sunny /></el-icon>
            <span>当前环境数据</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">空气温度</div>
              <div class="env-value">{{ suggestion.currentTemperature || '-' }}</div>
              <div class="env-assessment" :class="getAssessmentClass(suggestion.tempAssessment)">
                {{ suggestion.tempAssessment || '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">空气湿度</div>
              <div class="env-value">{{ suggestion.currentHumidity || '-' }}</div>
              <div class="env-assessment" :class="getAssessmentClass(suggestion.humidityAssessment)">
                {{ suggestion.humidityAssessment || '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">光照强度</div>
              <div class="env-value">{{ suggestion.currentIlluminance || '-' }}</div>
              <div class="env-assessment" :class="getAssessmentClass(suggestion.lightAssessment)">
                {{ suggestion.lightAssessment || '-' }}
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">土壤温度</div>
              <div class="env-value">{{ suggestion.currentSoilTemperature || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">土壤湿度</div>
              <div class="env-value">{{ suggestion.currentSoilHumidity || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="env-item">
              <div class="env-label">土壤pH</div>
              <div class="env-value">{{ suggestion.currentSoilPh || '-' }}</div>
            </div>
          </el-col>
        </el-row>
        <div v-if="suggestion.soilAssessment" class="soil-assessment">
          <el-alert :title="suggestion.soilAssessment" type="info" :closable="false" />
        </div>
      </el-card>

      <!-- 操作建议 -->
      <el-card class="section-card" shadow="never" v-if="hasActions">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>操作建议</span>
          </div>
        </template>
        <!-- 紧急措施 -->
        <div v-if="urgentActions.length > 0" class="action-group">
          <div class="action-group-title urgent">
            <el-icon><Warning /></el-icon> 紧急措施
          </div>
          <div v-for="(action, index) in urgentActions" :key="'urgent-' + index" class="action-item urgent">
            <el-tag type="danger" size="small">紧急</el-tag>
            <span class="action-title">{{ action.title }}</span>
            <span class="action-content">{{ action.content }}</span>
          </div>
        </div>
        <!-- 重要措施 -->
        <div v-if="importantActions.length > 0" class="action-group">
          <div class="action-group-title important">
            <el-icon><InfoFilled /></el-icon> 重要措施
          </div>
          <div v-for="(action, index) in importantActions" :key="'important-' + index" class="action-item important">
            <el-tag type="warning" size="small">重要</el-tag>
            <span class="action-title">{{ action.title }}</span>
            <span class="action-content">{{ action.content }}</span>
          </div>
        </div>
        <!-- 建议措施 -->
        <div v-if="suggestedActions.length > 0" class="action-group">
          <div class="action-group-title suggested">
            <el-icon><Promotion /></el-icon> 建议措施
          </div>
          <div v-for="(action, index) in suggestedActions" :key="'suggested-' + index" class="action-item suggested">
            <el-tag type="info" size="small">建议</el-tag>
            <span class="action-title">{{ action.title }}</span>
            <span class="action-content">{{ action.content }}</span>
          </div>
        </div>
      </el-card>

      <!-- 设备控制建议 -->
      <el-card class="section-card" shadow="never" v-if="deviceControls.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>设备控制建议</span>
          </div>
        </template>
        <el-table :data="deviceControls" size="small" stripe>
          <el-table-column prop="device" label="设备" min-width="120" />
          <el-table-column prop="action" label="操作" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.action === '开启' ? 'success' : row.action === '关闭' ? 'danger' : 'warning'" size="small">
                {{ row.action }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="目标值" min-width="100" />
        </el-table>
      </el-card>

      <!-- 风险预警 -->
      <el-card class="section-card" shadow="never" v-if="riskWarnings.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><WarningFilled /></el-icon>
            <span>风险预警</span>
          </div>
        </template>
        <div v-for="(risk, index) in riskWarnings" :key="index" class="risk-item">
          <div class="risk-header">
            <span class="risk-name">{{ risk.risk }}</span>
            <el-tag :type="risk.probability === '高' ? 'danger' : risk.probability === '中' ? 'warning' : 'info'" size="small">
              {{ risk.probability }}概率
            </el-tag>
          </div>
          <div class="risk-prevention">预防：{{ risk.prevention }}</div>
        </div>
      </el-card>

      <!-- 总结 -->
      <el-card class="section-card summary-card" shadow="never" v-if="suggestion.summary">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>总结建议</span>
          </div>
        </template>
        <p class="summary-text">{{ suggestion.summary }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  Loading, MagicStick, Refresh, Sunny, List, Warning, InfoFilled, 
  Promotion, Setting, WarningFilled, Document 
} from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'
import type { AgricultureEnvironmentAiSuggestionResult, ActionItem, DeviceControlItem, RiskWarningItem } from '@/types/agriculture/environmentAiSuggestion'

const props = defineProps<{
  pastureId: number | string
}>()

const loading = ref(false)
const generating = ref(false)
const suggestion = ref<AgricultureEnvironmentAiSuggestionResult | null>(null)

// 解析JSON数组
const parseJsonArray = <T>(jsonStr: string | null): T[] => {
  if (!jsonStr) return []
  try {
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const urgentActions = computed(() => parseJsonArray<ActionItem>(suggestion.value?.urgentActions || null))
const importantActions = computed(() => parseJsonArray<ActionItem>(suggestion.value?.importantActions || null))
const suggestedActions = computed(() => parseJsonArray<ActionItem>(suggestion.value?.suggestedActions || null))
const deviceControls = computed(() => parseJsonArray<DeviceControlItem>(suggestion.value?.deviceControls || null))
const riskWarnings = computed(() => parseJsonArray<RiskWarningItem>(suggestion.value?.riskWarnings || null))

const hasActions = computed(() => 
  urgentActions.value.length > 0 || 
  importantActions.value.length > 0 || 
  suggestedActions.value.length > 0
)

// 状态映射
const statusMap: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' }> = {
  'excellent': { text: '优秀', type: 'success' },
  'good': { text: '良好', type: 'success' },
  'warning': { text: '警告', type: 'warning' },
  'critical': { text: '严重', type: 'danger' }
}

const getStatusText = (status: string | null) => statusMap[status || '']?.text || '未知'
const getStatusTagType = (status: string | null) => statusMap[status || '']?.type || 'info'

const getScoreColor = (score: number | null) => {
  if (!score) return '#909399'
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getAssessmentClass = (assessment: string | null) => {
  if (!assessment) return ''
  if (assessment.includes('适宜') || assessment.includes('正常')) return 'status-success'
  if (assessment.includes('偏') || assessment.includes('警告')) return 'status-warning'
  if (assessment.includes('严重') || assessment.includes('不足')) return 'status-danger'
  return ''
}

// 加载最新建议
const loadLatestSuggestion = async () => {
  if (!props.pastureId) return
  loading.value = true
  try {
    const res = await AgricultureDecisionService.getLatestEnvironmentSuggestion(props.pastureId)
    if (res.code === 200) {
      suggestion.value = res.data
    }
  } catch (error) {
    console.error('加载环境调控建议失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成建议
const handleGenerate = async () => {
  if (!props.pastureId) return
  generating.value = true
  try {
    const res = await AgricultureDecisionService.triggerGenerateEnvironmentSuggestion(props.pastureId)
    if (res.code === 200) {
      ElNotification({
        title: 'AI分析已开始',
        message: '正在分析环境数据，请稍后刷新查看',
        type: 'success',
        duration: 5000
      })
      // 延迟刷新
      setTimeout(() => {
        loadLatestSuggestion()
      }, 3000)
    } else {
      ElMessage.error(res.msg || '生成失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    generating.value = false
  }
}

watch(() => props.pastureId, (newId) => {
  if (newId) {
    loadLatestSuggestion()
  }
}, { immediate: true })

defineExpose({
  loadLatestSuggestion,
  handleGenerate
})
</script>

<style lang="scss" scoped>
.ai-environment-suggestion-panel {
  .loading-container {
    padding: 40px 20px;
    text-align: center;
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      
      .loading-icon {
        animation: rotate 2s linear infinite;
        color: #409EFF;
      }
      
      .loading-text {
        .main-text {
          font-size: 16px;
          color: #303133;
          margin-bottom: 4px;
        }
        .sub-text {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .update-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .section-card {
    margin-bottom: 16px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }

  .score-card {
    .score-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 20px;
      
      .score-value {
        font-size: 36px;
        font-weight: bold;
      }
      
      .score-label {
        display: block;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .env-item {
    text-align: center;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    
    .env-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }
    
    .env-value {
      font-size: 20px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .env-assessment {
      font-size: 12px;
      
      &.status-success { color: #67C23A; }
      &.status-warning { color: #E6A23C; }
      &.status-danger { color: #F56C6C; }
    }
  }

  .soil-assessment {
    margin-top: 16px;
  }

  .action-group {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .action-group-title {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      margin-bottom: 8px;
      
      &.urgent { color: #F56C6C; }
      &.important { color: #E6A23C; }
      &.suggested { color: #409EFF; }
    }
    
    .action-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 4px;
      border-radius: 4px;
      background: #fafafa;
      
      .action-title {
        font-weight: 500;
        min-width: 80px;
      }
      
      .action-content {
        color: #606266;
      }
    }
  }

  .risk-item {
    padding: 12px;
    margin-bottom: 8px;
    background: #fef0f0;
    border-radius: 4px;
    border-left: 3px solid #F56C6C;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .risk-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .risk-name {
        font-weight: 500;
      }
    }
    
    .risk-prevention {
      font-size: 13px;
      color: #606266;
    }
  }

  .summary-card {
    .summary-text {
      line-height: 1.8;
      color: #606266;
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

