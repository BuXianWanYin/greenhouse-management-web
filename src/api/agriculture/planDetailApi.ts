import request from '@/utils/http'
import { AgricultureRotationDetailInfoResult,AgricultureRotationDetailListPageResult } from '@/types/agriculture/planDetail'
import { CodeMsgResult } from '@/types/axios'

// 种植计划明细（原轮作计划明细）
export class AgricultureRotationDetailService {
    // 查询种植计划明细列表
    static listDetail(query: any) {
        return request.get<AgricultureRotationDetailListPageResult>({
            url: '/agriculture/plandetail/list',
            params: query
        })
    }

    // 查询种植计划明细详细
    static getDetail(detailId: any) {
        return request.get<AgricultureRotationDetailInfoResult>({
            url: '/agriculture/plandetail/' + detailId,
        })
    }

    // 新增种植计划明细
    static addDetail(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/plandetail',
            data: data
        })
    }

    // 修改种植计划明细
    static updateDetail(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/plandetail',
            data: data
        })
    }

    // 删除种植计划明细
    static deleteDetail(detailId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/plandetail/' + detailId,
        })
    }

    // 导出种植计划明细列表
    static exportExcel(data: any) {
        return request.post({
            url: '/agriculture/plandetail/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}

