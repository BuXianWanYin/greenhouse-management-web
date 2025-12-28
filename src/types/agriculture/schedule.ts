import { BasePageResult, BaseArrayResult, BaseObjectResult } from '../axios'

export interface AgricultureEmployeeScheduleResult {
  scheduleId: number | string
  userId: number | string
  userName?: string
  nickName?: string
  pastureId?: number | string
  pastureName?: string
  batchId?: number | string
  batchName?: string
  scheduleDate: string
  workStartTime: string
  workEndTime: string
  workType?: string // normal=正常班,leave=请假,rest=休息
  ruleId?: number | string
  ruleName?: string // 排班规则名称（班次名称）
  taskId?: number | string
  status?: string // 0正常 1已取消
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

export type AgricultureEmployeeScheduleListPageResult = BasePageResult<AgricultureEmployeeScheduleResult>
export type AgricultureEmployeeScheduleListResult = BaseArrayResult<AgricultureEmployeeScheduleResult>
export type AgricultureEmployeeScheduleInfoResult = BaseObjectResult<AgricultureEmployeeScheduleResult>

