<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="82px">
      <el-row :gutter="20">
        <!-- 农资名称搜索项 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="农资名称" prop="resourceName">
            <el-input placeholder="请输入农资名称" v-model="queryParams.resourceName" @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Goods /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <div style="width: 12px"></div>
        <!-- 搜索、重置、新增、导出按钮区域 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-button @click="handleQuery" v-ripple>
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button @click="handleAdd" v-hasPermi="['agriculture:resource:add']" v-ripple>
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button @click="handleExport" v-hasPermi="['agriculture:resource:export']" v-ripple>
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>
    <!-- 搜索栏结束 -->

    <div class="material-cards-container">
      <div v-for="item in resourceList" :key="item.resourceId" class="material-card">
        <div class="card-header">
          <div class="material-name">
            <span>{{ item.resourceName }}</span>
          </div>
          <div class="material-type">
            <el-tag :type="item.resourceType === '0' ? 'success' : 'primary'">
              {{ getResourceTypeLabel(item.resourceType) }}
            </el-tag>
          </div>
        </div>

        <div class="card-body">
          <div class="card-body-content">
            <!-- 左侧：农资图片 -->
            <div class="material-image-container">
              <img 
                v-if="item.resourceImage" 
                :src="item.resourceImage" 
                :alt="item.resourceName"
                class="material-image"
              />
              <div v-else class="material-image-placeholder">
                <el-icon class="placeholder-icon">
                  <PictureFilled />
                </el-icon>
                <span class="placeholder-text">暂无图片</span>
              </div>
            </div>
            
            <!-- 右侧：农资信息 -->
            <div class="material-info-container">
              <div class="info-row">
                <span class="label"><el-icon><Document /></el-icon> 编码：</span>
                <span class="value">{{ item.resourceCode }}</span>
              </div>
              <div class="info-row">
                <span class="label"><el-icon><ScaleToOriginal /></el-icon> 计量单位：</span>
                <span class="value">{{ item.measureUnit }}</span>
              </div>
              <div class="info-row">
                <span class="label"><el-icon><ChatDotRound /></el-icon> 备注：</span>
                <span class="value">{{ item.remark || '无' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <el-button-group>
            <el-button class="card-action-btn edit" size="small" @click="handleUpdate(item)" 
              v-hasPermi="['agriculture:resource:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button class="card-action-btn delete" size="small" @click="handleDelete(item)"
              v-hasPermi="['agriculture:resource:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <el-pagination 
      v-if="total > queryParams.pageSize"
      background 
      layout="total, sizes, prev, pager, next, jumper" 
      :total="total"
      :page-size="queryParams.pageSize" 
      :current-page="queryParams.pageNum" 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" 
      :page-sizes="[5, 10, 20, 50]"
      style="margin-top: 20px; text-align: center; display: flex; justify-content: center;" 
    />

    <!-- 添加或修改农资信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="resourceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="农资编码" prop="resourceCode">
          <el-input v-model="form.resourceCode" placeholder="请输入农资编码" />
        </el-form-item>
        <el-form-item label="农资名称" prop="resourceName">
          <el-input v-model="form.resourceName" placeholder="请输入农资名称" />
        </el-form-item>
        <el-form-item label="农资类型" prop="resourceType">
          <el-select v-model="form.resourceType" placeholder="请选择农资类型" style="width: 100%">
            <el-option label="物料" value="0" />
            <el-option label="机械" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="农资图片" prop="resourceImage">
          <div class="el-top upload-container">
            <el-upload
              class="cover-uploader"
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="onSuccess"
              :on-error="onError"
              :before-upload="beforeUpload"
            >
              <div v-if="!form.resourceImage" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <img v-else :src="form.resourceImage" class="cover-image" />
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="计量单位" prop="measureUnit">
          <el-input v-model="form.measureUnit" placeholder="请输入计量单位" />
        </el-form-item>
        <el-form-item v-if="!form.resourceId" label="初始库存" prop="initialStock">
          <el-input-number v-model="form.initialStock" :min="0" :precision="2" placeholder="请输入初始库存" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { 
  Search, 
  Refresh, 
  Plus, 
  Download, 
  Goods, 
  PictureFilled,
  ScaleToOriginal,
  Document,
  ChatDotRound,
  EditPen,
  Delete
} from '@element-plus/icons-vue'
import EmojiText from '@/utils/emojo'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
let { accessToken } = userStore
// 传递 token
const uploadHeaders = { Authorization: accessToken }
// 上传路径
const uploadImageUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
import { AgricultureResourceService } from "@/api/agriculture/resourceApi";
import { ref, reactive, computed, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureResourceResult } from '@/types/agriculture/resource'
const resourceList = ref<AgricultureResourceResult[]>([])
const open = ref(false);
const loading = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const queryRef = ref()
const resourceRef = ref<FormInstance>()
// 定义初始表单状态
const initialFormState = {
  resourceId: null,
  resourceCode: null,
  resourceName: null,
  resourceType: '0', // 默认选择物料
  resourceImage: null,
  measureUnit: null,
  initialStock: 0,
  orderNum: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  delFlag: null,
  remark: null
}
const form = reactive({ ...initialFormState })
const queryParams = reactive({
  pageNum: 1,
  pageSize: 12,
  resourceName: '',
  resourceType: '',
  resourceCode: '',
})
const rules = reactive({
  resourceCode: [
    {
      required: true, message: "农资编码不能为空", trigger: "blur"
    }
  ],
  resourceName: [
    {
      required: true, message: "农资名称不能为空", trigger: "blur"
    }
  ],
  resourceType: [
    {
      required: true, message: "农资类型不能为空", trigger: "change"
    }
  ],
  measureUnit: [
    {
      required: true, message: "计量单位不能为空", trigger: "blur"
    }
  ]
})

/** 获取农资类型标签 */
const getResourceTypeLabel = (resourceType: string) => {
  const typeMap: Record<string, string> = {
    '0': '物料',
    '1': '机械'
  }
  return typeMap[resourceType] || resourceType
}

/** 查询农资信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await AgricultureResourceService.listResource(queryParams)
  if (res.code === 200) {
    resourceList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  }
}

// 上传成功后的处理函数
const onSuccess = (response: any) => {
    form.resourceImage = response.url
    ElMessage.success(`图片上传成功 ${EmojiText[200]}`)
  }

  // 上传失败后的处理函数
  const onError = () => {
    ElMessage.error(`图片上传失败 ${EmojiText[500]}`)
  }

  // 上传前的校验函数
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }


const columns = reactive([
  { name: '农资ID', show: true },
  { name: '农资编码', show: true },
  { name: '农资名称', show: true },
  { name: '计量单位', show: true },
  { name: '备注', show: true },
  { name: '状态', show: true },
  { name: '排序', show: true },
])

const changeColumn = (list: any) => {
  columns.values = list
}

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
}

// 表单重置
const reset = () => {
  // 重置表单数据到初始状态
  Object.assign(form, initialFormState)
  resourceRef.value?.resetFields()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
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

// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.resourceId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加农资信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  title.value = '修改农资信息'
  const res = await AgricultureResourceService.getResource(row.resourceId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}


/** 提交按钮 */
const submitForm = async () => {
  if (!resourceRef.value) return
  await resourceRef.value.validate(async (valid) => {
    if (valid) {
      if (form.resourceId != null) {
        const res = await AgricultureResourceService.updateResource(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false;
          getList();
        }
      } else {
        const res = await AgricultureResourceService.addResource(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false;
          getList();
        }
      }
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const _resourceIds = row.resourceId || ids.value;
  const Tr = await ElMessageBox.confirm('是否确认删除农资信息编号为"' + _resourceIds + '"的数据项？')
  if (Tr) {
    const res = await AgricultureResourceService.deleteResource(_resourceIds)
    if (res.code === 200) {
      getList()
      ElMessage.success(res.msg)
    }
  }
}


import { downloadExcel } from '@/utils/utils'

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureResourceService.exportExcel(queryParams))
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.material-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 16px;
  padding: 10px 5px;
}

/* 超大屏适配 (1920px+) - 保持4列 */
@media (min-width: 1920px) {
  .material-cards-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 大屏适配 (1600px - 1919px) - 4列 */
@media (min-width: 1600px) and (max-width: 1919px) {
  .material-cards-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 中等屏幕适配 (1200px - 1599px) - 3列 */
@media (min-width: 1200px) and (max-width: 1599px) {
  .material-cards-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

/* 平板横屏适配 (900px - 1199px) - 2列 */
@media (min-width: 900px) and (max-width: 1199px) {
  .material-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .card-header {
    padding: 18px 20px;
  }

  .card-body {
    padding: 18px 20px;
  }

  .material-image-container {
    width: 120px;
    height: 120px;
  }

  .info-row {
    font-size: 13px;
    margin-bottom: 14px;
  }

  .label {
    min-width: 90px;
  }

  .card-footer {
    padding: 14px 20px;
  }
}

/* 平板竖屏适配 (768px - 899px) - 2列，保持左右布局 */
@media (min-width: 768px) and (max-width: 899px) {
  .material-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 10px;
  }

  .card-header {
    padding: 16px 18px;
  }

  .material-name {
    font-size: 14px;
  }

  .card-body {
    padding: 14px 16px;
  }

  .card-body-content {
    gap: 14px;
  }

  .material-image-container {
    width: 100px;
    height: 100px;
  }

  .info-row {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .label {
    min-width: 70px;
    font-size: 11px;
  }

  .value {
    font-size: 12px;
  }

  .card-footer {
    padding: 14px 16px;
    gap: 10px;
  }

  .el-button-group {
    gap: 8px;
    flex-wrap: wrap;
  }
}

/* 手机横屏适配 (600px - 767px) - 1列，保持左右布局 */
@media (min-width: 600px) and (max-width: 767px) {
  .material-cards-container {
    grid-template-columns: 1fr;
    padding: 10px;
    gap: 12px;
  }

  .card-header {
    padding: 14px;
  }
  
  .material-name {
    font-size: 13px;
  }
  
  .card-body {
    padding: 12px;
  }
  
  .card-body-content {
    gap: 12px;
  }
  
  .material-image-container {
    width: 85px;
    height: 85px;
  }
  
  .info-row {
    font-size: 11px;
    margin-bottom: 8px;
  }
  
  .label {
    min-width: 60px;
    font-size: 10px;
  }

  .value {
    font-size: 11px;
  }
  
  .card-footer {
    padding: 12px;
    gap: 8px;
  }

  .el-button-group {
    gap: 6px;
    flex-wrap: wrap;
  }
}

/* 手机竖屏适配 (480px - 599px) - 信息行改为垂直 */
@media (min-width: 480px) and (max-width: 599px) {
  .material-cards-container {
    grid-template-columns: 1fr;
    padding: 10px;
    gap: 12px;
  }

  .card-header {
    padding: 12px;
  }
  
  .material-name {
    font-size: 12px;
  }
  
  .card-body {
    padding: 10px;
  }
  
  .card-body-content {
    gap: 10px;
  }
  
  .material-image-container {
    width: 75px;
    height: 75px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
  }
  
  .label {
    min-width: auto;
    font-size: 10px;
    font-weight: 600;
  }

  .value {
    font-size: 11px;
    padding-left: 20px;
  }
  
  .card-footer {
    padding: 10px;
    gap: 6px;
  }

  .el-button-group {
    width: 100%;
    gap: 5px;
    flex-wrap: wrap;
  }
}

/* 小屏手机适配 (max-width: 479px) - 信息行改为垂直 */
@media (max-width: 479px) {
  .material-cards-container {
    grid-template-columns: 1fr;
    padding: 8px;
    gap: 10px;
  }

  .card-header {
    padding: 10px;
  }
  
  .material-name {
    font-size: 11px;
  }
  
  .card-body {
    padding: 8px;
  }
  
  .card-body-content {
    gap: 8px;
  }
  
  .material-image-container {
    width: 65px;
    height: 65px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 2px;
    margin-bottom: 6px;
  }
  
  .label {
    min-width: auto;
    font-size: 9px;
    font-weight: 600;
  }

  .value {
    font-size: 10px;
    padding-left: 18px;
  }
  
  .card-footer {
    padding: 8px;
    gap: 5px;
  }

  .el-button-group {
    width: 100%;
    gap: 4px;
    flex-wrap: wrap;
  }
}

.material-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.material-card:hover {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12);
}

.card-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb00 100%);
  border-bottom: 1px solid #e0e0e042;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.material-type {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px 24px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.card-body-content {
  display: flex;
  gap: 24px;
  flex: 1;
  align-items: flex-start;
}

/* 农资图片容器 */
.material-image-container {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.material-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: #c0c4cc;
}

.placeholder-text {
  font-size: 12px;
  color: #909399;
}

/* 农资信息容器 */
.material-info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  min-width: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.label .el-icon {
  font-size: 16px;
}

.value {
  color: #303133;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.card-footer {
  padding: 16px 24px;
  background: #f1f1f15c;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  align-items: center;
  margin-top: auto;
}

.el-button-group {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
}

/* 搜索表单响应式样式 */
.el-form {
  .el-row {
    margin-bottom: 10px;
  }
}

/* 按钮组响应式 */
@media (max-width: 768px) {
  .el-form {
    .el-col {
      margin-bottom: 10px;
    }

    .el-button {
      width: 100%;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 480px) {
  .el-form {
    label-width: 70px !important;

    .el-form-item__label {
      font-size: 13px;
    }

    .el-button {
      font-size: 13px;
      padding: 8px 12px;
    }
  }
}

.card-action-btn {
  position: relative;
  border: none !important;
  background: #fff !important;
  color: #409eff !important;
  border-radius: 1.5rem !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  font-weight: 500;
  min-width: 80px;
  min-height: 32px;
  padding: 0 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
}

.card-action-btn.edit {
  border: 1px solid #409eff !important;
}

.card-action-btn.edit:hover {
  background: #409eff !important;
  color: #fff !important;
}

.card-action-btn.delete {
  border: 1px solid #f56c6c !important;
  color: #f56c6c !important;
}

.card-action-btn.delete:hover {
  background: #f56c6c !important;
  color: #fff !important;
}

.upload-container {
  .cover-uploader {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 8px;
    transition: var(--el-transition-duration);

    &:hover {
      border-color: var(--el-color-primary);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 260px;
      height: 160px;
      border: 1px dashed var(--el-border-color-darker);
      border-radius: 6px;
      background-color: var(--el-fill-color-light);

      .upload-icon {
        font-size: 32px;
        color: var(--el-color-info-light-3);
      }

      .upload-text {
        margin-top: 8px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .cover-image {
      display: block;
      width: 260px;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>