# OVS + CssTs 组件测试项目

对比展示两种组件实现方式：Vue SFC（Element Plus 风格）vs OVS + CssTs 原子类。

## 项目目的

| 实现方式 | 目录 | 特点 |
|---------|------|------|
| **Vue SFC** | `components/css/` | 标准 Vue 单文件组件，使用 scoped CSS |
| **OVS + CssTs** | `components/cssts/` | OVS 语法 + `css {}` 原子类 |

## 运行

```bash
cd test-project/ovs-component-test
npm install
npm run dev
```

访问 http://localhost:5173

## 代码对比

### Vue SFC 实现 (`components/css/ElButton.vue`)

```vue
<template>
  <button :class="buttonClasses" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
}>()

const buttonClasses = computed(() => [
  'el-button',
  `el-button--${props.type}`,
  { 'is-disabled': props.disabled }
])
</script>

<style scoped>
.el-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  padding: 0 15px;
  /* ... 大量 CSS 规则 ... */
}

.el-button--primary {
  background-color: var(--el-color-primary);
  /* ... */
}
</style>
```

### OVS + CssTs 实现 (`components/cssts/OvsButton.ovs`)

```javascript
import { computed } from 'vue'

// 原子类组合
const baseStyle = css {
  displayInlineFlex,
  justifyContentCenter,
  alignItemsCenter,
  height32px,
  paddingLeft15px,
  paddingRight15px
}

const typeStyles = {
  primary: css { bgPrimary, colorWhite },
  success: css { bgSuccess, colorWhite }
}

const buttonClass = computed(() => css {
  ...baseStyle,
  ...typeStyles[props.type]
})

button(class = buttonClass.value, onClick = handleClick) {
  props.children
}
```

## 核心差异

| 特性 | Vue SFC | OVS + CssTs |
|------|---------|-------------|
| 文件格式 | `.vue` (template + script + style) | `.ovs` (纯 JavaScript) |
| 样式定义 | `<style scoped>` 块 | `css {}` 内联语法 |
| 类型安全 | 需要额外配置 | 原生 TypeScript 支持 |
| 样式复用 | CSS 类继承 | 原子类组合 |
| 按需生成 | 全量加载 | 只生成使用的样式 |

## 项目结构

```
ovs-component-test/
├── src/
│   ├── components/
│   │   ├── css/              # Vue SFC 实现
│   │   │   ├── ElButton.vue
│   │   │   ├── ElCounter.vue
│   │   │   ├── ElInput.vue
│   │   │   └── ElCard.vue
│   │   └── cssts/            # OVS + CssTs 实现
│   │       ├── OvsButton.ovs
│   │       ├── OvsCounter.ovs
│   │       ├── OvsInput.ovs
│   │       └── OvsCard.ovs
│   ├── assets/main.css       # CSS 变量定义
│   ├── App.vue               # 对比展示页面
│   └── main.ts
└── vite.config.ts            # 使用 vite-plugin-ovs
```

## 完整源码对比

完整的 Element Plus 源码位于 `cssts-ui/packages/components/`，CssTs 重写版本位于 `cssts-ui/packages/cssts-components/`。
