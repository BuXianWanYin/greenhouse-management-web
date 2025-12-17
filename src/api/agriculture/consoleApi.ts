import request from '@/utils/http'
import { ConsoleListResult } from '@/types/agriculture/console'

/** 控制台信息 */
class AgricultureConsoleService {
  /** 查询农场信息*/
  static listAgriculture() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/agriculture'
    })
  }

   /** 查询任务信息 */
   static listBatchTask() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/batchTask'
    })
  }

  /** 查询农场数据（支持时间筛选） */
  static listAgricultureWithTimeRange(startTime?: string, endTime?: string) {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/agriculture/range',
      params: { startTime, endTime }
    })
  }

  /** 查询任务数据（支持时间筛选） */
  static listBatchTaskWithTimeRange(startTime?: string, endTime?: string) {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/batchTask/range',
      params: { startTime, endTime }
    })
  }

  /** 批次对比 */
  static compareBatches(batchIds: number[]) {
    return request.get({
      url: '/agriculture/console/compare/batches',
      params: { batchIds: batchIds.join(',') }
    })
  }

  /** 温室对比 */
  static comparePastures(pastureIds: number[]) {
    return request.get({
      url: '/agriculture/console/compare/pastures',
      params: { pastureIds: pastureIds.join(',') }
    })
  }
}

export default AgricultureConsoleService
