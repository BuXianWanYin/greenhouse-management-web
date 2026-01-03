import request from '@/utils/http'

import { AgricultureCropBatchInfoResult, AgricultureCropBatchListPageResult } from '@/types/agriculture/batch'

import { CodeMsgResult } from '@/types/axios'

/**
 * 种植批次管理API服务
 * 提供种植批次的增删改查、导出、任务查询等功能
 */
export class AgricultureCropBatchService {

    /**
     * 查询种植批次列表（支持分页和筛选）
     * @param query 查询参数对象，包含分页、筛选条件等
     * @returns 返回种植批次列表和分页信息
     */
    static listBatch(query: any) {
        return request.get<AgricultureCropBatchListPageResult>({
            url: '/agriculture/batch/list',
            params: query
        })
    }

    /**
     * 根据温室ID查询关联的批次列表
     * @param pastureId 温室ID
     * @returns 返回指定温室的批次列表
     */
    static listBatchByPasture(pastureId: string | number) {
        return request.get<AgricultureCropBatchListPageResult>({
            url: `/agriculture/batch/listByPasture/${pastureId}`
        })
    }

    /**
     * 查询批次详细信息
     * @param batchId 批次ID
     * @returns 返回批次详细信息
     */
    static getBatch(batchId: number | string) {
        return request.get<AgricultureCropBatchInfoResult>({
            url: `/agriculture/batch/${batchId}`,
        })
    }

    /**
     * 新增种植批次
     * 批次创建后会根据作物标准作业流程自动生成批次任务
     * @param data 批次信息对象
     * @returns 返回操作结果（成功/失败）
     */
    static addBatch(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    /**
     * 修改种植批次信息
     * @param data 批次信息对象（必须包含batchId）
     * @returns 返回操作结果（成功/失败）
     */
    static updateBatch(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    /**
     * 删除种植批次
     * @param batchId 批次ID
     * @returns 返回操作结果（成功/失败）
     */
    static deleteBatch(batchId: number | string) {
        return request.del<CodeMsgResult>({
            url: `/agriculture/batch/${batchId}`,
        })
    }

    /**
     * 导出批次列表为Excel文件
     * @param data 导出参数（筛选条件等）
     * @returns 返回Excel文件流
     */
    static exportExcel(data: any) {
        return request.post({
            url: '/agriculture/batch/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }

    /**
     * 根据批次ID查询关联的批次任务列表
     * @param batchId 批次ID
     * @returns 返回该批次下的所有任务列表
     */
    static getBatchTasks(batchId: number | string) {
        return request.get<AgricultureCropBatchTaskInfoResult[]>({
            url: `/agriculture/batch/${batchId}/tasks`
        })
    }
}