import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'
import {
  AgricultureEmployeeScheduleListPageResult,
  AgricultureEmployeeScheduleListResult,
  AgricultureEmployeeScheduleInfoResult,
  AgricultureEmployeeScheduleResult
} from '@/types/agriculture/schedule'

// 人员排班管理
export class AgricultureScheduleService {
  // 查询排班列表
  static listSchedule(query: any) {
    return request.get<AgricultureEmployeeScheduleListPageResult>({
      url: '/agriculture/schedule/list',
      params: query
    })
  }
  
  // 查询排班详情
  static getSchedule(scheduleId: number | string) {
    return request.get<AgricultureEmployeeScheduleInfoResult>({
      url: `/agriculture/schedule/${scheduleId}`
    })
  }
  
  // 新增排班
  static addSchedule(data: AgricultureEmployeeScheduleResult) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/schedule',
      data
    })
  }
  
  // 修改排班
  static updateSchedule(data: AgricultureEmployeeScheduleResult) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/schedule',
      data
    })
  }
  
  // 删除排班
  static deleteSchedule(scheduleId: number | string) {
    return request.del<CodeMsgResult>({
      url: `/agriculture/schedule/${scheduleId}`
    })
  }
  
  // 批量创建排班
  static batchCreate(data: AgricultureEmployeeScheduleResult[]) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/schedule/batch',
      data
    })
  }
  
  // 导出排班列表
  static exportExcel(data: any) {
    return request.post({
      url: '/agriculture/schedule/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data
    })
  }
  
  // 导出网格排班视图
  static exportGridExcel(startDate: string, endDate: string) {
    return request.post({
      url: '/agriculture/schedule/exportGrid',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      params: { startDate, endDate }
    })
  }
}

