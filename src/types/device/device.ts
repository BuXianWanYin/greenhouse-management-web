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
                collectInterval?: number | string,
                userControlSwitch?: string,
                onlineStatus?: number | string,
                commandOn?: string,        // 开启指令
                commandOff?: string,      // 关闭指令
                isControllable?: string,   // 是否可控
                controlStatus?: string     // 控制状态
}

export type AgricultureDeviceListPageResult = BasePageResult<AgricultureDeviceResult>
export type AgricultureDeviceListResult = BaseArrayResult<AgricultureDeviceResult>
export type AgricultureDeviceInfoResult = BaseObjectResult<AgricultureDeviceResult>

