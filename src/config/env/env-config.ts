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
          name: '温室种植计划管理与人员分工系统'
        }
      : createBaseConfig().systemInfo
}
