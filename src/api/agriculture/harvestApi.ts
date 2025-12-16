import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'
import {
  AgricultureHarvestRecordListPageResult,
  AgricultureHarvestRecordListResult,
  AgricultureHarvestRecordInfoResult,
  AgricultureHarvestRecordResult,
  HarvestStatisticsVO
} from '@/types/agriculture/harvest'

// 采收管理
export class AgricultureHarvestService {
  // 查询采收记录列表
  static listHarvest(query: any) {
    return request.get<AgricultureHarvestRecordListPageResult>({
      url: '/agriculture/harvest/list',
      params: query
    })
  }
  
  // 查询采收记录详情
  static getHarvest(harvestId: number | string) {
    return request.get<AgricultureHarvestRecordInfoResult>({
      url: `/agriculture/harvest/${harvestId}`
    })
  }
  
  // 新增采收记录
  static addHarvest(data: AgricultureHarvestRecordResult) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/harvest',
      data
    })
  }
  
  // 修改采收记录
  static updateHarvest(data: AgricultureHarvestRecordResult) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/harvest',
      data
    })
  }
  
  // 删除采收记录
  static deleteHarvest(harvestId: number | string) {
    return request.del<CodeMsgResult>({
      url: `/agriculture/harvest/${harvestId}`
    })
  }
  
  // 获取批次采收统计
  static getStatistics(batchId: number | string) {
    return request.get<HarvestStatisticsVO>({
      url: `/agriculture/harvest/statistics/${batchId}`
    })
  }
  
  // 导出采收记录
  static exportExcel(data: any) {
    return request.post({
      url: '/agriculture/harvest/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data
    })
  }
}

