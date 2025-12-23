<template>
    <div class="task-detail-calendar">
        <!-- 任务名称 -->
        <div class="task-title">
            {{ form.batchName }} / {{ form.taskName }}
        </div>

        <!-- 区域一：头部信息栏 -->
        <TaskHeader 
            :form="form" 
            :userList="userList" 
            :readonly="props.readonly"
            @update="handleFormUpdate"
            @submit="handleSubmit"
        />

        <!-- 主体区域：日历 + 详情 -->
        <div class="main-content">
            <!-- 区域二：左侧日历导航 -->
            <div class="calendar-nav-wrapper">
                <CalendarNav
                    :planStart="form.planStart || ''"
                    :planFinish="form.planFinish || ''"
                    :actualStart="form.actualStart || ''"
                    :actualFinish="form.actualFinish || ''"
                    :selectedDate="selectedDate"
                    :dailySummary="dailySummary"
                    @select-date="handleSelectDate"
                />
                <!-- 进度统计 -->
                <div class="stats-panel">
                    <div class="stats-title">进度统计</div>
                    <div class="stats-item">
                        <span class="stats-label">已记录天数</span>
                        <span class="stats-value">
                            <template v-if="!form.actualStart">--</template>
                            <template v-else-if="form.actualFinish">{{ recordedDays }}/{{ totalDays }} 天</template>
                            <template v-else>{{ recordedDays }} 天</template>
                        </span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">累计工时</span>
                        <span class="stats-value">{{ totalWorkHours }} 小时</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">农资使用</span>
                        <span class="stats-value">{{ totalMaterialCount }} 次</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">附件数量</span>
                        <span class="stats-value">{{ totalAttachmentCount }} 个</span>
                    </div>
                </div>
            </div>

            <!-- 区域三：右侧日期详情面板 -->
            <div class="date-detail-wrapper">
                <DateDetail
                    :selectedDate="selectedDate"
                    :taskId="props.taskId"
                    :batchId="form.batchId || props.batchId"
                    :taskEmployeeList="selectedEmployeeObjects"
                    :currentUser="currentUser"
                    :readonly="props.readonly"
                    @log="fetchLogList"
                    @refresh-summary="fetchDailySummary"
                />
            </div>
        </div>

        <!-- 区域四：底部折叠区域 -->
        <TaskFooter
            :form="form"
            :userList="userList"
            :selectEmployeeList="selectEmployeeList"
            :logList="logList"
            :readonly="props.readonly"
            @update-remark="handleRemarkUpdate"
            @employee-change="handleTaskEmployeeChange"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import TaskHeader from './components/TaskHeader.vue'
import CalendarNav from './components/CalendarNav.vue'
import DateDetail from './components/DateDetail.vue'
import TaskFooter from './components/TaskFooter.vue'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgricultureCropBatchTaskService } from '@/api/agriculture/cropBatchTaskApi'
import { AgricultureTaskEmployeeService } from '@/api/agriculture/taskEmployeeApi'
import { AgricultureTaskLogService } from '@/api/agriculture/logApi'
import { AgricultureCostEmployeeService } from '@/api/agriculture/costEmployeeApi'
import { AgricultureResourceUsageService } from '@/api/agriculture/resourceUsageApi'
import { AgricultureTaskAttachmentService } from '@/api/agriculture/taskAttachmentApi'
import { UserService } from '@/api/system/userApi'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
    taskId: {
        type: Number,
        required: true
    },
    oprType: {
        type: String,
        default: 'update'
    },
    batchId: {
        type: Number
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'updated'])

// 用户store
const userStore = useUserStore()
const currentUser = {
    userId: userStore.info.id,
    userName: userStore.info.nickName || userStore.info.userName || userStore.info.name || ''
}

// 表单数据
const initialFormState = {
    taskId: null,
    batchId: null,
    taskName: null,
    batchName: null,
    planStart: null,
    planFinish: null,
    actualStart: null,
    actualFinish: null,
    taskDetail: null,
    taskImages: [],
    taskVideos: [],
    remark: null,
    status: '0',
    responsiblePersonId: null,
    responsiblePersonName: null
}
const form = reactive({ ...initialFormState })

// 用户列表
const userList = ref([])
// 日志列表
const logList = ref([])
// 选中的员工列表
const selectEmployeeList = ref([])
// userId到taskEmployeeId的映射
const userIdToTaskEmployeeId = ref({})
// 当前选中日期
const selectedDate = ref('')
// 每日汇总数据
const dailySummary = ref({})
// 统计数据
const totalWorkHours = ref(0)
const totalMaterialCount = ref(0)
const totalAttachmentCount = ref(0)

// 计算属性 - 总天数：基于实际开始/结束时间计算
const totalDays = computed(() => {
    // 如果没有实际开始时间，返回0
    if (!form.actualStart) return 0
    
    const start = new Date(form.actualStart.split(' ')[0])
    start.setHours(0, 0, 0, 0)
    
    // 如果有实际结束时间，计算实际开始到实际结束的天数
    if (form.actualFinish) {
        const end = new Date(form.actualFinish.split(' ')[0])
        end.setHours(0, 0, 0, 0)
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    }
    
    // 如果只有实际开始时间，计算从实际开始到今天的天数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((today - start) / (1000 * 60 * 60 * 24)) + 1
})

// 已记录天数：在实际时间范围内有记录的天数
const recordedDays = computed(() => {
    if (!form.actualStart) return 0
    
    const start = new Date(form.actualStart.split(' ')[0])
    start.setHours(0, 0, 0, 0)
    
    let end
    if (form.actualFinish) {
        end = new Date(form.actualFinish.split(' ')[0])
    } else {
        end = new Date()
    }
    end.setHours(0, 0, 0, 0)
    
    // 统计在实际时间范围内有记录的天数
    return Object.keys(dailySummary.value).filter(date => {
        const dateObj = new Date(date)
        dateObj.setHours(0, 0, 0, 0)
        // 只统计在实际时间范围内的记录
        if (dateObj < start || dateObj > end) return false
        const summary = dailySummary.value[date]
        return summary.hasWorkHours || summary.hasMaterial || summary.hasAttachment
    }).length
})

const selectedEmployeeObjects = computed(() =>
    userList.value.filter(user => selectEmployeeList.value.includes(user.userId))
)

// 获取任务详情
const fetchTaskDetail = async () => {
    if (!props.taskId) return
    try {
        const response = await AgricultureCropBatchTaskService.getBatchTask(props.taskId)
        if (response.data) {
            Object.assign(form, response.data)
            // 处理图片和视频字段
            if (typeof form.taskImages === 'string') {
                form.taskImages = form.taskImages ? form.taskImages.split(',') : []
            } else {
                form.taskImages = form.taskImages || []
            }
            if (typeof form.taskVideos === 'string') {
                form.taskVideos = form.taskVideos ? form.taskVideos.split(',') : []
            } else {
                form.taskVideos = form.taskVideos || []
            }
            // 获取批次名称
            if (response.data.batchId) {
                const batchResponse = await AgricultureCropBatchService.getBatch(response.data.batchId)
                if (batchResponse.data) {
                    form.batchName = batchResponse.data.batchName
                }
            }
            // 默认选中今天或任务开始日期
            initSelectedDate()
        }
    } catch (error) {
        console.error('获取任务详情失败:', error)
    }
}

// 初始化选中日期：按实际开始时间选择，无则不选
const initSelectedDate = () => {
    // 如果有实际开始时间，默认选中实际开始时间
    if (form.actualStart) {
        selectedDate.value = form.actualStart.split(' ')[0]
    } else {
        // 没有实际开始时间，不选择任何日期
        selectedDate.value = ''
    }
}

// 获取用户列表
const fetchUserList = async () => {
    try {
        const firstRes = await UserService.listUser({ pageNum: 1, pageSize: 100 })
        if (firstRes.code === 200) {
            const total = firstRes.total || 0
            const firstPageRows = firstRes.rows || []
            if (total <= 100) {
                userList.value = firstPageRows.map(item => ({
                    ...item,
                    userId: Number(item.userId),
                    nickName: item.nickName
                }))
                return
            }
            const allUsers = [...firstPageRows]
            const totalPages = Math.ceil(total / 100)
            const promises = []
            for (let page = 2; page <= totalPages; page++) {
                promises.push(UserService.listUser({ pageNum: page, pageSize: 100 }))
            }
            const results = await Promise.all(promises)
            results.forEach((res) => {
                if (res.code === 200 && res.rows) {
                    allUsers.push(...res.rows)
                }
            })
            userList.value = allUsers.map(item => ({
                ...item,
                userId: Number(item.userId),
                nickName: item.nickName
            }))
        }
    } catch (error) {
        console.error('获取用户列表失败:', error)
    }
}

// 获取日志列表
const fetchLogList = async () => {
    const response = await AgricultureTaskLogService.listByTaskId(props.taskId)
    logList.value = response?.rows || []
}

// 获取任务员工
const fetchTaskEmployee = async () => {
    if (!userList.value.length) {
        await fetchUserList()
    }
    try {
        const res = await AgricultureTaskEmployeeService.listEmployee({ taskId: props.taskId })
        const filtered = (res.rows || []).filter(item => String(item.taskId) === String(props.taskId))
        const map = {}
        filtered.forEach(item => {
            const userId = item.userId || item.employeeId
            map[Number(userId)] = item.id
        })
        userIdToTaskEmployeeId.value = map
        const ids = [...new Set(filtered.map(item => Number(item.userId || item.employeeId)))]
        selectEmployeeList.value = ids
    } catch (e) {
        console.error('fetchTaskEmployee error:', e)
    }
}

// 获取每日汇总数据
const fetchDailySummary = async () => {
    if (!form.planStart || !form.planFinish) return
    
    const summary = {}
    let workHoursTotal = 0
    let materialTotal = 0
    let attachmentTotal = 0
    
    try {
        // 获取工时数据
        const workHoursRes = await AgricultureCostEmployeeService.listEmployee({ 
            taskId: props.taskId,
            pageNum: 1,
            pageSize: 9999
        })
        if (workHoursRes.rows) {
            workHoursRes.rows.forEach(item => {
                const date = item.workingStart ? item.workingStart.split(' ')[0] : null
                if (date) {
                    if (!summary[date]) {
                        summary[date] = { hasWorkHours: false, hasMaterial: false, hasAttachment: false }
                    }
                    summary[date].hasWorkHours = true
                    workHoursTotal += Number(item.workingHours) || 0
                }
            })
        }
        
        // 获取农资使用数据
        const materialRes = await AgricultureResourceUsageService.getUsageByTaskId(props.taskId)
        if (materialRes.data) {
            materialRes.data.forEach(item => {
                const date = item.usageDate ? item.usageDate.split(' ')[0] : null
                if (date) {
                    if (!summary[date]) {
                        summary[date] = { hasWorkHours: false, hasMaterial: false, hasAttachment: false }
                    }
                    summary[date].hasMaterial = true
                    materialTotal++
                }
            })
        }
        
        // 获取按日期附件数据
        const attachmentRes = await AgricultureTaskAttachmentService.listByTask(props.taskId)
        if (attachmentRes.data) {
            attachmentRes.data.forEach(item => {
                const date = item.attachmentDate ? item.attachmentDate.split(' ')[0] : null
                if (date) {
                    if (!summary[date]) {
                        summary[date] = { hasWorkHours: false, hasMaterial: false, hasAttachment: false }
                    }
                    summary[date].hasAttachment = true
                    attachmentTotal++
                }
            })
        }
        
    } catch (error) {
        console.error('获取汇总数据失败:', error)
    }
    
    dailySummary.value = summary
    totalWorkHours.value = workHoursTotal
    totalMaterialCount.value = materialTotal
    totalAttachmentCount.value = attachmentTotal
}

// 处理日期选择
const handleSelectDate = (date) => {
    selectedDate.value = date
}

// 处理表单更新
const handleFormUpdate = (field, value) => {
    form[field] = value
}

// 添加任务日志
const addTaskLog = async (des) => {
    await AgricultureTaskLogService.addLog({
        taskId: props.taskId,
        operDes: des,
        operName: currentUser.userName,
        operId: currentUser.userId,
        createBy: currentUser.userId,
        updateBy: currentUser.userId
    })
    await fetchLogList()
}

// 处理提交
const handleSubmit = async () => {
    if (props.readonly) return
    try {
        const submitData = { ...form }
        if (Array.isArray(submitData.taskImages)) {
            submitData.taskImages = submitData.taskImages.join(',')
        }
        if (Array.isArray(submitData.taskVideos)) {
            submitData.taskVideos = submitData.taskVideos.join(',')
        }
        await AgricultureCropBatchTaskService.updateBatchTask(submitData)
        await addTaskLog('完善项目信息')
        emit('updated')
    } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败')
    }
}

// 处理备注更新
const handleRemarkUpdate = async (remark) => {
    form.remark = remark
    await handleSubmit()
}

// 处理员工变更
const handleTaskEmployeeChange = async (e) => {
    const { type, value } = e
    if (type === 'add') {
        await AgricultureTaskEmployeeService.addEmployee({
            taskId: props.taskId,
            userId: value
        })
        await addTaskLog('增加参与人员')
        ElMessage.success('添加成功')
        await fetchTaskEmployee()
    } else if (type === 'del') {
        const taskEmployeeId = userIdToTaskEmployeeId.value[Number(value)]
        if (!taskEmployeeId) {
            ElMessage.error('未找到对应的任务员工记录，无法删除')
            return
        }
        await AgricultureTaskEmployeeService.deleteEmployee(taskEmployeeId)
        await addTaskLog('删除参与人员')
        ElMessage.success('删除成功')
        await fetchTaskEmployee()
    }
}

// 初始化
const initData = async () => {
    await Promise.all([
        fetchUserList(),
        fetchLogList()
    ])
    await fetchTaskDetail()
    await fetchTaskEmployee()
    await fetchDailySummary()
}

onMounted(() => {
    initData()
})
</script>

<style lang="scss" scoped>
.task-detail-calendar {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .task-title {
        font-size: 14px;
        color: #606266;
        padding: 0 0 15px 0;
        border-bottom: 1px solid #ebeef5;
        margin-bottom: 15px;
    }
    
    .main-content {
        display: flex;
        flex: 1;
        min-height: 0;
        gap: 15px;
        margin-top: 15px;
        
        .calendar-nav-wrapper {
            width: 400px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            
            .stats-panel {
                margin-top: 15px;
                padding: 15px;
                background: #f5f7fa;
                border-radius: 4px;
                
                .stats-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 12px;
                    color: #303133;
                }
                
                .stats-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 13px;
                    
                    .stats-label {
                        color: #606266;
                    }
                    
                    .stats-value {
                        color: #409eff;
                        font-weight: 500;
                    }
                }
            }
        }
        
        .date-detail-wrapper {
            flex: 1;
            min-width: 0;
            overflow-y: auto;
            border: 1px solid #ebeef5;
            border-radius: 4px;
            padding: 15px;
        }
    }
}
</style>
