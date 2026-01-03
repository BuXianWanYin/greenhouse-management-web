import request from '@/utils/http'
import { AgricultureClassListPageResult } from '@/types/agriculture/class'
import { CodeMsgResult } from '@/types/axios'

/**
 * 作物种类管理API服务
 * 提供作物种类的增删改查、导出、AI智能分析等功能
 */
export class AgricultureClassService {
  /**
   * 查询作物种类信息列表
   * @param query 查询参数对象，包含分页、筛选条件等
   * @returns 返回作物种类列表和分页信息
   */
  static listClass(query: any) {
    return request.get<AgricultureClassListPageResult>({
      url: '/agriculture/class/list',
      params: query
    })
  }

  /**
   * 新增作物种类信息
   * @param data 作物种类信息对象
   * @returns 返回操作结果（成功/失败）
   */
  static addClass(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/class',
      data: data
    })
  }

  /**
   * 修改作物种类信息
   * @param data 作物种类信息对象（必须包含classId）
   * @returns 返回操作结果（成功/失败）
   */
  static updateClass(data: any) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/class',
      data: data
    })
  }

  /**
   * 删除作物种类信息
   * @param classId 作物种类ID
   * @returns 返回操作结果（成功/失败）
   */
  static deleteClass(classId: any) {
    return request.del<CodeMsgResult>({
      url: '/agriculture/class/' + classId
    })
  }

  /**
   * 导出作物种类信息列表为Excel文件
   * @param data 导出参数（筛选条件等）
   * @returns 返回Excel文件流
   */
  static exportExcel(data: any) {
    return request.post({
      url: 'agriculture/class/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  /**
   * 生成作物种类AI智能分析报告
   * 通过DeepSeek AI生成作物的智能分析建议
   * @param data 包含作物种类ID等信息的对象
   * @returns 返回操作结果（成功/失败）
   */
  static aiAddClassReport(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/class/ai',
      data: data
    })
  }
}
