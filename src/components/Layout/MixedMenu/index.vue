<!--
  混合顶部菜单组件
  功能：在顶部显示水平滚动的菜单栏，支持左右滚动按钮
  使用场景：混合菜单模式下的顶部菜单展示
-->
<template>
  <div class="mixed-top-menu">
    <!-- 左侧滚动按钮 -->
    <div class="scroll-btn left" v-show="showLeftArrow" @click="scroll('left')">
      <el-icon><ArrowLeft /></el-icon>
    </div>

    <!-- 水平滚动菜单容器 -->
    <el-scrollbar
      ref="scrollbarRef"
      wrap-class="scrollbar-wrapper"
      :horizontal="true"
      @scroll="handleScroll"
    >
      <div class="scroll-bar">
        <!-- 遍历菜单列表，渲染菜单项 -->
        <template v-for="item in list" :key="item.meta.title">
          <div
            class="item"
            :class="{ active: isActive(item) }"
            @click="handleMenuJump(item, true)"
            v-if="!item.meta.isHide"
          >
            <!-- 菜单图标 -->
            <i class="iconfont-sys" v-html="item.meta.icon"></i>
            <!-- 菜单标题 -->
            <span>{{ formatMenuTitle(item.meta.title) }}</span>
          </div>
        </template>
      </div>
    </el-scrollbar>

    <!-- 右侧滚动按钮 -->
    <div class="scroll-btn right" v-show="showRightArrow" @click="scroll('right')">
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'
  import { MenuListType } from '@/types/menu'
  const route = useRoute()
  import { ref, onMounted } from 'vue'
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
  import { formatMenuTitle } from '@/utils/menu'
  import { handleMenuJump } from '@/utils/jump'

  // 设置状态管理
  const settingStore = useSettingStore()
  // 菜单展开宽度
  const menuopenwidth = computed(() => settingStore.getMenuOpenWidth)

  // 组件属性定义
  defineProps({
    list: {
      type: [Array] as PropType<MenuListType[]>,
      default: () => []
    }
  })

  /**
   * 判断菜单项是否激活（当前路由是否匹配）
   * @param item 菜单项
   * @returns 是否激活
   */
  const isActive = (item: MenuListType): boolean => {
    const currentPath = route.path

    // 如果有子菜单，递归检查子菜单是否匹配
    if (item.children?.length) {
      return item.children.some((child) => {
        // 如果子菜单还有子菜单，继续递归
        if (child.children?.length) {
          return isActive(child)
        }
        // 检查子菜单路径是否匹配当前路径
        return child.path === currentPath
      })
    }

    // 直接检查菜单路径是否匹配当前路径
    return item.path === currentPath
  }

  // 滚动条引用
  const scrollbarRef = ref()
  // 是否显示左侧箭头
  const showLeftArrow = ref(false)
  // 是否显示右侧箭头
  const showRightArrow = ref(false)

  /**
   * 处理滚动事件，控制左右箭头显示/隐藏
   */
  const handleScroll = () => {
    if (!scrollbarRef.value) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollbarRef.value.wrapRef
    // 如果滚动位置大于0，显示左箭头
    showLeftArrow.value = scrollLeft > 0
    // 如果滚动位置+可视宽度小于总宽度，显示右箭头
    showRightArrow.value = scrollLeft + clientWidth < scrollWidth
  }

  /**
   * 滚动菜单
   * @param direction 滚动方向：'left' 或 'right'
   */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollbarRef.value) return

    // 每次滚动距离
    const scrollDistance = 200
    const currentScroll = scrollbarRef.value.wrapRef.scrollLeft
    // 计算目标滚动位置
    const targetScroll =
      direction === 'left' ? currentScroll - scrollDistance : currentScroll + scrollDistance

    // 平滑滚动到目标位置
    scrollbarRef.value.wrapRef.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  // 组件挂载后初始化滚动状态
  onMounted(() => {
    handleScroll()
  })
</script>

<style lang="scss" scoped>
  .mixed-top-menu {
    position: relative;
    box-sizing: border-box;
    display: flex;
    width: 100%;
    overflow: hidden;

    :deep(.el-scrollbar__bar.is-horizontal) {
      bottom: 5px;
      display: none;
      height: 2px;
    }

    :deep(.scrollbar-wrapper) {
      width: calc(60vw - v-bind(menuopenwidth));
      margin: 0 30px;
    }

    .scroll-bar {
      box-sizing: border-box;
      display: flex;
      flex-shrink: 0;
      flex-wrap: nowrap;
      align-items: center;
      height: 60px;
      white-space: nowrap;

      .item {
        position: relative;
        height: 40px;
        padding: 0 12px;
        font-size: 14px;
        line-height: 40px;
        cursor: pointer;
        border-radius: 6px;

        i {
          margin-right: 5px;
          font-size: 15px;
        }

        &:hover {
          color: var(--main-color);
        }

        &.active {
          color: var(--main-color);
          background-color: var(--main-bg-color);

          &::after {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 2px;
            margin: auto;
            content: '';
            background-color: var(--main-color);
          }
        }
      }
    }

    .scroll-btn {
      position: absolute;
      top: 50%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      cursor: pointer;
      transform: translateY(-50%);

      &:hover {
        color: var(--main-color);
      }

      &.left {
        left: 0;
      }

      &.right {
        right: 0;
      }
    }
  }

  @media (max-width: $device-notebook) {
    .mixed-top-menu {
      :deep(.scrollbar-wrapper) {
        width: calc(48vw - v-bind(menuopenwidth));
        margin: 0 30px;
      }
    }
  }
</style>
