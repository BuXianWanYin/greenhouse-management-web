<template>
  <div class="page-content">
    <!-- 工具栏 -->
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="resetForm(queryFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryFormRef" label-width="82px">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="用户姓名" prop="userId">
              <el-select
                v-model="queryParams.userId"
                placeholder="请选择用户"
                clearable
                filterable
                  style="width: 100%"
                  @keyup.enter="handleQuery"
              >
                <el-option
                  v-for="user in userList"
                  :key="user.userId"
                  :label="user.nickName || user.userName"
                  :value="user.userId"
                />
              </el-select>
            </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="温室" prop="pastureId">
              <el-select
                v-model="queryParams.pastureId"
                placeholder="请选择温室"
                clearable
                  style="width: 100%"
                  @keyup.enter="handleQuery"
              >
                <el-option
                  v-for="pasture in pastureList"
                  :key="pasture.id || pasture.pastureId"
                  :label="pasture.name || pasture.pastureName"
                  :value="pasture.id || pasture.pastureId"
                />
              </el-select>
            </el-form-item>
            </el-col>
          </el-row>
          </el-form>
      </template>
      <template #bottom>
          <el-button
          :type="viewMode === 'calendar' ? 'primary' : ''"
          @click="switchToCalendar"
          v-ripple
        >日历视图</el-button>
        <el-button
          :type="viewMode === 'table' ? 'primary' : ''"
          @click="switchToTable"
          v-ripple
        >表格视图</el-button>
        <el-button
            @click="handleAdd"
            v-hasPermi="['agriculture:schedule:add']"
          v-ripple
          >新增</el-button>
          <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-hasPermi="['agriculture:schedule:remove']"
          v-ripple
        >删除</el-button>
        <el-button
            @click="handleExport"
            v-hasPermi="['agriculture:schedule:export']"
          v-ripple
          >导出</el-button>
      </template>
    </table-bar>

    <!-- 日历视图 -->
    <el-card v-if="viewMode === 'calendar'" v-loading="loading">
      <div class="calendar-header">
        <div class="calendar-nav">
          <el-button :icon="ArrowLeft" circle @click="prevMonth" />
          <div class="calendar-title">
            <el-date-picker
              v-model="currentDate"
              type="month"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              @change="handleMonthChange"
              style="width: 150px"
            />
          </div>
          <el-button :icon="ArrowRight" circle @click="nextMonth" />
          <el-button @click="goToday">今天</el-button>
        </div>
        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-dot normal"></span>
            <span>正常班</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot overtime"></span>
            <span>加班</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot leave"></span>
            <span>请假</span>
          </div>
        </div>
      </div>
      <div class="calendar-container">
        <div class="calendar-weekdays">
          <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
        </div>
        <div class="calendar-days">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': day.otherMonth,
              'today': day.isToday,
              'has-schedule': day.schedules && day.schedules.length > 0
            }"
            @click="handleDayClick(day)"
          >
            <div class="day-number">{{ day.date }}</div>
            <div class="day-schedules">
              <div
                v-for="(schedule, idx) in (day.schedules || []).slice(0, 3)"
                :key="schedule.scheduleId || idx"
                class="schedule-item"
                :class="schedule.workType || 'normal'"
                @click.stop="handleScheduleClick(schedule)"
                :title="`${schedule.nickName || schedule.userName || '未知'} ${schedule.workStartTime?.substring(11, 16) || ''}-${schedule.workEndTime?.substring(11, 16) || ''}`"
              >
                <span class="schedule-time" v-if="schedule.workStartTime && schedule.workEndTime">
                  {{ schedule.workStartTime.substring(11, 16) }}-{{ schedule.workEndTime.substring(11, 16) }}
                </span>
                <span class="schedule-user">{{ schedule.nickName || schedule.userName || '未知' }}</span>
              </div>
              <div
                v-if="day.schedules && day.schedules.length > 3"
                class="schedule-more"
                @click.stop="handleDayClick(day)"
              >
                +{{ day.schedules.length - 3 }} 更多
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 表格视图 -->
    <art-table
      v-else
        v-loading="loading"
        :data="scheduleList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      row-key="scheduleId"
      >
      <template #default>
        <el-table-column label="排班ID" prop="scheduleId" align="center" v-if="columns[0].show" />
        <el-table-column label="用户姓名" min-width="120" v-if="columns[1].show">
          <template #default="scope">
            {{ scope.row.nickName || scope.row.userName || '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="温室名称" prop="pastureName" min-width="150" v-if="columns[2].show" />
        <el-table-column label="排班日期" prop="scheduleDate" min-width="120" v-if="columns[3].show" />
        <el-table-column label="工作开始时间" prop="workStartTime" min-width="160" v-if="columns[4].show" />
        <el-table-column label="工作结束时间" prop="workEndTime" min-width="160" v-if="columns[5].show" />
        <el-table-column label="工作类型" prop="workType" min-width="100" v-if="columns[6].show">
          <template #default="scope">
            <el-tag v-if="scope.row.workType === 'normal'">正常班</el-tag>
            <el-tag type="warning" v-else-if="scope.row.workType === 'overtime'">加班</el-tag>
            <el-tag type="info" v-else-if="scope.row.workType === 'leave'">请假</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" min-width="80" v-if="columns[7].show">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['agriculture:schedule:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:schedule:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="scheduleRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="用户" prop="userId">
          <el-select
            v-model="form.userId"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.nickName || user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="温室" prop="pastureId">
          <el-select
            v-model="form.pastureId"
            placeholder="请选择温室"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="pasture in pastureList"
              :key="pasture.id || pasture.pastureId"
              :label="pasture.name || pasture.pastureName"
              :value="pasture.id || pasture.pastureId"
            />
          </el-select>
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
        <el-form-item label="排班规则" prop="ruleId">
          <el-select
            v-model="form.ruleId"
            placeholder="请选择排班规则（可选）"
            clearable
            filterable
            style="width: 100%"
            @change="handleRuleChange"
          >
            <el-option
              v-for="rule in ruleList"
              :key="rule.ruleId"
              :label="rule.ruleName"
              :value="rule.ruleId"
              :disabled="!isRuleApplicable(rule)"
            >
              <span>{{ rule.ruleName }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 10px">
                {{ formatWorkDays(rule.workDays) }} {{ rule.workStartTime }}-{{ rule.workEndTime }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作开始时间" prop="workStartTime">
          <el-date-picker
            v-model="form.workStartTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="工作结束时间" prop="workEndTime">
          <el-date-picker
            v-model="form.workEndTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="工作类型" prop="workType">
          <el-select v-model="form.workType" placeholder="请选择工作类型" style="width: 100%">
            <el-option label="正常班" value="normal" />
            <el-option label="加班" value="overtime" />
            <el-option label="请假" value="leave" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="'0'">正常</el-radio>
            <el-radio :value="'1'">已取消</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Search, Refresh, Plus, Download, Edit, Delete, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureScheduleService } from '@/api/agriculture/scheduleApi'
import { AgricultureEmployeeScheduleResult } from '@/types/agriculture/schedule'
import { UserService } from '@/api/system/userApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureScheduleRuleService, AgricultureScheduleRuleResult } from '@/api/agriculture/scheduleRuleApi'
import { downloadExcel, resetForm } from '@/utils/utils'
import dayjs from 'dayjs'

const loading = ref(false)
const scheduleList = ref<AgricultureEmployeeScheduleResult[]>([])
const open = ref(false)
const showSearch = ref(true)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const scheduleRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()
const userList = ref<any[]>([])
const pastureList = ref<any[]>([])
const ruleList = ref<AgricultureScheduleRuleResult[]>([])
const viewMode = ref<'calendar' | 'table'>('calendar')
const currentDate = ref(dayjs().format('YYYY-MM'))

// 表格列定义（用于列显示控制）
const columns = reactive([
  { name: '排班ID', show: true },
  { name: '用户姓名', show: true },
  { name: '温室名称', show: true },
  { name: '排班日期', show: true },
  { name: '工作开始时间', show: true },
  { name: '工作结束时间', show: true },
  { name: '工作类型', show: true },
  { name: '状态', show: true }
])

// 列显示控制
const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: null as number | null,
  pastureId: null as number | null,
  scheduleDate: '',
  workType: ''
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 计算日历天数
const calendarDays = computed(() => {
  const year = parseInt(currentDate.value.split('-')[0])
  const month = parseInt(currentDate.value.split('-')[1]) - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const todayDate = today.getDate()

  const days: any[] = []

  // 上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    days.push({
      date,
      fullDate: dayjs(new Date(year, month - 1, date)).format('YYYY-MM-DD'),
      otherMonth: true,
      schedules: getSchedulesForDate(dayjs(new Date(year, month - 1, date)).format('YYYY-MM-DD'))
    })
  }

  // 当前月的日期
  for (let date = 1; date <= daysInMonth; date++) {
    const fullDate = dayjs(new Date(year, month, date)).format('YYYY-MM-DD')
    days.push({
      date,
      fullDate,
      otherMonth: false,
      isToday: isCurrentMonth && date === todayDate,
      schedules: getSchedulesForDate(fullDate)
    })
  }

  // 下个月的日期（补齐到42天，6行x7列）
  const remainingDays = 42 - days.length
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      date,
      fullDate: dayjs(new Date(year, month + 1, date)).format('YYYY-MM-DD'),
      otherMonth: true,
      schedules: getSchedulesForDate(dayjs(new Date(year, month + 1, date)).format('YYYY-MM-DD'))
    })
  }

  return days
})

// 获取指定日期的排班
const getSchedulesForDate = (date: string) => {
  if (!date || !scheduleList.value || scheduleList.value.length === 0) {
    return []
  }
  
  return scheduleList.value.filter(schedule => {
    if (!schedule || !schedule.scheduleDate) return false
    
    // 格式化日期进行比较（确保格式一致）
    const scheduleDate = schedule.scheduleDate.substring(0, 10) // 只取日期部分 YYYY-MM-DD
    const targetDate = date.substring(0, 10)
    
    // 日期匹配且状态正常
    return scheduleDate === targetDate && schedule.status === '0'
  })
}

// 切换到日历视图
const switchToCalendar = () => {
  viewMode.value = 'calendar'
    loadCalendarData()
  }

// 切换到表格视图
const switchToTable = () => {
  viewMode.value = 'table'
  getList()
}

// 加载日历数据
const loadCalendarData = async () => {
  loading.value = true
  try {
    const year = parseInt(currentDate.value.split('-')[0])
    const month = parseInt(currentDate.value.split('-')[1])
    
    // 构建查询参数 - 不传scheduleDate，获取所有数据后在前端过滤
    const params: any = {
      pageNum: 1,
      pageSize: 1000 // 获取足够多的数据
    }
    
    if (queryParams.userId) {
      params.userId = queryParams.userId
    }
    if (queryParams.pastureId) {
      params.pastureId = queryParams.pastureId
    }
    
    const res = await AgricultureScheduleService.listSchedule(params)
    if (res.code === 200 && res.rows) {
      // 过滤出当前月的数据
      scheduleList.value = res.rows.filter((item: AgricultureEmployeeScheduleResult) => {
        if (!item.scheduleDate) return false
        // 确保日期格式正确
        const dateStr = item.scheduleDate
        if (dateStr.length < 10) return false
        
        const itemYear = parseInt(dateStr.substring(0, 4))
        const itemMonth = parseInt(dateStr.substring(5, 7))
        
        // 只显示当前年月的排班
        return itemYear === year && itemMonth === month && item.status === '0'
      })
      
      console.log('加载日历数据成功:', {
        year,
        month,
        total: res.rows.length,
        filtered: scheduleList.value.length,
        schedules: scheduleList.value
      })
    } else {
      scheduleList.value = []
      console.warn('加载日历数据返回异常:', res)
    }
  } catch (error) {
    console.error('加载日历数据失败:', error)
    scheduleList.value = []
  } finally {
    loading.value = false
  }
}

// 上一个月
const prevMonth = () => {
  const date = dayjs(currentDate.value + '-01').subtract(1, 'month')
  currentDate.value = date.format('YYYY-MM')
  loadCalendarData()
}

// 下一个月
const nextMonth = () => {
  const date = dayjs(currentDate.value + '-01').add(1, 'month')
  currentDate.value = date.format('YYYY-MM')
  loadCalendarData()
}

// 回到今天
const goToday = () => {
  currentDate.value = dayjs().format('YYYY-MM')
  loadCalendarData()
}

// 月份改变
const handleMonthChange = () => {
  loadCalendarData()
}

// 点击日期
const handleDayClick = (day: any) => {
  if (day.otherMonth) {
    // 如果是其他月的日期，切换到那个月
    currentDate.value = dayjs(day.fullDate).format('YYYY-MM')
    loadCalendarData()
    return
  }
  
  // 打开新增/编辑对话框
  reset()
  form.scheduleDate = day.fullDate
  form.workStartTime = `${day.fullDate} 08:00:00`
  form.workEndTime = `${day.fullDate} 17:00:00`
  
  // 如果该日期已有排班，显示列表让用户选择编辑
  if (day.schedules && day.schedules.length > 0) {
    ElMessageBox.confirm(
      `该日期已有 ${day.schedules.length} 个排班，是否查看详情？`,
      '提示',
      {
        confirmButtonText: '查看详情',
        cancelButtonText: '新增排班',
        type: 'info'
      }
    ).then(() => {
      // 显示该日期的排班列表
      viewMode.value = 'table'
      queryParams.scheduleDate = day.fullDate
      getList()
    }).catch(() => {
      open.value = true
      title.value = '添加排班'
    })
  } else {
    open.value = true
    title.value = '添加排班'
  }
}

// 点击排班项
const handleScheduleClick = (schedule: AgricultureEmployeeScheduleResult) => {
  handleUpdate(schedule)
}

const form = reactive({
  scheduleId: null,
  userId: null,
  pastureId: null,
  scheduleDate: '',
  workStartTime: '',
  workEndTime: '',
  workType: 'normal',
  ruleId: null,
  taskId: null,
  status: '0',
  remark: ''
})

const rules = reactive({
  userId: [{ required: true, message: '用户不能为空', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '排班日期不能为空', trigger: 'change' }],
  workStartTime: [{ required: true, message: '工作开始时间不能为空', trigger: 'change' }],
  workEndTime: [{ required: true, message: '工作结束时间不能为空', trigger: 'change' }]
})

/** 查询排班列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureScheduleService.listSchedule(queryParams)
    if (res.code === 200) {
      scheduleList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    console.error('查询排班列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  resetForm(queryFormRef)
  handleQuery()
}

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

/** 当前页改变 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: AgricultureEmployeeScheduleResult[]) => {
  ids.value = selection.map(item => Number(item.scheduleId))
  single.value = selection.length !== 1
  multiple.value = !selection.length
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
      if (form.scheduleId != null) {
        const res = await AgricultureScheduleService.updateSchedule(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          if (viewMode.value === 'calendar') {
            loadCalendarData()
          } else {
            getList()
          }
        }
      } else {
        const res = await AgricultureScheduleService.addSchedule(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          if (viewMode.value === 'calendar') {
            loadCalendarData()
          } else {
            getList()
          }
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureEmployeeScheduleResult) => {
  const scheduleIds = row?.scheduleId || ids.value
  if (!scheduleIds || (Array.isArray(scheduleIds) && scheduleIds.length === 0)) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  await ElMessageBox.confirm('是否确认删除选中的排班数据？', '提示', {
    type: 'warning'
  })
  const res = await AgricultureScheduleService.deleteSchedule(scheduleIds)
  if (res.code === 200) {
    if (viewMode.value === 'calendar') {
      loadCalendarData()
    } else {
      getList()
    }
    ElMessage.success(res.msg)
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureScheduleService.exportExcel(queryParams))
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  Object.assign(form, {
    scheduleId: null,
    userId: null,
    pastureId: null,
    scheduleDate: '',
    workStartTime: '',
    workEndTime: '',
    workType: 'normal',
    ruleId: null,
    taskId: null,
    status: '0',
    remark: ''
  })
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
  if (!form.scheduleDate || !rule.workDays) return true
  const date = dayjs(form.scheduleDate)
  const dayOfWeek = date.day() === 0 ? '7' : String(date.day()) // 转换为1-7格式（周一到周日）
  return rule.workDays.split(',').includes(dayOfWeek)
}

/** 日期变化时处理 */
const handleDateChange = () => {
  // 如果已选择规则，检查规则是否适用，如果不适用则清空规则
  if (form.ruleId) {
    const selectedRule = ruleList.value.find(r => r.ruleId === form.ruleId)
    if (selectedRule && !isRuleApplicable(selectedRule)) {
      ElMessage.warning('所选规则不适用于该日期，已清空规则选择')
      form.ruleId = null
      form.workStartTime = ''
      form.workEndTime = ''
    }
  }
}

/** 规则选择变化时自动填充时间 */
const handleRuleChange = (ruleId: number | null) => {
  if (!ruleId) {
    // 清空规则时不清空时间，让用户手动修改
    return
  }
  
  const rule = ruleList.value.find(r => r.ruleId === ruleId)
  if (!rule) return
  
  // 检查规则是否适用于当前日期
  if (form.scheduleDate && !isRuleApplicable(rule)) {
    ElMessage.warning('所选规则不适用于该日期')
    form.ruleId = null
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

/** 获取温室列表 */
const getPastureList = async () => {
  try {
    // 温室列表需要传分页参数，获取足够多的数据
    const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      pastureList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取温室列表失败:', error)
  }
}

// 监听查询参数变化
watch(
  () => [queryParams.userId, queryParams.pastureId],
  () => {
    if (viewMode.value === 'calendar') {
      loadCalendarData()
    } else {
      handleQuery()
    }
  }
)

onMounted(() => {
  getUserList()
  getPastureList()
  getRuleList()
  if (viewMode.value === 'calendar') {
    loadCalendarData()
  } else {
    getList()
  }
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  
  .calendar-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .calendar-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0 12px;
    }
  }
  
  .calendar-legend {
    display: flex;
    gap: 20px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #606266;
      
      .legend-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 2px;
        
        &.normal {
          background-color: #409eff;
        }
        
        &.overtime {
          background-color: #e6a23c;
        }
        
        &.leave {
          background-color: #909399;
        }
      }
    }
  }
}

.calendar-container {
  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: 8px;
    
    .weekday {
      text-align: center;
      padding: 12px 0;
      font-weight: 500;
      color: #606266;
      background-color: #f5f7fa;
    }
  }
  
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #ebeef5;
    border: 1px solid #ebeef5;
    
    .calendar-day {
      min-height: 120px;
      background-color: #fff;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
        z-index: 1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      &.other-month {
        background-color: #fafafa;
        color: #c0c4cc;
      }
      
      &.today {
        background-color: #ecf5ff;
        border: 2px solid #409eff;
        
        .day-number {
          color: #409eff;
          font-weight: 600;
        }
      }
      
      &.has-schedule {
        background-color: #f0f9ff;
      }
      
      .day-number {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #303133;
      }
      
      .day-schedules {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .schedule-item {
          padding: 4px 6px;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          
          &:hover {
            opacity: 0.8;
            transform: translateX(2px);
          }
          
          &.normal {
            background-color: #409eff;
            color: #fff;
          }
          
          &.overtime {
            background-color: #e6a23c;
            color: #fff;
          }
          
          &.leave {
            background-color: #909399;
            color: #fff;
          }
          
          .schedule-time {
            font-weight: 500;
            margin-right: 4px;
          }
          
          .schedule-user {
            opacity: 0.9;
          }
        }
        
        .schedule-more {
          font-size: 11px;
          color: #909399;
          text-align: center;
          padding: 2px 0;
          cursor: pointer;
          
          &:hover {
            color: #409eff;
          }
        }
      }
    }
  }
}

// 表格视图样式优化
:deep(.el-table) {
  width: 100% !important;
  
  .el-table__body-wrapper {
    width: 100% !important;
  }
}
</style>

