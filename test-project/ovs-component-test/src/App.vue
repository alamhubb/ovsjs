<script setup lang="ts">
import { ref } from 'vue'

// 从 @cssts-ui/components 导入 OVS + CssTs 实现的组件
import { Button as CsstsButton, Input as CsstsInput } from '@cssts-ui/components'

const handleClick = () => {
  window.alert('Button clicked!')
}

// Input state
const csstsInputValue = ref('')
</script>

<template>
  <div class="test-container">
    <h1>🧪 OVS + CssTs 组件测试</h1>
    <p>使用 @cssts-ui/components 中的组件</p>

    <!-- ==================== CssTs 实现 ==================== -->
    <div class="impl-section">
      <h2 class="impl-title">⚡ CssTs 实现 (css {} 原子类语法)</h2>
      
      <!-- Button -->
      <div class="test-section">
        <h3>📦 Button 组件</h3>
        <div class="test-row">
          <span class="test-label">类型变体:</span>
          <CsstsButton type="primary">Primary</CsstsButton>
          <CsstsButton type="success">Success</CsstsButton>
          <CsstsButton type="warning">Warning</CsstsButton>
          <CsstsButton type="danger">Danger</CsstsButton>
        </div>
        <div class="test-row">
          <span class="test-label">点击事件:</span>
          <CsstsButton type="primary" @click="handleClick">点击我</CsstsButton>
        </div>
      </div>

      <!-- Input -->
      <div class="test-section">
        <h3>✏️ Input 组件</h3>
        <div class="test-row">
          <span class="test-label">基础输入:</span>
          <CsstsInput v-model="csstsInputValue" placeholder="CssTs 实现..." />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.impl-section {
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.impl-title {
  color: #409eff;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.test-section {
  margin-bottom: 20px;
}

.test-section h3 {
  color: #303133;
  margin-bottom: 12px;
  font-size: 16px;
}

.test-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.test-label {
  min-width: 80px;
  color: #606266;
}
</style>
