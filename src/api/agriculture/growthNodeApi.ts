import request from '@/utils/http'
import { AgricultureGrowthNodeInfoResult,AgricultureGrowthNodeListPageResult } from '@/types/agriculture/growthNode'
import { CodeMsgResult } from '@/types/axios'

// 生长关键节点
export class AgricultureGrowthNodeService {
    // 查询生长关键节点列表
    static listNode(query: any) {
        return request.get<AgricultureGrowthNodeListPageResult>({
            url: '/agriculture/growthnode/list',
            params: query
        })
    }

    // 查询生长关键节点详细
    static getNode(nodeId: any) {
        return request.get<AgricultureGrowthNodeInfoResult>({
            url: '/agriculture/growthnode/' + nodeId,
        })
    }

    // 新增生长关键节点
    static addNode(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/growthnode',
            data: data
        })
    }

    // 修改生长关键节点
    static updateNode(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/growthnode',
            data: data
        })
    }

    // 删除生长关键节点
    static deleteNode(nodeId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/growthnode/' + nodeId,
        })
    }

    // 导出生长关键节点列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/growthnode/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}