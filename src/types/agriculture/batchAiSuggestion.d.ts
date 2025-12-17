import { BaseObjectResult } from '../axios'

/** 措施项 */
export interface ActionItem {
  title: string
  content: string
}

/** 风险项 */
export interface RiskItem {
  risk: string
  impact: string
  solution: string
}

/** 生长阶段项 */
export interface GrowthStageItem {
  stage: string
  period: string
  tasks: string
}

/** 批次AI种植建议 */
export interface AgricultureBatchAiSuggestionResult {
  suggestionId: string
  batchId: number
  cropName: string
  cropCategory: string
  pastureName: string
  currentStatus: string
  // 环境数据
  envTemperature: string
  envHumidity: string
  envIlluminance: string
  envAssessment: string
  // 土壤数据
  soilTemperature: string
  soilHumidity: string
  soilPh: string
  soilConductivity: string
  soilNitrogen: string
  soilPhosphorus: string
  soilPotassium: string
  soilAssessment: string
  // 密度建议
  densityCurrent: string
  densitySuggested: string
  densityReason: string
  // 产量预估
  yieldExpected: string
  yieldOptimized: string
  yieldIncrease: string
  // 措施（JSON字符串，前端解析）
  urgentActions: string
  importantActions: string
  suggestedActions: string
  // 风险（JSON字符串）
  riskHigh: string
  riskMedium: string
  riskLow: string
  // 生长阶段（JSON字符串）
  growthStages: string
  // 总结
  summary: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export type AgricultureBatchAiSuggestionInfoResult = BaseObjectResult<AgricultureBatchAiSuggestionResult>

