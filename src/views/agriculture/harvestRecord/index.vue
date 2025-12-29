<template>
  <div class="page-content">
    <!-- 采收记录 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(queryFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="批次名称"
              prop="batchName"
              @keyup.enter="search"
              v-model="queryParams.batchName"
            />
            <form-select
              label="质量等级"
              prop="qualityLevel"
              v-model="queryParams.qualityLevel"
              :options="qualityLevelOptions"
            />
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="采收日期" prop="dateRange">
                <el-date-picker
                  v-model="queryParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-hasPermi="['agriculture:harvest:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-hasPermi="['agriculture:harvest:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 采收记录列表 -->
    <art-table
      :data="harvestList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="采收ID" prop="harvestId" width="100" v-if="columns[0].show" />
        <el-table-column label="批次名称" prop="batchName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="作物信息" width="180" align="center" v-if="columns[2].show">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <el-image
                v-if="scope.row.classImage"
                :src="scope.row.classImage"
                style="width: 40px; height: 40px; border-radius: 4px;"
                fit="cover"
              />
              <span>{{ scope.row.className || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="采收日期" prop="harvestDate" width="120" align="center" v-if="columns[3].show" />
        <el-table-column label="采收时间" prop="harvestTime" width="160" align="center" v-if="columns[4].show" />
        <el-table-column label="采收面积" prop="harvestArea" width="120" align="center" v-if="columns[5].show">
          <template #default="scope">
            {{ scope.row.harvestArea ? scope.row.harvestArea + ' 亩' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="采收重量" prop="harvestWeight" width="120" align="center" v-if="columns[6].show">
          <template #default="scope">
            {{ scope.row.harvestWeight }} 公斤
          </template>
        </el-table-column>
        <el-table-column label="采收数量" prop="harvestQuantity" width="120" align="center" v-if="columns[7].show" />
        <el-table-column label="质量等级" prop="qualityLevel" width="100" align="center" v-if="columns[8].show">
          <template #default="scope">
            <el-tag v-if="scope.row.qualityLevel === 'A'" type="success">优</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === 'B'" type="warning">良</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === 'C'">合格</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="采收负责人" prop="harvestPersonName" width="120" align="center" v-if="columns[9].show" />
        <el-table-column label="存储位置" prop="storageLocation" min-width="150" show-overflow-tooltip v-if="columns[10].show" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="warning" @click="handleBatchTask(scope.row)">
              <el-icon><List /></el-icon>批次任务
            </el-button>
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['agriculture:harvest:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['agriculture:harvest:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="harvestRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="批次" prop="batchId">
          <el-select
            v-model="form.batchId"
            placeholder="请选择批次"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="batch in batchList"
              :key="batch.batchId"
              :label="batch.batchName"
              :value="batch.batchId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采收日期" prop="harvestDate">
          <el-date-picker
            v-model="form.harvestDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="采收时间" prop="harvestTime">
          <el-date-picker
            v-model="form.harvestTime"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="采收面积" prop="harvestArea">
          <el-input-number
            v-model="form.harvestArea"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入采收面积（亩）"
          />
        </el-form-item>
        <el-form-item label="采收重量" prop="harvestWeight">
          <el-input-number
            v-model="form.harvestWeight"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入采收重量（公斤）"
          />
        </el-form-item>
        <el-form-item label="采收数量" prop="harvestQuantity">
          <el-input-number
            v-model="form.harvestQuantity"
            :min="0"
            style="width: 100%"
            placeholder="请输入采收数量"
          />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityLevel">
          <el-select v-model="form.qualityLevel" placeholder="请选择质量等级" style="width: 100%">
            <el-option label="优" value="A" />
            <el-option label="良" value="B" />
            <el-option label="合格" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="采收负责人" prop="harvestPersonId">
          <el-select
            v-model="form.harvestPersonId"
            placeholder="请选择采收负责人"
            filterable
            clearable
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
        <el-form-item label="存储位置" prop="storageLocation">
          <el-input
            v-model="form.storageLocation"
            placeholder="请输入存储位置"
          />
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

    <!-- 批次任务对话框 -->
    <el-dialog v-model="batchTask.open" :title="batchTask.title" width="1300px">
      <div style="height: 500px; width: 100%; overflow: auto">
        <Task :batchId="batchTask.batchId" :tableBorder="true" :readonly="true" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { EditPen, Delete, List } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { resetForm } from '@/utils/utils'
import { AgricultureHarvestService } from '@/api/agriculture/harvestApi'
import { AgricultureHarvestRecordResult } from '@/types/agriculture/harvest'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { UserService } from '@/api/system/userApi'
import { downloadExcel } from '@/utils/utils'
import Task from '../plan/batchTask/TaskList.vue'

const loading = ref(false)
const harvestList = ref<AgricultureHarvestRecordResult[]>([])
const open = ref(false)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const harvestRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()
const batchList = ref<any[]>([])
const userList = ref<any[]>([])

// 批次任务对话框
const batchTask = reactive({
  open: false,
  title: '',
  batchId: undefined as number | undefined
})

const columns = reactive([
  { name: '采收ID', show: true },
  { name: '批次名称', show: true },
  { name: '作物信息', show: true },
  { name: '采收日期', show: true },
  { name: '采收时间', show: true },
  { name: '采收面积', show: true },
  { name: '采收重量', show: true },
  { name: '采收数量', show: true },
  { name: '质量等级', show: true },
  { name: '采收负责人', show: true },
  { name: '存储位置', show: true }
])

const qualityLevelOptions = ref([
  { label: '优', value: 'A' },
  { label: '良', value: 'B' },
  { label: '合格', value: 'C' }
])

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
  batchName: '',
  dateRange: [] as string[],  // 改为日期范围
  qualityLevel: ''
})

const form = reactive<any>({
  harvestId: undefined,
  batchId: undefined,
  harvestDate: '',
  harvestTime: '',
  harvestArea: undefined,
  harvestWeight: undefined,
  harvestQuantity: undefined,
  qualityLevel: '',
  harvestPersonId: undefined,
  storageLocation: '',
  remark: ''
})

const rules = reactive({
  batchId: [{ required: true, message: '批次不能为空', trigger: 'change' }],
  harvestDate: [{ required: true, message: '采收日期不能为空', trigger: 'change' }],
  harvestTime: [{ required: true, message: '采收时间不能为空', trigger: 'change' }],
  harvestWeight: [{ required: true, message: '采收重量不能为空', trigger: 'blur' }]
})

/** 查询采收记录列表 */
const getList = async () => {
  loading.value = true
  try {
    let params: any = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      batchName: queryParams.batchName,
      qualityLevel: queryParams.qualityLevel
    }
    
    // 处理日期范围
    if (queryParams.dateRange && queryParams.dateRange.length === 2) {
      params.beginHarvestDate = queryParams.dateRange[0]
      params.endHarvestDate = queryParams.dateRange[1]
    }
    
    const res = await AgricultureHarvestService.listHarvest(params)
    if (res.code === 200) {
      harvestList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    console.error('查询采收记录列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const search = () => {
  queryParams.pageNum = 1
  getList()
}

const handleQuery = search

/** 重置按钮操作 */
const resetQuery = () => {
  resetForm(queryFormRef.value)
  search()
}

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  getList()
}

/** 当前页改变 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: AgricultureHarvestRecordResult[]) => {
  ids.value = selection.map(item => Number(item.harvestId))
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加采收记录'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureHarvestRecordResult) => {
  reset()
  open.value = true
  title.value = '修改采收记录'
  const res = await AgricultureHarvestService.getHarvest(row.harvestId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!harvestRef.value) return
  await harvestRef.value.validate(async (valid) => {
    if (valid) {
      if (form.harvestId != null) {
        const res = await AgricultureHarvestService.updateHarvest(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureHarvestService.addHarvest(form)
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
const handleDelete = async (row: AgricultureHarvestRecordResult) => {
  const harvestId = row.harvestId
  await ElMessageBox.confirm('是否确认删除采收记录编号为"' + harvestId + '"的数据项？')
  const res = await AgricultureHarvestService.deleteHarvest(harvestId)
  if (res.code === 200) {
    getList()
    ElMessage.success(res.msg)
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureHarvestService.exportExcel(queryParams))
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  Object.assign(form, {
    harvestId: undefined,
    batchId: undefined,
    harvestDate: '',
    harvestTime: '',
    harvestArea: undefined,
    harvestWeight: undefined,
    harvestQuantity: undefined,
    qualityLevel: '',
    harvestPersonId: undefined,
    storageLocation: '',
    remark: ''
  })
  harvestRef.value?.resetFields()
}

/** 获取批次列表 */
const getBatchList = async () => {
  try {
    const res = await AgricultureCropBatchService.listBatch({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      batchList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取批次列表失败:', error)
  }
}

/** 获取用户列表（只获取采收质量管理部门的人员，deptId=104） */
const getUserList = async () => {
  try {
    const res = await UserService.listUser({ status: '0', deptId: 104, pageSize: 1000 })
    if (res.code === 200) {
      userList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

/** 查看批次任务详情 */
const handleBatchTask = (row: AgricultureHarvestRecordResult) => {
  batchTask.open = true
  batchTask.title = '批次任务详情'
  batchTask.batchId = row.batchId ? Number(row.batchId) : undefined
}

onMounted(() => {
  getList()
  getBatchList()
  getUserList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}
</style>

