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
    <el-empty v-else-if="!hasData" description="暂无AI建议，点击生成按钮获取">
      <el-button type="primary" @click="handleGenerate">
        <el-icon><MagicStick /></el-icon>
        生成AI建议
      </el-button>
    </el-empty>

    <!-- 全局分析：建议列表 -->
    <div v-else-if="isGlobalMode && suggestionList.length > 0" class="suggestion-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" size="small" @click="handleGenerate" :loading="generating">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
        <span class="update-time">更新于：{{ suggestionList[0]?.createTime }}</span>
      </div>

      <!-- 汇总统计 -->
      <el-card class="section-card" shadow="never">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">农资总数</div>
              <div class="status-value">{{ suggestionList.length }} 种</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">需立即采购</div>
              <div class="status-value text-danger">{{ urgencyStats.immediate }} 种</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">需尽快采购</div>
              <div class="status-value text-warning">{{ urgencyStats.soon }} 种</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">库存充足</div>
              <div class="status-value text-success">{{ urgencyStats.low }} 种</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 农资建议列表 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>各农资采购建议</span>
          </div>
        </template>
        <el-table :data="suggestionList" stripe size="small" :row-class-name="getRowClassName">
          <el-table-column prop="resourceName" label="农资名称" min-width="100" />
          <el-table-column label="当前库存" min-width="100">
            <template #default="{ row }">
              {{ row.currentStock || '-' }} {{ row.stockUnit || '' }}
            </template>
          </el-table-column>
          <el-table-column label="库存状态" min-width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="getStockStatusType(row.stockStatus)" size="small">
                {{ getStockStatusText(row.stockStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="日均消耗" min-width="90">
            <template #default="{ row }">
              {{ row.avgDailyUsage || 0 }} {{ row.stockUnit || '' }}
            </template>
          </el-table-column>
          <el-table-column label="可用天数" min-width="80" align="center">
            <template #default="{ row }">
              <span :class="getRemainingDaysClass(row.remainingDays)">
                {{ row.remainingDays || '-' }} 天
              </span>
            </template>
          </el-table-column>
          <el-table-column label="采购紧迫度" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getUrgencyType(row.purchaseUrgency)" size="small">
                {{ getUrgencyText(row.purchaseUrgency) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="建议采购量" min-width="100">
            <template #default="{ row }">
              <span v-if="row.suggestedQuantity > 0" class="highlight">
                {{ row.suggestedQuantity }} {{ row.stockUnit || '' }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="summary" label="建议摘要" min-width="200" show-overflow-tooltip />
        </el-table>
      </el-card>
    </div>

    <!-- 单个农资分析：详情展示 -->
    <div v-else-if="suggestion" class="suggestion-content">
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
          <el-col :span="6" v-if="suggestion.resourceId && suggestion.resourceName">
            <div class="status-item">
              <div class="status-label">农资名称</div>
              <div class="status-value">{{ suggestion.resourceName }}</div>
            </div>
          </el-col>
          <el-col :span="suggestion.resourceId && suggestion.resourceName ? 6 : 8">
            <div class="status-item">
              <div class="status-label">当前库存</div>
              <div class="status-value">
                {{ suggestion.currentStock || '-' }} {{ suggestion.stockUnit || '' }}
              </div>
            </div>
          </el-col>
          <el-col :span="suggestion.resourceId && suggestion.resourceName ? 6 : 8">
            <div class="status-item">
              <div class="status-label">库存状态</div>
              <div class="status-value">
                <el-tag :type="getStockStatusType(suggestion.stockStatus)" size="large">
                  {{ getStockStatusText(suggestion.stockStatus) }}
                </el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="suggestion.resourceId && suggestion.resourceName ? 6 : 8">
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
          <el-col :span="8" v-if="suggestion.purchaseUrgency !== 'low' && suggestion.suggestedQuantity">
            <div class="analysis-item">
              <div class="analysis-label">建议采购量</div>
              <div class="analysis-value highlight">{{ suggestion.suggestedQuantity }} {{ suggestion.stockUnit || '' }}</div>
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
        <div v-for="(risk, index) in riskAnalysis" :key="index" class="risk-item" :class="getRiskItemClass(risk.level)">
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
  OfficeBuilding, WarningFilled, Switch, Document, List 
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
const suggestionList = ref<AgricultureResourceAiSuggestionResult[]>([])

// 是否全局模式
const isGlobalMode = computed(() => !props.resourceId)

// 是否有数据
const hasData = computed(() => {
  if (isGlobalMode.value) {
    return suggestionList.value.length > 0
  }
  return suggestion.value !== null
})

// 紧迫度统计
const urgencyStats = computed(() => {
  const stats = { immediate: 0, soon: 0, normal: 0, low: 0 }
  suggestionList.value.forEach(item => {
    const urgency = item.purchaseUrgency as keyof typeof stats
    if (urgency && stats[urgency] !== undefined) {
      stats[urgency]++
    }
  })
  return stats
})

// 表格行样式
const getRowClassName = ({ row }: { row: AgricultureResourceAiSuggestionResult }) => {
  if (row.purchaseUrgency === 'immediate') return 'row-danger'
  if (row.purchaseUrgency === 'soon') return 'row-warning'
  return ''
}

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

const getRiskItemClass = (level: string) => {
  if (level === '高') return 'risk-high'
  if (level === '中') return 'risk-medium'
  return 'risk-low'
}

// 加载最新建议
const loadLatestSuggestion = async () => {
  loading.value = true
  try {
    if (isGlobalMode.value) {
      // 全局模式：加载建议列表
      const res = await AgricultureDecisionService.getLatestGlobalSuggestions()
      if (res.code === 200) {
        suggestionList.value = res.data || []
      }
    } else {
      // 单个农资模式：加载单条建议
      const res = await AgricultureDecisionService.getLatestResourceSuggestion(props.resourceId || undefined)
      if (res.code === 200) {
        suggestion.value = res.data
      }
    }
  } catch (error) {
    console.error('加载资源采购建议失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成建议
const handleGenerate = async () => {
  // 防止重复点击
  if (generating.value) return
  
  generating.value = true
  
  // 立即显示提示
  ElNotification({
    title: 'AI分析已开始',
    message: '正在调用DeepSeek AI生成建议，预计需要1-2分钟',
    type: 'success',
    duration: 5000
  })
  
  try {
    const res = await AgricultureDecisionService.triggerGenerateResourceSuggestion(props.resourceId || undefined)
    if (res.code !== 200) {
      ElMessage.error(res.msg || '生成失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  }
  
  // 3秒后刷新数据
  setTimeout(() => {
    loadLatestSuggestion()
    generating.value = false
  }, 3000)
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
    border-radius: 4px;
    border-left: 3px solid;
    
    &.risk-high {
      background: #fef0f0;
      border-left-color: #F56C6C;
    }
    
    &.risk-medium {
      background: #fdf6ec;
      border-left-color: #E6A23C;
    }
    
    &.risk-low {
      background: #f0f9eb;
      border-left-color: #67C23A;
    }
    
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

  .highlight {
    color: #409EFF;
    font-weight: 500;
  }

  .text-danger { color: #F56C6C !important; }
  .text-warning { color: #E6A23C !important; }
  .text-success { color: #67C23A !important; }

  :deep(.row-danger) {
    background-color: #fef0f0 !important;
  }
  
  :deep(.row-warning) {
    background-color: #fdf6ec !important;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

