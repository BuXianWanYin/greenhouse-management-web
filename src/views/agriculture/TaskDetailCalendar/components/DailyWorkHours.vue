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
        >
            <el-table-column label="雇员" align="center" prop="employeeId" min-width="100">
                <template #default="{ row }">
                    {{ getEmployeeName(row.employeeId) }}
                </template>
            </el-table-column>
            <el-table-column label="工时(天)" align="center" prop="workingHours" width="100" />
            <el-table-column label="开始日期" align="center" prop="workingStart" width="120">
                <template #default="{ row }">
                    {{ formatDate(row.workingStart) }}
                </template>
            </el-table-column>
            <el-table-column label="结束日期" align="center" prop="workingFinish" width="120">
                <template #default="{ row }">
                    {{ formatDate(row.workingFinish) }}
                </template>
            </el-table-column>
            <el-table-column 
                v-if="!props.readonly"
                label="操作" 
                align="center" 
                width="120"
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
                <el-form-item label="雇员" prop="employeeId">
                    <el-select
                        v-model="form.employeeId"
                        placeholder="请选择雇员"
                        clearable
                        filterable
                        style="width: 100%"
                    >
                        <el-option
                            v-for="item in props.taskEmployeeList"
                            :key="item.userId"
                            :label="item.nickName"
                            :value="item.userId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="工时" prop="workingHours">
                    <el-input v-model="form.workingHours" placeholder="请输入工时">
                        <template #append>天</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="开始日期" prop="workingStart">
                    <el-date-picker
                        v-model="form.workingStart"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="选择开始日期"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="结束日期" prop="workingFinish">
                    <el-date-picker
                        v-model="form.workingFinish"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="选择结束日期"
                        style="width: 100%"
                        :disabled-date="disableFinishDate"
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
import { ref, reactive, watch } from 'vue'
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
    employeeId: '',
    workingHours: null,
    workingStart: '',
    workingFinish: ''
})

const rules = {
    employeeId: [{ required: true, message: '请选择雇员', trigger: 'change' }],
    workingHours: [{ required: true, message: '请输入工时', trigger: 'blur' }],
    workingStart: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    workingFinish: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

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

// 获取雇员名称
const getEmployeeName = (employeeId) => {
    const employee = props.taskEmployeeList.find(item => item.userId == employeeId)
    return employee?.nickName || '-'
}

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return dateStr.split(' ')[0]
}

// 新增
const handleAdd = () => {
    resetForm()
    form.workingStart = props.selectedDate
    form.workingFinish = props.selectedDate
    dialogTitle.value = '新增工时'
    dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
    resetForm()
    const response = await AgricultureCostEmployeeService.getEmployee(row.costId)
    if (response.data) {
        Object.assign(form, {
            costId: response.data.costId,
            taskId: response.data.taskId,
            employeeId: response.data.employeeId,
            workingHours: response.data.workingHours,
            workingStart: response.data.workingStart ? response.data.workingStart.split(' ')[0] : '',
            workingFinish: response.data.workingFinish ? response.data.workingFinish.split(' ')[0] : ''
        })
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
                if (form.costId) {
                    await AgricultureCostEmployeeService.updateEmployee(form)
                    ElMessage.success('修改成功')
                    await addTaskLog('修改人工工时')
                } else {
                    await AgricultureCostEmployeeService.addEmployee(form)
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
    form.employeeId = ''
    form.workingHours = null
    form.workingStart = ''
    form.workingFinish = ''
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

// 结束日期不能早于开始日期
const disableFinishDate = (date) => {
    if (!form.workingStart) return false
    const start = new Date(form.workingStart)
    start.setHours(0, 0, 0, 0)
    const check = new Date(date)
    check.setHours(0, 0, 0, 0)
    return check < start
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
