import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureClassAiReportResult {
  reportId: string
  classId: string
  optimalTemperature: string
  optimalHumidity: string
  optimalLight: string
  optimalSoilTemperature: string
  optimalSoilHumidity: string
  optimalSoilConductivity: string
  optimalSoilPh: string
  optimalSoilSalinity: string
  optimalSoilNitrogen: string
  optimalSoilPhosphorus: string
  optimalSoilPotassium: string
  growthRate: string
  diseaseResistance: string
  feedConversion: string
  marketAcceptance: string
  waterManagement: string
  feedingManagement: string
  diseasePrevention: string
  environmentMonitoring: string
  growthAssessment: string
  cultivationDifficulty: string
  generalRecommendations: string
  marketAnalysis: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type AgricultureClassAiReportListPageResult = BasePageResult<AgricultureClassAiReportResult>
export type AgricultureClassAiReportListResult = BaseArrayResult<AgricultureClassAiReportResult>
export type AgricultureClassAiReportInfoResult = BaseObjectResult<AgricultureClassAiReportResult>
