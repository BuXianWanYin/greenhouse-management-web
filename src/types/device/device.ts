import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceResult {
                id: string,
                deviceName: string,
                deviceImage: string,
                deviceTypeId: string,
                deviceTypeName?: string,
                alarmStatus: string,
                lastOnlineTime: string,
                pastureId: string,
                pastureName?: string,
                sensorCommand: string,
                userControlSwitch?: string,
                onlineStatus?: number | string
}

export type AgricultureDeviceListPageResult = BasePageResult<AgricultureDeviceResult>
export type AgricultureDeviceListResult = BaseArrayResult<AgricultureDeviceResult>
export type AgricultureDeviceInfoResult = BaseObjectResult<AgricultureDeviceResult>

