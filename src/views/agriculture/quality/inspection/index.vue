<template>
  <div class="app-container-sm">
    <!-- 查询表单 -->
    <el-card class="card-margin-bottom">
      <el-form
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
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
        <el-form-item label="检测类型" prop="inspectionType">
          <el-select
            v-model="queryParams.inspectionType"
            placeholder="请选择检测类型"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="生长期" value="growth" />
            <el-option label="采收期" value="harvest" />
            <el-option label="存储期" value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期" prop="inspectionDate">
          <el-date-picker
            v-model="queryParams.inspectionDate"
            type="date"
            placeholder="选择日期"
            size="small"
            style="width: 200px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="是否合格" prop="qualified">
          <el-select
            v-model="queryParams.qualified"
            placeholder="请选择"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="合格" value="1" />
            <el-option label="不合格" value="0" />
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
            v-hasPermi="['agriculture:quality:inspection:add']"
          >新增</el-button>
          <el-button
            :icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['agriculture:quality:inspection:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="inspectionList"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="检测ID" prop="inspectionId" min-width="100" />
        <el-table-column label="批次名称" prop="batchName" min-width="150" />
        <el-table-column label="检测类型" prop="inspectionType" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.inspectionType === 'growth'">生长期</el-tag>
            <el-tag type="warning" v-else-if="scope.row.inspectionType === 'harvest'">采收期</el-tag>
            <el-tag type="info" v-else-if="scope.row.inspectionType === 'storage'">存储期</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检测日期" prop="inspectionDate" min-width="120" />
        <el-table-column label="检测项目" prop="inspectionItem" min-width="150" />
        <el-table-column label="检测结果" prop="inspectionResult" min-width="200" show-overflow-tooltip />
        <el-table-column label="是否合格" prop="qualified" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.qualified === '1' ? 'success' : 'danger'">
              {{ scope.row.qualified === '1' ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检测人员" prop="inspectorName" min-width="120" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['agriculture:quality:inspection:edit']"
            >修改</el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:quality:inspection:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-show="total > 0"
        :total="total"
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="inspectionRef" :model="form" :rules="rules" label-width="120px">
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
        <el-form-item label="检测类型" prop="inspectionType">
          <el-select v-model="form.inspectionType" placeholder="请选择检测类型" style="width: 100%">
            <el-option label="生长期" value="growth" />
            <el-option label="采收期" value="harvest" />
            <el-option label="存储期" value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期" prop="inspectionDate">
          <el-date-picker
            v-model="form.inspectionDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="检测项目" prop="inspectionItem">
          <el-input
            v-model="form.inspectionItem"
            placeholder="请输入检测项目"
          />
        </el-form-item>
        <el-form-item label="检测结果" prop="inspectionResult">
          <el-input
            v-model="form.inspectionResult"
            type="textarea"
            :rows="3"
            placeholder="请输入检测结果"
          />
        </el-form-item>
        <el-form-item label="检测标准" prop="inspectionStandard">
          <el-input
            v-model="form.inspectionStandard"
            type="textarea"
            :rows="3"
            placeholder="请输入检测标准"
          />
        </el-form-item>
        <el-form-item label="是否合格" prop="qualified">
          <el-radio-group v-model="form.qualified">
            <el-radio value="1">合格</el-radio>
            <el-radio value="0">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="检测人员" prop="inspectorId">
          <el-select
            v-model="form.inspectorId"
            placeholder="请选择检测人员"
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
import { AgricultureQualityService } from '@/api/agriculture/qualityApi'
import { AgricultureQualityInspectionResult } from '@/types/agriculture/quality'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { UserService } from '@/api/system/userApi'
import { downloadExcel } from '@/utils/utils'

const loading = ref(false)
const inspectionList = ref<AgricultureQualityInspectionResult[]>([])
const open = ref(false)
const showSearch = ref(true)
const title = ref('')
const total = ref(0)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const inspectionRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()
const batchList = ref<any[]>([])
const userList = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  batchName: '',
  inspectionType: '',
  inspectionDate: '',
  qualified: ''
})

const form = reactive({
  inspectionId: null,
  batchId: null,
  inspectionType: '',
  inspectionDate: '',
  inspectionItem: '',
  inspectionResult: '',
  inspectionStandard: '',
  qualified: '1',
  inspectorId: null,
  inspectionImages: []
})

const rules = reactive({
  batchId: [{ required: true, message: '批次不能为空', trigger: 'change' }],
  inspectionType: [{ required: true, message: '检测类型不能为空', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '检测日期不能为空', trigger: 'change' }],
  inspectionItem: [{ required: true, message: '检测项目不能为空', trigger: 'blur' }]
})

/** 查询质量检测记录列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureQualityService.listInspection(queryParams)
    if (res.code === 200) {
      inspectionList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    console.error('查询质量检测记录列表失败:', error)
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
const handleSelectionChange = (selection: AgricultureQualityInspectionResult[]) => {
  ids.value = selection.map(item => Number(item.inspectionId))
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加质量检测记录'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureQualityInspectionResult) => {
  reset()
  open.value = true
  title.value = '修改质量检测记录'
  const res = await AgricultureQualityService.getInspection(row.inspectionId)
  if (res.code === 200) {
    Object.assign(form, res.data)
    // 处理图片数组
    if (res.data.inspectionImages && typeof res.data.inspectionImages === 'string') {
      try {
        form.inspectionImages = JSON.parse(res.data.inspectionImages)
      } catch (e) {
        form.inspectionImages = []
      }
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!inspectionRef.value) return
  await inspectionRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = { ...form }
      // 处理图片数组
      if (submitData.inspectionImages && Array.isArray(submitData.inspectionImages)) {
        submitData.inspectionImages = JSON.stringify(submitData.inspectionImages)
      }
      
      if (form.inspectionId != null) {
        const res = await AgricultureQualityService.updateInspection(submitData)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureQualityService.addInspection(submitData)
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
const handleDelete = async (row: AgricultureQualityInspectionResult) => {
  const inspectionIds = row.inspectionId || ids.value
  await ElMessageBox.confirm('是否确认删除质量检测记录编号为"' + inspectionIds + '"的数据项？')
  const res = await AgricultureQualityService.deleteInspection(inspectionIds)
  if (res.code === 200) {
    getList()
    ElMessage.success(res.msg)
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureQualityService.exportInspection(queryParams))
}

/** 取消按钮 */
const cancel = () => {
  open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  Object.assign(form, {
    inspectionId: null,
    batchId: null,
    inspectionType: '',
    inspectionDate: '',
    inspectionItem: '',
    inspectionResult: '',
    inspectionStandard: '',
    qualified: '1',
    inspectorId: null,
    inspectionImages: []
  })
  inspectionRef.value?.resetFields()
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

