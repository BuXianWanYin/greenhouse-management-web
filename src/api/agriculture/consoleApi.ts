import request from '@/utils/http'
import { ConsoleListResult } from '@/types/agriculture/console'

/**
 * 农业控制台数据统计API服务
 * 提供控制台首页所需的各类数据统计、趋势分析、对比分析等功能
 */
class AgricultureConsoleService {
  /**
   * 查询农场基本信息统计数据
   * @returns 返回农场整体统计信息
   */
  static listAgriculture() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/agriculture'
    })
  }

  /**
   * 查询批次任务统计信息
   * @returns 返回任务整体统计数据
   */
  static listBatchTask() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/batchTask'
    })
  }

  /**
   * 查询指定时间范围内的农场数据（支持时间筛选）
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   * @returns 返回时间范围内的农场统计数据
   */
  static listAgricultureWithTimeRange(startTime?: string, endTime?: string) {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/agriculture/range',
      params: { startTime, endTime }
    })
  }

  /**
   * 查询指定时间范围内的任务数据（支持时间筛选）
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   * @returns 返回时间范围内的任务统计数据
   */
  static listBatchTaskWithTimeRange(startTime?: string, endTime?: string) {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/batchTask/range',
      params: { startTime, endTime }
    })
  }

  /**
   * 批次对比分析
   * 对比多个批次的各项指标数据
   * @param batchIds 批次ID数组
   * @returns 返回批次对比分析结果
   */
  static compareBatches(batchIds: number[]) {
    return request.get({
      url: '/agriculture/console/compare/batches',
      params: { batchIds: batchIds.join(',') }
    })
  }

  /**
   * 温室对比分析
   * 对比多个温室的各项指标数据
   * @param pastureIds 温室ID数组
   * @returns 返回温室对比分析结果
   */
  static comparePastures(pastureIds: number[]) {
    return request.get({
      url: '/agriculture/console/compare/pastures',
      params: { pastureIds: pastureIds.join(',') }
    })
  }

  /**
   * 获取批次创建趋势数据
   * 用于控制台展示批次创建的时间趋势图
   * @returns 返回批次创建趋势统计数据
   */
  static getBatchTrend() {
    return request.get<{ data: any[] }>({
      url: '/agriculture/console/batchTrend'
    })
  }

  /**
   * 获取任务完成进度统计
   * 统计各状态任务的数量和占比
   * @returns 返回任务完成进度统计数据
   */
  static getTaskProgress() {
    return request.get<{ data: any }>({
      url: '/agriculture/console/taskProgress'
    })
  }

  /**
   * 获取今日排班列表
   * 查询今天的人员排班安排
   * @returns 返回今日排班列表
   */
  static getTodaySchedule() {
    return request.get<{ data: any[] }>({
      url: '/agriculture/console/todaySchedule'
    })
  }

  /**
   * 获取最近动态信息
   * 查询系统最近的操作记录和重要事件
   * @returns 返回最近动态列表
   */
  static getRecentActivities() {
    return request.get<{ data: any[] }>({
      url: '/agriculture/console/recentActivities'
    })
  }
}

export default AgricultureConsoleService
