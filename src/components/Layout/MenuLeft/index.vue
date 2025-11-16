<!--
  左侧菜单组件（支持单列和双列菜单模式）
  功能：
    1. 单列菜单：左侧垂直菜单栏
    2. 双列菜单：左侧一级菜单 + 右侧二级菜单
    3. 支持菜单折叠/展开
    4. 支持移动端适配
  使用场景：左侧菜单模式和双列菜单模式
-->
<template>
  <div class="left-menu-or-dual-menu">
    <!-- 双列菜单模式：左侧一级菜单栏 -->
    <div class="dual-menu-left" :style="{ background: theme.background }" v-if="isDualMenu">
      <!-- Logo图标，点击返回首页 -->
      <svg class="svg-icon" aria-hidden="true" @click="toHome">
        <use xlink:href="#iconsys-zhaopian-copy"></use>
      </svg>
      <!-- 一级菜单滚动容器 -->
      <el-scrollbar style="height: calc(100% - 135px)">
        <ul>
          <!-- 遍历一级菜单 -->
          <li v-for="menu in firstLevelMenus" :key="menu.path" @click="handleMenuJump(menu, true)">
            <!-- 菜单项提示框（折叠状态下显示） -->
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t(menu.meta.title)"
              placement="right"
              :offset="25"
              :hide-after="0"
              :disabled="settingStore.dualMenuShowText"
            >
              <div
                :class="{
                  'is-active': menu.meta.isInMainContainer
                    ? menu.path === route.path
                    : menu.path === firstLevelMenuPath
                }"
                :style="{
                  margin: settingStore.dualMenuShowText ? '5px' : '15px',
                  height: settingStore.dualMenuShowText ? '60px' : '46px'
                }"
              >
                <!-- 菜单图标 -->
                <i
                  class="iconfont-sys"
                  v-html="menu.meta.icon"
                  :style="{
                    fontSize: settingStore.dualMenuShowText ? '18px' : '22px',
                    marginBottom: settingStore.dualMenuShowText ? '5px' : '0'
                  }"
                ></i>
                <!-- 菜单标题（仅在显示文本模式下显示） -->
                <span v-if="settingStore.dualMenuShowText">
                  {{ $t(menu.meta.title) }}
                </span>
              </div>
            </el-tooltip>
          </li>
        </ul>
      </el-scrollbar>
      <!-- 切换显示模式按钮（图标/图标+文字） -->
      <div class="switch-btn" @click="setDualMenuMode">
        <i class="iconfont-sys">&#xe798;</i>
      </div>
    </div>

    <!-- 左侧菜单（单列模式） || 双列菜单（右侧二级菜单） -->
    <div
      class="menu-left"
      id="menu-left"
      :class="`menu-left-${theme.theme} menu-left-${collapse ? 'close' : 'open'}`"
      :style="{ background: theme.background }"
    >
      <!-- 菜单头部（Logo和系统名称） -->
      <div class="header" @click="toHome" :style="{ background: theme.background }">
        <!-- Logo图片（仅在非双列菜单模式下显示） -->
        <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" v-if="!isDualMenu" />
        <!-- 系统名称 -->
        <p
          :class="{ 'is-dual-menu-name': isDualMenu }"
          :style="{ color: theme.systemNameColor, opacity: collapse ? 0 : 1 }"
        >
          {{ AppConfig.systemInfo.name }}
        </p>
      </div>
      <!-- Element Plus 菜单组件 -->
      <el-menu
        :class="'el-menu-' + theme.theme"
        :collapse="collapse"
        :default-active="routerPath"
        :text-color="theme.textColor"
        :unique-opened="uniqueOpened"
        :background-color="theme.background"
        :active-text-color="theme.textActiveColor"
        :default-openeds="defaultOpenedsArray"
        :popper-class="`menu-left-${theme.theme}-popper`"
      >
        <!-- 使用子菜单组件递归渲染菜单树 -->
        <submenu :list="menuList" :isMobile="isMobileModel" :theme="theme" @close="closeMenu" />
      </el-menu>

      <!-- 移动端菜单遮罩层 -->
      <div
        class="menu-model"
        @click="visibleMenu"
        :style="{
          opacity: collapse ? 0 : 1,
          transform: showMobileModel ? 'scale(1)' : 'scale(0)'
        }"
      >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Submenu from '../Submenu/submenu.vue'
  import { HOME_PAGE } from '@/router/index'
  import { useSettingStore } from '@/store/modules/setting'
  import AppConfig from '@/config'
  import { MenuTypeEnum, MenuWidth } from '@/enums/appEnum'
  import { useMenuStore } from '@/store/modules/menu'
  import { isIframe } from '@/utils/utils'
  import { handleMenuJump } from '@/utils/jump'

  // 路由和路由实例
  const route = useRoute()
  const router = useRouter()
  // 设置状态管理
  const settingStore = useSettingStore()
  // 菜单展开时的宽度
  const menuOpenWidth = computed(() => settingStore.getMenuOpenWidth)
  // 菜单折叠时的宽度
  const menuCloseWidth = MenuWidth.CLOSE
  // 是否为顶部左侧菜单模式
  const isTopLeftMenu = computed(() => settingStore.menuType === MenuTypeEnum.TOP_LEFT)
  // 是否为双列菜单模式
  const isDualMenu = computed(() => settingStore.menuType === MenuTypeEnum.DUAL_MENU)

  // 菜单是否折叠
  const collapse = computed(() => !settingStore.menuOpen)
  // 是否只允许一个子菜单展开
  const uniqueOpened = computed(() => settingStore.uniqueOpened)
  // 默认展开的菜单项
  const defaultOpenedsArray = ref([])

  /**
   * 一级菜单列表（过滤掉隐藏的菜单）
   */
  const firstLevelMenus = computed(() => {
    return useMenuStore().getMenuList.filter((item) => !item.meta.isHide)
  })

  /**
   * 当前需要显示的菜单列表
   * 根据菜单模式（单列/双列/顶部左侧）返回不同的菜单数据
   */
  const menuList = computed(() => {
    const list = useMenuStore().getMenuList

    // 如果不是顶部左侧菜单或双列菜单，直接返回完整菜单列表
    if (!isTopLeftMenu.value && !isDualMenu.value) {
      return list
    }

    // 处理 iframe 路径（iframe 页面需要特殊处理）
    if (isIframe(route.path)) {
      return findIframeMenuList(route.path, list)
    }

    // 获取当前路由的顶级路径（第一级路径）
    const currentTopPath = `/${route.path.split('/')[1]}`

    // 处理主容器内的一级菜单
    if (route.meta.isInMainContainer) {
      return list.filter((menu) => menu.meta.isInMainContainer)
    }

    // 返回当前顶级路径对应的子菜单
    const currentMenu = list.find((menu) => menu.path === currentTopPath)
    return currentMenu?.children ?? []
  })

  /**
   * 查找 iframe 对应的二级菜单列表
   * @param currentPath 当前路径
   * @param menuList 菜单列表
   * @returns 匹配的子菜单列表
   */
  const findIframeMenuList = (currentPath: string, menuList: any[]) => {
    /**
     * 递归查找包含当前路径的菜单项
     * @param items 菜单项数组
     * @returns 是否包含当前路径
     */
    const hasPath = (items: any[]) => {
      for (const item of items) {
        if (item.path === currentPath) {
          return true
        }
        if (item.children && hasPath(item.children)) {
          return true
        }
      }
      return false
    }

    // 遍历一级菜单查找匹配的子菜单
    for (const menu of menuList) {
      if (menu.children && hasPath(menu.children)) {
        return menu.children
      }
    }
    return []
  }

  /**
   * 当前路由的一级菜单路径
   */
  const firstLevelMenuPath = computed(() => {
    return route.matched[0].path
  })

  /**
   * 当前路由路径（用于激活对应的菜单项）
   */
  const routerPath = computed(() => {
    return route.path
  })

  // 组件挂载后监听窗口大小变化
  onMounted(() => {
    listenerWindowResize()
  })

  // 是否为移动端模式
  const isMobileModel = ref(false)
  // 是否显示移动端遮罩层
  const showMobileModel = ref(false)
  // 菜单主题配置
  const theme = computed(() => settingStore.getMenuTheme)

  // 监听菜单折叠状态变化
  watch(
    () => collapse.value,
    (collapse: boolean) => {
      // 如果菜单展开，显示移动端遮罩层
      if (!collapse) {
        showMobileModel.value = true
      }
    }
  )

  /**
   * 跳转到首页
   */
  const toHome = () => {
    router.push(HOME_PAGE)
  }

  // 屏幕宽度
  let screenWidth = 0

  /**
   * 监听窗口大小变化，自动调整菜单状态
   */
  const listenerWindowResize = () => {
    screenWidth = document.body.clientWidth

    setMenuModel()

    // 绑定窗口大小变化事件
    window.onresize = () => {
      return (() => {
        screenWidth = document.body.clientWidth
        setMenuModel()
      })()
    }
  }

  /**
   * 根据屏幕宽度设置菜单模式
   * 小屏幕（<800px）自动折叠菜单
   */
  const setMenuModel = () => {
    // 小屏幕折叠菜单
    if (screenWidth < 800) {
      settingStore.setMenuOpen(false)
    }
  }

  /**
   * 显示/隐藏菜单（移动端使用）
   */
  const visibleMenu = () => {
    // 切换菜单展开/折叠状态
    settingStore.setMenuOpen(!!collapse.value)

    // 移动端模态框显示/隐藏
    if (!showMobileModel.value) {
      showMobileModel.value = true
    } else {
      setTimeout(() => {
        showMobileModel.value = false
      }, 200)
    }
  }

  /**
   * 关闭菜单（移动端使用）
   */
  const closeMenu = () => {
    // 小屏幕下点击菜单项后自动关闭菜单
    if (document.body.clientWidth < 800) {
      settingStore.setMenuOpen(false)
      showMobileModel.value = false
    }
  }

  /**
   * 切换双列菜单显示模式（图标模式 / 图标+文字模式）
   */
  const setDualMenuMode = () => {
    settingStore.setDualMenuShowText(!settingStore.dualMenuShowText)
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>

<style lang="scss">
  @use './theme';

  .menu-left {
    // 展开的宽度
    .el-menu:not(.el-menu--collapse) {
      width: v-bind(menuOpenWidth);
    }

    // 折叠后宽度
    .el-menu--collapse {
      width: v-bind(menuCloseWidth);
    }

    // 去除 el-menu 出现的边框
    .el-menu:focus-visible {
      outline: unset;
    }
  }
</style>
