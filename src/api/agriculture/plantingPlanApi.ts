import request from '@/utils/http'
import { AgricultureRotationPlanInfoResult,AgricultureRotationPlanListPageResult } from '@/types/agriculture/plantingPlan'
import { CodeMsgResult } from '@/types/axios'

// 种植计划
export class AgricultureRotationPlanService {
    // 查询种植计划列表
    static listPlan(query: any) {
        return request.get<AgricultureRotationPlanListPageResult>({
            url: '/agriculture/plantingplan/list',
            params: query
        })
    }

    // 查询种植计划详细
    static getPlan(planId: any) {
        return request.get<AgricultureRotationPlanInfoResult>({
            url: '/agriculture/plantingplan/' + planId,
        })
    }

    // 新增种植计划
    static addPlan(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/plantingplan',
            data: data
        })
    }

    // 修改种植计划
    static updatePlan(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/plantingplan',
            data: data
        })
    }

    // 删除种植计划
    static deletePlan(planId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/plantingplan/' + planId,
        })
    }

    // 导出种植计划列表
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

