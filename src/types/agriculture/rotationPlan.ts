import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureRotationPlanResult {
                rotationId: string,
                rotationName: string,
                planYear: string,
                pastureId: string,
                rotationCycle: string,
                rotationDescription: string,
                rotationStatus: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string,
                delFlag: string
}

export type AgricultureRotationPlanListPageResult = BasePageResult<AgricultureRotationPlanResult>
export type AgricultureRotationPlanListResult = BaseArrayResult<AgricultureRotationPlanResult>
export type AgricultureRotationPlanInfoResult = BaseObjectResult<AgricultureRotationPlanResult>

