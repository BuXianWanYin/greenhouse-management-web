import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureRotationPlanResult {
    planId: number | string, // 种植计划ID
    planName: string, // 种植计划名称
    planYear?: number | string, // 计划年份
    planType?: string, // 计划类型（annual=年度计划,seasonal=季度计划,rotation=轮作计划）
    parentPlanId?: number | string | null, // 父计划ID（关联agriculture_planting_plan表，年度计划的parent_plan_id为NULL，季度计划的parent_plan_id指向所属的年度计划）
    seasonType?: string, // 季节类型（spring=春季,summer=夏季,autumn=秋季,winter=冬季，仅用于季度计划）
    pastureId?: number | string, // 温室ID（关联agriculture_pasture表）
    rotationCycle?: number | string, // 轮作周期（年）
    planDescription?: string, // 计划描述
    planStatus?: string, // 状态（0=未开始,1=执行中,2=已完成,3=已取消）
    startDate?: string, // 计划开始日期（预期）
    endDate?: string, // 计划结束日期（预期）
    actualStartDate?: string, // 实际开始日期（自动计算）
    actualEndDate?: string, // 实际结束日期（自动计算）
    totalArea?: number | string, // 计划总面积（亩）
    createBy?: string, // 创建者
    createTime?: string, // 创建时间
    updateBy?: string, // 更新者
    updateTime?: string, // 更新时间
    remark?: string, // 备注
    delFlag?: string, // 删除标志（0代表存在 2代表删除）
    // 兼容旧字段（向后兼容）
    rotationId?: number | string, // 兼容旧字段，映射到planId
    rotationName?: string, // 兼容旧字段，映射到planName
    rotationDescription?: string, // 兼容旧字段，映射到planDescription
    rotationStatus?: string, // 兼容旧字段，映射到planStatus
}

export type AgricultureRotationPlanListPageResult = BasePageResult<AgricultureRotationPlanResult>
export type AgricultureRotationPlanListResult = BaseArrayResult<AgricultureRotationPlanResult>
export type AgricultureRotationPlanInfoResult = BaseObjectResult<AgricultureRotationPlanResult>

