import request from '@/utils/http'
import type { CodeMsgResult } from '@/types/axios'

export interface DeviceControlRequest {
  deviceId: number | string
  action: 'on' | 'off'
}

export class DeviceOperationService {
  /**
   * 控制设备开关
   */
  static controlDevice(data: DeviceControlRequest) {
    return request.post<CodeMsgResult>({
      url: '/deviceOperation/control',
      data: data
    })
  }
}
