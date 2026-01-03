import request from '@/utils/http'
import { AgricultureRotationPlanInfoResult,AgricultureRotationPlanListPageResult } from '@/types/agriculture/plantingPlan'
import { CodeMsgResult } from '@/types/axios'

/**
 * 种植计划管理API服务
 * 提供种植计划的增删改查、导出等功能
 * 支持年度计划、季度计划和轮作计划管理
 */
export class AgricultureRotationPlanService {
    /**
     * 查询种植计划列表（支持分页和筛选）
     * @param query 查询参数对象，包含分页、筛选条件等
     * @returns 返回种植计划列表和分页信息
     */
    static listPlan(query: any) {
        return request.get<AgricultureRotationPlanListPageResult>({
            url: '/agriculture/plantingplan/list',
            params: query
        })
    }

    /**
     * 查询种植计划详细信息
     * @param planId 计划ID
     * @returns 返回计划详细信息
     */
    static getPlan(planId: any) {
        return request.get<AgricultureRotationPlanInfoResult>({
            url: '/agriculture/plantingplan/' + planId,
        })
    }

    /**
     * 新增种植计划
     * @param data 种植计划信息对象
     * @returns 返回操作结果（成功/失败）
     */
    static addPlan(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/plantingplan',
            data: data
        })
    }

    /**
     * 修改种植计划信息
     * @param data 种植计划信息对象（必须包含planId）
     * @returns 返回操作结果（成功/失败）
     */
    static updatePlan(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/plantingplan',
            data: data
        })
    }

    /**
     * 删除种植计划
     * @param planId 计划ID
     * @returns 返回操作结果（成功/失败）
     */
    static deletePlan(planId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/plantingplan/' + planId,
        })
    }

    /**
     * 导出种植计划列表为Excel文件
     * @param data 导出参数（筛选条件等）
     * @returns 返回Excel文件流
     */
    static exportExcel(data: any) {
        return request.post({
            url: '/agriculture/plantingplan/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}

