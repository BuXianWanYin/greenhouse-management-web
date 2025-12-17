import { BasePageResult, BaseArrayResult, BaseObjectResult } from '../axios'

export interface AgricultureAlertResult {
  alertId: number | string
  alertCategory: string // device=设备,task=任务,resource=资源,quality=质量,schedule=排班
  alertType: string
  alertLevel: number // 0=提示,1=警告,2=严重,3=紧急
  alertTitle: string
  alertMessage: string
  currentValue?: number
  thresholdValue?: number
  thresholdId?: number | string
  targetId?: number | string
  targetType?: string
  pastureId?: number | string
  pastureName?: string
  status: number // 0=未处理,1=已处理,2=已忽略
  alertTime: string
  handleTime?: string
  handleBy?: string
  remark?: string
  createTime?: string
}

export interface AlertCountResult {
  all: number
  device: number
  task: number
  resource: number
  quality: number
  schedule: number
}

export type AgricultureAlertListPageResult = BasePageResult<AgricultureAlertResult>
export type AgricultureAlertListResult = BaseArrayResult<AgricultureAlertResult>
export type AgricultureAlertInfoResult = BaseObjectResult<AgricultureAlertResult>
export type AlertCountInfoResult = BaseObjectResult<AlertCountResult>

// 预警阈值配置
export interface AgricultureAlertThresholdResult {
  thresholdId?: number | string
  alertCategory: string // device=设备,task=任务,resource=资源,quality=质量,schedule=排班
  alertType: string
  thresholdName: string
  minValue?: number
  maxValue?: number
  warningMin?: number
  warningMax?: number
  criticalMin?: number
  criticalMax?: number
  unit?: string
  pastureId?: number | string
  pastureName?: string
  classId?: number | string
  className?: string
  enabled: string // 0=禁用 1=启用
  checkInterval?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

export type AgricultureAlertThresholdListPageResult = BasePageResult<AgricultureAlertThresholdResult>
export type AgricultureAlertThresholdListResult = BaseArrayResult<AgricultureAlertThresholdResult>
export type AgricultureAlertThresholdInfoResult = BaseObjectResult<AgricultureAlertThresholdResult>

