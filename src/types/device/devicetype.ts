import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceTypeResult {
                id: string,
                typeCode: string,
                typeName: string,
                typeDesc: string,
                isControllable?: string  // 是否可控设备
}

export type AgricultureDeviceTypeListPageResult = BasePageResult<AgricultureDeviceTypeResult>
export type AgricultureDeviceTypeListResult = BaseArrayResult<AgricultureDeviceTypeResult>
export type AgricultureDeviceTypeInfoResult = BaseObjectResult<AgricultureDeviceTypeResult>

