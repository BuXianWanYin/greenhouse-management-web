import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgriculturePlanBatchResult {
                id: string,
                planId: string,
                batchId: string,
                createBy: string,
                createTime: string
}

export type AgriculturePlanBatchListPageResult = BasePageResult<AgriculturePlanBatchResult>
export type AgriculturePlanBatchListResult = BaseArrayResult<AgriculturePlanBatchResult>
export type AgriculturePlanBatchInfoResult = BaseObjectResult<AgriculturePlanBatchResult>

