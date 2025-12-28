import { createBaseConfig } from '../core/base-config'

/**
 * 根据环境变量动态配置 base-config
 * 开发环境：development
 * 生产环境：production
 */
export const envConfig = {
  systemInfo:
    process.env.NODE_ENV === 'development'
      ? {
          ...createBaseConfig().systemInfo,
          name: '温室作物种植计划与人员分工管理系统'
        }
      : createBaseConfig().systemInfo
}
