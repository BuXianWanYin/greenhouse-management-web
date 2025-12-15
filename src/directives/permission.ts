import { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 权限指令 v-hasPermi
 * 若依标准框架实现
 * 用法：
 * <el-button v-hasPermi="['system:menu:add']">按钮</el-button>
 * <el-button v-hasPermi="['system:menu:add', 'system:menu:edit']">按钮</el-button>
 */
const hasPermiDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const all_permission = '*:*:*'
    const store = useUserStore()
    const permissions = store.getUserInfo?.permissions || []

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      const hasPermissions = permissions.some((permission: string) => {
        return all_permission === permission || permissionFlag.includes(permission)
      })
      if (!hasPermissions && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const all_permission = '*:*:*'
    const store = useUserStore()
    const permissions = store.getUserInfo?.permissions || []

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      const hasPermissions = permissions.some((permission: string) => {
        return all_permission === permission || permissionFlag.includes(permission)
      })
      if (!hasPermissions && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }
}

/**
 * 角色指令 v-hasRole
 * 若依标准框架实现
 * 用法：
 * <el-button v-hasRole="['admin']">管理员按钮</el-button>
 * <el-button v-hasRole="['admin', 'manager']">按钮</el-button>
 */
const hasRoleDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const super_admin = 'admin'
    const store = useUserStore()
    const roles = store.getUserInfo?.roles || []

    if (value && value instanceof Array && value.length > 0) {
      const roleFlag = value
      const hasRoles = roles.some((role: any) => {
        const roleKey = role.roleKey || role
        return super_admin === roleKey || roleFlag.includes(roleKey)
      })
      if (!hasRoles && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('请设置角色标签值')
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const super_admin = 'admin'
    const store = useUserStore()
    const roles = store.getUserInfo?.roles || []

    if (value && value instanceof Array && value.length > 0) {
      const roleFlag = value
      const hasRoles = roles.some((role: any) => {
        const roleKey = role.roleKey || role
        return super_admin === roleKey || roleFlag.includes(roleKey)
      })
      if (!hasRoles && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }
}

export function setupPermissionDirective(app: App) {
  // 若依标准框架指令
  app.directive('hasPermi', hasPermiDirective)
  app.directive('hasRole', hasRoleDirective)
}
