import { BaseObjectResult } from '../axios'

/**
 * 立即行动项
 */
export interface ImmediateActionItem {
  action: string
  reason: string
  deadline: string
}

/**
 * 短期/长期措施项
 */
export interface ActionItem {
  action: string
  priority?: number
  benefit?: string
}

/**
 * 预防措施项
 */
export interface PreventionMeasureItem {
  measure: string
  frequency: string
}

/**
 * 影响范围项
 */
export interface AffectedAreaItem {
  area: string
  impact: string
}

/**
 * 所需资源项
 */
export interface ResourceRequirementItem {
  resource: string
  quantity: string
}

/**
 * 预警处理AI建议
 */
export interface AgricultureAlertAiSuggestionResult {
  suggestionId: string
  alertId: number
  alertTitle: string | null
  alertCategory: string | null
  alertLevel: string | null
  alertTime: string | null
  rootCause: string | null
  impactAssessment: string | null
  severityScore: number | null
  immediateActions: string | null // JSON数组字符串
  shortTermActions: string | null
  longTermActions: string | null
  preventionMeasures: string | null
  affectedAreas: string | null
  relatedAlerts: string | null
  estimatedResolutionTime: string | null
  resourceRequirements: string | null
  summary: string | null
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string | null
}

export type AgricultureAlertAiSuggestionInfoResult = BaseObjectResult<AgricultureAlertAiSuggestionResult>

