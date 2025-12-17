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

export interface AgricultureTraceInfoResult {
  traceId: number | string
  batchId: number | string
  traceCode: string
  traceType: string // batch=批次,product=产品
  traceData?: any // JSON格式的溯源数据
  qrCodeUrl?: string
  createBy?: string
  createTime?: string
}

export interface TraceDetailVO {
  traceCode: string
  batchName?: string
  className?: string
  pastureName?: string
  plantingInfo?: Record<string, any>
  environmentData?: Record<string, any>[]
  taskRecords?: Record<string, any>[]
  qualityInspections?: Record<string, any>[]
  harvestInfo?: Record<string, any>
}

export type AgricultureQualityInspectionListPageResult = BasePageResult<AgricultureQualityInspectionResult>
export type AgricultureQualityInspectionListResult = BaseArrayResult<AgricultureQualityInspectionResult>
export type AgricultureQualityInspectionInfoResult = BaseObjectResult<AgricultureQualityInspectionResult>

