<script setup lang="ts">
import { ref } from 'vue'

// Vue SFC 实现的组件（Element Plus 风格）
import ElButton from './components/css/ElButton.vue'
import ElCounter from './components/css/ElCounter.vue'
import ElInput from './components/css/ElInput.vue'
import ElCard from './components/css/ElCard.vue'

// OVS + CssTs 实现的组件
import CsstsButton from './components/cssts/OvsButton.ovs'
import CsstsCounter from './components/cssts/OvsCounter.ovs'
import CsstsInput from './components/cssts/OvsInput.ovs'
import CsstsCard from './components/cssts/OvsCard.ovs'

const handleClick = () => {
  window.alert('Button clicked!')
}

// Counter state
const cssCounterValue = ref(0)
const csstsCounterValue = ref(0)

// Input state
const cssInputValue = ref('')
const csstsInputValue = ref('')
</script>

<template>
  <div class="test-container">
    <h1>🧪 OVS + CssTs 组件测试</h1>
    <p>对比 CSS 实现 vs CssTs 原子类实现</p>

    <!-- ==================== Vue SFC 实现 (Element Plus 风格) ==================== -->
    <div class="impl-section">
      <h2 class="impl-title">📝 Vue SFC 实现 (Element Plus 风格)</h2>
      
      <!-- Button -->
      <div class="test-section">
        <h3>📦 Button 组件</h3>
        <div class="test-row">
          <span class="test-label">类型变体:</span>
          <ElButton type="primary">Primary</ElButton>
          <ElButton type="success">Success</ElButton>
          <ElButton type="warning">Warning</ElButton>
          <ElButton type="danger">Danger</ElButton>
        </div>
        <div class="test-row">
          <span class="test-label">点击事件:</span>
          <ElButton type="primary" @click="handleClick">点击我</ElButton>
        </div>
      </div>

      <!-- Counter -->
      <div class="test-section">
        <h3>🔢 Counter 组件</h3>
        <ElCounter v-model="cssCounterValue" />
      </div>

      <!-- Input -->
      <div class="test-section">
        <h3>✏️ Input 组件</h3>
        <div class="test-row">
          <span class="test-label">基础输入:</span>
          <ElInput v-model="cssInputValue" placeholder="Vue SFC 实现..." />
        </div>
      </div>

      <!-- Card -->
      <div class="test-section">
        <h3>🃏 Card 组件</h3>
        <ElCard header="Vue SFC 卡片">
          <p>使用 Vue SFC + scoped CSS</p>
        </ElCard>
      </div>
    </div>

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

      <!-- Counter -->
      <div class="test-section">
        <h3>🔢 Counter 组件</h3>
        <CsstsCounter :initial-value="0" />
      </div>

      <!-- Input -->
      <div class="test-section">
        <h3>✏️ Input 组件</h3>
        <div class="test-row">
          <span class="test-label">基础输入:</span>
          <CsstsInput placeholder="CssTs 实现..." />
        </div>
      </div>

      <!-- Card -->
      <div class="test-section">
        <h3>🃏 Card 组件</h3>
        <CsstsCard title="CssTs 实现卡片">
          <p>使用 css {} 原子类语法</p>
        </CsstsCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.impl-section {
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.impl-title {
  color: var(--el-color-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--el-color-primary);
}

.test-section h3 {
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  font-size: 16px;
}
</style>
