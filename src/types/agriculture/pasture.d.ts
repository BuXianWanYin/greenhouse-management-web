import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgriculturePastureResult {
                id: string | number,
                name: string,
                address: string,
                description: string,
                area: string,
                delFlag: string | number,
                createBy?: string,
                createTime?: string,
                updateBy?: string,
                updateTime?: string
}

export type AgriculturePastureListPageResult = BasePageResult<AgriculturePastureResult>
export type AgriculturePastureListResult = BaseArrayResult<AgriculturePastureResult>
export type AgriculturePastureInfoResult = BaseObjectResult<AgriculturePastureResult>

