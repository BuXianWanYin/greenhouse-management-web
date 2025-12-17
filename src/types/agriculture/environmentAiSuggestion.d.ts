import { BaseObjectResult } from '../axios'

/**
 * 设备控制建议项
 */
export interface DeviceControlItem {
  device: string
  action: string
  target?: string
}

/**
 * 时间计划调整项
 */
export interface ScheduleAdjustmentItem {
  time: string
  action: string
}

/**
 * 风险预警项
 */
export interface RiskWarningItem {
  risk: string
  probability: string
  prevention: string
}

/**
 * 操作建议项
 */
export interface ActionItem {
  title: string
  content: string
  priority?: number
}

/**
 * 环境调控AI建议
 */
export interface AgricultureEnvironmentAiSuggestionResult {
  suggestionId: string
  pastureId: number
  pastureName: string | null
  currentTemperature: string | null
  currentHumidity: string | null
  currentIlluminance: string | null
  currentSoilTemperature: string | null
  currentSoilHumidity: string | null
  currentSoilPh: string | null
  tempAssessment: string | null
  humidityAssessment: string | null
  lightAssessment: string | null
  soilAssessment: string | null
  overallStatus: 'excellent' | 'good' | 'warning' | 'critical' | null
  overallScore: number | null
  urgentActions: string | null // JSON数组字符串
  importantActions: string | null
  suggestedActions: string | null
  deviceControls: string | null
  scheduleAdjustments: string | null
  riskWarnings: string | null
  summary: string | null
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string | null
}

export type AgricultureEnvironmentAiSuggestionInfoResult = BaseObjectResult<AgricultureEnvironmentAiSuggestionResult>

