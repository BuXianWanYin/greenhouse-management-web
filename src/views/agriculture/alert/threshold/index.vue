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
        <el-form-item label="预警类别" prop="alertCategory">
          <el-select
            v-model="queryParams.alertCategory"
            placeholder="请选择预警类别"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="设备" value="device" />
            <el-option label="任务" value="task" />
            <el-option label="资源" value="resource" />
            <el-option label="质量" value="quality" />
            <el-option label="排班" value="schedule" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型" prop="alertType">
          <el-input
            v-model="queryParams.alertType"
            placeholder="请输入预警类型"
            clearable
            size="small"
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-select
            v-model="queryParams.enabled"
            placeholder="请选择启用状态"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
            v-hasPermi="['agriculture:alert:threshold:add']"
          >新增</el-button>
          <el-button
            :icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['agriculture:alert:threshold:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="thresholdList"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="阈值名称" prop="thresholdName" min-width="150" show-overflow-tooltip />
        <el-table-column label="预警类别" prop="alertCategory" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.alertCategory === 'device'">设备</el-tag>
            <el-tag type="warning" v-else-if="scope.row.alertCategory === 'task'">任务</el-tag>
            <el-tag type="success" v-else-if="scope.row.alertCategory === 'resource'">资源</el-tag>
            <el-tag type="danger" v-else-if="scope.row.alertCategory === 'quality'">质量</el-tag>
            <el-tag type="info" v-else-if="scope.row.alertCategory === 'schedule'">排班</el-tag>
            <span v-else>{{ scope.row.alertCategory }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" prop="alertType" min-width="120" />
        <el-table-column label="阈值范围" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.minValue !== null && scope.row.maxValue !== null">
              {{ scope.row.minValue }} ~ {{ scope.row.maxValue }} {{ scope.row.unit || '' }}
            </span>
            <span v-else-if="scope.row.minValue !== null">
              最小值: {{ scope.row.minValue }} {{ scope.row.unit || '' }}
            </span>
            <span v-else-if="scope.row.maxValue !== null">
              最大值: {{ scope.row.maxValue }} {{ scope.row.unit || '' }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="警告范围" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.warningMin !== null && scope.row.warningMax !== null">
              {{ scope.row.warningMin }} ~ {{ scope.row.warningMax }} {{ scope.row.unit || '' }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="严重范围" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.criticalMin !== null && scope.row.criticalMax !== null">
              {{ scope.row.criticalMin }} ~ {{ scope.row.criticalMax }} {{ scope.row.unit || '' }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="温室" prop="pastureName" min-width="120" />
        <el-table-column label="检查间隔" prop="checkInterval" min-width="100">
          <template #default="scope">
            {{ scope.row.checkInterval }} 分钟
          </template>
        </el-table-column>
        <el-table-column label="启用状态" prop="enabled" min-width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              active-value="1"
              inactive-value="0"
              @change="handleToggle(scope.row)"
              v-hasPermi="['agriculture:alert:threshold:edit']"
            />
            <span v-if="!hasPermi(['agriculture:alert:threshold:edit'])">
              {{ scope.row.enabled === '1' ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['agriculture:alert:threshold:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['agriculture:alert:threshold:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
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

    <!-- 添加或修改阈值配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="thresholdRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="预警类别" prop="alertCategory">
          <el-select v-model="form.alertCategory" placeholder="请选择预警类别" style="width: 100%">
            <el-option label="设备" value="device" />
            <el-option label="任务" value="task" />
            <el-option label="资源" value="resource" />
            <el-option label="质量" value="quality" />
            <el-option label="排班" value="schedule" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型" prop="alertType">
          <el-input v-model="form.alertType" placeholder="请输入预警类型，如：temperature、humidity、stock等" />
        </el-form-item>
        <el-form-item label="阈值名称" prop="thresholdName">
          <el-input v-model="form.thresholdName" placeholder="请输入阈值名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小值阈值" prop="minValue">
              <el-input-number v-model="form.minValue" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大值阈值" prop="maxValue">
              <el-input-number v-model="form.maxValue" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="警告最小值" prop="warningMin">
              <el-input-number v-model="form.warningMin" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="警告最大值" prop="warningMax">
              <el-input-number v-model="form.warningMax" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="严重最小值" prop="criticalMin">
              <el-input-number v-model="form.criticalMin" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="严重最大值" prop="criticalMax">
              <el-input-number v-model="form.criticalMax" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="如：℃、%、kg等" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查间隔（分钟）" prop="checkInterval">
              <el-input-number v-model="form.checkInterval" :min="1" :max="1440" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="温室" prop="pastureId">
          <el-select
            v-model="form.pastureId"
            placeholder="请选择温室（留空表示全局配置）"
            clearable
            filterable
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
        <el-form-item label="启用状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio value="1">启用</el-radio>
            <el-radio value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, EditPen, Delete } from '@element-plus/icons-vue'
import { AgricultureAlertThresholdService } from '@/api/agriculture/alertApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureAlertThresholdResult } from '@/types/agriculture/alert'
import { hasPermi } from '@/utils/auth'

const loading = ref(false)
const showSearch = ref(true)
const thresholdList = ref<AgricultureAlertThresholdResult[]>([])
const selectedIds = ref<(number | string)[]>([])
const total = ref(0)
const title = ref('')
const open = ref(false)
const pastureList = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  alertCategory: undefined,
  alertType: undefined,
  enabled: undefined
})

const form = reactive<AgricultureAlertThresholdResult>({
  alertCategory: '',
  alertType: '',
  thresholdName: '',
  minValue: undefined,
  maxValue: undefined,
  warningMin: undefined,
  warningMax: undefined,
  criticalMin: undefined,
  criticalMax: undefined,
  unit: '',
  pastureId: undefined,
  classId: undefined,
  enabled: '1',
  checkInterval: 10,
  remark: ''
})

const rules = {
  alertCategory: [{ required: true, message: '预警类别不能为空', trigger: 'change' }],
  alertType: [{ required: true, message: '预警类型不能为空', trigger: 'blur' }],
  thresholdName: [{ required: true, message: '阈值名称不能为空', trigger: 'blur' }]
}

const thresholdRef = ref()
const queryFormRef = ref()

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureAlertThresholdService.listThreshold(queryParams)
    thresholdList.value = res.rows
    total.value = res.total
  } catch (error) {
    console.error('获取阈值配置列表失败:', error)
    ElMessage.error('获取阈值配置列表失败')
  } finally {
    loading.value = false
  }
}

// 获取温室列表
const getPastureList = async () => {
  try {
    const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
    pastureList.value = res.rows || []
  } catch (error) {
    console.error('获取温室列表失败:', error)
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 选择变化
const handleSelectionChange = (selection: AgricultureAlertThresholdResult[]) => {
  selectedIds.value = selection.map(item => item.thresholdId!).filter(Boolean)
}

// 新增
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加预警阈值配置'
}

// 修改
const handleUpdate = (row: AgricultureAlertThresholdResult) => {
  reset()
  Object.assign(form, row)
  open.value = true
  title.value = '修改预警阈值配置'
}

// 删除
const handleDelete = (row: AgricultureAlertThresholdResult) => {
  ElMessageBox.confirm('是否确认删除阈值配置"' + row.thresholdName + '"？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return AgricultureAlertThresholdService.deleteThreshold([row.thresholdId!])
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 启用/禁用
const handleToggle = async (row: AgricultureAlertThresholdResult) => {
  try {
    await AgricultureAlertThresholdService.toggleThreshold(row.thresholdId!, row.enabled)
    ElMessage.success('操作成功')
  } catch (error) {
    row.enabled = row.enabled === '1' ? '0' : '1'
    ElMessage.error('操作失败')
  }
}

// 导出
const handleExport = () => {
  ElMessageBox.confirm('是否确认导出所有阈值配置数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return AgricultureAlertThresholdService.exportThreshold(queryParams)
    })
    .then(() => {
      ElMessage.success('导出成功')
    })
    .catch(() => {})
}

// 提交表单
const submitForm = () => {
  thresholdRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.thresholdId) {
        AgricultureAlertThresholdService.updateThreshold(form)
          .then(() => {
            ElMessage.success('修改成功')
            open.value = false
            getList()
          })
      } else {
        AgricultureAlertThresholdService.addThreshold(form)
          .then(() => {
            ElMessage.success('新增成功')
            open.value = false
            getList()
          })
      }
    }
  })
}

// 取消
const cancel = () => {
  open.value = false
  reset()
}

// 重置表单
const reset = () => {
  Object.assign(form, {
    thresholdId: undefined,
    alertCategory: '',
    alertType: '',
    thresholdName: '',
    minValue: undefined,
    maxValue: undefined,
    warningMin: undefined,
    warningMax: undefined,
    criticalMin: undefined,
    criticalMax: undefined,
    unit: '',
    pastureId: undefined,
    classId: undefined,
    enabled: '1',
    checkInterval: 10,
    remark: ''
  })
  thresholdRef.value?.resetFields()
}

onMounted(() => {
  getList()
  getPastureList()
})
</script>

<style scoped lang="scss">
.card-margin-bottom {
  margin-bottom: 20px;
}
</style>

