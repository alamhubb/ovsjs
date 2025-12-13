<script setup lang="ts">
import { ref } from 'vue'
import { Counter } from './Counter.ovs'
// 导入 cssts-ui 的 Button 组件
import { Button } from '@cssts-ui/components'

const count = ref(0)
const handleClick = () => {
  count.value++
}

const handleButtonClick = () => {
  window.alert('CssTs Button clicked!')
}
</script>

<template>
  <div class="test-container">
    <h1>🧪 OVS + CssTs 基础测试</h1>
    <p>测试 vite-plugin-ovs 和 cssts 的基本功能</p>

    <div class="test-section">
      <h2>Vue 计数器</h2>
      <p>当前计数: {{ count }}</p>
      <button @click="handleClick">点击增加</button>
    </div>

    <div class="test-section">
      <h2>OVS 组件测试</h2>
      <Counter :initial="10" />
    </div>

    <div class="test-section">
      <h2>CssTs-UI Button 组件</h2>
      <div class="button-row">
        <Button type="primary" @click="handleButtonClick">Primary</Button>
        <Button type="success">Success</Button>
        <Button type="warning">Warning</Button>
        <Button type="danger">Danger</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #66b1ff;
}
</style>
