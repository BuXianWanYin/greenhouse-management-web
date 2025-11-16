<!--
  顶部菜单组件
  功能：在页面顶部显示水平菜单栏
  使用场景：顶部菜单模式下的菜单展示
-->
<template>
  <div class="menu-top">
    <!-- Element Plus 水平菜单 -->
    <el-menu
      :ellipsis="true"
      class="el-menu-popper-demo"
      mode="horizontal"
      :default-active="routerPath"
      text-color="var(--art-text-gray-700)"
      :popper-offset="16"
      :style="{ width: width + 'px' }"
      background-color="transparent"
    >
      <!-- 遍历过滤后的菜单项，使用子菜单组件递归渲染 -->
      <MenuTopSubmenu
        v-for="item in filteredMenuItems"
        :key="item.id"
        :item="item"
        :isMobile="false"
        :level="0"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
  import { MenuListType } from '@/types/menu'

  const route = useRoute()

  // 组件属性定义
  const props = defineProps({
    // 菜单列表数据
    list: {
      type: [Array] as PropType<MenuListType[]>,
      default: () => []
    },
    // 菜单宽度
    width: {
      type: Number,
      default: 500
    }
  })

  // 当前路由路径，用于激活对应的菜单项
  const routerPath = computed(() => {
    return route.path
  })

  // 过滤后的菜单项（排除隐藏的菜单）
  const filteredMenuItems = computed(() => {
    return props.list.filter((item) => !item.meta.isHide)
  })
</script>

<style lang="scss" scoped>
  // :deep(.el-menu--horizontal > .el-sub-menu.is-active) {
  //   background-color: #eee;
  // }

  :deep(.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title) {
    border: 0 !important;
  }

  .menu-top {
    .el-menu {
      border: none;

      :deep(.el-sub-menu) {
        .el-sub-menu__title {
          padding: 0 20px;
        }
      }

      :deep(.el-menu-item) {
        padding: 0 20px;
      }
    }
  }

  @media only screen and (max-width: $device-notebook) {
    .menu-top {
      .el-menu {
        width: 28vw !important;
      }
    }
  }
</style>
