<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="resetForm(queryRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="规则名称"
              prop="ruleName"
              v-model="queryParams.ruleName"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-hasPermi="['agriculture:scheduleRule:add']" v-ripple>新增</el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-hasPermi="['agriculture:scheduleRule:remove']"
          v-ripple
        >删除</el-button>
        <el-button @click="handleExport" v-hasPermi="['agriculture:scheduleRule:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="ruleList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="ruleId"
    >
      <template #default>
        <el-table-column label="规则ID" prop="ruleId" align="center" v-if="columns[0].show" />
        <el-table-column label="规则名称" prop="ruleName" align="center" v-if="columns[1].show" />
        <el-table-column label="工作日" prop="workDays" align="center" v-if="columns[2].show">
          <template #default="scope">
            {{ formatWorkDays(scope.row.workDays) }}
          </template>
        </el-table-column>
        <el-table-column label="工作开始时间" prop="workStartTime" align="center" v-if="columns[3].show" />
        <el-table-column label="工作结束时间" prop="workEndTime" align="center" v-if="columns[4].show" />
        <el-table-column label="休息时间" align="center" v-if="columns[5].show">
          <template #default="scope">
            <span v-if="scope.row.breakStartTime && scope.row.breakEndTime">
              {{ scope.row.breakStartTime }}-{{ scope.row.breakEndTime }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="每日最大工作小时" prop="maxWorkHoursPerDay" align="center" v-if="columns[6].show" />
        <el-table-column label="每周最大工作天数" prop="maxWorkDaysPerWeek" align="center" v-if="columns[7].show" />
        <el-table-column label="状态" prop="status" align="center" v-if="columns[8].show">
          <template #default="scope">
            <dict-tag :options="statusOptions" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['agriculture:scheduleRule:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:scheduleRule:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="ruleRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="工作日" prop="workDays">
          <el-checkbox-group v-model="selectedDays">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="7">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="工作开始时间" prop="workStartTime">
          <el-time-picker
            v-model="form.workStartTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="工作结束时间" prop="workEndTime">
          <el-time-picker
            v-model="form.workEndTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="休息开始时间" prop="breakStartTime">
          <el-time-picker
            v-model="form.breakStartTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择休息开始时间（可选）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="休息结束时间" prop="breakEndTime">
          <el-time-picker
            v-model="form.breakEndTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择休息结束时间（可选）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每日最大工作小时" prop="maxWorkHoursPerDay">
          <el-input-number
            v-model="form.maxWorkHoursPerDay"
            :min="0"
            :max="24"
            :precision="2"
            placeholder="请输入每日最大工作小时数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每周最大工作天数" prop="maxWorkDaysPerWeek">
          <el-input-number
            v-model="form.maxWorkDaysPerWeek"
            :min="0"
            :max="7"
            placeholder="请输入每周最大工作天数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="'0'">正常</el-radio>
            <el-radio :value="'1'">停用</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureScheduleRuleService, AgricultureScheduleRuleResult } from '@/api/agriculture/scheduleRuleApi'
import { downloadExcel, resetForm } from '@/utils/utils'
import { useDict } from '@/utils/dict'

const { sys_normal_disable } = useDict('sys_normal_disable')
const statusOptions = sys_normal_disable

const loading = ref(false)
const ruleList = ref<AgricultureScheduleRuleResult[]>([])
const open = ref(false)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const ruleRef = ref<FormInstance>()
const queryRef = ref<FormInstance>()
const selectedDays = ref<string[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ruleName: '',
  status: ''
})

const columns = reactive([
  { name: '规则ID', show: true },
  { name: '规则名称', show: true },
  { name: '工作日', show: true },
  { name: '工作开始时间', show: true },
  { name: '工作结束时间', show: true },
  { name: '休息时间', show: true },
  { name: '每日最大工作小时', show: true },
  { name: '每周最大工作天数', show: true },
  { name: '状态', show: true }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  ruleId: null,
  ruleName: '',
  workDays: '',
  workStartTime: '',
  workEndTime: '',
  breakStartTime: '',
  breakEndTime: '',
  maxWorkHoursPerDay: 8.0,
  maxWorkDaysPerWeek: 5,
  status: '0',
  remark: ''
}

const form = reactive({ ...initialFormState })

const rules = reactive({
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  workDays: [{ required: true, message: '请选择工作日', trigger: 'change' }],
  workStartTime: [{ required: true, message: '工作开始时间不能为空', trigger: 'change' }],
  workEndTime: [{ required: true, message: '工作结束时间不能为空', trigger: 'change' }]
})

// 格式化工作日显示
const formatWorkDays = (workDays: string) => {
  if (!workDays) return '-'
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

/** 查询排班规则列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureScheduleRuleService.listRule(queryParams)
    if (res.code === 200) {
      ruleList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    console.error('查询排班规则列表失败:', error)
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
  resetForm(queryRef)
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
const handleSelectionChange = (selection: AgricultureScheduleRuleResult[]) => {
  ids.value = selection.map(item => Number(item.ruleId))
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加排班规则'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureScheduleRuleResult) => {
  reset()
  open.value = true
  title.value = '修改排班规则'
  const res = await AgricultureScheduleRuleService.getRule(row.ruleId!)
  if (res.code === 200) {
    Object.assign(form, res.data)
    selectedDays.value = res.data.workDays ? res.data.workDays.split(',') : []
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!ruleRef.value) return
  await ruleRef.value.validate(async (valid: boolean) => {
    if (valid) {
      form.workDays = selectedDays.value.join(',')
      if (form.ruleId) {
        const res = await AgricultureScheduleRuleService.updateRule(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureScheduleRuleService.addRule(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row?: AgricultureScheduleRuleResult) => {
  const ruleIds = row ? [row.ruleId!] : ids.value
  if (ruleIds.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  await ElMessageBox.confirm('是否确认删除排班规则编号为"' + ruleIds.join(',') + '"的数据项？')
  try {
    const res = await AgricultureScheduleRuleService.deleteRule(ruleIds)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      getList()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await downloadExcel(AgricultureScheduleRuleService.exportExcel(queryParams), '排班规则.xlsx')
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, initialFormState)
  selectedDays.value = []
  if (ruleRef.value) {
    ruleRef.value.resetFields()
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>

