import request from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { AgricultureBatchAiSuggestionInfoResult } from '@/types/agriculture/batchAiSuggestion'

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

  /**
   * 生成人员推荐建议
   */
  static recommendEmployees(taskId: number | string) {
    return request.get<BaseResult<string>>({
      url: `/agriculture/decision/personnel/${taskId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 生成环境调控建议
   */
  static generateEnvironmentSuggestions(pastureId: number | string) {
    return request.get<BaseResult<string>>({
      url: `/agriculture/decision/environment/${pastureId}`,
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 生成资源采购建议
   */
  static generateResourceSuggestions(resourceId?: number | string) {
    return request.get<BaseResult<string>>({
      url: '/agriculture/decision/resource',
      params: resourceId ? { resourceId } : {},
      timeout: AI_DECISION_TIMEOUT
    })
  }

  /**
   * 生成预警处理建议
   */
  static generateAlertHandlingSuggestions(alertId: number | string) {
    return request.get<BaseResult<string>>({
      url: `/agriculture/decision/alert/${alertId}`,
      timeout: AI_DECISION_TIMEOUT
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

