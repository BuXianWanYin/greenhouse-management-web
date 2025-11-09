<template>
  <div class="plan-batch-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAddBatch" v-auth="['agriculture:planbatch:add']">
        <el-icon><Plus /></el-icon>添加批次到计划
      </el-button>
      <el-button type="success" @click="handleCreateBatch" v-auth="['agriculture:batch:add']">
        <el-icon><Plus /></el-icon>创建新批次
      </el-button>
    </div>
    <el-table :data="batchList" border v-loading="loading">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="关联ID" prop="id" width="100" />
      <el-table-column label="批次ID" prop="batchId" width="100" />
      <el-table-column label="批次名称" prop="batchName" min-width="150" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleViewBatch(scope.row)" v-auth="['agriculture:batch:query']">
            <el-icon><View /></el-icon>查看批次
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:planbatch:remove']">
            <el-icon><Delete /></el-icon>移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > queryParams.pageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="queryParams.pageSize"
      :current-page="queryParams.pageNum"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[10, 20, 50, 100]"
      style="margin-top: 20px; text-align: center"
    />

    <!-- 添加批次到计划对话框 -->
    <el-dialog title="添加批次到计划" v-model="addBatchOpen" width="500px" append-to-body>
      <el-form ref="addBatchRef" :model="addBatchForm" :rules="addBatchRules" label-width="100px">
        <el-form-item label="批次ID" prop="batchId">
          <el-input-number v-model="addBatchForm.batchId" :min="1" placeholder="请输入批次ID" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAddBatch">确 定</el-button>
          <el-button @click="addBatchOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建新批次对话框 -->
    <el-dialog title="创建新批次" v-model="createBatchOpen" width="700px" append-to-body>
      <el-form ref="createBatchRef" :model="createBatchForm" :rules="createBatchRules" label-width="120px">
        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="createBatchForm.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="种植种质" prop="classId">
          <el-select v-model="createBatchForm.classId" placeholder="请选择种植种质" clearable filterable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属温室" prop="pastureId">
          <el-select v-model="createBatchForm.pastureId" placeholder="请选择所属温室" clearable style="width: 100%">
            <el-option
              v-for="item in pastureOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="cropArea">
          <el-input-number v-model="createBatchForm.cropArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePersonId">
          <el-select v-model="createBatchForm.responsiblePersonId" placeholder="请选择负责人" clearable filterable style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="createBatchForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createBatchForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="createBatchForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitCreateBatch">确 定</el-button>
          <el-button @click="createBatchOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { Plus, View, Delete } from '@element-plus/icons-vue'
import { AgriculturePlanBatchService } from '@/api/agriculture/planBatchApi'
import { AgriculturePlanBatchResult } from '@/types/agriculture/planBatch'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { UserService } from '@/api/system/userApi'

const emit = defineEmits(['refresh'])

const props = defineProps({
  planId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const batchList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const addBatchOpen = ref(false)
const addBatchRef = ref<FormInstance>()
const createBatchOpen = ref(false)
const createBatchRef = ref<FormInstance>()
const classOptions = ref<any[]>([])
const pastureOptions = ref<any[]>([])
const userOptions = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planId: props.planId
})

const addBatchForm = reactive({
  planId: props.planId,
  batchId: null
})

const addBatchRules = reactive({
  batchId: [{ required: true, message: '批次ID不能为空', trigger: 'blur' }]
})

const initialCreateBatchState = {
  batchName: '',
  classId: undefined as string | undefined,
  pastureId: undefined as string | undefined,
  cropArea: 0,
  responsiblePersonId: undefined as string | undefined,
  startTime: '',
  status: '0',
  remark: ''
}

const createBatchForm = reactive({ ...initialCreateBatchState })

const createBatchRules = reactive({
  batchName: [{ required: true, message: '批次名称不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '种植种质不能为空', trigger: 'change' }],
  pastureId: [{ required: true, message: '所属温室不能为空', trigger: 'change' }],
  cropArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }]
})

/** 获取关联批次列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgriculturePlanBatchService.listBatch(queryParams)
    if (res.code === 200) {
      // 需要根据batchId获取批次详细信息
      const batchIds = res.rows.map((item: AgriculturePlanBatchResult) => item.batchId)
      if (batchIds.length > 0) {
        const batchRes = await AgricultureCropBatchService.listBatch({ batchIds: batchIds.join(',') })
        if (batchRes.code === 200) {
          batchList.value = res.rows.map((item: AgriculturePlanBatchResult) => {
            const batch = batchRes.rows.find((b: any) => b.batchId == item.batchId)
            return {
              ...item,
              batchName: batch?.batchName || '--'
            }
          })
        } else {
          batchList.value = res.rows
        }
      } else {
        batchList.value = res.rows
      }
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('获取关联批次列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

const handleAddBatch = () => {
  addBatchOpen.value = true
}

const handleCreateBatch = () => {
  resetCreateBatch()
  createBatchOpen.value = true
  // 加载选项数据
  loadOptions()
}

/** 重置创建批次表单 */
const resetCreateBatch = () => {
  Object.assign(createBatchForm, initialCreateBatchState)
}

/** 加载选项数据 */
const loadOptions = async () => {
  // 加载种质列表
  try {
    const classRes = await AgricultureClassService.listClass({ pageNum: 1, pageSize: 1000 })
    if (classRes.code === 200) {
      classOptions.value = classRes.rows || []
    }
  } catch (error) {
    console.error('加载种质列表失败:', error)
  }

  // 加载温室列表
  try {
    const pastureRes = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
    if (pastureRes.code === 200) {
      pastureOptions.value = pastureRes.rows || []
    }
  } catch (error) {
    console.error('加载温室列表失败:', error)
  }

  // 加载用户列表
  try {
    const firstRes = await UserService.listUser({ pageNum: 1, pageSize: 100 })
    if (firstRes.code === 200) {
      const total = firstRes.total || 0
      const firstPageRows = firstRes.rows || []
      
      if (total <= 100) {
        userOptions.value = firstPageRows
      } else {
        const allUsers = [...firstPageRows]
        const totalPages = Math.ceil(total / 100)
        
        const promises = []
        for (let page = 2; page <= totalPages; page++) {
          promises.push(UserService.listUser({ pageNum: page, pageSize: 100 }))
        }
        
        const results = await Promise.all(promises)
        results.forEach((res: any) => {
          if (res.code === 200 && res.rows) {
            allUsers.push(...res.rows)
          }
        })
        
        userOptions.value = allUsers
      }
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

/** 提交创建批次 */
const submitCreateBatch = async () => {
  if (!createBatchRef.value) return
  await createBatchRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await AgricultureCropBatchService.addBatch(createBatchForm)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          createBatchOpen.value = false
          
          // 创建成功后，尝试通过批次名称查找新创建的批次并添加到计划
          // 由于API返回的是CodeMsgResult，不包含批次ID，我们需要通过查询获取
          try {
            const listRes = await AgricultureCropBatchService.listBatch({
              batchName: createBatchForm.batchName,
              pageNum: 1,
              pageSize: 1
            })
            if (listRes.code === 200 && listRes.rows && listRes.rows.length > 0) {
              const newBatch = listRes.rows[0]
              await addBatchToPlan(newBatch.batchId)
            } else {
              ElMessage.warning('批次创建成功，但未找到新创建的批次，请手动添加到计划')
            }
          } catch (error) {
            console.error('查找新批次失败:', error)
            ElMessage.warning('批次创建成功，但添加到计划失败，请手动添加')
          }
          
          resetCreateBatch()
        }
      } catch (error) {
        console.error('创建批次失败:', error)
        ElMessage.error('创建批次失败')
      }
    }
  })
}

/** 将批次添加到计划 */
const addBatchToPlan = async (batchId: string | number) => {
  try {
    const res = await AgriculturePlanBatchService.addBatch({
      planId: props.planId,
      batchId: batchId
    })
    if (res.code === 200) {
      ElMessage.success('批次已创建并添加到计划')
      getList()
      emit('refresh')
    }
  } catch (error) {
    console.error('添加批次到计划失败:', error)
    ElMessage.warning('批次创建成功，但添加到计划失败，请手动添加')
  }
}

const handleViewBatch = (row: any) => {
  router.push({
    path: '/agriculture/plan/batch/detail',
    query: { batchId: row.batchId }
  })
}

const submitAddBatch = async () => {
  if (!addBatchRef.value) return
  await addBatchRef.value.validate(async (valid) => {
    if (valid) {
      const res = await AgriculturePlanBatchService.addBatch(addBatchForm)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        addBatchOpen.value = false
        addBatchForm.batchId = null
        getList()
        emit('refresh')
      }
    }
  })
}

const handleDelete = async (row: AgriculturePlanBatchResult) => {
  await ElMessageBox.confirm('是否确认移除该批次？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgriculturePlanBatchService.deleteBatch(row.id)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        getList()
        emit('refresh')
      }
    })
    .catch(() => {})
}

watch(() => props.planId, () => {
  queryParams.planId = props.planId
  getList()
})

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.plan-batch-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
</style>

