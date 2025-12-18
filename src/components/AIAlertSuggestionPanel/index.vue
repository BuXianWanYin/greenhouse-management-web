<template>
  <div class="ai-alert-suggestion-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <div class="loading-text">
          <p class="main-text">AI正在分析预警信息...</p>
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

      <!-- 预警信息和严重程度 -->
      <el-card class="section-card" shadow="never">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="alert-info">
              <h4 class="alert-title">{{ suggestion.alertTitle }}</h4>
              <div class="alert-meta">
                <el-tag type="info" size="small">{{ suggestion.alertCategory }}</el-tag>
                <el-tag :type="getLevelType(suggestion.alertLevel)" size="small">{{ suggestion.alertLevel }}</el-tag>
                <span class="alert-time">{{ suggestion.alertTime }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="severity-container">
              <el-progress 
                type="dashboard" 
                :percentage="suggestion.severityScore || 0" 
                :color="getSeverityColor(suggestion.severityScore)"
                :width="100"
              >
                <template #default="{ percentage }">
                  <span class="severity-value">{{ percentage }}</span>
                  <span class="severity-label">严重程度</span>
                </template>
              </el-progress>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 根因分析和影响评估 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Search /></el-icon>
            <span>分析结果</span>
          </div>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="根因分析">
            <span class="analysis-text">{{ suggestion.rootCause || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="影响评估">
            <span class="analysis-text">{{ suggestion.impactAssessment || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预计解决时间">
            <el-tag type="info">{{ suggestion.estimatedResolutionTime || '-' }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 立即行动 -->
      <el-card class="section-card" shadow="never" v-if="immediateActions.length > 0">
        <template #header>
          <div class="card-header urgent">
            <el-icon><Warning /></el-icon>
            <span>立即行动</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item 
            v-for="(action, index) in immediateActions" 
            :key="index"
            type="danger"
            :hollow="true"
          >
            <div class="action-item">
              <div class="action-header">
                <span class="action-name">{{ action.action }}</span>
                <el-tag type="danger" size="small">{{ action.deadline }}</el-tag>
              </div>
              <div class="action-reason">{{ action.reason }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 短期措施 -->
      <el-card class="section-card" shadow="never" v-if="shortTermActions.length > 0">
        <template #header>
          <div class="card-header warning">
            <el-icon><Clock /></el-icon>
            <span>短期措施（24小时内）</span>
          </div>
        </template>
        <div v-for="(action, index) in shortTermActions" :key="index" class="measure-item">
          <el-tag type="warning" size="small">优先级 {{ action.priority || index + 1 }}</el-tag>
          <span class="measure-text">{{ action.action }}</span>
        </div>
      </el-card>

      <!-- 长期措施 -->
      <el-card class="section-card" shadow="never" v-if="longTermActions.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>长期措施（一周内）</span>
          </div>
        </template>
        <div v-for="(action, index) in longTermActions" :key="index" class="measure-item long-term">
          <span class="measure-text">{{ action.action }}</span>
          <span class="measure-benefit" v-if="action.benefit">收益：{{ action.benefit }}</span>
        </div>
      </el-card>

      <!-- 预防措施 -->
      <el-card class="section-card" shadow="never" v-if="preventionMeasures.length > 0">
        <template #header>
          <div class="card-header success">
            <el-icon><Shield /></el-icon>
            <span>预防措施</span>
          </div>
        </template>
        <el-table :data="preventionMeasures" size="small" stripe>
          <el-table-column prop="measure" label="措施" min-width="200" />
          <el-table-column prop="frequency" label="频率" min-width="100" />
        </el-table>
      </el-card>

      <!-- 影响范围 -->
      <el-card class="section-card" shadow="never" v-if="affectedAreas.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Location /></el-icon>
            <span>影响范围</span>
          </div>
        </template>
        <div v-for="(area, index) in affectedAreas" :key="index" class="area-item">
          <span class="area-name">{{ area.area }}</span>
          <span class="area-impact">{{ area.impact }}</span>
        </div>
      </el-card>

      <!-- 所需资源 -->
      <el-card class="section-card" shadow="never" v-if="resourceRequirements.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Box /></el-icon>
            <span>所需资源</span>
          </div>
        </template>
        <el-table :data="resourceRequirements" size="small" stripe>
          <el-table-column prop="resource" label="资源" min-width="150" />
          <el-table-column prop="quantity" label="数量" min-width="100" />
        </el-table>
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
import { ref, computed, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  Loading, MagicStick, Refresh, Search, Warning, Clock, 
  Calendar, Shield, Location, Box, Document 
} from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'
import type { 
  AgricultureAlertAiSuggestionResult,
  ImmediateActionItem,
  ActionItem,
  PreventionMeasureItem,
  AffectedAreaItem,
  ResourceRequirementItem
} from '@/types/agriculture/alertAiSuggestion'

const props = defineProps<{
  alertId: number | string
}>()

const loading = ref(false)
const generating = ref(false)
const suggestion = ref<AgricultureAlertAiSuggestionResult | null>(null)

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

const immediateActions = computed(() => parseJsonArray<ImmediateActionItem>(suggestion.value?.immediateActions || null))
const shortTermActions = computed(() => parseJsonArray<ActionItem>(suggestion.value?.shortTermActions || null))
const longTermActions = computed(() => parseJsonArray<ActionItem>(suggestion.value?.longTermActions || null))
const preventionMeasures = computed(() => parseJsonArray<PreventionMeasureItem>(suggestion.value?.preventionMeasures || null))
const affectedAreas = computed(() => parseJsonArray<AffectedAreaItem>(suggestion.value?.affectedAreas || null))
const resourceRequirements = computed(() => parseJsonArray<ResourceRequirementItem>(suggestion.value?.resourceRequirements || null))

// 状态映射
const levelTypeMap: Record<string, 'info' | 'warning' | 'danger'> = {
  '提示': 'info',
  '警告': 'warning',
  '严重': 'danger',
  '紧急': 'danger'
}

const getLevelType = (level: string | null) => levelTypeMap[level || ''] || 'info'

const getSeverityColor = (score: number | null) => {
  if (!score) return '#909399'
  if (score >= 80) return '#F56C6C'
  if (score >= 60) return '#E6A23C'
  if (score >= 40) return '#409EFF'
  return '#67C23A'
}

// 加载最新建议
const loadLatestSuggestion = async () => {
  if (!props.alertId) return
  loading.value = true
  try {
    const res = await AgricultureDecisionService.getLatestAlertSuggestion(props.alertId)
    if (res.code === 200) {
      suggestion.value = res.data
    }
  } catch (error) {
    console.error('加载预警处理建议失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成建议
const handleGenerate = async () => {
  if (!props.alertId) return
  generating.value = true
  try {
    const res = await AgricultureDecisionService.triggerGenerateAlertSuggestion(props.alertId)
    if (res.code === 200) {
      ElNotification({
        title: 'AI分析已开始',
        message: '正在调用DeepSeek AI生成建议，预计需要1-2分钟',
        type: 'success',
        duration: 5000
      })
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

watch(() => props.alertId, (newId) => {
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
.ai-alert-suggestion-panel {
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
      
      &.urgent { color: #F56C6C; }
      &.warning { color: #E6A23C; }
      &.success { color: #67C23A; }
    }
  }

  .alert-info {
    .alert-title {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    
    .alert-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .alert-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .severity-container {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .severity-value {
      font-size: 24px;
      font-weight: bold;
    }
    
    .severity-label {
      display: block;
      font-size: 12px;
      color: #909399;
    }
  }

  .analysis-text {
    line-height: 1.6;
  }

  .action-item {
    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .action-name {
        font-weight: 500;
      }
    }
    
    .action-reason {
      font-size: 13px;
      color: #606266;
    }
  }

  .measure-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fdf6ec;
    border-radius: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.long-term {
      background: #f0f9eb;
      flex-direction: column;
      align-items: flex-start;
      
      .measure-benefit {
        font-size: 12px;
        color: #67C23A;
        margin-top: 4px;
      }
    }
    
    .measure-text {
      flex: 1;
    }
  }

  .area-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fafafa;
    border-radius: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .area-name {
      font-weight: 500;
    }
    
    .area-impact {
      color: #909399;
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

