<!-- 图片卡片 - 左右布局（参考设备详情卡片） -->
<template>
  <div class="crop-card">
    <div class="card-header">
      <div class="crop-name">
        <span>{{ className }}</span>
      </div>
      <div class="crop-type">
        <el-tag :type="getTagType(classTypeName)">
          {{ categoryName }}
        </el-tag>
      </div>
    </div>

    <div class="card-body">
      <div class="card-body-content">
        <!-- 左侧：作物图片 -->
        <div class="crop-image-container">
          <img 
            v-if="classImage" 
            :src="classImage" 
            :alt="className"
            class="crop-image"
          />
          <div v-else class="crop-image-placeholder">
            <el-icon class="placeholder-icon">
              <PictureFilled />
            </el-icon>
            <span class="placeholder-text">暂无图片</span>
          </div>
        </div>
        
        <!-- 右侧：作物信息 -->
        <div class="crop-info-container">
          <div class="info-row">
            <span class="label"><el-icon><Crop /></el-icon> 作物名称：</span>
            <span class="value">{{ className }}</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><Collection /></el-icon> 作物类型：</span>
            <span class="value">{{ categoryName }}</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><ChatDotRound /></el-icon> 宣传语：</span>
            <span class="value slogan-value">{{ classDes || '暂无宣传语' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <el-button-group>
        <slot name="button"></slot>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Crop, Collection, PictureFilled, ChatDotRound } from '@element-plus/icons-vue'
  import { computed } from 'vue'

  interface Props {
    className: string
    classTypeName: string
    classType: string
    classImage: string
    classDes?: string
  }

  const props = defineProps<Props>()
  
  // 将类别英文值转换为中文显示
  const categoryName = computed(() => {
    const categoryMap: Record<string, string> = {
      'fruit': '瓜果',
      'vegetable': '蔬菜',
      'other': '其他'
    }
    return categoryMap[props.classTypeName] || props.classTypeName
  })

  // 获取标签类型
  const getTagType = (type: string): 'success' | 'primary' | 'warning' | 'info' | 'danger' => {
    const typeMap: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'danger'> = {
      'fruit': 'success',
      'vegetable': 'primary',
      'other': 'info'
    }
    return typeMap[type] || 'info'
  }
</script>

<style lang="scss" scoped>
.crop-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12);
  }
}

.card-header {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb00 100%);
  border-bottom: 1px solid #e0e0e042;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.crop-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.crop-type {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.card-body-content {
  display: flex;
  gap: 20px;
  flex: 1;
  align-items: flex-start;
}

/* 作物图片容器 */
.crop-image-container {
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

.crop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crop-image-placeholder {
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

/* 作物信息容器 */
.crop-info-container {
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

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  color: #909399;
  min-width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon {
    font-size: 16px;
  }
}

.value {
  color: #303133;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

.slogan-value {
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.6;
}

.card-footer {
  padding: 24px 0px;
  background: #f1f1f15c;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  min-height: 24px;
  align-items: center;
  margin-top: auto;
}

.el-button-group {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  overflow: hidden;
}

/* 响应式布局 - 全部保持左右布局 */

/* 中等屏幕适配 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .card-header {
    padding: 18px 20px;
  }

  .card-body {
    padding: 16px 18px;
  }

  .card-body-content {
    gap: 16px;
  }

  .crop-image-container {
    width: 120px;
    height: 120px;
  }

  .info-row {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .label {
    min-width: 85px;
    font-size: 12px;
  }

  .value {
    font-size: 13px;
    line-height: 1.4;
  }

  .slogan-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    padding: 16px 18px;
    gap: 10px;
  }
}

/* 平板适配 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .card-header {
    padding: 16px 18px;
  }

  .crop-name {
    font-size: 14px;
  }

  .card-body {
    padding: 14px 16px;
  }

  .card-body-content {
    gap: 14px;
  }

  .crop-image-container {
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
    line-height: 1.3;
  }

  .slogan-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    padding: 14px 16px;
    gap: 8px;
  }

  .el-button-group {
    gap: 8px;
  }
}

/* 手机横屏/小平板 (600px - 767px) */
@media (min-width: 600px) and (max-width: 767px) {
  .card-header {
    padding: 14px 16px;
  }

  .crop-name {
    font-size: 13px;
  }

  .card-body {
    padding: 12px 14px;
  }

  .card-body-content {
    gap: 12px;
  }

  .crop-image-container {
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
    line-height: 1.3;
  }

  .slogan-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    padding: 12px 14px;
    gap: 6px;
  }

  .el-button-group {
    gap: 6px;
    flex-wrap: wrap;
  }
}

/* 手机竖屏 (480px - 599px) - 信息行改为垂直 */
@media (min-width: 480px) and (max-width: 599px) {
  .card-header {
    padding: 12px 14px;
  }

  .crop-name {
    font-size: 12px;
  }

  .card-body {
    padding: 10px 12px;
  }

  .card-body-content {
    gap: 10px;
  }

  .crop-image-container {
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
    line-height: 1.3;
    padding-left: 20px;
  }

  .slogan-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    padding: 10px 12px;
    gap: 5px;
  }

  .el-button-group {
    width: 100%;
    flex-wrap: wrap;
    gap: 5px;
  }
}

/* 小屏手机 (max-width: 479px) - 信息行改为垂直 */
@media (max-width: 479px) {
  .card-header {
    padding: 10px 12px;
  }

  .crop-name {
    font-size: 11px;
  }

  .card-body {
    padding: 8px 10px;
  }

  .card-body-content {
    gap: 8px;
  }

  .crop-image-container {
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
    line-height: 1.3;
    padding-left: 18px;
  }

  .slogan-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    padding: 8px 10px;
    gap: 4px;
  }

  .el-button-group {
    width: 100%;
    flex-wrap: wrap;
    gap: 4px;
  }
}

/* 旧的响应式代码保留 */
@media (max-width: 768px) {
  .card-body-content-old {
    flex-direction: column;
    gap: 16px;
  }
  
  .crop-image-container {
    width: 100%;
    height: 180px;
    align-self: center;
  }
  
  .info-row {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .label {
    min-width: 90px;
  }
  
  .card-footer {
    padding: 10px 0px;
    min-height: 20px;
    gap: 3px;
  }
  
  .el-button-group {
    width: 100%;
    gap: 3px;
    justify-content: space-between;
  }
}
</style>
