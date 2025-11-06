import request from '@/utils/http'
import { AgriculturePlanBatchInfoResult,AgriculturePlanBatchListPageResult } from '@/types/agriculture/planBatch'
import { CodeMsgResult } from '@/types/axios'

// 年度计划批次关联
export class AgriculturePlanBatchService {
    // 查询年度计划批次关联列表
    static listBatch(query: any) {
        return request.get<AgriculturePlanBatchListPageResult>({
            url: '/agriculture/planbatch/list',
            params: query
        })
    }

    // 查询年度计划批次关联详细
    static getBatch(id: any) {
        return request.get<AgriculturePlanBatchInfoResult>({
            url: '/agriculture/planbatch/' + id,
        })
    }

    // 新增年度计划批次关联
    static addBatch(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/planbatch',
            data: data
        })
    }

    // 修改年度计划批次关联
    static updateBatch(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/planbatch',
            data: data
        })
    }

    // 删除年度计划批次关联
    static deleteBatch(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/planbatch/' + id,
        })
    }

    // 导出年度计划批次关联列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/planbatch/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}