import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'
import {
  AgricultureAlertListPageResult,
  AgricultureAlertListResult,
  AgricultureAlertInfoResult,
  AgricultureAlertResult,
  AlertCountInfoResult
} from '@/types/agriculture/alert'

// 统一预警管理
export class AgricultureAlertService {
  // 查询预警列表
  static listAlert(query: any) {
    return request.get<AgricultureAlertListPageResult>({
      url: '/agriculture/alert/list',
      params: query
    })
  }
  
  // 查询预警详情
  static getAlert(alertId: number | string) {
    return request.get<AgricultureAlertInfoResult>({
      url: `/agriculture/alert/${alertId}`
    })
  }
  
  // 新增预警
  static addAlert(data: AgricultureAlertResult) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/alert',
      data
    })
  }
  
  // 修改预警
  static updateAlert(data: AgricultureAlertResult) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/alert',
      data
    })
  }
  
  // 删除预警
  static deleteAlert(alertId: number | string) {
    return request.del<CodeMsgResult>({
      url: `/agriculture/alert/${alertId}`
    })
  }
  
  // 处理预警
  static handleAlert(alertId: number | string) {
    return request.post<CodeMsgResult>({
      url: `/agriculture/alert/handle/${alertId}`
    })
  }
  
  // 忽略预警
  static ignoreAlert(alertId: number | string) {
    return request.post<CodeMsgResult>({
      url: `/agriculture/alert/ignore/${alertId}`
    })
  }
  
  // 获取未处理预警数量统计
  static getUnhandledCount() {
    return request.get<AlertCountInfoResult>({
      url: '/agriculture/alert/count'
    })
  }
  
  // 手动触发预警检查
  static checkAlerts() {
    return request.post<CodeMsgResult>({
      url: '/agriculture/alert/check'
    })
  }
  
  // 导出预警列表
  static exportAlert(data: any) {
    return request.post({
      url: '/agriculture/alert/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data
    })
  }
}

