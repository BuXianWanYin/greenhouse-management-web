import request from '@/utils/http'
import { AgriculturePastureInfoResult,AgriculturePastureListPageResult } from '@/types/agriculture/pasture'
import { CodeMsgResult } from '@/types/axios'

// 温室
export class AgriculturePastureService {
    // 查询温室列表
    static listPasture(query: any) {
        return request.get<AgriculturePastureListPageResult>({
            url: '/agriculture/pasture/list',
            params: query
        })
    }

    // 查询温室详细
    static getPasture(id: any) {
        return request.get<AgriculturePastureInfoResult>({
            url: '/agriculture/pasture/' + id,
        })
    }

    // 新增温室
    static addPasture(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/pasture',
            data: data
        })
    }

    // 修改温室
    static updatePasture(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/pasture',
            data: data
        })
    }

    // 删除温室
    static deletePasture(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/pasture/' + id,
        })
    }

    // 导出温室列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/pasture/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}