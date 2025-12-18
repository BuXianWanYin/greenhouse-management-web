<template>
  <div class="ai-resource-suggestion-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <div class="loading-text">
          <p class="main-text">AI正在分析库存数据...</p>
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

      <!-- 库存状态概览 -->
      <el-card class="section-card status-card" shadow="never">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">农资名称</div>
              <div class="status-value">{{ suggestion.resourceName || '全局分析' }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">当前库存</div>
              <div class="status-value">
                {{ suggestion.currentStock || '-' }} {{ suggestion.stockUnit || '' }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">库存状态</div>
              <div class="status-value">
                <el-tag :type="getStockStatusType(suggestion.stockStatus)" size="large">
                  {{ getStockStatusText(suggestion.stockStatus) }}
                </el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">采购紧迫度</div>
              <div class="status-value">
                <el-tag :type="getUrgencyType(suggestion.purchaseUrgency)" size="large">
                  {{ getUrgencyText(suggestion.purchaseUrgency) }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 使用分析 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>使用分析</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="analysis-item">
              <div class="analysis-label">日均消耗</div>
              <div class="analysis-value">{{ suggestion.avgDailyUsage || '-' }} {{ suggestion.stockUnit || '' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-item">
              <div class="analysis-label">预计可用天数</div>
              <div class="analysis-value" :class="getRemainingDaysClass(suggestion.remainingDays)">
                {{ suggestion.remainingDays || '-' }} 天
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-item">
              <div class="analysis-label">建议采购量</div>
              <div class="analysis-value highlight">{{ suggestion.suggestedQuantity || '-' }} {{ suggestion.stockUnit || '' }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 采购建议 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><ShoppingCart /></el-icon>
            <span>采购建议</span>
          </div>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="成本预估">{{ suggestion.costEstimate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="采购时机">{{ suggestion.purchaseTiming || '-' }}</el-descriptions-item>
          <el-descriptions-item label="存储建议">{{ suggestion.storageAdvice || '-' }}</el-descriptions-item>
          <el-descriptions-item label="使用优化">{{ suggestion.usageOptimization || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 推荐供应商 -->
      <el-card class="section-card" shadow="never" v-if="suggestedSuppliers.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><OfficeBuilding /></el-icon>
            <span>推荐供应商</span>
          </div>
        </template>
        <div v-for="(supplier, index) in suggestedSuppliers" :key="index" class="supplier-item">
          <span class="supplier-name">{{ supplier.name }}</span>
          <span class="supplier-reason">{{ supplier.reason }}</span>
        </div>
      </el-card>

      <!-- 风险分析 -->
      <el-card class="section-card" shadow="never" v-if="riskAnalysis.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><WarningFilled /></el-icon>
            <span>风险分析</span>
          </div>
        </template>
        <div v-for="(risk, index) in riskAnalysis" :key="index" class="risk-item">
          <div class="risk-header">
            <span class="risk-name">{{ risk.risk }}</span>
            <el-tag :type="risk.level === '高' ? 'danger' : risk.level === '中' ? 'warning' : 'info'" size="small">
              {{ risk.level }}风险
            </el-tag>
          </div>
          <div class="risk-mitigation">缓解措施：{{ risk.mitigation }}</div>
        </div>
      </el-card>

      <!-- 替代资源 -->
      <el-card class="section-card" shadow="never" v-if="alternativeResources.length > 0">
        <template #header>
          <div class="card-header">
            <el-icon><Switch /></el-icon>
            <span>替代资源</span>
          </div>
        </template>
        <el-table :data="alternativeResources" size="small" stripe>
          <el-table-column prop="name" label="替代品名称" min-width="150" />
          <el-table-column prop="advantage" label="优势" min-width="200" />
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
  Loading, MagicStick, Refresh, TrendCharts, ShoppingCart, 
  OfficeBuilding, WarningFilled, Switch, Document 
} from '@element-plus/icons-vue'
import { AgricultureDecisionService } from '@/api/agriculture/decisionApi'
import type { 
  AgricultureResourceAiSuggestionResult, 
  SupplierItem, 
  RiskAnalysisItem, 
  AlternativeResourceItem 
} from '@/types/agriculture/resourceAiSuggestion'

const props = defineProps<{
  resourceId?: number | string | null
}>()

const loading = ref(false)
const generating = ref(false)
const suggestion = ref<AgricultureResourceAiSuggestionResult | null>(null)

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

const suggestedSuppliers = computed(() => parseJsonArray<SupplierItem>(suggestion.value?.suggestedSuppliers || null))
const riskAnalysis = computed(() => parseJsonArray<RiskAnalysisItem>(suggestion.value?.riskAnalysis || null))
const alternativeResources = computed(() => parseJsonArray<AlternativeResourceItem>(suggestion.value?.alternativeResources || null))

// 状态映射
const stockStatusMap: Record<string, { text: string; type: 'success' | 'warning' | 'danger' }> = {
  'sufficient': { text: '充足', type: 'success' },
  'warning': { text: '偏低', type: 'warning' },
  'critical': { text: '紧缺', type: 'danger' }
}

const urgencyMap: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' }> = {
  'immediate': { text: '立即采购', type: 'danger' },
  'soon': { text: '尽快采购', type: 'warning' },
  'normal': { text: '正常采购', type: 'info' },
  'low': { text: '暂不需要', type: 'success' }
}

const getStockStatusText = (status: string | null) => stockStatusMap[status || '']?.text || '未知'
const getStockStatusType = (status: string | null) => stockStatusMap[status || '']?.type || 'info'
const getUrgencyText = (urgency: string | null) => urgencyMap[urgency || '']?.text || '未知'
const getUrgencyType = (urgency: string | null) => urgencyMap[urgency || '']?.type || 'info'

const getRemainingDaysClass = (days: number | null) => {
  if (!days) return ''
  if (days <= 7) return 'text-danger'
  if (days <= 14) return 'text-warning'
  return 'text-success'
}

// 加载最新建议
const loadLatestSuggestion = async () => {
  loading.value = true
  try {
    const res = await AgricultureDecisionService.getLatestResourceSuggestion(props.resourceId || undefined)
    if (res.code === 200) {
      suggestion.value = res.data
    }
  } catch (error) {
    console.error('加载资源采购建议失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成建议
const handleGenerate = async () => {
  generating.value = true
  try {
    const res = await AgricultureDecisionService.triggerGenerateResourceSuggestion(props.resourceId || undefined)
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

watch(() => props.resourceId, () => {
  loadLatestSuggestion()
}, { immediate: true })

defineExpose({
  loadLatestSuggestion,
  handleGenerate
})
</script>

<style lang="scss" scoped>
.ai-resource-suggestion-panel {
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

  .status-item, .analysis-item {
    text-align: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    
    .status-label, .analysis-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .status-value, .analysis-value {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
      
      &.highlight {
        color: #409EFF;
      }
      
      &.text-danger { color: #F56C6C; }
      &.text-warning { color: #E6A23C; }
      &.text-success { color: #67C23A; }
    }
  }

  .supplier-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    margin-bottom: 8px;
    background: #f0f9eb;
    border-radius: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .supplier-name {
      font-weight: 500;
      color: #67C23A;
    }
    
    .supplier-reason {
      color: #606266;
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
    
    .risk-mitigation {
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

