import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCropBatchResult {
    batchId: number | string,
    batchName: string,
    classId?: number | string,
    pastureId: number | string,
    planYear?: number,
    seasonType?: string, // 季节类型（spring=春季,summer=夏季,autumn=秋季,winter=冬季）
    planId?: number | string, // 种植计划ID（关联agriculture_planting_plan表）
    detailId?: number | string, // 轮作计划明细ID（关联agriculture_plan_detail表，仅用于轮作计划）
    plantingDensity?: number | string, // 种植密度（株/亩）
    cropArea: number, // 种植面积（亩）
    startTime?: string,
    expectedHarvestTime?: string,
    actualHarvestTime?: string,
    status?: string, // 状态（0=未开始,1=进行中,2=已完成,3=已取消）
    harvest?: string, // 收获标志(0代表已收获，1代表未收获)
    responsiblePersonId?: number | string,
    createBy?: string,
    createTime?: string,
    updateBy?: string,
    updateTime?: string,
    remark?: string,
    delFlag?: string, // 删除标志（0代表存在 2代表删除）
    // 关联查询字段
    classImage?: string,
    className?: string,
    classImages?: string[],
    nickName?: string,
    planName?: string, // 种植计划名称
}

export type AgricultureCropBatchListPageResult = BasePageResult<AgricultureCropBatchResult>
export type AgricultureCropBatchListResult = BaseArrayResult<AgricultureCropBatchResult>
export type AgricultureCropBatchInfoResult = BaseObjectResult<AgricultureCropBatchResult>

