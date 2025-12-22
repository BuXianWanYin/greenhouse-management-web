// requireReLogin: true // 需要重新登录

export const upgradeLogList = ref([
  {
    version: 'v1.0.0',
    title: '温室管理系统正式版发布',
    date: '2025-12-22',
    status: 'complete',
    statusText: '完成',
    detail: [
      '完成人员排班管理功能优化',
      '实现基于角色的用户过滤',
      '优化批量排班对话框交互',
      '完善温室管理业务逻辑',
      '系统整体测试通过'
    ]
  },
  {
    version: 'v0.9.0',
    title: '人员排班模块优化',
    date: '2025-12-20',
    status: 'complete',
    statusText: '完成',
    detail: [
      '优化排班网格视图UI',
      '减小单元格高度提升显示效率',
      '员工列居中显示优化',
      '批量排班对话框交互优化',
      '根据工作类型动态显示温室选择'
    ]
  },
  {
    version: 'v0.8.0',
    title: '角色权限管理完善',
    date: '2025-12-15',
    status: 'complete',
    statusText: '完成',
    detail: [
      '实现基于角色的用户列表过滤',
      '完善超级管理员、CEO、主管权限',
      '优化部门级别的数据权限',
      '修复角色数据加载问题'
    ]
  },
  {
    version: 'v0.7.0',
    title: '人员排班功能上线',
    date: '2025-12-10',
    status: 'complete',
    statusText: '完成',
    detail: [
      '新增人员排班网格视图',
      '支持批量排班操作',
      '实现排班规则管理',
      '支持多种工作类型（正常班、请假、休息）',
      '温室关联排班功能'
    ]
  },
  {
    version: 'v0.6.0',
    title: '温室管理功能完善',
    date: '2025-11-25',
    status: 'complete',
    statusText: '完成',
    detail: [
      '完善温室基础信息管理',
      '新增温室环境监控',
      '实现温室设备管理',
      '优化温室数据统计'
    ]
  },
  {
    version: 'v0.5.0',
    title: '部门组织架构管理',
    date: '2025-11-15',
    status: 'complete',
    statusText: '完成',
    detail: [
      '实现部门树形结构管理',
      '支持部门层级关系',
      '完善部门人员管理',
      '实现部门权限控制'
    ]
  },
  {
    version: 'v0.4.0',
    title: '用户权限系统',
    date: '2025-11-08',
    status: 'complete',
    statusText: '完成',
    detail: [
      '实现RBAC权限模型',
      '支持角色管理和分配',
      '实现菜单权限控制',
      '完善数据权限过滤'
    ]
  },
  {
    version: 'v0.3.0',
    title: '系统基础功能',
    date: '2025-10-20',
    status: 'complete',
    statusText: '完成',
    detail: [
      '实现用户登录认证',
      '完成系统菜单管理',
      '实现字典数据管理',
      '完善系统日志记录'
    ]
  },
  {
    version: 'v0.2.0',
    title: '前后端框架搭建',
    date: '2025-10-01',
    status: 'complete',
    statusText: '完成',
    detail: [
      '搭建Vue3 + TypeScript前端框架',
      '集成Element Plus UI组件库',
      '搭建Spring Boot后端框架',
      '集成MyBatis Plus数据层',
      '完成前后端接口联调'
    ]
  },
  {
    version: 'v0.1.0',
    title: '温室管理系统首次发行版',
    date: '2025-09-15',
    status: 'complete',
    statusText: '完成',
    detail: [
      '项目立项和需求分析',
      '系统架构设计',
      '数据库设计完成',
      '技术选型确定',
      '开发环境搭建'
    ]
  }
])
