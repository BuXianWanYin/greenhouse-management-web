# 温室作物种植计划与人员分工管理系统 - 前端项目

## 项目简介

温室作物种植计划与人员分工管理系统前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus 构建的现代化农业智能管理平台。系统集成了作物种植计划管理、设备监控、环境监测、人员调度、AI 决策辅助等功能，为温室农业提供全方位的智能化管理解决方案。

## 技术栈

- **框架**: Vue 3.5.16
- **语言**: TypeScript 5.6.3
- **构建工具**: Vite 4.5.1
- **UI 组件库**: Element Plus 2.9.11
- **状态管理**: Pinia 2.3.1
- **路由**: Vue Router 4.4.2
- **HTTP 客户端**: Axios 1.7.5
- **图表库**: ECharts 5.4.0
- **实时通信**: MQTT 5.13.1
- **国际化**: Vue I18n 9.14.0
- **富文本编辑器**: WangEditor 5.1.23, MD Editor V3 4.17.0
- **代码规范**: ESLint + Prettier + Stylelint + Husky
- **其他**: MQTT 实时通信、SSE 服务端推送、WebSocket

## 项目特性

- **农业智能管理**: 作物种植计划、轮作管理、任务分配、收获记录
- **数据可视化**: ECharts 图表展示、实时数据监控大屏
- **AI 智能决策**: AI 辅助决策、智能建议、资源优化、环境分析
- **设备实时监控**: IoT 设备接入、MQTT 实时数据传输、设备状态监控
- **环境监测**: 温湿度、光照、土壤等多维度环境数据采集与分析
- **人员管理**: 员工排班、工时统计、任务分配、技能管理
- **智能告警**: 多级告警配置、实时预警通知、告警历史分析
- **响应式设计**: 适配多种设备尺寸，支持移动端访问
- **主题切换**: 支持亮色/暗色主题，多种布局模式
- **国际化**: 支持中英文切换
- **权限管理**: 基于 RBAC 的权限控制，细粒度权限管理

## 项目结构

```
greenhouse-management-web/
├── public/                          # 静态资源目录
│   └── favicon.png                 # 网站图标
├── src/                            # 源代码目录
│   ├── api/                        # API接口定义
│   │   ├── agriculture/            # 农业相关API
│   │   │   ├── classApi.ts        # 班次管理API
│   │   │   ├── classReportApi.ts  # 班次报告API
│   │   │   ├── consoleApi.ts      # 控制台API
│   │   │   ├── costEmployeeApi.ts # 员工成本API
│   │   │   ├── cropBatchApi.ts    # 作物批次API
│   │   │   ├── cropBatchTaskApi.ts # 批次任务API
│   │   │   ├── decisionApi.ts     # 决策建议API
│   │   │   ├── harvestApi.ts      # 收获管理API
│   │   │   ├── jobApi.ts          # 作业任务API
│   │   │   ├── logApi.ts          # 日志API
│   │   │   ├── partitionFoodApi.ts # 分区投料API
│   │   │   ├── pastureApi.ts      # 牧场管理API
│   │   │   ├── planDetailApi.ts   # 计划详情API
│   │   │   ├── plantingPlanApi.ts # 种植计划API
│   │   │   ├── resourceApi.ts     # 资源管理API
│   │   │   ├── resourceInventoryApi.ts # 资源库存API
│   │   │   ├── resourceUsageApi.ts # 资源使用API
│   │   │   ├── robot.ts           # 机器人控制API
│   │   │   ├── scheduleApi.ts     # 排班API
│   │   │   ├── scheduleRuleApi.ts # 排班规则API
│   │   │   ├── taskAttachmentApi.ts # 任务附件API
│   │   │   └── taskEmployeeApi.ts # 任务员工API
│   │   ├── ai/                     # AI相关API
│   │   │   └── aiApi.ts           # AI智能决策API
│   │   ├── device/                 # 设备相关API
│   │   │   ├── deviceApi.ts       # 设备管理API
│   │   │   ├── deviceConfigApi.ts # 设备配置API
│   │   │   ├── deviceheartbeatApi.ts # 设备心跳API
│   │   │   ├── devicetypeApi.ts   # 设备类型API
│   │   │   ├── thresholdConfig.ts # 阈值配置API
│   │   │   └── typedictApi.ts     # 类型字典API
│   │   ├── monitor/                # 监控相关API
│   │   │   ├── cacheApi.ts        # 缓存监控API
│   │   │   ├── jobApi.ts          # 定时任务API
│   │   │   ├── jobLogApi.ts       # 任务日志API
│   │   │   ├── logininforApi.ts   # 登录日志API
│   │   │   ├── onlineApi.ts       # 在线用户API
│   │   │   ├── operlogApi.ts      # 操作日志API
│   │   │   └── serverApi.ts       # 服务器监控API
│   │   ├── mqtt/                   # MQTT通信
│   │   │   └── mqttClient.ts      # MQTT客户端
│   │   ├── sensor/                 # 传感器相关API
│   │   │   ├── airdataApi.ts      # 空气数据API
│   │   │   ├── alertApi.ts        # 告警API
│   │   │   └── soilDataApi.ts     # 土壤数据API
│   │   ├── system/                 # 系统管理API
│   │   │   ├── dict/               # 字典管理
│   │   │   │   ├── dataApi.ts     # 字典数据API
│   │   │   │   └── typeApi.ts     # 字典类型API
│   │   │   ├── configApi.ts       # 系统配置API
│   │   │   ├── deptApi.ts         # 部门管理API
│   │   │   ├── menuApi.ts         # 菜单管理API
│   │   │   ├── noticeApi.ts       # 通知公告API
│   │   │   ├── postApi.ts         # 岗位管理API
│   │   │   ├── roleApi.ts         # 角色管理API
│   │   │   └── userApi.ts         # 用户管理API
│   │   ├── tool/                   # 工具API
│   │   │   └── generatorApi.ts    # 代码生成API
│   │   ├── loginApi.ts             # 登录API
│   │   ├── menuApi.ts              # 菜单API
│   │   └── sseApi.ts               # SSE服务端推送API
│   ├── assets/                     # 静态资源
│   │   ├── fonts/                  # 字体文件
│   │   │   ├── DMSans.woff2       # DM Sans字体
│   │   │   └── Montserrat.woff2   # Montserrat字体
│   │   ├── icons/                  # 图标资源
│   │   │   └── system/             # 系统图标字体
│   │   │       ├── iconfont.css   # 图标CSS
│   │   │       ├── iconfont.js    # 图标JS
│   │   │       ├── iconfont.json  # 图标配置
│   │   │       ├── iconfont.ttf   # 图标字体TTF
│   │   │       ├── iconfont.woff  # 图标字体WOFF
│   │   │       └── iconfont.woff2 # 图标字体WOFF2
│   │   ├── img/                    # 图片资源
│   │   │   ├── 3d/                 # 3D图标
│   │   │   │   ├── fish.png
│   │   │   │   ├── icon1.png
│   │   │   │   ├── icon2.png
│   │   │   │   ├── icon3.png
│   │   │   │   ├── icon4.png
│   │   │   │   ├── icon5.png
│   │   │   │   ├── icon6.png
│   │   │   │   ├── icon7.png
│   │   │   │   └── icon8.png
│   │   │   ├── avatar/             # 用户头像
│   │   │   │   ├── avatar.png
│   │   │   │   ├── avatar1.jpg
│   │   │   │   ├── avatar2.jpg
│   │   │   │   ├── avatar3.jpg
│   │   │   │   ├── avatar4.jpg
│   │   │   │   ├── avatar5.jpg
│   │   │   │   ├── avatar6.jpg
│   │   │   │   ├── avatar7.jpg
│   │   │   │   ├── avatar8.jpg
│   │   │   │   ├── avatar9.jpg
│   │   │   │   ├── avatar10.jpg
│   │   │   │   ├── bg.png
│   │   │   │   ├── default-avatar.png
│   │   │   │   └── default-avatars.png
│   │   │   ├── ceremony/           # 庆典动画资源
│   │   │   │   ├── hb.png         # 红包
│   │   │   │   ├── sd.png         # 闪电
│   │   │   │   ├── xc.png         # 星辰
│   │   │   │   └── yd.png         # 月亮
│   │   │   ├── common/             # 通用图片
│   │   │   │   └── logo.png       # Logo
│   │   │   ├── cover/              # 封面图片
│   │   │   │   ├── img1.jpg
│   │   │   │   ├── img2.jpg
│   │   │   │   ├── img3.jpg
│   │   │   │   ├── img4.jpg
│   │   │   │   ├── img5.jpg
│   │   │   │   ├── img6.jpg
│   │   │   │   ├── img7.jpg
│   │   │   │   ├── img8.jpg
│   │   │   │   ├── img9.jpg
│   │   │   │   └── img10.jpg
│   │   │   ├── draw/               # 绘图资源
│   │   │   │   └── draw1.png
│   │   │   ├── lock/               # 锁屏图片
│   │   │   │   └── lock_screen_1.png
│   │   │   ├── login/              # 登录页图片
│   │   │   │   ├── lf_bg.png      # 登录背景
│   │   │   │   ├── lf_icon1.png   # 登录图标1
│   │   │   │   └── lf_icon2.png   # 登录图标2
│   │   │   ├── safeguard/          # 安全防护图片
│   │   │   │   └── server.png
│   │   │   ├── settings/           # 设置相关图片
│   │   │   │   ├── menu_layouts/   # 菜单布局样式
│   │   │   │   │   ├── dual_column.png # 双栏布局
│   │   │   │   │   ├── horizontal.png  # 横向布局
│   │   │   │   │   ├── mixed.png       # 混合布局
│   │   │   │   │   └── vertical.png    # 纵向布局
│   │   │   │   ├── menu_styles/    # 菜单样式
│   │   │   │   │   ├── dark.png    # 暗色主题
│   │   │   │   │   ├── design.png  # 设计主题
│   │   │   │   │   └── light.png   # 亮色主题
│   │   │   │   └── theme_styles/   # 主题样式
│   │   │   │       ├── dark.png    # 暗色
│   │   │   │       ├── light.png   # 亮色
│   │   │   │       └── system.png  # 跟随系统
│   │   │   ├── state/              # 状态图片
│   │   │   │   ├── 403.png        # 无权限
│   │   │   │   ├── 404.png        # 页面未找到
│   │   │   │   ├── 500.png        # 服务器错误
│   │   │   │   ├── ban_access.png # 禁止访问
│   │   │   │   ├── data_failure.png # 数据失败
│   │   │   │   ├── empty.png      # 空状态
│   │   │   │   ├── error.png      # 错误
│   │   │   │   ├── fault.png      # 故障
│   │   │   │   ├── loading.png    # 加载中
│   │   │   │   ├── no_network.png # 无网络
│   │   │   │   ├── notice.png     # 通知
│   │   │   │   └── update.png     # 更新
│   │   │   ├── user/               # 用户相关图片
│   │   │   │   ├── avatar.png     # 默认头像
│   │   │   │   └── bg.png         # 背景
│   │   │   └── favicon.ico         # 网站图标
│   │   ├── live2d/                 # Live2D动画库
│   │   │   └── live2d.min.js      # Live2D脚本
│   │   ├── logo/                   # Logo资源
│   │   │   ├── login.png          # 登录页Logo
│   │   │   └── logo.png           # 系统Logo
│   │   ├── mp3/                    # 音频文件
│   │   │   └── test.mp3           # 测试音频
│   │   ├── styles/                 # 全局样式
│   │   │   ├── app.scss           # 应用主样式
│   │   │   ├── change.scss        # 变化动画样式
│   │   │   ├── dark.scss          # 暗色主题样式
│   │   │   ├── el-dark.scss       # Element Plus暗色主题
│   │   │   ├── el-light.scss      # Element Plus亮色主题
│   │   │   ├── el-ui.scss         # Element Plus UI样式
│   │   │   ├── markdown.scss      # Markdown样式
│   │   │   ├── mixin.scss         # SCSS混合
│   │   │   ├── mobile.scss        # 移动端样式
│   │   │   ├── one-dark-pro.scss  # One Dark Pro主题
│   │   │   ├── pages.scss         # 页面样式
│   │   │   ├── reset.scss         # 重置样式
│   │   │   ├── theme-animation.scss # 主题动画
│   │   │   ├── transition.scss    # 过渡动画
│   │   │   ├── tree.scss          # 树形组件样式
│   │   │   └── variables.scss     # SCSS变量
│   │   └── svg/                    # SVG资源
│   │       └── loading.ts          # 加载动画SVG
│   ├── components/                 # 公共组件
│   │   ├── AIBatchSuggestionPanel/ # AI批次建议面板
│   │   │   └── index.vue
│   │   ├── AIResourceSuggestionPanel/ # AI资源建议面板
│   │   │   └── index.vue
│   │   ├── AlertNotification/      # 告警通知组件
│   │   │   ├── index.vue          # 告警通知主组件
│   │   │   └── message.vue        # 消息组件
│   │   ├── Bot/                    # 智能机器人组件
│   │   │   ├── chat.vue           # 聊天界面
│   │   │   ├── index.vue          # 机器人主组件
│   │   │   └── writer.vue         # 写作助手
│   │   ├── Ceremony/               # 庆典动画组件
│   │   │   └── Fireworks.vue      # 烟花动画
│   │   ├── Crontab/                # Cron表达式组件
│   │   │   ├── day.vue            # 日
│   │   │   ├── hour.vue           # 时
│   │   │   ├── index.vue          # 主组件
│   │   │   ├── min.vue            # 分
│   │   │   ├── month.vue          # 月
│   │   │   ├── result.vue         # 结果显示
│   │   │   ├── second.vue         # 秒
│   │   │   ├── week.vue           # 周
│   │   │   └── year.vue           # 年
│   │   ├── Form/                   # 表单组件
│   │   │   ├── ButtonMore.vue     # 更多按钮
│   │   │   ├── ButtonTable.vue    # 表格按钮
│   │   │   ├── DragVerify.vue     # 拖拽验证
│   │   │   ├── Editor.vue         # 富文本编辑器
│   │   │   ├── ExcelExport.vue    # Excel导出
│   │   │   ├── ExcelImport.vue    # Excel导入
│   │   │   ├── FormInput.vue      # 表单输入
│   │   │   └── FormSelect.vue     # 表单选择
│   │   ├── Icons/                  # 图标组件
│   │   │   └── IconSelector.vue   # 图标选择器
│   │   ├── Layout/                 # 布局组件
│   │   │   ├── Breadcrumb/         # 面包屑导航
│   │   │   │   ├── breadcrumb.scss
│   │   │   │   └── Breadcrumb.vue
│   │   │   ├── FastEnter/          # 快速入口
│   │   │   │   └── FastEnter.vue
│   │   │   ├── LockScreen/         # 锁屏
│   │   │   │   └── LockScreen.vue
│   │   │   ├── MenuLeft/           # 左侧菜单
│   │   │   │   ├── menu-left.scss
│   │   │   │   ├── menu-setting.scss
│   │   │   │   └── MenuLeft.vue
│   │   │   ├── MenuTop/            # 顶部菜单
│   │   │   │   ├── MenuTop.vue
│   │   │   │   └── Submenu.vue
│   │   │   ├── MixedMenu/          # 混合菜单
│   │   │   │   └── MixedMenu.vue
│   │   │   ├── Notice/             # 通知中心
│   │   │   │   ├── notice.scss
│   │   │   │   └── Notice.vue
│   │   │   ├── Search/             # 全局搜索
│   │   │   │   ├── search.scss
│   │   │   │   └── Search.vue
│   │   │   ├── Setting/            # 系统设置
│   │   │   │   ├── Setting.vue
│   │   │   │   └── setting.scss
│   │   │   ├── Submenu/            # 子菜单
│   │   │   │   └── Submenu.vue
│   │   │   ├── TopBar/             # 顶部栏
│   │   │   │   ├── search.scss
│   │   │   │   ├── TopBar.vue
│   │   │   │   └── topbar.scss
│   │   │   └── WorkTab/            # 工作标签
│   │   │       ├── WorkTab.vue
│   │   │       └── worktab.scss
│   │   ├── MoCountTo/              # 数字滚动组件
│   │   │   └── index.vue
│   │   ├── Pages/                  # 页面级组件
│   │   │   └── Login/              # 登录页组件
│   │   │       └── LeftView.vue   # 登录左侧视图
│   │   ├── Table/                  # 表格组件
│   │   │   ├── ArtTable.vue       # 高级表格
│   │   │   └── TableBar.vue       # 表格工具栏
│   │   ├── Tag/                    # 标签组件
│   │   │   └── Tag.vue
│   │   ├── Views/                  # 视图组件
│   │   │   └── Views.vue
│   │   ├── Widgets/                # 小部件组件
│   │   │   ├── Banners/            # 横幅组件
│   │   │   │   ├── BasicBanner.vue # 基础横幅
│   │   │   │   └── CardBanner.vue  # 卡片横幅
│   │   │   ├── Cards/              # 卡片组件
│   │   │   │   ├── BarChartCard.vue    # 柱状图卡片
│   │   │   │   ├── DataListCard.vue    # 数据列表卡片
│   │   │   │   ├── DonutChartCard.vue  # 环形图卡片
│   │   │   │   ├── ImageCard.vue       # 图片卡片
│   │   │   │   ├── LineChartCard.vue   # 折线图卡片
│   │   │   │   ├── ProgressCard.vue    # 进度卡片
│   │   │   │   └── StatsCard.vue       # 统计卡片
│   │   │   ├── Charts/             # 图表组件
│   │   │   │   ├── BarChart.vue    # 柱状图
│   │   │   │   ├── DualBarCompareChart.vue # 双柱对比图
│   │   │   │   ├── HBarChart.vue   # 横向柱状图
│   │   │   │   ├── KLineChart.vue  # K线图
│   │   │   │   ├── LineChart.vue   # 折线图
│   │   │   │   ├── MapChart.vue    # 地图
│   │   │   │   └── RadarChart.vue  # 雷达图
│   │   │   ├── BackToTop.vue       # 返回顶部
│   │   │   ├── CutterImg.vue       # 图片裁剪
│   │   │   ├── FestivalTextScroll.vue # 节日文字滚动
│   │   │   ├── MenuRight.vue       # 右键菜单
│   │   │   ├── Network.vue         # 网络状态
│   │   │   ├── TextScroll.vue      # 文字滚动
│   │   │   └── Watermark.vue       # 水印
│   │   └── index.ts                # 组件统一导出
│   ├── composables/                # 组合式函数
│   │   ├── useCeremony.ts         # 庆典动画hooks
│   │   ├── useChart.ts            # 图表hooks
│   │   ├── useCommon.ts           # 通用hooks
│   │   ├── useSystemInfo.ts       # 系统信息hooks
│   │   └── useTheme.ts            # 主题hooks
│   ├── config/                     # 配置文件
│   │   ├── assets/                 # 资源配置
│   │   │   └── images.ts          # 图片资源配置
│   │   ├── core/                   # 核心配置
│   │   │   ├── base-config.ts     # 基础配置
│   │   │   └── ceremony.ts        # 庆典配置
│   │   ├── env/                    # 环境配置
│   │   │   └── env-config.ts      # 环境变量配置
│   │   ├── types/                  # 类型定义
│   │   │   └── index.ts           # 配置类型
│   │   └── index.ts                # 配置统一导出
│   ├── directives/                 # 自定义指令
│   │   ├── copyText.ts            # 复制文本指令
│   │   ├── highlight.ts           # 代码高亮指令
│   │   ├── index.ts               # 指令统一导出
│   │   ├── permission.ts          # 权限指令
│   │   └── ripple.ts              # 波纹效果指令
│   ├── enums/                      # 枚举定义
│   │   ├── agricultureEnum.ts     # 农业相关枚举
│   │   ├── appEnum.ts             # 应用枚举
│   │   └── formEnum.ts            # 表单枚举
│   ├── language/                   # 国际化
│   │   ├── locales/                # 语言包
│   │   │   ├── en.json            # 英文
│   │   │   └── zh.json            # 中文
│   │   └── index.ts                # 国际化配置
│   ├── mock/                       # Mock数据
│   │   └── upgradeLog.ts          # 升级日志Mock
│   ├── plugins/                    # 插件
│   │   └── echarts/                # ECharts插件
│   │       └── index.ts           # ECharts配置
│   ├── router/                     # 路由配置
│   │   ├── modules/                # 路由模块
│   │   │   ├── asyncRoutes.ts     # 异步路由
│   │   │   ├── dynamicRoutes.ts   # 动态路由
│   │   │   └── routesAlias.ts     # 路由别名
│   │   └── index.ts                # 路由主文件
│   ├── store/                      # Pinia状态管理
│   │   ├── modules/                # 状态模块
│   │   │   ├── menu.ts            # 菜单状态
│   │   │   ├── mqttStore.ts       # MQTT状态
│   │   │   ├── setting.ts         # 设置状态
│   │   │   ├── user.ts            # 用户状态
│   │   │   ├── websocket.ts       # WebSocket状态
│   │   │   └── worktab.ts         # 工作标签状态
│   │   └── index.ts                # Store统一导出
│   ├── types/                      # TypeScript类型定义
│   │   ├── agriculture/            # 农业相关类型
│   │   │   ├── alertData.d.ts     # 告警数据类型
│   │   │   ├── batch.ts           # 批次类型
│   │   │   ├── batchAiSuggestion.d.ts # 批次AI建议类型
│   │   │   ├── batchTask.d.ts     # 批次任务类型
│   │   │   ├── class.ts           # 班次类型
│   │   │   ├── classReport.d.ts   # 班次报告类型
│   │   │   ├── console.d.ts       # 控制台类型
│   │   │   ├── costEmployee.ts    # 员工成本类型
│   │   │   ├── harvest.ts         # 收获类型
│   │   │   ├── job.d.ts           # 作业类型
│   │   │   ├── log.d.ts           # 日志类型
│   │   │   ├── partitionFood.ts   # 分区投料类型
│   │   │   ├── pasture.d.ts       # 牧场类型
│   │   │   ├── planDetail.ts      # 计划详情类型
│   │   │   ├── plantingPlan.ts    # 种植计划类型
│   │   │   ├── resource.d.ts      # 资源类型
│   │   │   ├── resourceAiSuggestion.d.ts # 资源AI建议类型
│   │   │   ├── resourceInventory.d.ts # 资源库存类型
│   │   │   ├── resourceUsage.d.ts # 资源使用类型
│   │   │   ├── robot.ts           # 机器人类型
│   │   │   ├── schedule.ts        # 排班类型
│   │   │   └── taskEmployee.ts    # 任务员工类型
│   │   ├── device/                 # 设备相关类型
│   │   │   ├── device.ts          # 设备类型
│   │   │   ├── deviceConfig.ts    # 设备配置类型
│   │   │   ├── deviceheartbeat.ts # 设备心跳类型
│   │   │   ├── devicetype.ts      # 设备类型定义
│   │   │   ├── thresholdConfig.ts # 阈值配置类型
│   │   │   └── typedict.ts        # 类型字典
│   │   ├── monitor/                # 监控相关类型
│   │   │   ├── cache.d.ts         # 缓存类型
│   │   │   ├── job.d.ts           # 任务类型
│   │   │   ├── jobLog.d.ts        # 任务日志类型
│   │   │   ├── logininfor.d.ts    # 登录信息类型
│   │   │   ├── online.d.ts        # 在线用户类型
│   │   │   ├── operlog.d.ts       # 操作日志类型
│   │   │   └── server.d.ts        # 服务器类型
│   │   ├── sensor/                 # 传感器相关类型
│   │   │   ├── airdata.d.ts       # 空气数据类型
│   │   │   ├── alert.ts           # 告警类型
│   │   │   └── soildata.ts        # 土壤数据类型
│   │   ├── system/                 # 系统管理类型
│   │   │   ├── config.d.ts        # 配置类型
│   │   │   ├── dept.d.ts          # 部门类型
│   │   │   ├── dict.d.ts          # 字典类型
│   │   │   ├── menu.d.ts          # 菜单类型
│   │   │   ├── notice.d.ts        # 通知类型
│   │   │   ├── post.d.ts          # 岗位类型
│   │   │   ├── role.d.ts          # 角色类型
│   │   │   └── user.d.ts          # 用户类型
│   │   ├── tool/                   # 工具类型
│   │   │   └── generator.d.ts     # 代码生成类型
│   │   ├── auto-imports.d.ts       # 自动导入类型
│   │   ├── axios.d.ts              # Axios类型
│   │   ├── components.d.ts         # 组件类型
│   │   ├── login.d.ts              # 登录类型
│   │   ├── menu.d.ts               # 菜单类型
│   │   └── store.d.ts              # Store类型
│   ├── utils/                      # 工具函数
│   │   ├── aurora-dia/             # Aurora对话框工具
│   │   │   ├── messages/           # 对话框消息
│   │   │   │   ├── cn.json        # 中文消息
│   │   │   │   └── en.json        # 英文消息
│   │   │   └── index.ts           # 对话框主文件
│   │   ├── echarts/                # ECharts工具
│   │   │   ├── defaultOpstions.ts # 默认配置
│   │   │   ├── README.md          # 使用说明
│   │   │   └── useECharts.ts      # ECharts hooks
│   │   ├── http/                   # HTTP工具
│   │   │   ├── index.ts           # HTTP请求封装
│   │   │   └── status.ts          # HTTP状态码
│   │   ├── theme/                  # 主题工具
│   │   │   └── animation.ts       # 主题动画
│   │   ├── color.ts                # 颜色工具
│   │   ├── colors.ts               # 颜色常量
│   │   ├── console.ts              # 控制台工具
│   │   ├── dict.ts                 # 字典工具
│   │   ├── emojo.ts                # Emoji工具
│   │   ├── errorCode.ts            # 错误码定义
│   │   ├── event.ts                # 事件工具
│   │   ├── iconfont.ts             # 图标字体工具
│   │   ├── jump.ts                 # 跳转工具
│   │   ├── links.ts                # 链接工具
│   │   ├── menu.ts                 # 菜单工具
│   │   ├── mittBus.ts              # 事件总线
│   │   ├── permission.ts           # 权限工具
│   │   ├── storage.ts              # 本地存储工具
│   │   ├── tabs.ts                 # 标签页工具
│   │   ├── utils.ts                # 通用工具函数
│   │   ├── webSocket.ts            # WebSocket工具
│   │   └── worktab.ts              # 工作标签工具
│   ├── views/                      # 页面视图
│   │   ├── agriculture/            # 农业管理模块
│   │   │   ├── class/              # 班次管理
│   │   │   │   ├── card.vue       # 班次卡片
│   │   │   │   ├── index.vue      # 班次列表
│   │   │   │   ├── job.vue        # 班次作业
│   │   │   │   └── report.vue     # 班次报告
│   │   │   ├── harvest/            # 收获管理
│   │   │   │   └── index.vue      # 收获记录
│   │   │   ├── harvestRecord/      # 收获记录
│   │   │   │   └── index.vue
│   │   │   ├── material/           # 物料管理
│   │   │   │   ├── materialinfo/   # 物料信息
│   │   │   │   │   └── index.vue
│   │   │   │   ├── materialInventory/ # 物料库存
│   │   │   │   │   └── index.vue
│   │   │   │   └── materialUse/    # 物料使用
│   │   │   │       └── index.vue
│   │   │   ├── pasture/            # 牧场管理
│   │   │   │   └── index.vue
│   │   │   ├── plan/               # 种植计划
│   │   │   │   ├── batch/          # 批次管理
│   │   │   │   │   └── index.vue
│   │   │   │   ├── batchTask/      # 批次任务
│   │   │   │   │   ├── index.vue  # 任务列表
│   │   │   │   │   └── TaskList.vue # 任务清单
│   │   │   │   ├── rotationDetail/ # 轮作详情
│   │   │   │   │   └── index.vue
│   │   │   │   └── rotationPlan/   # 轮作计划
│   │   │   │       ├── components/
│   │   │   │       │   └── RotationDetailList.vue # 轮作详情列表
│   │   │   │       ├── detail.vue  # 计划详情
│   │   │   │       └── index.vue   # 计划列表
│   │   │   ├── SearchMenu/         # 搜索菜单
│   │   │   │   └── index.vue
│   │   │   ├── TaskDetail/         # 任务详情组件
│   │   │   │   ├── CalendarSelect.vue  # 日历选择
│   │   │   │   ├── CostEmployee.vue    # 员工成本
│   │   │   │   ├── CostMaterial.vue    # 物料成本
│   │   │   │   ├── MultipleSelect.vue  # 多选
│   │   │   │   ├── RadioSelect.vue     # 单选
│   │   │   │   └── StatusSelect.vue    # 状态选择
│   │   │   └── TaskDetailCalendar/     # 任务日历详情
│   │   │       ├── components/
│   │   │       │   ├── CalendarNav.vue      # 日历导航
│   │   │       │   ├── DailyAttachment.vue  # 每日附件
│   │   │       │   ├── DailyMaterial.vue    # 每日物料
│   │   │       │   ├── DailyWorkHours.vue   # 每日工时
│   │   │       │   ├── DateDetail.vue       # 日期详情
│   │   │       │   ├── TaskFooter.vue       # 任务底部
│   │   │       │   └── TaskHeader.vue       # 任务头部
│   │   │       └── index.vue
│   │   ├── console/                # 控制台
│   │   │   ├── widget/             # 控制台小部件
│   │   │   │   ├── BatchTrendChart.vue    # 批次趋势图
│   │   │   │   ├── CardList.vue           # 卡片列表
│   │   │   │   ├── QuickActions.vue       # 快捷操作
│   │   │   │   ├── RecentActivities.vue   # 最近活动
│   │   │   │   ├── TaskProgressCard.vue   # 任务进度卡片
│   │   │   │   ├── TodaySales.vue         # 今日销售
│   │   │   │   └── TodaySchedule.vue      # 今日排班
│   │   │   └── index.vue           # 控制台首页
│   │   ├── device/                 # 设备管理
│   │   │   ├── history/            # 历史数据
│   │   │   │   └── index.vue
│   │   │   ├── info/               # 设备信息
│   │   │   │   ├── index.vue
│   │   │   │   ├── ThresholdConfig.vue    # 阈值配置
│   │   │   │   └── WeatherStationStatus.vue # 气象站状态
│   │   │   ├── sensondata/         # 传感器数据
│   │   │   │   └── index.vue
│   │   │   ├── soil/               # 土壤监测
│   │   │   │   └── index.vue
│   │   │   └── weather/            # 天气数据
│   │   │       └── index.vue
│   │   ├── exception/              # 异常页面
│   │   │   ├── 403.vue            # 无权限页面
│   │   │   ├── 404.vue            # 页面未找到
│   │   │   └── 500.vue            # 服务器错误页面
│   │   ├── forget-password/        # 忘记密码
│   │   │   └── index.vue
│   │   ├── index/                  # 首页
│   │   │   └── index.vue
│   │   ├── log/                    # 更新日志
│   │   │   └── ChangeLog.vue
│   │   ├── login/                  # 登录页
│   │   │   ├── index.scss         # 登录页样式
│   │   │   └── index.vue          # 登录页面
│   │   ├── monitor/                # 系统监控
│   │   │   ├── cache/              # 缓存监控
│   │   │   │   ├── index.vue      # 缓存列表
│   │   │   │   └── list.vue       # 缓存详情
│   │   │   ├── job/                # 定时任务
│   │   │   │   ├── index.vue      # 任务列表
│   │   │   │   └── log.vue        # 任务日志
│   │   │   ├── logininfor/         # 登录日志
│   │   │   │   └── index.vue
│   │   │   ├── online/             # 在线用户
│   │   │   │   └── index.vue
│   │   │   ├── operlog/            # 操作日志
│   │   │   │   └── index.vue
│   │   │   └── server/             # 服务器监控
│   │   │       └── index.vue
│   │   ├── outside/                # 外部页面
│   │   │   └── Iframe.vue         # Iframe嵌入页
│   │   ├── personnel/              # 人员管理
│   │   │   ├── schedule/           # 排班管理
│   │   │   │   └── index.vue
│   │   │   └── scheduleRule/       # 排班规则
│   │   │       └── index.vue
│   │   ├── register/               # 注册页
│   │   │   ├── index.scss         # 注册页样式
│   │   │   └── index.vue          # 注册页面
│   │   ├── system/                 # 系统管理
│   │   │   ├── config/             # 参数配置
│   │   │   │   └── index.vue
│   │   │   ├── dept/               # 部门管理
│   │   │   │   └── index.vue
│   │   │   ├── dict/               # 字典管理
│   │   │   │   ├── data.vue       # 字典数据
│   │   │   │   └── index.vue      # 字典类型
│   │   │   ├── menu/               # 菜单管理
│   │   │   │   └── index.vue
│   │   │   ├── notice/             # 通知公告
│   │   │   │   └── index.vue
│   │   │   ├── post/               # 岗位管理
│   │   │   │   └── index.vue
│   │   │   ├── role/               # 角色管理
│   │   │   │   ├── components/
│   │   │   │   │   └── AllocationUser.vue # 分配用户
│   │   │   │   └── index.vue
│   │   │   └── user/               # 用户管理
│   │   │       ├── authRole.vue   # 分配角色
│   │   │       └── index.vue      # 用户列表
│   │   ├── tool/                   # 系统工具
│   │   │   └── gen/                # 代码生成
│   │   │       ├── components/
│   │   │       │   ├── basicInfoForm.vue  # 基本信息表单
│   │   │       │   ├── createTable.vue    # 创建表
│   │   │       │   ├── genInfoForm.vue    # 生成信息表单
│   │   │       │   └── importTable.vue    # 导入表
│   │   │       ├── gen/            # 代码生成子模块
│   │   │       │   ├── components/
│   │   │       │   │   ├── basicInfoForm.vue
│   │   │       │   │   ├── createTable.vue
│   │   │       │   │   ├── genInfoForm.vue
│   │   │       │   │   └── importTable.vue
│   │   │       │   ├── edit-table.vue
│   │   │       │   └── index.vue
│   │   │       ├── edit-table.vue  # 编辑表
│   │   │       └── index.vue       # 代码生成主页
│   │   └── user/                   # 个人中心
│   │       └── user.vue           # 个人信息
│   ├── App.vue                     # 根组件
│   ├── env.d.ts                    # 环境变量类型声明
│   └── main.ts                     # 应用入口
├── index.html                       # HTML模板
├── package.json                     # 项目配置文件
├── package-lock.json                # 依赖锁定文件
├── tsconfig.app.json                # TypeScript应用配置
├── tsconfig.json                    # TypeScript配置
├── tsconfig.node.json               # TypeScript Node配置
├── vite.config.ts                   # Vite配置文件
├── yarn.lock                        # Yarn锁定文件
├── README.md                        # 项目说明文档
└── 搜索重置按钮布局修复指南.md       # 布局修复文档
```

## 核心功能模块

### 1. 农业管理 (agriculture)
- **种植计划管理**: 作物批次管理、轮作计划、种植计划详情
- **任务管理**: 批次任务分配、任务进度跟踪、任务日历视图
- **班次管理**: 班次安排、班次报告、作业管理
- **物料管理**: 物料信息维护、库存管理、使用记录
- **收获管理**: 收获记录、产量统计、质量评估
- **告警管理**: 阈值配置、告警规则、实时预警
- **质量管理**: 质量检验、溯源追踪、质量控制

### 2. 设备监控 (device)
- **设备管理**: 设备信息、设备配置、设备类型管理
- **数据监测**: 空气数据、土壤数据、气象数据实时监控
- **历史数据**: 历史数据查询、数据分析、趋势展示
- **阈值配置**: 监测阈值设置、告警触发规则
- **设备状态**: 设备心跳检测、在线状态、故障预警

### 3. AI 智能决策 (ai)
- **批次建议**: AI 分析作物生长情况，提供批次管理建议
- **资源建议**: 智能优化资源分配，降低成本
- **环境建议**: 根据环境数据提供优化建议
- **告警建议**: 智能告警分析与处理建议
- **决策支持**: 综合数据分析，辅助决策制定

### 4. 控制台 (console)
- **数据概览**: 关键指标展示、数据统计
- **趋势分析**: 批次趋势、销售趋势图表
- **快捷操作**: 常用功能快速入口
- **今日排班**: 当日人员排班情况
- **最近活动**: 系统操作记录、重要事件提醒

### 5. 人员管理 (personnel)
- **排班管理**: 员工排班、班次安排、调班处理
- **排班规则**: 排班规则配置、自动排班
- **技能管理**: 员工技能登记、技能匹配
- **工时统计**: 工时记录、工资核算、成本分析

### 6. 系统管理 (system)
- **用户管理**: 用户增删改查、角色分配、权限管理
- **角色管理**: 角色定义、权限配置、用户分配
- **菜单管理**: 菜单配置、权限绑定、动态路由
- **部门管理**: 组织架构、部门层级、人员归属
- **岗位管理**: 岗位设置、职责定义
- **字典管理**: 数据字典维护、系统参数配置
- **通知公告**: 系统通知、公告发布

### 7. 系统监控 (monitor)
- **在线用户**: 当前在线用户、会话管理
- **定时任务**: 任务调度、执行日志、Cron表达式配置
- **操作日志**: 用户操作记录、操作审计
- **登录日志**: 登录记录、登录统计、异常登录监测
- **服务器监控**: CPU、内存、磁盘使用情况
- **缓存监控**: Redis 缓存监控、缓存清理

### 8. 开发工具 (tool)
- **代码生成**: 根据数据库表自动生成前后端代码
- **表单构建**: 可视化表单设计器
- **接口文档**: API 接口文档自动生成

## 开发规范

### 目录命名规范
- 组件目录使用大驼峰命名 (PascalCase): `MyComponent/`
- 工具类目录使用小驼峰命名 (camelCase): `utils/`, `config/`
- 页面视图目录使用小写短横线命名 (kebab-case): `user-management/`

### 文件命名规范
- Vue 组件文件使用大驼峰命名: `UserList.vue`
- TypeScript 文件使用小驼峰命名: `userApi.ts`
- 样式文件使用小写短横线命名: `user-list.scss`
- 类型定义文件使用 `.d.ts` 后缀: `user.d.ts`

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 使用 Stylelint 进行样式代码检查
- 提交代码前使用 Husky + Lint-staged 进行代码检查
- 提交信息遵循 Conventional Commits 规范

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发运行

```bash
# 启动开发服务器
npm run dev

# 或
yarn dev
```

访问 http://localhost:5173 (默认端口)

### 构建打包

```bash
# 生产环境构建
npm run build

# 或
yarn build
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run fix

# Prettier 格式化
npm run lint:prettier

# Stylelint 检查并修复
npm run lint:stylelint
```

### 提交代码

```bash
# 使用 commitizen 提交代码（推荐）
npm run commit

# 或使用 git commit
git commit -m "feat: 添加新功能"
```

## 环境配置

### 开发环境变量

在项目根目录创建 `.env.development` 文件：

```env
# 应用标题
VITE_APP_TITLE=温室管理系统

# API 基础路径
VITE_API_BASE_URL=http://localhost:8080

# WebSocket 地址
VITE_WS_URL=ws://localhost:8080/ws

# MQTT 配置
VITE_MQTT_URL=ws://localhost:8083/mqtt
VITE_MQTT_USERNAME=admin
VITE_MQTT_PASSWORD=admin123

# 上传文件大小限制 (MB)
VITE_UPLOAD_SIZE=10
```

### 生产环境变量

在项目根目录创建 `.env.production` 文件：

```env
# 应用标题
VITE_APP_TITLE=温室管理系统

# API 基础路径
VITE_API_BASE_URL=https://api.yourdomain.com

# WebSocket 地址
VITE_WS_URL=wss://api.yourdomain.com/ws

# MQTT 配置
VITE_MQTT_URL=wss://mqtt.yourdomain.com/mqtt
VITE_MQTT_USERNAME=admin
VITE_MQTT_PASSWORD=yourpassword

# 上传文件大小限制 (MB)
VITE_UPLOAD_SIZE=10
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 依赖说明

### 核心依赖
- `vue`: Vue 3 框架核心
- `vue-router`: Vue 官方路由管理器
- `pinia`: Vue 官方状态管理库
- `element-plus`: Element Plus UI 组件库
- `typescript`: TypeScript 类型支持
- `vite`: 下一代前端构建工具

### UI 相关
- `@element-plus/icons-vue`: Element Plus 图标库
- `echarts`: 数据可视化图表库
- `md-editor-v3`: Markdown 编辑器
- `@wangeditor/editor`: 富文本编辑器
- `qrcode.vue`: 二维码生成组件
- `xgplayer`: 西瓜视频播放器

### 工具库
- `axios`: HTTP 客户端
- `mqtt`: MQTT 客户端
- `mitt`: 事件总线
- `crypto-js`: 加密工具
- `file-saver`: 文件保存
- `uuid`: UUID 生成
- `js-cookie`: Cookie 管理
- `nprogress`: 页面加载进度条
- `xlsx`: Excel 文件处理
- `highlight.js`: 代码高亮

### 开发工具
- `eslint`: JavaScript 代码检查工具
- `prettier`: 代码格式化工具
- `stylelint`: 样式代码检查工具
- `husky`: Git hooks 工具
- `lint-staged`: Git 暂存文件检查
- `commitizen`: 规范化提交工具
- `cz-git`: Commitizen 适配器

## 项目亮点

1. **完整的 TypeScript 支持**: 全项目使用 TypeScript 开发，提供完善的类型定义
2. **模块化架构**: 清晰的目录结构，模块职责明确，易于维护和扩展
3. **组件化开发**: 高度组件化，组件可复用性强
4. **实时通信**: 集成 MQTT、WebSocket、SSE 多种实时通信方式
5. **智能化决策**: 集成 AI 辅助决策功能，提升管理效率
6. **数据可视化**: 丰富的图表展示，直观展现数据趋势
7. **权限管理**: 完善的 RBAC 权限控制系统
8. **响应式布局**: 适配多种屏幕尺寸，支持移动端访问
9. **主题定制**: 支持亮色/暗色主题切换，多种布局模式
10. **代码规范**: 完善的代码规范和提交规范，保证代码质量
11. **国际化支持**: 内置中英文双语支持，易于扩展其他语言

## 注意事项

1. 项目使用了大量现代化技术栈，建议使用最新版本的浏览器访问
3. 开发时请遵循项目的代码规范和提交规范
4. 部分功能需要后端 API 支持，请确保后端服务正常运行
5. MQTT 和 WebSocket 功能需要配置相应的服务器地址

## 技术支持

如有问题，请提交 Issue 或联系开发团队。

## 许可证

本项目采用 MIT 许可证。

---

**温室作物种植计划与人员分工管理系统** - 让农业管理更智能、更高效

