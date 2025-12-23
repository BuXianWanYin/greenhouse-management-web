<template>
    <div class="daily-work-hours">
        <div class="section-header">
            <span class="section-title">当日工时记录</span>
            <el-button 
                v-if="!props.readonly"
                type="primary" 
                size="small" 
                @click="handleAdd"
            >
                新增
            </el-button>
        </div>
        
        <el-table
            v-loading="loading"
            :data="workHoursList"
            size="small"
            empty-text="暂无工时记录"
            style="width: 100%"
        >
            <el-table-column label="员工" align="center" prop="nickName" min-width="100">
                <template #default="{ row }">
                    {{ row.nickName || getEmployeeName(row.userId) }}
                </template>
            </el-table-column>
            <el-table-column label="排班时间" align="center" min-width="140">
                <template #default="{ row }">
                    <span v-if="row.scheduleStartTime && row.scheduleEndTime">
                        {{ formatTime(row.scheduleStartTime) }} - {{ formatTime(row.scheduleEndTime) }}
                    </span>
                    <span v-else style="color: #909399">无排班</span>
                </template>
            </el-table-column>
            <el-table-column label="计划工时" align="center" prop="planHours" min-width="90">
                <template #default="{ row }">
                    {{ row.planHours ? row.planHours + 'h' : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="实际工时" align="center" prop="actualHours" min-width="90">
                <template #default="{ row }">
                    {{ row.actualHours ? row.actualHours + 'h' : (row.workingHours ? row.workingHours * 8 + 'h' : '-') }}
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                    {{ row.remark || '-' }}
                </template>
            </el-table-column>
            <el-table-column 
                v-if="!props.readonly"
                label="操作" 
                align="center" 
                width="100"
                fixed="right"
            >
                <template #default="{ row }">
                    <el-button size="small" type="primary" link @click="handleEdit(row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" link @click="handleDelete(row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="450px"
            append-to-body
        >
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="80px"
            >
                <el-form-item label="员工" prop="userId">
                    <el-select
                        v-model="form.userId"
                        placeholder="请选择员工"
                        clearable
                        filterable
                        style="width: 100%"
                        @change="handleEmployeeChange"
                    >
                        <el-option
                            v-for="item in props.taskEmployeeList"
                            :key="item.userId"
                            :label="item.nickName"
                            :value="item.userId"
                        />
                    </el-select>
                </el-form-item>
                
                <!-- 排班信息展示 -->
                <el-form-item v-if="scheduleInfo.hasSchedule" label="排班信息">
                    <el-tag type="success" size="large">
                        {{ formatTime(scheduleInfo.workStartTime) }} - {{ formatTime(scheduleInfo.workEndTime) }}
                        （{{ getWorkTypeText(scheduleInfo.workType) }}）
                    </el-tag>
                </el-form-item>
                
                <el-form-item v-if="scheduleInfo.hasSchedule" label="计划工时">
                    <el-input :model-value="scheduleInfo.planHours" disabled>
                        <template #append>小时</template>
                    </el-input>
                </el-form-item>
                
                <!-- 无排班提示 -->
                <el-alert
                    v-if="form.userId && !scheduleInfo.hasSchedule && !scheduleLoading"
                    title="该员工当日无排班记录，请手动录入工时"
                    type="warning"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 12px"
                />
                
                <el-form-item label="实际工时" prop="actualHours">
                    <el-input 
                        v-model="form.actualHours" 
                        type="number"
                        :min="0" 
                        :max="24"
                        placeholder="请输入实际工时"
                    >
                        <template #append>小时</template>
                    </el-input>
                </el-form-item>
                
                <el-form-item label="工作日期">
                    <el-input :model-value="props.selectedDate" disabled />
                </el-form-item>
                
                <el-form-item label="备注" prop="remark">
                    <el-input 
                        v-model="form.remark" 
                        type="textarea"
                        :rows="2"
                        :placeholder="getRemarkPlaceholder"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgricultureCostEmployeeService } from '@/api/agriculture/costEmployeeApi'
import { AgricultureTaskLogService } from '@/api/agriculture/logApi'

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true
    },
    selectedDate: {
        type: String,
        default: ''
    },
    taskEmployeeList: {
        type: Array,
        default: () => []
    },
    currentUser: {
        type: Object,
        required: true
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['log', 'refresh'])

const loading = ref(false)
const workHoursList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增工时')
const formRef = ref(null)

const form = reactive({
    costId: null,
    taskId: props.taskId,
    userId: '',
    scheduleId: null,
    workingHours: null,
    planHours: null,
    actualHours: null,
    workStartTime: '',
    workEndTime: '',
    remark: ''
})

// 排班信息
const scheduleInfo = reactive({
    hasSchedule: false,
    schedule: null,
    scheduleId: null,
    planHours: 0,
    workType: '',
    workStartTime: '',
    workEndTime: ''
})
const scheduleLoading = ref(false)

const rules = {
    userId: [{ required: true, message: '请选择员工', trigger: 'change' }],
    actualHours: [{ required: true, message: '请输入实际工时', trigger: 'blur' }]
}

// 备注提示文字（当实际工时与计划工时不一致时提示）
const getRemarkPlaceholder = computed(() => {
    if (scheduleInfo.hasSchedule && form.actualHours && form.actualHours != scheduleInfo.planHours) {
        return '实际工时与计划工时不一致，请填写调整原因（如加班等）'
    }
    return '可填写备注信息'
})

// 获取当日工时列表
const getList = async () => {
    if (!props.selectedDate) return
    loading.value = true
    try {
        const response = await AgricultureCostEmployeeService.listEmployee({
            taskId: props.taskId,
            pageNum: 1,
            pageSize: 9999
        })
        // 筛选当日数据
        workHoursList.value = (response.rows || []).filter(item => {
            const start = item.workingStart ? item.workingStart.split(' ')[0] : ''
            return start === props.selectedDate
        })
    } finally {
        loading.value = false
    }
}

// 获取员工名称
const getEmployeeName = (employeeId) => {
    const employee = props.taskEmployeeList.find(item => item.userId == employeeId)
    return employee?.nickName || '-'
}

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return dateStr.split(' ')[0]
}

// 员工变更时查询排班
const handleEmployeeChange = async (userId) => {
    if (!userId || !props.selectedDate) {
        resetScheduleInfo()
        return
    }
    
    scheduleLoading.value = true
    try {
        const res = await AgricultureCostEmployeeService.getScheduleInfo({
            userId,
            scheduleDate: props.selectedDate,
            taskId: props.taskId
        })
        
        if (res.code === 200 && res.data) {
            Object.assign(scheduleInfo, res.data)
            
            // 如果有排班，自动填充工时
            if (res.data.hasSchedule) {
                form.scheduleId = res.data.scheduleId
                form.actualHours = res.data.planHours
                form.planHours = res.data.planHours
                form.workStartTime = res.data.workStartTime
                form.workEndTime = res.data.workEndTime
            } else {
                form.scheduleId = null
                form.planHours = null
            }
        }
    } catch (error) {
        console.error('获取排班信息失败:', error)
    } finally {
        scheduleLoading.value = false
    }
}

// 重置排班信息
const resetScheduleInfo = () => {
    Object.assign(scheduleInfo, {
        hasSchedule: false,
        schedule: null,
        scheduleId: null,
        planHours: 0,
        workType: '',
        workStartTime: '',
        workEndTime: ''
    })
}

// 格式化时间显示 HH:mm
const formatTime = (datetime) => {
    if (!datetime) return ''
    if (typeof datetime === 'string') {
        return datetime.substring(11, 16)
    }
    return ''
}

// 获取工作类型文本
const getWorkTypeText = (workType) => {
    const typeMap = {
        'normal': '正常班',
        'leave': '请假',
        'rest': '休息'
    }
    return typeMap[workType] || '正常班'
}

// 新增
const handleAdd = () => {
    resetForm()
    resetScheduleInfo()
    dialogTitle.value = '新增工时'
    dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
    resetForm()
    resetScheduleInfo()
    const response = await AgricultureCostEmployeeService.getEmployee(row.costId)
    if (response.data) {
        Object.assign(form, {
            costId: response.data.costId,
            taskId: response.data.taskId,
            userId: response.data.userId,
            scheduleId: response.data.scheduleId,
            workingHours: response.data.workingHours,
            planHours: response.data.planHours,
            actualHours: response.data.actualHours || (response.data.workingHours ? response.data.workingHours * 8 : null),
            workStartTime: response.data.workStartTime,
            workEndTime: response.data.workEndTime,
            remark: response.data.remark || ''
        })
        // 如果有员工ID，查询排班信息
        if (response.data.userId) {
            await handleEmployeeChange(response.data.userId)
        }
    }
    dialogTitle.value = '编辑工时'
    dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确认删除该工时记录？', '提示', {
            type: 'warning'
        })
        await AgricultureCostEmployeeService.deleteEmployee(row.costId)
        ElMessage.success('删除成功')
        await addTaskLog('删除人工工时')
        getList()
        emit('refresh')
    } catch (e) {
        // 取消删除
    }
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 自动使用当前选中日期作为开始和结束日期
                // 排除workStartTime和workEndTime（排班信息仅用于展示，不存储）
                const { workStartTime, workEndTime, ...restForm } = form
                const submitData = {
                    ...restForm,
                    workingStart: props.selectedDate,
                    workingFinish: props.selectedDate
                }
                
                if (form.costId) {
                    await AgricultureCostEmployeeService.updateEmployee(submitData)
                    ElMessage.success('修改成功')
                    await addTaskLog('修改人工工时')
                } else {
                    await AgricultureCostEmployeeService.addEmployee(submitData)
                    ElMessage.success('新增成功')
                    await addTaskLog('新增人工工时')
                }
                dialogVisible.value = false
                getList()
                emit('refresh')
            } catch (error) {
                console.error('操作失败:', error)
            }
        }
    })
}

// 重置表单
const resetForm = () => {
    form.costId = null
    form.taskId = props.taskId
    form.userId = ''
    form.scheduleId = null
    form.workingHours = null
    form.planHours = null
    form.actualHours = null
    form.workStartTime = ''
    form.workEndTime = ''
    form.remark = ''
    formRef.value?.resetFields()
}

// 添加日志
const addTaskLog = async (des) => {
    await AgricultureTaskLogService.addLog({
        taskId: props.taskId,
        operDes: des,
        operName: props.currentUser.userName,
        operId: props.currentUser.userId,
        createBy: props.currentUser.userId,
        updateBy: props.currentUser.userId
    })
    emit('log')
}

// 监听日期变化，重新获取数据
watch(() => props.selectedDate, () => {
    getList()
}, { immediate: true })

// 监听taskId变化
watch(() => props.taskId, () => {
    form.taskId = props.taskId
    getList()
})
</script>

<style lang="scss" scoped>
.daily-work-hours {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .section-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }
    }
}
</style>
