import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureRotationDetailResult {
                detailId: string,
                rotationId: string,
                classId: string,
                rotationOrder: string,
                seasonType: string,
                plantingArea: string,
                plantingDensity: string,
                expectedStartDate: string,
                expectedEndDate: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureRotationDetailListPageResult = BasePageResult<AgricultureRotationDetailResult>
export type AgricultureRotationDetailListResult = BaseArrayResult<AgricultureRotationDetailResult>
export type AgricultureRotationDetailInfoResult = BaseObjectResult<AgricultureRotationDetailResult>

