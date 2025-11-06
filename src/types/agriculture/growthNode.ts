import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureGrowthNodeResult {
                nodeId: string,
                batchId: string,
                nodeType: string,
                nodeName: string,
                expectedDate: string,
                actualDate: string,
                remindDays: string,
                remindStatus: string,
                nodeStatus: string,
                nodeDescription: string,
                nodeImages: string,
                nodeVideos: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureGrowthNodeListPageResult = BasePageResult<AgricultureGrowthNodeResult>
export type AgricultureGrowthNodeListResult = BaseArrayResult<AgricultureGrowthNodeResult>
export type AgricultureGrowthNodeInfoResult = BaseObjectResult<AgricultureGrowthNodeResult>

