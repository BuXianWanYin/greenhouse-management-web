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
        <el-form-item label="预警级别" prop="alertLevel">
          <el-select
            v-model="queryParams.alertLevel"
            placeholder="请选择预警级别"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="提示" :value="0" />
            <el-option label="警告" :value="1" />
            <el-option label="严重" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择处理状态"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option label="未处理" :value="0" />
            <el-option label="已处理" :value="1" />
            <el-option label="已忽略" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item class="fr">
          <el-button
            type="primary"
            :icon="Check"
            size="small"
            @click="handleCheckAlerts"
            v-hasPermi="['agriculture:alert:check']"
          >检查预警</el-button>
          <el-button
            :icon="Download"
            size="small"
            @click="handleExport"
            v-hasPermi="['agriculture:alert:export']"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI决策建议面板（选中预警时显示） -->
    <el-card v-if="selectedAlert" class="card-margin-bottom">
      <AIDecisionPanel
        type="alert"
        :target-id="selectedAlert.alertId"
        :auto-load="true"
      />
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="alertList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="预警ID" prop="alertId" min-width="100" />
        <el-table-column label="预警类别" prop="alertCategory" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.alertCategory === 'device'">设备</el-tag>
            <el-tag type="warning" v-else-if="scope.row.alertCategory === 'task'">任务</el-tag>
            <el-tag type="info" v-else-if="scope.row.alertCategory === 'resource'">资源</el-tag>
            <el-tag type="success" v-else-if="scope.row.alertCategory === 'quality'">质量</el-tag>
            <el-tag type="danger" v-else-if="scope.row.alertCategory === 'schedule'">排班</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" prop="alertType" min-width="120" />
        <el-table-column label="预警级别" prop="alertLevel" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.alertLevel === 0" type="info">提示</el-tag>
            <el-tag v-else-if="scope.row.alertLevel === 1" type="warning">警告</el-tag>
            <el-tag v-else-if="scope.row.alertLevel === 2" type="danger">严重</el-tag>
            <el-tag v-else-if="scope.row.alertLevel === 3" type="danger">紧急</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警标题" prop="alertTitle" min-width="200" show-overflow-tooltip />
        <el-table-column label="预警内容" prop="alertMessage" min-width="250" show-overflow-tooltip />
        <el-table-column label="温室" prop="pastureName" min-width="120" />
        <el-table-column label="预警时间" prop="alertTime" min-width="160" />
        <el-table-column label="处理状态" prop="status" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">未处理</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已处理</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info">已忽略</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 0"
              link
              type="primary"
              :icon="Check"
              @click="handleAlert(scope.row)"
              v-hasPermi="['agriculture:alert:handle']"
            >处理</el-button>
            <el-button
              v-if="scope.row.status === 0"
              link
              type="info"
              :icon="Close"
              @click="ignoreAlert(scope.row)"
              v-hasPermi="['agriculture:alert:ignore']"
            >忽略</el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:alert:remove']"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureAlertService } from '@/api/agriculture/alertApi'
import { AgricultureAlertResult } from '@/types/agriculture/alert'
import { downloadExcel } from '@/utils/utils'
import AIDecisionPanel from '@/components/AIDecisionPanel/index.vue'

const loading = ref(false)
const alertList = ref<AgricultureAlertResult[]>([])
const showSearch = ref(true)
const total = ref(0)
const ids = ref<number[]>([])
const queryFormRef = ref<FormInstance>()
const selectedAlert = ref<AgricultureAlertResult | null>(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  alertCategory: '',
  alertType: '',
  alertLevel: null as number | null,
  status: null as number | null
})

/** 查询预警列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureAlertService.listAlert(queryParams)
    if (res.code === 200) {
      alertList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    console.error('查询预警列表失败:', error)
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
const handleSelectionChange = (selection: AgricultureAlertResult[]) => {
  ids.value = selection.map(item => Number(item.alertId))
}

/** 处理预警 */
const handleAlert = async (row: AgricultureAlertResult) => {
  try {
    const res = await AgricultureAlertService.handleAlert(row.alertId)
    if (res.code === 200) {
      ElMessage.success('处理成功')
      getList()
    }
  } catch (error) {
    console.error('处理预警失败:', error)
  }
}

/** 忽略预警 */
const ignoreAlert = async (row: AgricultureAlertResult) => {
  try {
    const res = await AgricultureAlertService.ignoreAlert(row.alertId)
    if (res.code === 200) {
      ElMessage.success('已忽略')
      getList()
    }
  } catch (error) {
    console.error('忽略预警失败:', error)
  }
}

/** 删除预警 */
const handleDelete = async (row: AgricultureAlertResult) => {
  const alertIds = row.alertId || ids.value
  await ElMessageBox.confirm('是否确认删除预警编号为"' + alertIds + '"的数据项？')
  const res = await AgricultureAlertService.deleteAlert(alertIds)
  if (res.code === 200) {
    getList()
    ElMessage.success(res.msg)
  }
}

/** 检查预警 */
const handleCheckAlerts = async () => {
  try {
    const res = await AgricultureAlertService.checkAlerts()
    if (res.code === 200) {
      ElMessage.success('预警检查完成')
      getList()
    }
  } catch (error) {
    console.error('检查预警失败:', error)
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureAlertService.exportAlert(queryParams))
}

/** 行点击事件 */
const handleRowClick = (row: AgricultureAlertResult) => {
  selectedAlert.value = row
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.card-margin-bottom {
  margin-bottom: 20px;
}
</style>

