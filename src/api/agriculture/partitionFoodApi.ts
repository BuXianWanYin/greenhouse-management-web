import request from '@/utils/http'
import { AgriculturePartitionFoodInfoResult, AgriculturePartitionFoodListPageResult } from '@/types/agriculture/partitionFood'
import { CodeMsgResult } from '@/types/axios'

// 采收记录
export class partitionFoodService {
    // 查询 采收列表
    static listFood(query: any) {
        return request.get<AgriculturePartitionFoodListPageResult>({
            url: '/agriculture/partitionFood/list',
            params: query
        })
    }
    
    // 查询 采收详细
    static getFood(id: any) {
        return request.get<AgriculturePartitionFoodInfoResult>({
            url: '/agriculture/partitionFood/' + id,
        })
    }

    // 新增 采收
    static addFood(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 修改 采收
    static updateFood(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 删除 采收
    static deleteFood(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/partitionFood' + id,
        })
    }

    // 导出 采收列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/partitionFood/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}