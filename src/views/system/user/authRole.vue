<template>
  <div class="app-container">
    <div class="info-card">
      <h4 class="form-header h4">基本信息</h4>
      <el-form :model="form" label-width="80px">
        <el-row>
          <el-col :span="8" :offset="2">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="2">
            <el-form-item label="登录账号" prop="userName">
              <el-input v-model="form.userName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="role-card">
      <h4 class="form-header h4">角色信息</h4>
      <art-table
        ref="roleRef"
        v-loading="loading"
        :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
        selection
        :total="total"
        :current-page="pageNum"
        :page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
        row-key="roleId"
        class="role-table"
      >
        <el-table-column label="角色名称" prop="roleName" align="center" />
        <el-table-column label="角色描述" prop="roleDesc" align="center" />
        <el-table-column label="权限" prop="roleKey" align="center" />
        <el-table-column label="创建时间" prop="createTime" align="center" />
      </art-table>
    </div>
    <div class="button-container" style="display: flex; justify-content: center; margin-top: 20px">
      <el-button type="primary" class="gradient-btn" @click="submitForm">保存</el-button>
      <el-button class="outline-btn" @click="close">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { UserService } from '@/api/system/userApi'
  import { ElMessage } from 'element-plus'
  import { useRouter, useRoute } from 'vue-router'
  import { ref, nextTick, onMounted, watch } from 'vue'
  import { RoleType } from '@/types/system/user'

  const router = useRouter()
  const route = useRoute()

  const loading = ref(true)
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)
  const roleIds = ref<number[]>([])
  const roles = ref<RoleType[]>([])
  const roleRef = ref()
  const form = ref({
    nickName: '',
    userName: '',
    userId: 0
  })

  /** 关闭按钮 */
  const close = () => {
    router.back()
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    pageSize.value = size
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    pageNum.value = page
    // 切换页面后重新选中当前页的角色
    selectAssignedRoles()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    // 获取当前页的角色ID
    const currentPageRoleIds = selection.map((item: any) => item.roleId)
    // 获取当前页的所有角色ID（包括未选中的）
    const currentPageAllRoleIds = roles.value
      .slice((pageNum.value - 1) * pageSize.value, pageNum.value * pageSize.value)
      .map((r: RoleType) => r.roleId)
    
    // 从 roleIds 中移除当前页的所有角色ID
    const otherPageRoleIds = roleIds.value.filter((id: number) => !currentPageAllRoleIds.includes(id))
    // 合并其他页的选中角色和当前页的选中角色
    roleIds.value = [...otherPageRoleIds, ...currentPageRoleIds]
  }

  /** 提交按钮 */
  const submitForm = async () => {
    const userId = form.value.userId
    const rIds = roleIds.value.join(',')
    const res = await UserService.updateAuthRole({ userId: userId, roleIds: rIds })
    if (res.code === 200) {
      ElMessage.success(res.msg)
      close()
    }
  }

  // 自动选中已有角色的函数
  const selectAssignedRoles = async () => {
    if (!roleRef.value || !roles.value.length) {
      return
    }
    
    // 等待表格完全渲染
    await nextTick()
    // 再等待一小段时间确保表格DOM完全更新
    setTimeout(() => {
      if (roleRef.value) {
        // 获取当前页显示的角色
        const currentPageRoles = roles.value.slice((pageNum.value - 1) * pageSize.value, pageNum.value * pageSize.value)
        currentPageRoles.forEach((row: RoleType) => {
          if (row.flag) {
            roleRef.value.toggleRowSelection(row, true)
          }
        })
        // 更新已选中的角色ID列表（包含所有页面的已选角色）
        const selectedRoles = roles.value.filter((r: RoleType) => r.flag)
        roleIds.value = selectedRoles.map((r: RoleType) => r.roleId)
      }
    }, 100)
  }

  // 监听 roles 数据变化，自动选中已有角色
  watch(
    () => roles.value,
    () => {
      if (roles.value.length > 0 && !loading.value) {
        selectAssignedRoles()
      }
    },
    { deep: true }
  )

  // 监听 loading 状态，当加载完成时选中角色
  watch(
    () => loading.value,
    (newVal) => {
      if (!newVal && roles.value.length > 0) {
        selectAssignedRoles()
      }
    }
  )

  onMounted(async () => {
    const userId = route.params && route.params.userId
    if (userId) {
      loading.value = true
      try {
        const res = await UserService.getAuthRole(userId)
        if (res.code === 200) {
          form.value = res.user
          roles.value = res.roles || []
          total.value = roles.value.length
          
          // 初始化已选中的角色ID列表
          const selectedRoles = roles.value.filter((r: RoleType) => r.flag)
          roleIds.value = selectedRoles.map((r: RoleType) => r.roleId)
        }
      } catch (error) {
        console.error('获取角色信息失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }

  .info-card,
  .role-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }

  .form-header {
    color: #303133;
    font-weight: 600;
    margin-bottom: 20px;
    position: relative;
    padding-left: 10px;
  }

  .form-header::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(to bottom, #409eff, #36d1dc);
    border-radius: 2px;
  }

  .role-table {
    margin-top: 10px;
  }

  .gradient-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  .outline-btn {
    transition: all 0.3s ease;
  }
</style>
