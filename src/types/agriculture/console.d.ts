import { BaseArrayResult } from '../axios'
/**
 * 控制台统计数据类型
 * 后端只返回状态码和业务数据，UI配置由前端处理
 */
export interface ConsoleTotalInfo {
  /** 状态码，用于前端映射UI配置 */
  status?: number
  /** 统计数值 */
  value: number
  /** 环比变化率（如"+10%"、"-5%"） */
  change: string
  /** 以下字段由前端根据status映射填充 */
  label?: string
  icon?: string
  class?: string
  color?: string
  unit?: string
}

/**
 * 控制台数据总类型接口
 */
export interface ConsoleToTalData {
  /** 农业相关的统计数组 */
  agriculture: ConsoleTotalInfo[]
  /** 批量任务相关的统计数组 */
  batchTask: ConsoleTotalInfo[]
}

/**
 * 控制台统计卡片接口返回类型
 */
export type ConsoleListResult = BaseArrayResult<ConsoleTotalInfo>
