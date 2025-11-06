import request from '@/utils/http'
import { AgricultureGrowthStageInfoResult,AgricultureGrowthStageListPageResult } from '@/types/agriculture/growthStage'
import { CodeMsgResult } from '@/types/axios'

// 生长阶段
export class AgricultureGrowthStageService {
    // 查询生长阶段列表
    static listStage(query: any) {
        return request.get<AgricultureGrowthStageListPageResult>({
            url: '/agriculture/growthstage/list',
            params: query
        })
    }

    // 查询生长阶段详细
    static getStage(stageId: any) {
        return request.get<AgricultureGrowthStageInfoResult>({
            url: '/agriculture/growthstage/' + stageId,
        })
    }

    // 新增生长阶段
    static addStage(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/growthstage',
            data: data
        })
    }

    // 修改生长阶段
    static updateStage(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/growthstage',
            data: data
        })
    }

    // 删除生长阶段
    static deleteStage(stageId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/growthstage/' + stageId,
        })
    }

    // 导出生长阶段列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/growthstage/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}