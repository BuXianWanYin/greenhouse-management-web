<template>
  <div class="app-container-sm">
    <!-- 查询表单 -->
    <el-card class="card-margin-bottom">
      <el-form
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        v-show="showSearch"
        label-width="80px"
        class="form-minus-bottom"
      >
        <el-form-item label="批次名称" prop="batchName">
          <el-input
            v-model="queryParams.batchName"
            placeholder="请输入批次名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="采收日期" prop="harvestDate">
          <el-date-picker
            v-model="queryParams.harvestDate"
            type="date"
            placeholder="选择日期"
            size="small"
            style="width: 200px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityLevel">
          <el-select
            v-model="queryParams.qualityLevel"
            placeholder="请选择质量等级"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="优" value="A" />
            <el-option label="良" value="B" />
            <el-option label="合格" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item class="fr">
          <el-button
            type="primary"
            :icon="Plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['agriculture:harvest:add']"
          >新增</el-button>
          <el-button
            :icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['agriculture:harvest:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="harvestList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="采收ID" prop="harvestId" width="100" />
        <el-table-column label="批次名称" prop="batchName" width="150" />
        <el-table-column label="采收日期" prop="harvestDate" width="120" />
        <el-table-column label="采收时间" prop="harvestTime" width="160" />
        <el-table-column label="采收面积" prop="harvestArea" width="120">
          <template #default="scope">
            {{ scope.row.harvestArea ? scope.row.harvestArea + ' 亩' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="采收重量" prop="harvestWeight" width="120">
          <template #default="scope">
            {{ scope.row.harvestWeight }} 公斤
          </template>
        </el-table-column>
        <el-table-column label="采收数量" prop="harvestQuantity" width="120" />
        <el-table-column label="质量等级" prop="qualityLevel" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.qualityLevel === 'A'" type="success">优</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === 'B'" type="warning">良</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === 'C'">合格</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="采收人员" prop="harvestPersonName" width="120" />
        <el-table-column label="存储位置" prop="storageLocation" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['agriculture:harvest:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:harvest:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

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
        <el-form-item label="采收人员" prop="harvestPersonId">
          <el-select
            v-model="form.harvestPersonId"
            placeholder="请选择采收人员"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureHarvestService } from '@/api/agriculture/harvestApi'
import { AgricultureHarvestRecordResult } from '@/types/agriculture/harvest'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { UserService } from '@/api/system/userApi'
import { downloadExcel } from '@/utils/utils'

const loading = ref(false)
const harvestList = ref<AgricultureHarvestRecordResult[]>([])
const open = ref(false)
const showSearch = ref(true)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const harvestRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()
const batchList = ref<any[]>([])
const userList = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  batchName: '',
  harvestDate: '',
  qualityLevel: ''
})

const form = reactive({
  harvestId: null,
  batchId: null,
  harvestDate: '',
  harvestTime: '',
  harvestArea: null,
  harvestWeight: null,
  harvestQuantity: null,
  qualityLevel: '',
  harvestPersonId: null,
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
    const res = await AgricultureHarvestService.listHarvest(queryParams)
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
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
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
  const harvestIds = row.harvestId || ids.value
  await ElMessageBox.confirm('是否确认删除采收记录编号为"' + harvestIds + '"的数据项？')
  const res = await AgricultureHarvestService.deleteHarvest(harvestIds)
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
    harvestId: null,
    batchId: null,
    harvestDate: '',
    harvestTime: '',
    harvestArea: null,
    harvestWeight: null,
    harvestQuantity: null,
    qualityLevel: '',
    harvestPersonId: null,
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

/** 获取用户列表 */
const getUserList = async () => {
  try {
    const res = await UserService.listUser({ status: '0' })
    if (res.code === 200) {
      userList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

onMounted(() => {
  getList()
  getBatchList()
  getUserList()
})
</script>

<style lang="scss" scoped>
.card-margin-bottom {
  margin-bottom: 20px;
}
</style>

