import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'

/**
 * 智能决策建议API
 */
export class AgricultureDecisionService {
  /**
   * 生成种植计划建议
   */
  static generatePlanSuggestions(batchId: number | string) {
    return request.get<CodeMsgResult<string>>({
      url: `/agriculture/decision/plan/${batchId}`
    })
  }

  /**
   * 生成人员推荐建议
   */
  static recommendEmployees(taskId: number | string) {
    return request.get<CodeMsgResult<string>>({
      url: `/agriculture/decision/personnel/${taskId}`
    })
  }

  /**
   * 生成环境调控建议
   */
  static generateEnvironmentSuggestions(pastureId: number | string) {
    return request.get<CodeMsgResult<string>>({
      url: `/agriculture/decision/environment/${pastureId}`
    })
  }

  /**
   * 生成资源采购建议
   */
  static generateResourceSuggestions(resourceId?: number | string) {
    return request.get<CodeMsgResult<string>>({
      url: '/agriculture/decision/resource',
      params: resourceId ? { resourceId } : {}
    })
  }

  /**
   * 生成预警处理建议
   */
  static generateAlertHandlingSuggestions(alertId: number | string) {
    return request.get<CodeMsgResult<string>>({
      url: `/agriculture/decision/alert/${alertId}`
    })
  }
}

