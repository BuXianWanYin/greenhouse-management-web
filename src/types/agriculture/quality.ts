import { BasePageResult, BaseArrayResult, BaseObjectResult } from '../axios'

export interface AgricultureQualityInspectionResult {
  inspectionId: number | string
  batchId: number | string
  batchName?: string
  inspectionType: string // growth=生长期,harvest=采收期,storage=存储期
  inspectionDate: string
  inspectionItem: string
  inspectionResult?: string
  inspectionStandard?: string
  qualified: string // 0不合格 1合格
  inspectorId?: number | string
  inspectorName?: string
  inspectionImages?: string[]
  createBy?: string
  createTime?: string
}

export type AgricultureQualityInspectionListPageResult = BasePageResult<AgricultureQualityInspectionResult>
export type AgricultureQualityInspectionListResult = BaseArrayResult<AgricultureQualityInspectionResult>
export type AgricultureQualityInspectionInfoResult = BaseObjectResult<AgricultureQualityInspectionResult>

