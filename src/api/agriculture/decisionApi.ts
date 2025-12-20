import request from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { AgricultureBatchAiSuggestionInfoResult } from '@/types/agriculture/batchAiSuggestion'
import { AgricultureResourceAiSuggestionInfoResult } from '@/types/agriculture/resourceAiSuggestion'

/**
 * AI决策API超时时间（2分钟）
 * DeepSeek API响应较慢，需要更长的超时时间
 */
const AI_DECISION_TIMEOUT = 120000

/**
 * 智能决策建议API
 */
export class AgricultureDecisionService {
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

