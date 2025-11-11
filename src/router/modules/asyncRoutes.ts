/**
 * 异步路由配置模块

 * 1. 前端静态配置模式 - 直接使用本文件中定义的路由配置
 * 2. 后端动态配置模式 - 后端返回菜单数据，前端解析生成路由
 * 菜单标题（title）:
 * - 可以是字符串，比如：'用户列表'
 */
import { RoutesAlias } from './routesAlias'
import { MenuListType } from '@/types/menu'
import { uuid } from '@/utils/utils'
import { upgradeLogList } from '@/mock/upgradeLog'

/**
 * 异步路由列表
 * 这些路由通常需要根据用户权限动态加载
 */
export const asyncRoutes: MenuListType[] = [
  // 工作台/控制台路由
  {
    id: uuid(),
    path: '/console',
    name: 'Console',
    component: RoutesAlias.Dashboard,
    meta: {
      title: 'menus.dashboard.console',
      keepAlive: false,
      icon: '',
      isInMainContainer: true // 标记为在主容器中显示
    }
  },
  // 代码生成器编辑路由（隐藏路由，通过参数访问）
  {
    id: uuid(),
    path: '/tool/gen-edit',
    name: 'GenEdit',
    component: RoutesAlias.Home,
    meta: {
      title: '修改生成配置',
      keepAlive: false,
      isHide: true // 隐藏菜单，但可以通过路径访问
    },
    children: [
      {
        id: uuid(),
        path: 'index/:tableId(\\d+)', // 动态路由，tableId 必须是数字
        component: RoutesAlias.GenEdit,
        name: 'GenEditIndex',
        meta: { title: '修改生成配置', keepAlive: false }
      }
    ]
  },
  // 字典数据路由（隐藏路由，通过参数访问）
  {
    id: uuid(),
    path: '/system/dict-data',
    name: 'DictData',
    component: RoutesAlias.Home,
    meta: {
      title: '字典数据',
      keepAlive: false,
      isHide: true // 隐藏菜单，但可以通过路径访问
    },
    children: [
      {
        id: uuid(),
        path: 'index/:dictId(\\d+)', // 动态路由，dictId 必须是数字
        component: RoutesAlias.DictData,
        name: 'DictDataIndex',
        meta: { title: '字典数据', keepAlive: false }
      }
    ]
  },
  // 用户授权角色路由（隐藏路由，通过参数访问）
  {
    id: uuid(),
    path: '/system/user-auth',
    name: 'UserAuth',
    component: RoutesAlias.Home,
    meta: {
      title: '分配角色',
      keepAlive: false,
      isHide: true // 隐藏菜单，但可以通过路径访问
    },
    children: [
      {
        id: uuid(),
        path: 'role/:userId(\\d+)', // 动态路由，userId 必须是数字
        component: RoutesAlias.AuthRole,
        name: 'AuthRole',
        meta: { title: '分配角色', keepAlive: false }
      }
    ]
  },
]
