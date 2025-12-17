import { BaseObjectResult } from '../axios'

/**
 * 供应商推荐项
 */
export interface SupplierItem {
  name: string
  reason: string
}

/**
 * 风险分析项
 */
export interface RiskAnalysisItem {
  risk: string
  level: string
  mitigation: string
}

/**
 * 替代资源项
 */
export interface AlternativeResourceItem {
  name: string
  advantage: string
}

/**
 * 资源采购AI建议
 */
export interface AgricultureResourceAiSuggestionResult {
  suggestionId: string
  resourceId: number | null
  resourceName: string | null
  resourceType: string | null
  currentStock: number | null
  stockUnit: string | null
  stockStatus: 'sufficient' | 'warning' | 'critical' | null
  avgDailyUsage: number | null
  remainingDays: number | null
  purchaseUrgency: 'immediate' | 'soon' | 'normal' | 'low' | null
  suggestedQuantity: number | null
  suggestedSuppliers: string | null // JSON数组字符串
  costEstimate: string | null
  purchaseTiming: string | null
  storageAdvice: string | null
  usageOptimization: string | null
  riskAnalysis: string | null
  alternativeResources: string | null
  summary: string | null
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string | null
}

export type AgricultureResourceAiSuggestionInfoResult = BaseObjectResult<AgricultureResourceAiSuggestionResult>

