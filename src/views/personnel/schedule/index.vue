<template>
  <div class="page-content">
    <!-- 工具栏 -->
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="resetForm(queryFormRef)"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryFormRef" label-width="82px">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="8">
              <el-form-item 
                label="用户筛选" 
                prop="userIds"
              >
              <el-select
                v-model="queryParams.userIds"
                placeholder="请选择用户（可多选）"
                clearable
                filterable
                multiple
                collapse-tags
                collapse-tags-tooltip
                style="width: 100%"
                @change="handleQuery"
              >
                <el-option
                  v-for="user in filterUserList"
                  :key="user.userId"
                  :label="user.nickName || user.userName"
                  :value="user.userId"
                />
              </el-select>
            </el-form-item>
            </el-col>
          </el-row>
          </el-form>
      </template>
      <template #bottom>
        <el-button
            @click="handleAdd"
            v-hasPermi="['agriculture:schedule:add']"
          v-ripple
          >新增</el-button>
        <el-button
            @click="handleExport"
            v-hasPermi="['agriculture:schedule:export']"
          v-ripple
          >导出</el-button>
      </template>
    </table-bar>

    <!-- 网格排班视图 -->
    <el-card v-loading="loading" class="grid-schedule-card">
      <div class="grid-header">
        <div class="grid-controls">
          <el-date-picker
            v-model="gridMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            @change="handleMonthChange"
            style="width: 150px; margin-right: 20px"
          />
          <el-button @click="loadGridData" :icon="Refresh">刷新</el-button>
          <el-button @click="clearSelection">清除选择</el-button>
        </div>
        <div class="grid-legend">
          <div class="legend-item">
            <span class="legend-cell normal"></span>
            <span>正常班</span>
          </div>
          <div class="legend-item">
            <span class="legend-cell leave"></span>
            <span>请假</span>
          </div>
          <div class="legend-item">
            <span class="legend-cell rest"></span>
            <span>休息</span>
          </div>
          <div class="legend-item">
            <span class="legend-cell selected"></span>
            <span>已选择</span>
          </div>
        </div>
      </div>
      <div class="grid-container" @mouseleave="handleGridMouseLeave" @click.self="clearSelection">
        <div class="grid-table" :style="{ '--date-column-count': gridDateList.length }">
          <!-- 表头：日期行 -->
          <div class="grid-row grid-header-row">
            <div class="grid-cell grid-user-header">员工</div>
            <div 
              v-for="date in gridDateList" 
              :key="date"
              class="grid-cell grid-date-header"
              :class="{ 'today': isToday(date), 'weekend': isWeekend(date) }"
            >
              <div class="date-number">{{ dayjs(date).format('DD') }}</div>
              <div class="date-weekday">{{ getWeekday(date) }}</div>
            </div>
            <!-- 统计列 -->
            <div class="grid-cell grid-stat-header">
              <div class="stat-header-line">请假</div>
              <div class="stat-header-line">天数</div>
            </div>
            <div class="grid-cell grid-stat-header">
              <div class="stat-header-line">休息</div>
              <div class="stat-header-line">天数</div>
            </div>
            <div class="grid-cell grid-stat-header">
              <div class="stat-header-line">上班</div>
              <div class="stat-header-line">天数</div>
            </div>
          </div>
          <!-- 数据行：每个员工一行 -->
          <div 
            v-for="user in gridUserList" 
            :key="user.userId"
            class="grid-row grid-data-row"
          >
            <div class="grid-cell grid-user-cell">
              <div class="user-name">{{ user.nickName || user.userName }}</div>
            </div>
            <div
              v-for="date in gridDateList"
              :key="`${user.userId}-${date}`"
              class="grid-cell grid-data-cell"
              :class="{
                'today': isToday(date),
                'weekend': isWeekend(date),
                'selected': isDateSelected(date) && selectedUserId === user.userId,
                'selecting': isDateInSelectingRange(date, user.userId)
              }"
              @mousedown.stop="handleCellMouseDown(user.userId, date, $event)"
              @mouseenter="handleCellMouseEnter(user.userId, date)"
              @mouseup.stop="handleCellMouseUp($event)"
              @click.stop="handleCellClick(user.userId, date, $event)"
            >
              <div class="cell-content">
                <el-tooltip
                  v-for="schedule in getSchedulesForUserAndDate(user.userId, date)"
                  :key="schedule.scheduleId"
                  placement="top"
                  effect="light"
                  popper-class="schedule-tooltip"
                >
                  <template #content>
                    <div class="tooltip-content">
                      <div v-if="schedule.ruleName" class="tooltip-line">
                        <span class="tooltip-label">班次：</span>
                        <span class="tooltip-value">{{ schedule.ruleName }}</span>
                      </div>
                      <div v-if="schedule.pastureName" class="tooltip-line">
                        <span class="tooltip-label">温室：</span>
                        <span class="tooltip-value">{{ schedule.pastureName }}</span>
                      </div>
                      <div v-if="schedule.batchName" class="tooltip-line">
                        <span class="tooltip-label">批次：</span>
                        <span class="tooltip-value">{{ schedule.batchName }}</span>
                      </div>
                      <div v-if="schedule.workStartTime && schedule.workEndTime" class="tooltip-line">
                        <span class="tooltip-label">时间：</span>
                        <span class="tooltip-value">{{ schedule.workStartTime?.substring(11, 16) }}-{{ schedule.workEndTime?.substring(11, 16) }}</span>
                      </div>
                      <div v-if="schedule.workType" class="tooltip-line">
                        <span class="tooltip-label">类型：</span>
                        <span class="tooltip-value">{{ {'normal': '正常班', 'leave': '请假', 'rest': '休息'}[schedule.workType] }}</span>
                      </div>
                    </div>
                  </template>
                  <div
                    class="schedule-badge"
                    :class="schedule.workType || 'normal'"
                    @click.stop="handleDelete(schedule)"
                  >
                    {{ getScheduleDisplayText(schedule) }}
                  </div>
                </el-tooltip>
                <div v-if="getSchedulesForUserAndDate(user.userId, date).length === 0" class="cell-empty">
                  <span class="empty-hint">点击排班</span>
                </div>
              </div>
            </div>
            <!-- 统计列 -->
            <div class="grid-cell grid-stat-cell">
              <div class="stat-value">{{ getUserStatistic(user.userId, 'leave') }}</div>
            </div>
            <div class="grid-cell grid-stat-cell">
              <div class="stat-value">{{ getUserStatistic(user.userId, 'rest') }}</div>
            </div>
            <div class="grid-cell grid-stat-cell">
              <div class="stat-value">{{ getUserStatistic(user.userId, 'normal') }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 选择提示 -->
      <div v-if="selectedDateRange" class="selection-info">
        <span>已选择日期范围：{{ selectedDateRange.start }} 至 {{ selectedDateRange.end }}</span>
        <div class="selection-actions">
          <el-button type="primary" size="small" @click="openGridBatchDialog">
            批量排班
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete" v-hasPermi="['agriculture:schedule:remove']">
            批量删除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 添加或修改对话框（简化版，参考批量排班） -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="scheduleRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="用户" prop="userId">
          <el-select
            v-model="form.userId"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
            @change="handleUserChange"
          >
            <el-option
              v-for="user in filterUserList"
              :key="user.userId"
              :label="user.nickName || user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作类型" prop="workType">
          <el-select v-model="form.workType" placeholder="请选择工作类型" style="width: 100%">
            <el-option label="正常班" value="normal" />
            <el-option label="请假" value="leave" />
            <el-option label="休息" value="rest" />
          </el-select>
        </el-form-item>
        <el-form-item label="温室/批次" prop="pastureBatchCascaderValue" v-if="form.workType === 'normal'">
          <el-cascader
            v-model="pastureBatchCascaderValue"
            :options="pastureBatchCascaderOptions"
            :props="{ ...pastureBatchCascaderProps, multiple: true }"
            placeholder="请选择温室和批次（可多选）"
            clearable
            filterable
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
            @change="handlePastureBatchCascaderChange"
          />
        </el-form-item>
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker
            v-model="form.scheduleDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="排班规则" prop="ruleId" v-if="form.workType === 'normal'">
          <el-select
            v-model="form.ruleId"
            placeholder="请选择排班规则"
            filterable
            style="width: 100%"
            @change="handleRuleChange"
          >
            <el-option
              v-for="rule in ruleList"
              :key="rule.ruleId"
              :label="rule.ruleName"
              :value="rule.ruleId || 0"
            >
              <span>{{ rule.ruleName }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 10px">
                {{ rule.workStartTime }}-{{ rule.workEndTime }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量排班对话框 -->
    <el-dialog :title="batchDialogTitle" v-model="batchOpen" width="700px" append-to-body>
      <el-form :model="batchForm" :rules="batchRules as any" ref="batchFormRef" label-width="120px">
        <el-form-item label="工作类型" prop="workType">
          <el-select v-model="batchForm.workType" placeholder="请选择工作类型" style="width: 100%">
            <el-option label="正常班" value="normal" />
            <el-option label="请假" value="leave" />
            <el-option label="休息" value="rest" />
          </el-select>
        </el-form-item>
        <el-form-item label="温室/批次" prop="pastureBatch" v-if="batchForm.workType === 'normal'">
          <el-cascader
            v-model="batchPastureBatchCascaderValue"
            :options="pastureBatchCascaderOptions"
            :props="{ ...pastureBatchCascaderProps, multiple: true }"
            placeholder="请选择温室和批次（可多选）"
            clearable
            filterable
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
            @change="handleBatchPastureBatchCascaderChange"
          />
        </el-form-item>
        <el-form-item label="日期范围" prop="dateRange">
          <el-date-picker
            v-model="batchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排班规则" prop="ruleId" v-if="batchForm.workType === 'normal'">
          <el-select v-model="batchForm.ruleId" placeholder="请选择排班规则" filterable style="width: 100%">
            <el-option
              v-for="rule in ruleList"
              :key="rule.ruleId"
              :label="rule.ruleName"
              :value="rule.ruleId || 0"
            >
              <span>{{ rule.ruleName }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 10px">
                {{ rule.workStartTime }}-{{ rule.workEndTime }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchOpen = false">取消</el-button>
        <el-button type="primary" @click="submitBatchForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Search, Refresh, Plus, Download, Edit, Delete, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { Refresh as RefreshIcon } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureScheduleService } from '@/api/agriculture/scheduleApi'
import { AgricultureEmployeeScheduleResult } from '@/types/agriculture/schedule'
import { UserService } from '@/api/system/userApi'
import { AgricultureScheduleRuleService, AgricultureScheduleRuleResult } from '@/api/agriculture/scheduleRuleApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { downloadExcel, resetForm } from '@/utils/utils'
import { useUserStore } from '@/store/modules/user'
import dayjs from 'dayjs'

const loading = ref(false)
const scheduleList = ref<AgricultureEmployeeScheduleResult[]>([])
const open = ref(false)
const batchOpen = ref(false)
const showSearch = ref(true)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const scheduleRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()
const userList = ref<any[]>([])
const ruleList = ref<AgricultureScheduleRuleResult[]>([])
const pastureList = ref<any[]>([])
const gridMonth = ref(dayjs().format('YYYY-MM'))
const gridStartDate = ref(dayjs().startOf('month').format('YYYY-MM-DD'))
const gridEndDate = ref(dayjs().endOf('month').format('YYYY-MM-DD'))

// 级联选择器相关数据
const pastureBatchCascaderValue = ref<(string | number)[]>([])
const pastureBatchCascaderOptions = ref<any[]>([])
const pastureBatchCascaderProps = {
  expandTrigger: 'hover' as const,
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: true
}

const batchPastureBatchCascaderValue = ref<(string | number)[]>([])

// 月份变化处理
const handleMonthChange = (month: string) => {
  if (month) {
    gridStartDate.value = dayjs(month).startOf('month').format('YYYY-MM-DD')
    gridEndDate.value = dayjs(month).endOf('month').format('YYYY-MM-DD')
    loadGridData()
  }
}

// 单个排班表单
const form = reactive({
  scheduleId: undefined as number | undefined,
  userId: undefined as number | undefined,
  pastureId: undefined as number | undefined,
  batchId: undefined as number | undefined,
  scheduleDate: '',
  workStartTime: '',
  workEndTime: '',
  workType: 'normal',
  ruleId: undefined as number | undefined,
  taskId: undefined as number | undefined,
  status: '0',
  remark: ''
})

// 网格视图相关
const selectedDateRange = ref<{ start: string; end: string } | null>(null)
const selectedUserId = ref<number | null>(null) // 当前选择的用户ID，确保只选择同一行的日期
const isSelecting = ref(false)
const selectStartDate = ref<string | null>(null)
const gridUserList = ref<any[]>([]) // 网格视图显示的用户列表
const gridScheduleMap = ref<Map<string, AgricultureEmployeeScheduleResult[]>>(new Map()) // 日期 -> 排班列表
const userStore = useUserStore()

// 批量排班表单
const batchForm = reactive({
  userId: undefined as number | undefined,
  pastureId: undefined as number | undefined,
  batchId: undefined as number | undefined,
  dateRange: [] as string[],
  ruleId: undefined as number | undefined,
  workStartTime: '08:00',
  workEndTime: '18:00',
  workType: 'normal' as string
})

// 批量排班对话框标题
const batchDialogTitle = computed(() => {
  if (batchForm.userId) {
    const user = userList.value.find(u => u.userId === batchForm.userId)
    if (user) {
      return `为${user.nickName || user.userName}批量排班`
    }
  }
  return '批量排班'
})

// 单个排班验证规则（简化版，参考批量排班）
const rules = computed(() => {
  const baseRules: any = {
    userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
    scheduleDate: [{ required: true, message: '请选择排班日期', trigger: 'change' }],
    workType: [{ required: true, message: '请选择工作类型', trigger: 'change' }]
  }
  
  // 如果是正常班，则必须选择排班规则
  if (form.workType === 'normal') {
    baseRules.ruleId = [{ required: true, message: '请选择排班规则', trigger: 'change' }]
  }
  
  return baseRules
})

// 批量排班验证规则（动态）
const batchRules = computed(() => {
  const rules: any = {
    userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
    dateRange: [{ required: true, message: '请选择日期范围', trigger: 'change' }],
    workType: [{ required: true, message: '请选择工作类型', trigger: 'change' }]
  }
  
  // 如果是正常班，则必须选择排班规则
  if (batchForm.workType === 'normal') {
    rules.ruleId = [{ required: true, message: '请选择排班规则', trigger: 'change' }]
  }
  
  return rules
})


const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userIds: [] as number[],
  scheduleDate: '',
  workType: ''
})


// 计算网格视图的日期列表
const gridDateList = computed(() => {
  const start = dayjs(gridStartDate.value)
  const end = dayjs(gridEndDate.value)
  const dates: string[] = []
  let current = start
  
  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  
  return dates
})

// 计算每列的宽度（响应式）
const columnWidth = computed(() => {
  // 用户列固定宽度
  const userColumnWidth = 120
  // 日期列数量
  const dateColumnCount = gridDateList.value.length
  // 最小列宽（小屏幕时使用）
  const minColumnWidth = 80
  // 理想列宽（大屏幕时使用）
  const idealColumnWidth = 100
  
  // 计算可用宽度（假设容器宽度，实际会通过CSS自动计算）
  // 这里返回一个基础宽度，CSS会通过 calc() 动态计算
  return {
    userColumn: userColumnWidth,
    dateColumn: idealColumnWidth,
    minDateColumn: minColumnWidth
  }
})

// 判断是否是今天
const isToday = (date: string) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

// 判断是否是周末
const isWeekend = (date: string) => {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

// 获取星期几
const getWeekday = (date: string) => {
  const day = dayjs(date).day()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return weekdays[day]
}

// 获取用户统计（请假天数、休息天数、上班天数）
const getUserStatistic = (userId: number, type: 'leave' | 'rest' | 'normal') => {
  let count = 0
  gridDateList.value.forEach(date => {
    const schedules = getSchedulesForUserAndDate(userId, date)
    // 每个日期只计算一次，取第一个排班的类型（通常一个日期只有一个排班）
    if (schedules.length > 0 && schedules[0].workType === type) {
      count++
    }
  })
  return count
}

// 判断日期是否被选中（只显示同一用户的选中状态）
const isDateSelected = (date: string) => {
  if (!selectedDateRange.value) return false
  const d = dayjs(date)
  const start = dayjs(selectedDateRange.value.start)
  const end = dayjs(selectedDateRange.value.end)
  return (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end))
}

// 判断日期是否在选择范围内（鼠标拖拽时，只对同一用户显示）
const isDateInSelectingRange = (date: string, userId: number) => {
  if (!isSelecting.value || !selectStartDate.value || !selectedDateRange.value || selectedUserId.value !== userId) {
    return false
  }
  const d = dayjs(date)
  const start = dayjs(selectedDateRange.value.start)
  const end = dayjs(selectedDateRange.value.end)
  return (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end))
}

// 获取指定用户和日期的排班
const getSchedulesForUserAndDate = (userId: number, date: string) => {
  const schedules = gridScheduleMap.value.get(date) || []
  return schedules.filter(s => s.userId === userId && s.status === '0')
}

// 获取排班显示文本（优先显示班次名称，否则显示工作类型）
const getScheduleDisplayText = (schedule: AgricultureEmployeeScheduleResult) => {
  // 如果有绑定排班规则，显示规则名称
  if (schedule.ruleName) {
    return schedule.ruleName
  }
  // 否则根据工作类型显示
  const workTypeMap: Record<string, string> = {
    'normal': '正常班',
    'leave': '请假',
    'rest': '休息'
  }
  return workTypeMap[schedule.workType || 'normal'] || '正常班'
}

// 获取排班提示文本
const getScheduleTooltip = (schedule: AgricultureEmployeeScheduleResult) => {
  const lines: string[] = []
  
  // 班次信息
  if (schedule.ruleName) {
    lines.push(`班次：${schedule.ruleName}`)
  }
  
  // 温室信息
  if (schedule.pastureName) {
    lines.push(`温室：${schedule.pastureName}`)
  }
  
  // 批次信息
  if (schedule.batchName) {
    lines.push(`批次：${schedule.batchName}`)
  }
  
  // 时间信息
  const startTime = schedule.workStartTime?.substring(11, 16) || ''
  const endTime = schedule.workEndTime?.substring(11, 16) || ''
  if (startTime && endTime) {
    lines.push(`时间：${startTime}-${endTime}`)
  }
  
  // 工作类型
  const workTypeMap: Record<string, string> = {
    'normal': '正常班',
    'leave': '请假',
    'rest': '休息'
  }
  if (schedule.workType) {
    lines.push(`类型：${workTypeMap[schedule.workType] || schedule.workType}`)
  }
  
  return lines.join('\n')
}

// 加载网格视图数据
const loadGridData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: 1,
      pageSize: 10000
    }
    
    // 如果是员工，自动添加用户ID过滤
    if (isEmployee.value && currentUserId.value) {
      params.userId = currentUserId.value
    }
    
    const res = await AgricultureScheduleService.listSchedule(params)
    if (res.code === 200 && res.rows) {
      // 构建日期 -> 排班列表的映射
      const scheduleMap = new Map<string, AgricultureEmployeeScheduleResult[]>()
      const userSet = new Set<number>()
      
      res.rows.forEach((schedule: AgricultureEmployeeScheduleResult) => {
        if (!schedule.scheduleDate) return
        const date = schedule.scheduleDate.substring(0, 10)
        
        // 只显示日期范围内的排班
        if (dayjs(date).isBefore(dayjs(gridStartDate.value)) || dayjs(date).isAfter(dayjs(gridEndDate.value))) {
          return
        }
        
        if (!scheduleMap.has(date)) {
          scheduleMap.set(date, [])
        }
        scheduleMap.get(date)!.push(schedule)
        
        if (schedule.userId && typeof schedule.userId === 'number') {
          userSet.add(schedule.userId)
        }
      })
      
      gridScheduleMap.value = scheduleMap
      
      // 获取用户列表（根据角色和部门过滤，再根据选择的用户筛选）
      let baseUserList = filterUserList.value
      
      // 如果选择了特定用户，只显示这些用户
      if (queryParams.userIds && queryParams.userIds.length > 0) {
        gridUserList.value = baseUserList.filter((user: any) => 
          queryParams.userIds.includes(user.userId)
        )
      } else {
        gridUserList.value = baseUserList
      }
    }
  } catch (error) {
    console.error('加载网格数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 单元格鼠标按下
const handleCellMouseDown = (userId: number, date: string, event: MouseEvent) => {
  // 检查权限，如果没有权限，只允许查看，不允许选择
  if (!hasPermission(['agriculture:schedule:add'])) {
    return
  }
  
  // 如果已经有选择范围且是同一个用户，不重新开始选择（保持原有选择）
  if (selectedDateRange.value && selectedUserId.value === userId) {
    const d = dayjs(date)
    const start = dayjs(selectedDateRange.value.start)
    const end = dayjs(selectedDateRange.value.end)
    // 如果点击的是已选择范围内的日期，不重新开始选择
    if ((d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end))) {
      return
    }
  }
  
  // 阻止默认行为，防止文本选择（使用非被动事件监听器）
  if (event.cancelable) {
    event.preventDefault()
  }
  event.stopPropagation()
  
  // 开始选择，记录起始用户和日期
  isSelecting.value = true
  selectedUserId.value = userId
  selectStartDate.value = date
  selectedDateRange.value = { start: date, end: date }
}

// 单元格鼠标进入（拖拽选择）
const handleCellMouseEnter = (userId: number, date: string) => {
  // 如果不在选择状态，或者不是同一个用户，不处理
  if (!isSelecting.value || !selectStartDate.value || selectedUserId.value !== userId) {
    return
  }
  
  // 只允许横向选择（同一用户的不同日期）
  const start = dayjs(selectStartDate.value)
  const end = dayjs(date)
  
  if (start.isBefore(end) || start.isSame(end)) {
    selectedDateRange.value = {
      start: selectStartDate.value,
      end: date
    }
  } else {
    selectedDateRange.value = {
      start: date,
      end: selectStartDate.value
    }
  }
}

// 单元格鼠标释放
const handleCellMouseUp = (event?: MouseEvent) => {
  if (event) {
    event.stopPropagation()
  }
  
  // 如果正在选择，完成选择（不清除选择状态，保持选中）
  if (isSelecting.value) {
    // 延迟清除拖拽状态，确保点击事件能正确判断
    setTimeout(() => {
      isSelecting.value = false // 只清除拖拽状态，保留选择结果
      selectStartDate.value = null
      // 不清除 selectedUserId 和 selectedDateRange，保持选择状态
    }, 100)
  }
}

// 网格鼠标离开（拖拽时）
const handleGridMouseLeave = () => {
  // 只在拖拽过程中离开网格时才清除拖拽状态
  if (isSelecting.value) {
    isSelecting.value = false
    selectStartDate.value = null
    // 不清除选择结果，保持已选择的日期范围
  }
}

// 单元格点击（单个日期排班）
const handleCellClick = (userId: number, date: string, event?: MouseEvent) => {
  if (event) {
    event.stopPropagation()
  }
  
  // 如果正在拖拽选择中，延迟处理点击（等待拖拽完成）
  if (isSelecting.value) {
    setTimeout(() => {
      // 拖拽完成后，如果点击的是已选择范围，打开批量排班对话框
      if (selectedDateRange.value && selectedUserId.value === userId) {
        const d = dayjs(date)
        const start = dayjs(selectedDateRange.value.start)
        const end = dayjs(selectedDateRange.value.end)
        if ((d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end))) {
          // 点击的是已选择范围，打开批量排班对话框
          openGridBatchDialog()
          return
        }
      }
      // 否则打开单个排班对话框
      handleSingleSchedule(userId, date)
    }, 150)
    return
  }
  
  // 如果点击的是已选择的日期范围，打开批量排班对话框
  if (selectedDateRange.value && selectedUserId.value === userId) {
    const d = dayjs(date)
    const start = dayjs(selectedDateRange.value.start)
    const end = dayjs(selectedDateRange.value.end)
    if ((d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end))) {
      // 点击的是已选择范围，打开批量排班对话框
      openGridBatchDialog()
      return
    }
  }
  
  // 否则打开单个排班对话框
  handleSingleSchedule(userId, date)
}

// 处理单个日期排班
const handleSingleSchedule = (userId: number, date: string) => {
  // 检查权限
  if (!hasPermission(['agriculture:schedule:add'])) {
    ElMessage.warning('您没有排班权限，请联系管理员')
    return
  }
  
  // 打开单个排班对话框
  reset()
  form.userId = userId
  form.scheduleDate = date
  form.workStartTime = `${date} 08:00:00`
  form.workEndTime = `${date} 17:00:00`
  open.value = true
  title.value = '添加排班'
}

// 清除选择
const clearSelection = () => {
  selectedDateRange.value = null
  isSelecting.value = false
  selectStartDate.value = null
  selectedUserId.value = null
}

// 打开网格批量排班对话框
const openGridBatchDialog = () => {
  if (!selectedDateRange.value) {
    ElMessage.warning('请先选择日期范围')
    return
  }
  
  // 自动填充选中的用户ID（如果已选择）
  batchForm.userId = selectedUserId.value || undefined
  batchForm.pastureId = undefined
  batchForm.batchId = undefined
  batchPastureBatchCascaderValue.value = []
  // 自动填充选中的日期范围
  batchForm.dateRange = [selectedDateRange.value.start, selectedDateRange.value.end]
  batchForm.ruleId = undefined
  batchForm.workStartTime = '08:00'
  batchForm.workEndTime = '18:00'
  batchForm.workType = 'normal'
  batchOpen.value = true
}

// 检查权限
const hasPermission = (perms: string[]) => {
  const userInfo = userStore.getUserInfo
  if (!userInfo || !userInfo.permissions) {
    console.warn('权限检查失败：用户信息或权限列表为空', { userInfo })
    return false
  }
  const allPermission = '*:*:*'
  const userPermissions = userInfo.permissions || []
  
  // 如果是超级管理员，直接返回true
  if (userPermissions.includes(allPermission)) {
    return true
  }
  
  // 检查是否有任一权限
  const hasPerm = perms.some(perm => userPermissions.includes(perm))
  console.log('权限检查:', { perms, userPermissions, hasPerm })
  return hasPerm
}


// 导出按钮操作
const handleExport = async () => {
  try {
    console.log('网格导出参数:', gridStartDate.value, gridEndDate.value)
    await downloadExcel(
      AgricultureScheduleService.exportGridExcel(gridStartDate.value, gridEndDate.value), 
      '网格排班.xlsx'
    )
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 需要温室的部门
const departmentsRequiringPasture = [
  'planting',      // 种植管理部
  'facility',      // 设施管理部
  'harvest'        // 采收管理部
]

// 根据选中的用户判断是否需要温室（单个排班）
const isPastureRequired = computed(() => {
  if (!form.userId || form.userId === undefined) return false
  
  // 查找选中的用户信息
  const selectedUser = userList.value.find(u => u.userId === form.userId)
  if (!selectedUser) return false
  
  // 获取用户的部门信息（从用户对象或角色中获取）
  const userDept = selectedUser.deptName || selectedUser.dept?.deptName || ''
  
  // 判断用户所在部门是否需要温室
  return departmentsRequiringPasture.some(dept => {
    if (dept === 'planting') return userDept.includes('种植')
    if (dept === 'facility') return userDept.includes('设施')
    if (dept === 'harvest') return userDept.includes('采收')
    return false
  })
})

// 温室字段验证规则（单个排班）
const pastureRules = computed(() => {
  if (isPastureRequired.value) {
    return [{ required: true, message: '请选择温室', trigger: 'change' }]
  }
  return [] // 不需要温室时，不验证
})

// 根据选中的用户判断是否需要温室（批量排班）
const isBatchPastureRequired = computed(() => {
  if (!batchForm.userId || batchForm.userId === undefined) return false
  
  // 查找选中的用户信息
  const selectedUser = userList.value.find(u => u.userId === batchForm.userId)
  if (!selectedUser) return false
  
  // 获取用户的部门信息
  const userDept = selectedUser.deptName || selectedUser.dept?.deptName || ''
  
  // 判断用户所在部门是否需要温室
  return departmentsRequiringPasture.some(dept => {
    if (dept === 'planting') return userDept.includes('种植')
    if (dept === 'facility') return userDept.includes('设施')
    if (dept === 'harvest') return userDept.includes('采收')
    return false
  })
})

// 温室字段验证规则（批量排班）
const batchPastureRules = computed(() => {
  if (isBatchPastureRequired.value) {
    return [{ required: true, message: '请选择温室', trigger: 'change' }]
  }
  return [] // 不需要温室时，不验证
})

// 判断是否是员工角色（用于数据过滤）
const isEmployee = computed(() => {
  const userInfo = userStore.getUserInfo
  if (!userInfo || !userInfo.roles) return false
  return userInfo.roles.some((role: string) => role === 'employee')
})

// 判断是否是超级管理员角色
const isAdmin = computed(() => {
  const userInfo = userStore.getUserInfo
  if (!userInfo || !userInfo.roles) return false
  return userInfo.roles.some((role: string) => role === 'admin')
})

// 判断是否是主管角色
const isManager = computed(() => {
  const userInfo = userStore.getUserInfo
  if (!userInfo || !userInfo.roles) return false
  return userInfo.roles.some((role: string) => role === 'manager')
})

// 获取当前用户ID
const currentUserId = computed(() => {
  const userInfo = userStore.getUserInfo
  return userInfo?.id ? Number(userInfo.id) : null
})

// 获取当前用户的部门ID
const currentUserDeptId = computed(() => {
  const userInfo: any = userStore.getUserInfo
  // 首先尝试从userStore中获取
  if (userInfo?.dept?.deptId) {
    return Number(userInfo.dept.deptId)
  }
  
  // 如果userStore中没有dept信息，从用户列表中查找当前用户
  if (currentUserId.value && userList.value.length > 0) {
    const currentUser = userList.value.find((u: any) => u.userId === currentUserId.value)
    if (currentUser) {
      const deptId = currentUser.dept?.deptId || currentUser.deptId
      if (deptId) {
        return Number(deptId)
      }
    }
  }
  
  return null
})

// 筛选用户列表（根据角色过滤）
const filterUserList = computed(() => {
  if (isEmployee.value && currentUserId.value) {
    // 员工只能看自己
    return userList.value.filter((u: any) => u.userId === currentUserId.value)
  } else if (isAdmin.value) {
    // 超级管理员：显示所有非admin用户（即主管和员工）
    return userList.value.filter((user: any) => {
      if (user.admin === true) return false
      // 注意：后端返回的roles可能是字符串数组或对象数组，需要兼容处理
      const roles = user.roles || []
      const hasAdminRole = roles.some((role: any) => {
        if (typeof role === 'string') {
          return role === 'admin'
        }
        return role.roleKey === 'admin'
      })
      return !hasAdminRole
    })
  } else if (isManager.value) {
    // 主管：显示本部门的所有员工（不包括admin和其他主管）
    return userList.value.filter((user: any) => {
      if (user.admin === true) return false
      const roles = user.roles || []
      // 只显示employee角色的用户
      const hasEmployeeRole = roles.some((role: any) => {
        if (typeof role === 'string') {
          return role === 'employee'
        }
        return role.roleKey === 'employee'
      })
      if (!hasEmployeeRole) return false
      const userDeptId = user.dept?.deptId || user.deptId
      return userDeptId === currentUserDeptId.value
    })
  } else {
    // 默认：显示本部门的用户
    return userList.value.filter((user: any) => {
      if (user.admin === true) return false
      const roles = user.roles || []
      const hasAdminRole = roles.some((role: any) => {
        if (typeof role === 'string') {
          return role === 'admin'
        }
        return role.roleKey === 'admin'
      })
      if (hasAdminRole) return false
      const userDeptId = user.dept?.deptId || user.deptId
      return userDeptId === currentUserDeptId.value
    })
  }
})

// 根据部门筛选用户列表（用于用户下拉框）- 已移除部门筛选功能
// 现在直接使用 filterUserList

// 部门变化处理 - 已移除
// const handleDeptChange = () => {
//   queryParams.userIds = []
//   handleQuery()
// }

// 获取部门列表 - 已移除
// const getDeptList = async () => { ... }

// 构建部门树形结构 - 已移除
// const buildDeptTree = (data: any[]): any[] => { ... }

/** 搜索按钮操作 */
const handleQuery = () => {
  loadGridData()
}

/** 重置按钮操作 */
const resetQuery = () => {
  if (queryFormRef.value) {
    resetForm(queryFormRef.value)
  }
  handleQuery()
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加排班'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureEmployeeScheduleResult) => {
  reset()
  open.value = true
  title.value = '修改排班'
  const res = await AgricultureScheduleService.getSchedule(row.scheduleId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!scheduleRef.value) return
  await scheduleRef.value.validate(async (valid) => {
    if (valid) {
      // 如果是修改模式，直接提交单条
      if (form.scheduleId !== undefined && form.scheduleId !== null) {
        const submitData: any = { ...form, status: '0' }
        if (form.workType === 'normal' && form.ruleId) {
          const rule = ruleList.value.find(r => r.ruleId === form.ruleId)
          if (rule && form.scheduleDate) {
            submitData.workStartTime = `${form.scheduleDate} ${rule.workStartTime || '08:00:00'}`
            submitData.workEndTime = `${form.scheduleDate} ${rule.workEndTime || '17:00:00'}`
          }
        }
        const res = await AgricultureScheduleService.updateSchedule(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          loadGridData()
        }
        return
      }

      // 新增模式：根据选择的温室/批次数量创建排班记录
      // 获取所有选中的温室/批次组合
      const selectedPairs: Array<{ pastureId: number, batchId?: number }> = []
      if (form.workType === 'normal' && pastureBatchCascaderValue.value && pastureBatchCascaderValue.value.length > 0) {
        for (const item of pastureBatchCascaderValue.value) {
          if (Array.isArray(item) && item.length >= 2) {
            selectedPairs.push({ pastureId: Number(item[0]), batchId: Number(item[1]) })
          } else if (Array.isArray(item) && item.length === 1) {
            selectedPairs.push({ pastureId: Number(item[0]) })
          }
        }
      }

      // 如果没有选择温室（非正常班或未选温室），按原逻辑提交单条
      if (selectedPairs.length <= 1) {
        const submitData: any = { ...form, status: '0' }
        if (form.workType === 'normal' && form.ruleId) {
          const rule = ruleList.value.find(r => r.ruleId === form.ruleId)
          if (rule && form.scheduleDate) {
            submitData.workStartTime = `${form.scheduleDate} ${rule.workStartTime || '08:00:00'}`
            submitData.workEndTime = `${form.scheduleDate} ${rule.workEndTime || '17:00:00'}`
          }
        }
        const res = await AgricultureScheduleService.addSchedule(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          loadGridData()
        }
        return
      }

      // 多温室：为每个温室/批次创建一条排班记录，使用批量创建接口
      const schedules: any[] = []
      const rule = form.ruleId ? ruleList.value.find(r => r.ruleId === form.ruleId) : null
      for (const pair of selectedPairs) {
        const schedule: any = {
          userId: form.userId,
          pastureId: pair.pastureId,
          batchId: pair.batchId,
          scheduleDate: form.scheduleDate,
          workType: form.workType,
          ruleId: form.ruleId,
          status: '0'
        }
        if (form.workType === 'normal' && rule && form.scheduleDate) {
          schedule.workStartTime = `${form.scheduleDate} ${rule.workStartTime || '08:00:00'}`
          schedule.workEndTime = `${form.scheduleDate} ${rule.workEndTime || '17:00:00'}`
        }
        schedules.push(schedule)
      }
      try {
        const res = await AgricultureScheduleService.batchCreate(schedules)
        if (res.code === 200) {
          ElMessage.success(`成功创建 ${schedules.length} 条排班记录`)
          open.value = false
          loadGridData()
        }
      } catch (error) {
        console.error('批量创建排班失败:', error)
        ElMessage.error('创建排班失败')
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureEmployeeScheduleResult) => {
  if (!row) {
    ElMessage.warning('请选择要删除的数据（在网格视图中点击排班项进行删除）')
    return
  }
  
  const deleteIds = typeof row.scheduleId === 'number' ? row.scheduleId : Number(row.scheduleId)
  
  await ElMessageBox.confirm('是否确认删除选中的排班数据？', '提示', {
    type: 'warning'
  })
  const res = await AgricultureScheduleService.deleteSchedule(deleteIds)
  if (res.code === 200) {
    loadGridData()
    ElMessage.success(res.msg)
  }
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  Object.assign(form, {
    scheduleId: undefined,
    userId: undefined,
    pastureId: undefined,
    batchId: undefined,
    scheduleDate: '',
    workStartTime: '',
    workEndTime: '',
    workType: 'normal',
    ruleId: undefined,
    taskId: undefined,
    status: '0',
    remark: ''
  })
  pastureBatchCascaderValue.value = []
  scheduleRef.value?.resetFields()
}

/** 获取用户列表 */
const getUserList = async () => {
  try {
    // 先查询第一页，获取总数
    const firstRes = await UserService.listUser({ status: '0', pageNum: 1, pageSize: 100 })
    if (firstRes.code === 200) {
      const total = firstRes.total || 0
      const firstPageRows = firstRes.rows || []
      
      // 如果总数小于等于100，直接使用第一页数据
      if (total <= 100) {
        userList.value = firstPageRows
        return
      }
      
      // 如果总数大于100，需要分页查询所有数据
      const allUsers = [...firstPageRows]
      const totalPages = Math.ceil(total / 100)
      
      // 并发查询剩余页
      const promises = []
      for (let page = 2; page <= totalPages; page++) {
        promises.push(UserService.listUser({ status: '0', pageNum: page, pageSize: 100 }))
      }
      
      const results = await Promise.all(promises)
      results.forEach((res: any) => {
        if (res.code === 200 && res.rows) {
          allUsers.push(...res.rows)
        }
      })
      
      userList.value = allUsers
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

/** 获取排班规则列表 */
const getRuleList = async () => {
  try {
    const res = await AgricultureScheduleRuleService.listRule({ status: '0', pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      ruleList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取排班规则列表失败:', error)
  }
}

/** 获取温室列表 */
const getPastureList = async () => {
  try {
    console.log('🌱 开始获取温室列表...')
    const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
    console.log('🌱 温室列表API响应:', res)
    if (res.code === 200) {
      pastureList.value = res.rows || []
      console.log('✅ 温室列表加载成功，共', pastureList.value.length, '个温室')
    }
  } catch (error) {
    console.error('❌ 获取温室列表失败:', error)
  }
}

/** 构建温室批次级联选择器选项 */
const buildPastureBatchCascaderOptions = async () => {
  console.log('🏗️ 开始构建级联选择器选项，温室数量:', pastureList.value.length)
  const options: any[] = []
  for (const pasture of pastureList.value) {
    try {
      console.log('📦 正在获取温室批次:', pasture.name || pasture.pastureName, 'ID:', pasture.id || pasture.pastureId)
      const batches: any = await AgricultureCropBatchService.listBatchByPasture(pasture.id || pasture.pastureId)
      console.log('📦 批次API响应:', batches)
      
      // 兼容两种返回格式：{data: []} 或 {rows: []}
      const batchList = batches.data || batches.rows || []
      const children = batchList.map((batch: any) => ({
        label: batch.batchName,
        value: Number(batch.batchId),
        isLeaf: true
      }))
      
      console.log('📦 温室', pasture.name || pasture.pastureName, '的批次数量:', children.length)
      console.log('📦 批次详情:', children)
      
      // 显示所有温室，如果没有批次则显示"暂无批次"的禁用选项
      if (children.length > 0) {
        options.push({
          label: pasture.name || pasture.pastureName,
          value: Number(pasture.id || pasture.pastureId),
          children: children
        })
      } else {
        // 没有批次时，添加一个禁用的提示选项
        options.push({
          label: pasture.name || pasture.pastureName,
          value: Number(pasture.id || pasture.pastureId),
          children: [{
            label: '暂无批次',
            value: -1,
            disabled: true,
            isLeaf: true
          }]
        })
      }
    } catch (error) {
      console.error(`❌ 获取温室 ${pasture.id || pasture.pastureId} 的批次失败:`, error)
    }
  }
  pastureBatchCascaderOptions.value = options
  console.log('✅ 级联选择器选项构建完成，共', options.length, '个温室')
  console.log('📋 最终选项:', JSON.stringify(options, null, 2))
}

/** 处理单个排班温室批次级联选择器变化（多选模式，value 是二维数组） */
const handlePastureBatchCascaderChange = (value: any) => {
  // 多选模式下 value 格式: [[pastureId1, batchId1], [pastureId2, batchId2], ...]
  if (value && Array.isArray(value) && value.length > 0) {
    // 取第一个选项的值作为 form 的默认值（兼容原有逻辑）
    const first = value[0]
    if (Array.isArray(first) && first.length === 2) {
      form.pastureId = Number(first[0])
      form.batchId = Number(first[1])
    } else if (Array.isArray(first) && first.length === 1) {
      form.pastureId = Number(first[0])
      form.batchId = undefined
    }
  } else {
    form.pastureId = undefined
    form.batchId = undefined
  }
}

/** 处理批量排班温室批次级联选择器变化（多选模式，value 是二维数组） */
const handleBatchPastureBatchCascaderChange = (value: any) => {
  // 多选模式下 value 格式: [[pastureId1, batchId1], [pastureId2, batchId2], ...]
  if (value && Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (Array.isArray(first) && first.length === 2) {
      batchForm.pastureId = Number(first[0])
      batchForm.batchId = Number(first[1])
    } else if (Array.isArray(first) && first.length === 1) {
      batchForm.pastureId = Number(first[0])
      batchForm.batchId = undefined
    }
  } else {
    batchForm.pastureId = undefined
    batchForm.batchId = undefined
  }
}

/** 批量删除排班 */
const handleBatchDelete = async () => {
  if (!selectedDateRange.value || !selectedUserId.value) {
    ElMessage.warning('请先选择要删除的日期范围和员工')
    return
  }

  const startDate = selectedDateRange.value.start
  const endDate = selectedDateRange.value.end
  const userId = selectedUserId.value

  // 获取选中日期范围内的所有排班ID
  const schedulesToDelete: number[] = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end)) {
    const date = current.format('YYYY-MM-DD')
    const schedules = getSchedulesForUserAndDate(userId, date)
    schedules.forEach(s => {
      if (s.scheduleId) {
        schedulesToDelete.push(Number(s.scheduleId))
      }
    })
    current = current.add(1, 'day')
  }

  if (schedulesToDelete.length === 0) {
    ElMessage.info('选中日期范围内没有可删除的排班记录')
    return
  }

  await ElMessageBox.confirm(
    `是否确认删除员工 ${userList.value.find(u => u.userId === userId)?.nickName || userId} 在 ${startDate} 至 ${endDate} 期间的 ${schedulesToDelete.length} 条排班数据？`,
    '提示',
    { type: 'warning' }
  )
  try {
    const res = await AgricultureScheduleService.deleteSchedule(schedulesToDelete.join(','))
    if (res.code === 200) {
      ElMessage.success(`成功删除 ${schedulesToDelete.length} 条排班记录`)
      loadGridData()
      clearSelection()
    }
  } catch (error) {
    console.error('批量删除排班失败:', error)
    ElMessage.error('批量删除排班失败')
  }
}

/** 格式化工作日显示 */
const formatWorkDays = (workDays: string) => {
  if (!workDays) return ''
  const dayMap: Record<string, string> = {
    '1': '周一',
    '2': '周二',
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六',
    '7': '周日'
  }
  return workDays.split(',').map(d => dayMap[d] || d).join('、')
}

/** 检查规则是否适用于选中的日期 */
const isRuleApplicable = (rule: AgricultureScheduleRuleResult) => {
  // 排班规则始终可用
  return true
}

/** 日期变化时处理 */
const handleDateChange = () => {
  // 如果已选择规则，检查规则是否适用，如果不适用则清空规则
  if (form.ruleId) {
    const selectedRule = ruleList.value.find(r => r.ruleId === form.ruleId)
    if (selectedRule && !isRuleApplicable(selectedRule)) {
      ElMessage.warning('所选规则不适用于该日期，已清空规则选择')
      form.ruleId = undefined
      form.workStartTime = ''
      form.workEndTime = ''
    }
  }
}

/** 规则选择变化时自动填充时间 */
const handleRuleChange = (ruleId: number | null | undefined) => {
  if (!ruleId) {
    // 清空规则时不清空时间，让用户手动修改
    return
  }
  
  const rule = ruleList.value.find(r => r.ruleId === ruleId)
  if (!rule) return
  
  // 检查规则是否适用于当前日期
  if (form.scheduleDate && !isRuleApplicable(rule)) {
    ElMessage.warning('所选规则不适用于该日期')
    form.ruleId = undefined
    return
  }
  
  // 如果有排班日期，自动填充工作开始和结束时间
  if (form.scheduleDate) {
    const dateStr = form.scheduleDate
    form.workStartTime = `${dateStr} ${rule.workStartTime || '08:00:00'}`
    form.workEndTime = `${dateStr} ${rule.workEndTime || '17:00:00'}`
  } else {
    // 如果没有日期，只提示用户先选择日期
    ElMessage.info('请先选择排班日期，规则时间将自动填充')
  }
}

/** 用户选择变化时，重新验证温室字段 */
const handleUserChange = () => {
  // 触发表单重新验证
  scheduleRef.value?.validateField('pastureId')
}

// 获取温室列表 - 已移除
// const getPastureList = async () => { ... }

/** 批量排班按钮操作 */
const handleBatchAdd = () => {
  batchForm.userId = undefined
  batchForm.pastureId = undefined
  batchForm.dateRange = []
  batchForm.ruleId = undefined
  batchForm.workStartTime = '08:00'
  batchForm.workEndTime = '18:00'
  batchForm.workType = 'normal'
  batchOpen.value = true
}

/** 提交批量排班表单 */
const submitBatchForm = async () => {
  if (!batchFormRef.value) return
  await (batchFormRef.value as FormInstance).validate(async (valid) => {
    if (valid) {
      if (!batchForm.userId || !batchForm.dateRange || batchForm.dateRange.length !== 2) {
        ElMessage.warning('请填写完整信息')
        return
      }
      
      // 如果是正常班，必须选择排班规则
      if (batchForm.workType === 'normal' && !batchForm.ruleId) {
        ElMessage.warning('请选择排班规则')
        return
      }
      
      const [startDate, endDate] = batchForm.dateRange
      const schedules: any[] = []
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      
      // 获取所有选中的温室/批次组合
      const selectedPairs: Array<{ pastureId?: number, batchId?: number }> = []
      if (batchForm.workType === 'normal' && batchPastureBatchCascaderValue.value && batchPastureBatchCascaderValue.value.length > 0) {
        for (const item of batchPastureBatchCascaderValue.value) {
          if (Array.isArray(item) && item.length >= 2) {
            selectedPairs.push({ pastureId: Number(item[0]), batchId: Number(item[1]) })
          } else if (Array.isArray(item) && item.length === 1) {
            selectedPairs.push({ pastureId: Number(item[0]) })
          }
        }
      }
      // 如果没有选择温室，用 form 中的值（兼容非正常班场景）
      if (selectedPairs.length === 0) {
        selectedPairs.push({ pastureId: batchForm.pastureId, batchId: batchForm.batchId })
      }

      const rule = batchForm.ruleId ? ruleList.value.find(r => r.ruleId === batchForm.ruleId) : null
      let current = start
      
      while (current.isBefore(end) || current.isSame(end)) {
        const dateStr = current.format('YYYY-MM-DD')
        // 为每个温室/批次组合创建一条排班记录
        for (const pair of selectedPairs) {
          const schedule: any = {
            userId: batchForm.userId,
            pastureId: pair.pastureId,
            batchId: pair.batchId,
            scheduleDate: dateStr,
            workType: batchForm.workType,
            status: '0'
          }
          
          if (batchForm.workType === 'normal' && rule) {
            schedule.ruleId = batchForm.ruleId
            schedule.workStartTime = `${dateStr} ${rule.workStartTime || '08:00:00'}`
            schedule.workEndTime = `${dateStr} ${rule.workEndTime || '17:00:00'}`
          }
          
          schedules.push(schedule)
        }
        current = current.add(1, 'day')
      }
      
      if (schedules.length === 0) {
        ElMessage.warning('没有可生成的排班记录')
        return
      }
      
      try {
        const res = await AgricultureScheduleService.batchCreate(schedules)
        if (res.code === 200) {
          ElMessage.success(`成功创建 ${schedules.length} 条排班记录`)
          batchOpen.value = false
          loadGridData()
          clearSelection()
        }
      } catch (error) {
        console.error('批量创建排班失败:', error)
        ElMessage.error('批量创建排班失败')
      }
    }
  })
}

// 监听查询参数变化 - 移除了 deptId 和 pastureId 的监听
watch(
  () => queryParams.userIds,
  () => {
    loadGridData()
  },
  { deep: true }
)

onMounted(async () => {
  await getUserList()
  await getRuleList()
  await getPastureList()
  await buildPastureBatchCascaderOptions()
  loadGridData()
})

// 监听批量排班成功，刷新网格数据
watch(() => batchOpen.value, (newVal) => {
  if (!newVal) {
    // 批量排班对话框关闭后，刷新网格数据
    loadGridData()
    clearSelection()
  }
})

// 监听单个排班成功，刷新网格数据
watch(() => open.value, (newVal) => {
  if (!newVal) {
    loadGridData()
  }
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}

// 网格排班视图样式
.grid-schedule-card {
  margin-top: 20px;
  width: 100%;
  
  :deep(.el-card__body) {
    padding: 20px;
    overflow: visible; /* 允许内容溢出，让横向滚动条正常工作 */
  }
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  
  .grid-controls {
    display: flex;
    align-items: center;
  }
  
  .grid-legend {
    display: flex;
    gap: 20px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #606266;
      
      .legend-cell {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 3px;
        border: 1px solid #dcdfe6;
        
        &.normal {
          background-color: #67c23a; /* 正常班 - 绿色 */
        }
        
        &.leave {
          background-color: #f56c6c; /* 请假 - 红色 */
        }
        
        &.rest {
          background-color: #e6a23c; /* 休息 - 橙色 */
        }
        
        &.selected {
          background-color: #e1f3d8; /* 已选择 - 浅绿色，与单元格选中颜色一致 */
        }
      }
    }
  }
}

.grid-container {
  overflow-x: auto; /* 当内容超出时显示横向滚动条 */
  overflow-y: auto; /* 纵向滚动 */
  max-height: calc(100vh - 400px);
  border: 1px solid #ebeef5;
  border-radius: 4px;
  width: 100%;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  
  /* 响应式：大屏幕（1k、2k）时，如果内容能完全显示，则不显示滚动条 */
  /* 小屏幕（手机、平板）时，如果内容超出，则显示滚动条 */
  
  /* 滚动条样式优化 */
  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

.grid-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  
  .grid-row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    min-width: 0;
    align-items: stretch; /* 确保所有单元格高度一致 */
    
    &.grid-header-row {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #f5f7fa;
    }
    
    &.grid-data-row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
  
  .grid-cell {
    border: 1px solid #dcdfe6; /* 添加外边框 */
    padding: 6px; /* 减小内边距，节省空间 */
    position: relative;
    box-sizing: border-box;
    min-width: 0;
    margin: 0; /* 确保没有外边距 */
    
    /* 响应式内边距 */
    @media (max-width: 768px) {
      padding: 4px;
    }
    
    @media (min-width: 1920px) {
      padding: 8px; /* 大屏幕时使用更大的内边距 */
    }
    
    &.grid-user-header {
      width: 100px; /* 减小用户列宽度，节省空间给日期列 */
      min-width: 100px;
      max-width: 100px;
      flex-shrink: 0; /* 用户列固定宽度，不缩放 */
      background-color: #f5f7fa;
      font-weight: 500;
      text-align: center;
      position: sticky;
      left: 0;
      z-index: 5;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      
      @media (min-width: 1920px) {
        width: 120px;
        min-width: 120px;
        max-width: 120px;
      }
    }
    
    &.grid-user-cell {
      width: 100px; /* 减小用户列宽度，节省空间给日期列 */
      min-width: 100px;
      max-width: 100px;
      flex-shrink: 0; /* 用户列固定宽度，不缩放 */
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
      position: sticky;
      left: 0;
      z-index: 4;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      
      @media (min-width: 1920px) {
        width: 120px;
        min-width: 120px;
        max-width: 120px;
      }
      
      .user-name {
        font-weight: 500;
        color: #303133;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center; /* 居中显示 */
      }
    }
    
    &.grid-date-header {
      flex: 1 1 0; /* 日期列平均分配剩余空间，确保对齐 */
      min-width: 50px; /* 减小最小宽度，让更多日期能显示 */
      text-align: center;
      background-color: #f5f7fa;
      font-weight: 500;
      min-height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      padding: 6px;
      
      @media (min-width: 1920px) {
        padding: 8px;
      }
      
      .date-number {
        font-size: 13px; /* 稍微减小字体 */
        color: #303133;
        margin-bottom: 2px;
        white-space: nowrap;
      }
      
      .date-weekday {
        font-size: 11px; /* 稍微减小字体 */
        color: #909399;
        white-space: nowrap;
      }
      
      &.today {
        background-color: #ecf5ff;
        color: #409eff;
        
        .date-number {
          font-weight: 600;
        }
      }
      
      &.weekend {
        background-color: #f5f7fa; /* 周末背景改为浅灰色 */
        color: #909399; /* 周末文字颜色改为灰色 */
      }
    }
    
    &.grid-data-cell {
      flex: 1 1 0; /* 日期列平均分配剩余空间，确保对齐 */
      min-width: 50px; /* 减小最小宽度，让更多日期能显示 */
      min-height: 60px;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
      background-color: #fff;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      padding: 6px;
      
      @media (min-width: 1920px) {
        padding: 8px;
      }
      
      @media (max-width: 768px) {
        min-height: 40px;
        min-width: 40px; /* 移动端更小的最小宽度 */
      }
      
      &:hover {
        background-color: #f0f9ff;
        z-index: 1;
        border-color: #409eff;
      }
      
      &.today {
        background-color: #ecf5ff;
      }
      
      &.weekend {
        background-color: #f5f7fa; /* 周末背景改为浅灰色 */
      }
      
      &.selected {
        background-color: #e1f3d8 !important;
        border-color: #67c23a;
      }
      
      &.selecting {
        background-color: #e6f7ff;
        border-color: #409eff;
        border-style: dashed;
      }
      
      .cell-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 40px;
        height: 100%;
        
        .schedule-badge {
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          
          &:hover {
            opacity: 0.8;
            /* 移除 transform: scale，避免导致对齐问题 */
          }
          
          &.normal {
            background-color: #67c23a; /* 正常班 - 绿色 */
            color: #fff;
          }
          
          &.leave {
            background-color: #f56c6c; /* 请假 - 红色 */
            color: #fff;
          }
          
          &.rest {
            background-color: #e6a23c; /* 休息 - 橙色 */
            color: #fff;
          }
        }
        
        .cell-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #c0c4cc;
          font-size: 12px;
          
          .empty-hint {
            opacity: 0;
            transition: opacity 0.2s;
          }
        }
      }
      
      &:hover .cell-empty .empty-hint {
        opacity: 1;
      }
    }
    
    &.grid-stat-header {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      flex-shrink: 0;
      text-align: center;
      background-color: #f5f7fa;
      font-weight: 500;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      padding: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 60px;
      
      @media (min-width: 1920px) {
        padding: 8px;
      }
      
      .stat-header-line {
        line-height: 1.2;
        white-space: nowrap;
        font-size: 12px;
        
        &:first-child {
          margin-bottom: 2px;
        }
      }
    }
    
    &.grid-stat-cell {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      flex-shrink: 0;
      text-align: center;
      background-color: #fafafa;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      
      @media (min-width: 1920px) {
        padding: 8px;
      }
      
      .stat-value {
        font-weight: 600;
        font-size: 16px;
        color: #303133;
      }
    }
  }
}

.selection-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  span {
    color: #409eff;
    font-weight: 500;
  }
  
  .selection-actions {
    display: flex;
    gap: 10px;
  }
}

// Tooltip样式
:deep(.schedule-tooltip) {
  max-width: 300px;
}

.tooltip-content {
  padding: 4px 0;
  
  .tooltip-line {
    display: flex;
    align-items: center;
    padding: 4px 0;
    font-size: 13px;
    line-height: 1.5;
    
    .tooltip-label {
      font-weight: 600;
      color: #606266;
      min-width: 50px;
      flex-shrink: 0;
    }
    
    .tooltip-value {
      color: #303133;
      word-break: break-all;
    }
  }
}
</style>

