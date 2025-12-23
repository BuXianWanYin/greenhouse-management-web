import { BasePageResult, BaseArrayResult, BaseObjectResult } from '../axios'

export interface AgricultureHarvestRecordResult {
  harvestId: number | string
  batchId: number | string
  batchName?: string
  classId?: number | string
  className?: string
  classImage?: string
  harvestDate: string
  harvestTime: string
  harvestArea?: number
  harvestWeight: number
  harvestQuantity?: number
  qualityLevel?: string // A=优,B=良,C=合格
  harvestPersonId?: number | string
  harvestPersonName?: string
  storageLocation?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

export interface HarvestStatisticsVO {
  harvestCount: number
  totalHarvestWeight: number
  totalHarvestArea: number
  totalHarvestQuantity: number
  averageWeight: number
}

export type AgricultureHarvestRecordListPageResult = BasePageResult<AgricultureHarvestRecordResult>
export type AgricultureHarvestRecordListResult = BaseArrayResult<AgricultureHarvestRecordResult>
export type AgricultureHarvestRecordInfoResult = BaseObjectResult<AgricultureHarvestRecordResult>

