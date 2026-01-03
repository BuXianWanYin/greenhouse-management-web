import request from '@/utils/http'
import { AgricultureClassAiReportInfoResult } from '@/types/agriculture/classReport'

/**
 * 作物种类AI智能报告API服务
 * 用于查询AI生成的作物种类分析报告
 */
export class AgricultureClassAiReportService {
  /**
   * 查询作物种类AI智能分析报告详细信息
   * @param query 查询参数对象，包含作物种类ID等
   * @returns 返回AI生成的智能分析报告内容
   */
  static getReport(query: any) {
    return request.get<AgricultureClassAiReportInfoResult>({
      url: '/agriculture/class/report/info',
      params: query
    })
  }
}
