<!--
  顶部菜单子菜单组件（递归组件）
  功能：递归渲染顶部菜单的子菜单项，支持多级嵌套
  使用场景：顶部菜单模式下的子菜单渲染
-->
<template>
  <!-- 如果有子菜单，渲染为子菜单项 -->
  <el-sub-menu v-if="hasChildren" :index="item.path || item.meta.title">
    <template #title>
      <!-- 菜单图标 -->
      <i
        class="menu-icon iconfont-sys"
        :style="{ color: theme?.iconColor }"
        v-html="item.meta.icon"
      ></i>
      <!-- 菜单标题 -->
      <span>{{ formatMenuTitle(item.meta.title) }}</span>
    </template>
    <!-- 递归渲染子菜单 -->
    <MenuTopSubmenu
      v-for="child in filteredChildren"
      :key="child.id"
      :item="child"
      @close="closeMenu"
      :level="level + 1"
      :theme="theme"
      :is-mobile="isMobile"
    />
  </el-sub-menu>

  <!-- 如果没有子菜单且未隐藏，渲染为普通菜单项 -->
  <el-menu-item
    v-else-if="!item.meta.isHide"
    :index="item.path || item.meta.title"
    @click="goPage(item)"
  >
    <!-- 菜单图标 -->
    <i
      class="menu-icon iconfont-sys"
      :style="{ color: theme?.iconColor }"
      v-html="item.meta.icon"
    ></i>
    <!-- 菜单标题 -->
    <span>{{ formatMenuTitle(item.meta.title) }}</span>
    <!-- 徽章提示 -->
    <div class="badge" v-if="item.meta.showBadge"></div>
  </el-menu-item>
</template>

<script lang="ts" setup>
  import { MenuListType } from '@/types/menu'
  import { handleMenuJump } from '@/utils/jump'
  import { formatMenuTitle } from '@/utils/menu'

  // 组件属性定义
  const props = defineProps({
    // 菜单项数据
    item: {
      type: Object as PropType<MenuListType>,
      required: true
    },
    // 主题配置
    theme: {
      type: Object,
      default: () => ({})
    },
    // 是否为移动端
    isMobile: Boolean,
    // 菜单层级（用于递归）
    level: {
      type: Number,
      default: 0
    }
  })

  // 事件定义
  const emit = defineEmits(['close'])

  /**
   * 计算当前项是否有子菜单
   */
  const hasChildren = computed(() => {
    return props.item.children && props.item.children.length > 0
  })

  /**
   * 过滤后的子菜单项（排除隐藏的菜单项）
   */
  const filteredChildren = computed(() => {
    return props.item.children?.filter((child) => !child.meta.isHide) || []
  })

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
  const closeMenu = () => {
    emit('close')
  }

  /**
   * 判断子菜单是否不为空
   * @param children 子菜单数组
   */
  const isNotEmpty = (children: MenuListType[] | undefined) => {
    return children && children.length > 0
  }
</script>

<style lang="scss" scoped>
  .el-sub-menu {
    padding: 0 !important;

    :deep(.el-sub-menu__title) {
      padding: 0 30px 0 15px !important;

      .el-sub-menu__icon-arrow {
        right: 10px !important;
      }
    }
  }

  .menu-icon {
    margin-right: 5px;
    font-size: 16px;
  }
</style>
