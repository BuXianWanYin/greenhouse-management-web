import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureThresholdConfigResult {
                id: string,
                deviceId: string,
                deviceType: string,
                paramType: string,
                thresholdMin: string,
                thresholdMax: string,
                isEnabled: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string,
                debounceSeconds?: number,  // 防抖时长（秒）
                debounceCount?: number     // 防抖采样次数
}

export type AgricultureThresholdConfigListPageResult = BasePageResult<AgricultureThresholdConfigResult>
export type AgricultureThresholdConfigListResult = BaseArrayResult<AgricultureThresholdConfigResult>
export type AgricultureThresholdConfigInfoResult = BaseObjectResult<AgricultureThresholdConfigResult>

