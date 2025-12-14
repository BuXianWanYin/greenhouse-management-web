import type { App } from 'vue'
import { createPinia } from 'pinia'

/**
 * Pinia 状态管理实例
 */
export const store = createPinia()

/**
 * 初始化 Pinia 状态管理
 * @param app Vue 应用实例
 */
export function initStore(app: App<Element>) {
  app.use(store)
}
