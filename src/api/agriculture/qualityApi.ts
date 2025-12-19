import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'
import {
  AgricultureQualityInspectionListPageResult,
  AgricultureQualityInspectionListResult,
  AgricultureQualityInspectionInfoResult,
  AgricultureQualityInspectionResult
} from '@/types/agriculture/quality'

// 质量追溯管理
export class AgricultureQualityService {
  // 查询质量检测记录列表
  static listInspection(query: any) {
    return request.get<AgricultureQualityInspectionListPageResult>({
      url: '/agriculture/quality/inspection/list',
      params: query
    })
  }
  
  // 查询质量检测记录详情
  static getInspection(inspectionId: number | string) {
    return request.get<AgricultureQualityInspectionInfoResult>({
      url: `/agriculture/quality/inspection/${inspectionId}`
    })
  }
  
  // 新增质量检测记录
  static addInspection(data: AgricultureQualityInspectionResult) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/quality/inspection',
      data
    })
  }
  
  // 修改质量检测记录
  static updateInspection(data: AgricultureQualityInspectionResult) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/quality/inspection',
      data
    })
  }
  
  // 删除质量检测记录
  static deleteInspection(inspectionId: number | string) {
    return request.del<CodeMsgResult>({
      url: `/agriculture/quality/inspection/${inspectionId}`
    })
  }
  
  // 导出质量检测记录
  static exportInspection(data: any) {
    return request.post({
      url: '/agriculture/quality/inspection/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data
    })
  }
}

