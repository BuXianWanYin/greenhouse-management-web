import request from '@/utils/http'
import { AgricultureRotationPlanInfoResult,AgricultureRotationPlanListPageResult } from '@/types/agriculture/rotationPlan'
import { CodeMsgResult } from '@/types/axios'

// 轮作计划
export class AgricultureRotationPlanService {
    // 查询轮作计划列表
    static listPlan(query: any) {
        return request.get<AgricultureRotationPlanListPageResult>({
            url: '/agriculture/rotationplan/list',
            params: query
        })
    }

    // 查询轮作计划详细
    static getPlan(rotationId: any) {
        return request.get<AgricultureRotationPlanInfoResult>({
            url: '/agriculture/rotationplan/' + rotationId,
        })
    }

    // 新增轮作计划
    static addPlan(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/rotationplan',
            data: data
        })
    }

    // 修改轮作计划
    static updatePlan(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/rotationplan',
            data: data
        })
    }

    // 删除轮作计划
    static deletePlan(rotationId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/rotationplan/' + rotationId,
        })
    }

    // 导出轮作计划列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/rotationplan/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}