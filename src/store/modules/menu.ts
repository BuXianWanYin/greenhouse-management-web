import { defineStore } from 'pinia'
import { MenuListType } from '@/types/menu'

/**
 * 菜单状态接口
 */
interface MenuState {
  menuList: MenuListType[] // 菜单列表
  menuWidth: string // 菜单宽度
}

/**
 * 菜单状态管理 Store
 * 用于管理菜单列表和菜单宽度
 */
export const useMenuStore = defineStore({
  id: 'menuStore',
  state: (): MenuState => ({
    menuList: [], // 菜单列表
    menuWidth: '' // 菜单宽度
  }),
  getters: {
    /**
     * 获取菜单列表
     * @returns 菜单列表
     */
    getMenuList(): MenuListType[] {
      return this.menuList
    }
  },
  actions: {
    /**
     * 设置菜单列表
     * @param list 菜单列表数据
     */
    setMenuList(list: []) {
      this.menuList = list
    },
    /**
     * 设置菜单宽度
     * @param width 菜单宽度
     */
    setMenuWidth(width: string) {
      this.menuWidth = width
    }
  }
})
