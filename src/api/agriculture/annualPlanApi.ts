import request from '@/utils/http'
import { AgricultureAnnualPlanInfoResult,AgricultureAnnualPlanListPageResult } from '@/types/agriculture/annualplan'    
import { CodeMsgResult } from '@/types/axios'

// 年度种植规划
export class AgricultureAnnualPlanService {
    // 查询年度种植规划列表
    static listPlan(query: any) {
        return request.get<AgricultureAnnualPlanListPageResult>({
            url: '/agriculture/annualplan/list',
            params: query
        })
    }

    // 查询年度种植规划详细
    static getPlan(planId: any) {
        return request.get<AgricultureAnnualPlanInfoResult>({
            url: '/agriculture/annualplan/' + planId,
        })
    }

    // 新增年度种植规划
    static addPlan(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/annualplan',
            data: data
        })
    }

    // 修改年度种植规划
    static updatePlan(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/annualplan',
            data: data
        })
    }

    // 删除年度种植规划
    static deletePlan(planId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/annualplan/' + planId,
        })
    }

    // 导出年度种植规划列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/annualplan/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}