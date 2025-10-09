<template>
  <div 
    class="selection-canvas"
    @mousedown="startSelection"
    @mousemove="updateSelection"
    @mouseup="endSelection"
  >
    <!-- 已创建的区域 -->
    <div
      v-for="region in regions"
      :key="region.id"
      class="region"
      :class="{ active: region.id === activeRegionId }"
      :style="{
        left: region.x + 'px',
        top: region.y + 'px',
        width: region.width + 'px',
        height: region.height + 'px'
      }"
      @click.stop="selectRegion(region.id)"
    >
      <div class="region-label">{{ region.label || '未命名' }}</div>
      <button class="delete-btn" @click.stop="deleteRegion(region.id)">×</button>
    </div>
    
    <!-- 正在绘制的选区 -->
    <div
      v-if="isSelecting"
      class="selecting-box"
      :style="{
        left: selectionBox.x + 'px',
        top: selectionBox.y + 'px',
        width: selectionBox.width + 'px',
        height: selectionBox.height + 'px'
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Region {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
}

const emit = defineEmits<{
  regionCreated: [region: Region]
  regionSelected: [regionId: string]
}>()

const regions = ref<Region[]>([])
const activeRegionId = ref<string | null>(null)
const isSelecting = ref(false)
const startPos = reactive({ x: 0, y: 0 })
const selectionBox = reactive({ x: 0, y: 0, width: 0, height: 0 })

function startSelection(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('selection-canvas')) {
    isSelecting.value = true
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    startPos.x = e.clientX - rect.left
    startPos.y = e.clientY - rect.top
    
    selectionBox.x = startPos.x
    selectionBox.y = startPos.y
    selectionBox.width = 0
    selectionBox.height = 0
  }
}

function updateSelection(e: MouseEvent) {
  if (!isSelecting.value) return
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  // 计算选框位置和大小
  const x = Math.min(startPos.x, currentX)
  const y = Math.min(startPos.y, currentY)
  const width = Math.abs(currentX - startPos.x)
  const height = Math.abs(currentY - startPos.y)
  
  selectionBox.x = x
  selectionBox.y = y
  selectionBox.width = width
  selectionBox.height = height
}

function endSelection(e: MouseEvent) {
  if (!isSelecting.value) return
  
  // 最小尺寸检查
  if (selectionBox.width > 10 && selectionBox.height > 10) {
    const newRegion: Region = {
      id: Date.now().toString(),
      x: selectionBox.x,
      y: selectionBox.y,
      width: selectionBox.width,
      height: selectionBox.height
    }
    
    regions.value.push(newRegion)
    activeRegionId.value = newRegion.id
    emit('regionCreated', newRegion)
  }
  
  isSelecting.value = false
}

function selectRegion(id: string) {
  activeRegionId.value = id
  emit('regionSelected', id)
}

function deleteRegion(id: string) {
  const index = regions.value.findIndex(r => r.id === id)
  if (index !== -1) {
    regions.value.splice(index, 1)
  }
  if (activeRegionId.value === id) {
    activeRegionId.value = null
  }
}

function updateRegionLabel(id: string, label: string) {
  const region = regions.value.find(r => r.id === id)
  if (region) {
    region.label = label
  }
}

defineExpose({
  updateRegionLabel,
  regions,
  activeRegionId
})
</script>

<style scoped>
.selection-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  cursor: crosshair;
  overflow: hidden;
}

.selecting-box {
  position: absolute;
  border: 2px dashed #1890ff;
  background: rgba(24, 144, 255, 0.1);
  pointer-events: none;
}

.region {
  position: absolute;
  border: 2px solid #52c41a;
  background: rgba(82, 196, 26, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.region:hover {
  background: rgba(82, 196, 26, 0.15);
  border-color: #73d13d;
}

.region.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

.region-label {
  position: absolute;
  top: -22px;
  left: 0;
  background: #52c41a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
  white-space: nowrap;
}

.region.active .region-label {
  background: #1890ff;
}

.delete-btn {
  position: absolute;
  top: -22px;
  right: 0;
  width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  display: none;
}

.region:hover .delete-btn {
  display: block;
}

.delete-btn:hover {
  background: #ff7875;
}
</style>




