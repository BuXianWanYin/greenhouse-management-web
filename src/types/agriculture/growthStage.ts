import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureGrowthStageResult {
                stageId: string,
                batchId: string,
                stageType: string,
                stageName: string,
                stageOrder: string,
                expectedStartDate: string,
                expectedEndDate: string,
                actualStartDate: string,
                actualEndDate: string,
                stageStatus: string,
                stageDescription: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureGrowthStageListPageResult = BasePageResult<AgricultureGrowthStageResult>
export type AgricultureGrowthStageListResult = BaseArrayResult<AgricultureGrowthStageResult>
export type AgricultureGrowthStageInfoResult = BaseObjectResult<AgricultureGrowthStageResult>

