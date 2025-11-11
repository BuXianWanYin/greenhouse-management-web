/**
 * 动态路由处理模块
 * 
 * 根据后端接口返回的菜单列表动态注册路由
 * 支持 iframe 类型路由的特殊处理
 * 支持主容器路由的嵌套处理
 * 自动加载对应的 Vue 组件
 */
import type { Router, RouteRecordRaw } from 'vue-router'
import type { MenuListType } from '@/types/menu'
import { RoutesAlias } from './routesAlias'
import { saveIframeRoutes } from '@/utils/menu'

/**
 * 动态导入 views 目录下所有 .vue 组件
 * 使用 Vite 的 glob 功能，在构建时自动生成所有组件的导入映射
 */
const modules: Record<string, () => Promise<any>> = import.meta.glob('../../views/**/*.vue')

/**
 * 注册异步路由
 * 将接口返回的菜单列表转换为 Vue Router 路由配置，并添加到传入的 router 实例中
 * 
 * @param router Vue Router 实例
 * @param menuList 接口返回的菜单列表
 */
function registerAsyncRoutes(router: Router, menuList: MenuListType[]): void {
  // 用于收集 iframe 类型路由，后续统一处理
  const iframeRoutes: MenuListType[] = []
  
  // 遍历菜单列表，将每个菜单项转换为路由并注册
  menuList.forEach((route) => {
    // 只有当路由有名称且尚未注册时才进行注册，避免重复注册
    if (route.name && !router.hasRoute(route.name)) {
      const routeConfig = convertRouteComponent(route, iframeRoutes)
      router.addRoute(routeConfig as RouteRecordRaw)
    }
  })
  
  // 保存 iframe 路由，供后续使用
  saveIframeRoutes(iframeRoutes)
}

/**
 * 根据组件路径动态加载组件
 * 
 * @param componentPath 组件路径（不包含 ../../views 前缀和 .vue 后缀）
 *                      例如：'/agriculture/plan/rotationPlan/index'
 * @param routeName 当前路由名称（用于错误提示）
 * @returns 组件加载函数，返回一个 Promise，resolve 时返回组件
 */
function loadComponent(componentPath: string, routeName: string): () => Promise<any> {
  // 构建完整的组件路径
  const fullPath = `../../views${componentPath}.vue`
  const module = modules[fullPath]
  
  // 如果找不到组件且路径不为空，输出错误信息
  if (!module && componentPath !== '') {
    console.error(`未找到组件：${routeName} ${fullPath}`)
  }
  
  return module as () => Promise<any>
}

interface ConvertedRoute extends Omit<RouteRecordRaw, 'children'> {
  id?: number
  children?: ConvertedRoute[]
  component?: RouteRecordRaw['component'] | (() => Promise<any>)
}

/**
 * 将菜单项转换为路由配置
 * 
 * @param route 菜单项数据
 * @param iframeRoutes iframe 路由收集数组
 * @returns 转换后的路由配置
 */
function convertRouteComponent(route: MenuListType, iframeRoutes: MenuListType[]): ConvertedRoute {
  const { component, children, ...routeConfig } = route
  
  // 创建基础路由配置，component 先设为 undefined，后续根据类型设置
  const converted: ConvertedRoute = {
    ...routeConfig,
    component: undefined
  }

  try {
    // 根据路由类型进行不同的处理
    if (route.meta.isIframe) {
      // 处理 iframe 类型路由（外部页面嵌入）
      handleIframeRoute(converted, route, iframeRoutes)
    } else if (route.meta.isInMainContainer) {
      // 处理主容器路由（需要嵌套在首页布局中）
      handleLayoutRoute(converted, route, component)
    } else {
      // 处理普通路由组件
      handleNormalRoute(converted, component, route.name)
    }

    // 递归处理子路由
    if (children?.length) {
      converted.children = children.map((child) => convertRouteComponent(child, iframeRoutes))
    }
    return converted
  } catch (error) {
    console.error(`路由转换失败: ${route.name}`, error)
    throw error
  }
}

/**
 * 处理 iframe 类型路由
 * iframe 路由用于嵌入外部页面，统一使用 Iframe 组件
 * 
 * @param converted 转换后的路由配置对象
 * @param route 原始菜单项数据
 * @param iframeRoutes iframe 路由收集数组
 */
function handleIframeRoute(
  converted: ConvertedRoute,
  route: MenuListType,
  iframeRoutes: MenuListType[]
): void {
  // 设置 iframe 路由的路径格式
  converted.path = `/outside/iframe/${route.name}`
  // 统一使用 Iframe 组件
  converted.component = () => import('@/views/outside/Iframe.vue')
  // 收集 iframe 路由，供后续使用
  iframeRoutes.push(route)
}

/**
 * 处理主容器路由
 * 主容器路由需要嵌套在首页布局中，创建一个父路由包含实际页面路由
 * 
 * @param converted 转换后的路由配置对象
 * @param route 原始菜单项数据
 * @param component 组件路径
 */
function handleLayoutRoute(
  converted: ConvertedRoute,
  route: MenuListType,
  component: string | undefined
): void {
  // 父路由使用首页布局组件
  converted.component = () => import('@/views/index/index.vue')
  // 提取路径的第一级作为父路由路径
  converted.path = `/${(route.path?.split('/')[1] || '').trim()}`
  // 父路由不需要名称
  converted.name = ''

  // 创建子路由，包含实际的页面组件
  converted.children = [
    {
      id: route.id,
      path: route.path,
      name: route.name,
      component: loadComponent(component as string, route.name),
      meta: route.meta
    }
  ]
}

/**
 * 处理普通路由
 * 普通路由直接加载对应的组件，支持路由别名和动态加载
 * 
 * @param converted 转换后的路由配置对象
 * @param component 组件路径或路由别名
 * @param routeName 路由名称（用于错误提示）
 */
function handleNormalRoute(converted: any, component: string | undefined, routeName: string): void {
  if (component) {
    // 优先检查是否是路由别名，如果是则使用别名对应的路径
    // 否则使用动态加载组件的方式
    converted.component = component
      ? RoutesAlias[component as keyof typeof RoutesAlias] ||
        loadComponent(component as string, routeName)
      : undefined
  }
}

export { registerAsyncRoutes, convertRouteComponent, loadComponent }
