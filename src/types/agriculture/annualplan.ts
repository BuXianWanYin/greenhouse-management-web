import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureAnnualPlanResult {
                planId: string,
                planYear: string,
                planName: string,
                pastureId: string,
                planType: string,
                planStatus: string,
                startDate: string,
                endDate: string,
                totalArea: string,
                planDescription: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string,
                delFlag: string
}

export type AgricultureAnnualPlanListPageResult = BasePageResult<AgricultureAnnualPlanResult>
export type AgricultureAnnualPlanListResult = BaseArrayResult<AgricultureAnnualPlanResult>
export type AgricultureAnnualPlanInfoResult = BaseObjectResult<AgricultureAnnualPlanResult>

