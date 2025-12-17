import request from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { AgricultureBatchAiSuggestionInfoResult } from '@/types/agriculture/batchAiSuggestion'
import { AgricultureEnvironmentAiSuggestionInfoResult } from '@/types/agriculture/environmentAiSuggestion'
import { AgricultureResourceAiSuggestionInfoResult } from '@/types/agriculture/resourceAiSuggestion'
import { AgricultureAlertAiSuggestionInfoResult } from '@/types/agriculture/alertAiSuggestion'

/**
 * AI决策API超时时间（2分钟）
 * DeepSeek API响应较慢，需要更长的超时时间
 */
const AI_DECISION_TIMEOUT = 120000

/**
 * 智能决策建议API
 */
export class AgricultureDecisionService {
  /**
   * 生成种植计划建议
   */
  static generatePlanSuggestions(batchId: number | string) {
    return request.get<BaseResult<string>>({
      url: `/agriculture/decision/plan/${batchId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  // ==================== 环境调控建议 ====================

  /**
   * 触发异步生成环境调控建议
   */
  static triggerGenerateEnvironmentSuggestion(pastureId: number | string) {
    return request.post<BaseResult<string>>({
      url: `/agriculture/decision/environment/generate/${pastureId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 获取温室最新的环境调控AI建议
   */
  static getLatestEnvironmentSuggestion(pastureId: number | string) {
    return request.get<AgricultureEnvironmentAiSuggestionInfoResult>({
      url: `/agriculture/decision/environment/latest/${pastureId}`
    })
  }

  // ==================== 资源采购建议 ====================

  /**
   * 触发异步生成资源采购建议
   */
  static triggerGenerateResourceSuggestion(resourceId?: number | string) {
    return request.post<BaseResult<string>>({
      url: '/agriculture/decision/resource/generate',
      params: resourceId ? { resourceId } : {},
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 获取农资最新的采购AI建议
   */
  static getLatestResourceSuggestion(resourceId?: number | string) {
    return request.get<AgricultureResourceAiSuggestionInfoResult>({
      url: '/agriculture/decision/resource/latest',
      params: resourceId ? { resourceId } : {}
    })
  }

  // ==================== 预警处理建议 ====================

  /**
   * 触发异步生成预警处理建议
   */
  static triggerGenerateAlertSuggestion(alertId: number | string) {
    return request.post<BaseResult<string>>({
      url: `/agriculture/decision/alert/generate/${alertId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 获取预警最新的处理AI建议
   */
  static getLatestAlertSuggestion(alertId: number | string) {
    return request.get<AgricultureAlertAiSuggestionInfoResult>({
      url: `/agriculture/decision/alert/latest/${alertId}`
    })
  }

  /**
   * 触发异步生成批次种植建议（返回JSON结构化数据）
   */
  static triggerGenerateBatchSuggestion(batchId: number | string) {
    return request.post<BaseResult<string>>({
      url: `/agriculture/decision/plan/generate/${batchId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 获取批次最新的AI建议（结构化数据）
   */
  static getLatestBatchSuggestion(batchId: number | string) {
    return request.get<AgricultureBatchAiSuggestionInfoResult>({
      url: `/agriculture/decision/plan/latest/${batchId}`
    })
  }
}

