import { BasePageResult, BaseArrayResult, BaseObjectResult } from '../axios'

export interface AgricultureEmployeeScheduleResult {
  scheduleId: number | string
  userId: number | string
  userName?: string
  nickName?: string
  pastureId?: number | string
  pastureName?: string
  scheduleDate: string
  workStartTime: string
  workEndTime: string
  workType?: string // normal=正常班,overtime=加班,leave=请假
  ruleId?: number | string
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

