import request from '@/utils/http'
import { CodeMsgResult, BaseObjectResult, BasePageResult } from '@/types/axios'

export interface AgricultureScheduleRuleResult {
  ruleId?: number
  ruleName: string
  workDays: string
  workStartTime: string
  workEndTime: string
  breakStartTime?: string
  breakEndTime?: string
  maxWorkHoursPerDay?: number
  maxWorkDaysPerWeek?: number
  status: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

export type AgricultureScheduleRuleListPageResult = BasePageResult<AgricultureScheduleRuleResult>
export type AgricultureScheduleRuleInfoResult = BaseObjectResult<AgricultureScheduleRuleResult>

// 排班规则管理
export class AgricultureScheduleRuleService {
  // 查询排班规则列表
  static listRule(query: any) {
    return request.get<AgricultureScheduleRuleListPageResult>({
      url: '/agriculture/scheduleRule/list',
      params: query
    })
  }
  
  // 查询排班规则详情
  static getRule(ruleId: number | string) {
    return request.get<AgricultureScheduleRuleInfoResult>({
      url: `/agriculture/scheduleRule/${ruleId}`
    })
  }
  
  // 新增排班规则
  static addRule(data: AgricultureScheduleRuleResult) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/scheduleRule',
      data
    })
  }
  
  // 修改排班规则
  static updateRule(data: AgricultureScheduleRuleResult) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/scheduleRule',
      data
    })
  }
  
  // 删除排班规则
  static deleteRule(ruleIds: number[] | string[]) {
    return request.del<CodeMsgResult>({
      url: `/agriculture/scheduleRule/${ruleIds.join(',')}`
    })
  }
  
  // 导出排班规则列表
  static exportExcel(data: any) {
    return request.post({
      url: '/agriculture/scheduleRule/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data
    })
  }
}

