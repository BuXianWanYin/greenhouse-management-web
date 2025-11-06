import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCropBatchResult {
    batchId: number | string,
    batchName: string,
    classId?: number | string,
    planYear?: number,
    seasonType?: string,
    rotationPlanId?: number | string,
    plantingDensity?: number,
    expectedHarvestTime?: string,
    currentGrowthStage?: string,
    growthStageStartTime?: string,
    totalGrowthDays?: number,
    actualHarvestTime?: string,
    pastureId: number | string,
    cropArea: number,
    startTime?: string,
    status?: string,
    orderNum?: number | string,
    delFlag?: string,
    responsiblePersonId?: number | string,
    createBy?: string,
    createTime?: string,
    updateBy?: string,
    updateTime?: string,
    remark?: string,
    harvest?: string,
    // 关联查询字段
    classImage?: string,
    className?: string,
    classImages?: string[],
    nickName?: string,
}

export type AgricultureCropBatchListPageResult = BasePageResult<AgricultureCropBatchResult>
export type AgricultureCropBatchListResult = BaseArrayResult<AgricultureCropBatchResult>
export type AgricultureCropBatchInfoResult = BaseObjectResult<AgricultureCropBatchResult>

