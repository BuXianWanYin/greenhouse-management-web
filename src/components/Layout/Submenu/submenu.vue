<!--
  子菜单递归组件
  功能：递归渲染菜单树，支持多级嵌套菜单
  使用场景：左侧菜单和双列菜单的子菜单渲染
-->
<template>
  <template v-for="item in filteredMenuItems" :key="item.id">
    <!-- 包含子菜单的项目：渲染为可展开的子菜单 -->
    <el-sub-menu v-if="hasChildren(item)" :index="item.path || item.meta.title" :level="level">
      <template #title>
        <!-- 菜单图标 -->
        <MenuItemIcon :icon="item.meta.icon" :color="theme?.iconColor" />
        <!-- 菜单标题 -->
        <span class="menu-name" :data-menu="formatMenuTitle(item.meta.title)">{{ formatMenuTitle(item.meta.title) }}</span>
        <!-- 徽章提示（位于标题右侧） -->
        <div v-if="item.meta.showBadge" class="badge" style="right: 35px" />
      </template>
      <!-- 递归渲染子菜单 -->
      <submenu
        :list="item.children"
        :is-mobile="isMobile"
        :level="level + 1"
        :theme="theme"
        @close="closeMenu"
      />
    </el-sub-menu>

    <!-- 普通菜单项：没有子菜单的叶子节点 -->
    <el-menu-item
      v-else
      :index="item.path || item.meta.title"
      :level-item="level + 1"
      @click="goPage(item)"
    >
      <!-- 菜单图标 -->
      <MenuItemIcon :icon="item.meta.icon" :color="theme?.iconColor" />
      <template #title>
        <!-- 菜单标题 -->
        <span class="menu-name" :data-menu="formatMenuTitle(item.meta.title)">{{ formatMenuTitle(item.meta.title) }}</span>
        <!-- 徽章提示 -->
        <div v-if="item.meta.showBadge" class="badge" />
        <!-- 文字徽章提示 -->
        <div v-if="item.meta.showTextBadge" class="text-badge">
          {{ item.meta.showTextBadge }}
        </div>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MenuListType } from '@/types/menu'
  import { formatMenuTitle } from '@/utils/menu'
  import { handleMenuJump } from '@/utils/jump'

  // 组件属性类型定义
  interface Props {
    title?: string
    list?: MenuListType[]
    theme?: {
      iconColor?: string
    }
    isMobile?: boolean
    level?: number
  }

  // Props定义
  const props = withDefaults(defineProps<Props>(), {
    title: '',
    list: () => [],
    theme: () => ({}),
    isMobile: false,
    level: 0
  })

  // 事件定义
  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  /**
   * 过滤后的菜单项（排除隐藏的菜单项）
   */
  const filteredMenuItems = computed(() => filterRoutes(props.list))

  /**
   * 跳转到菜单对应的页面
   * @param item 菜单项
   */
  const goPage = (item: MenuListType) => {
    closeMenu()
    handleMenuJump(item)
  }

  /**
   * 关闭菜单（移动端使用）
   */
  const closeMenu = () => emit('close')

  /**
   * 判断菜单项是否有子菜单
   * @param item 菜单项
   * @returns 是否有子菜单
   */
  const hasChildren = (item: MenuListType): boolean => {
    return Boolean(item.children?.length)
  }

  /**
   * 递归过滤菜单项，排除隐藏的菜单项
   * @param items 菜单项数组
   * @returns 过滤后的菜单项数组
   */
  const filterRoutes = (items: MenuListType[]): MenuListType[] => {
    return items
      .filter((item) => !item.meta.isHide)
      .map((item) => ({
        ...item,
        children: item.children ? filterRoutes(item.children) : undefined
      }))
  }
</script>

<script lang="ts">
  /**
   * 菜单项图标组件
   * 功能：统一渲染菜单图标，支持自定义颜色
   */
  const MenuItemIcon = defineComponent({
    name: 'MenuItemIcon',
    props: {
      // 图标HTML内容
      icon: String,
      // 图标颜色
      color: String
    },
    setup(props) {
      return () =>
        h('i', {
          class: 'menu-icon iconfont-sys',
          style: props.color ? { color: props.color } : undefined,
          innerHTML: props.icon
        })
    }
  })
</script>
