import request from '@/utils/http'
import { AgricultureRotationDetailInfoResult,AgricultureRotationDetailListPageResult } from '@/types/agriculture/rotationDetail'
import { CodeMsgResult } from '@/types/axios'

// 轮作计划明细
export class AgricultureRotationDetailService {
    // 查询轮作计划明细列表
    static listDetail(query: any) {
        return request.get<AgricultureRotationDetailListPageResult>({
            url: '/agriculture/rotationdetail/list',
            params: query
        })
    }

    // 查询轮作计划明细详细
    static getDetail(detailId: any) {
        return request.get<AgricultureRotationDetailInfoResult>({
            url: '/agriculture/rotationdetail/' + detailId,
        })
    }

    // 新增轮作计划明细
    static addDetail(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/rotationdetail',
            data: data
        })
    }

    // 修改轮作计划明细
    static updateDetail(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/rotationdetail',
            data: data
        })
    }

    // 删除轮作计划明细
    static deleteDetail(detailId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/rotationdetail/' + detailId,
        })
    }

    // 导出轮作计划明细列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/rotationdetail/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}