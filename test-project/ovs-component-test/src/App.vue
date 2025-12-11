<script setup lang="ts">
import OvsButton from './components/OvsButton.ovs'
import OvsCounter from './components/OvsCounter.ovs'
import OvsInput from './components/OvsInput.ovs'
import OvsCard from './components/OvsCard.ovs'

const handleClick = () => {
  window.alert('Button clicked!')
}
</script>

<template>
  <div class="test-container">
    <h1>🧪 OVS + CssTs 组件测试</h1>
    <p>使用 cssts 原子类样式</p>

    <!-- 按钮组件测试 -->
    <div class="test-section">
      <h2>📦 Button 组件</h2>
      <div class="test-row">
        <span class="test-label">类型变体:</span>
        <OvsButton type="primary">Primary</OvsButton>
        <OvsButton type="success">Success</OvsButton>
        <OvsButton type="warning">Warning</OvsButton>
        <OvsButton type="danger">Danger</OvsButton>
      </div>
      <div class="test-row">
        <span class="test-label">点击事件:</span>
        <OvsButton type="primary" @click="handleClick">点击我</OvsButton>
      </div>
    </div>

    <!-- 计数器组件测试 -->
    <div class="test-section">
      <h2>🔢 Counter 组件</h2>
      <OvsCounter :initial-value="0" />
    </div>

    <!-- 输入框组件测试 -->
    <div class="test-section">
      <h2>✏️ Input 组件</h2>
      <div class="test-row">
        <span class="test-label">基础输入:</span>
        <OvsInput placeholder="请输入内容..." />
      </div>
    </div>

    <!-- 卡片组件测试 -->
    <div class="test-section">
      <h2>🃏 Card 组件</h2>
      <OvsCard title="OVS 组件卡片">
        <p>这是一个使用 OVS 语法编写的卡片组件</p>
        <p>支持传递子内容和属性</p>
      </OvsCard>
    </div>
  </div>
</template>
