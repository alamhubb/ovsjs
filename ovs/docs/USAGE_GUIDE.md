# OVS 使用指南

## 快速开始

### 1. 创建 OVS 文件

```javascript
// hello.ovs
export const hello = div {
  const message = "Hello OVS!"
  
  h1 { message }
  
  if (message) {
    p { "Welcome to OVS" }
  }
}
```

### 2. 在 Vue 中使用

```javascript
// app.ts
import {hello} from './hello.ovs'

export const App = {
  render() {
    return hello
  }
}
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 语法规则

### ExpressionStatement 自动渲染

在 `div { }` 中，所有的表达式语句都会被渲染：

```javascript
div {
  123                    // ✅ 渲染
  "hello"                // ✅ 渲染
  variable               // ✅ 渲染
  func()                 // ✅ 渲染
  a + b                  // ✅ 渲染
  a ? b : c              // ✅ 渲染
}
```

### 其他语句保持原样

```javascript
div {
  const data = [1, 2, 3]  // ❌ 不渲染（变量声明）
  
  if (data.length > 0) {   // ❌ if 本身不渲染
    data.length            // ✅ 但内部的表达式会渲染
  }
}
```

## 导出方式

### 命名导出（推荐）

```javascript
// component.ovs
export const myComponent = div {
  "content"
}

// 使用
import {myComponent} from './component.ovs'
```

### 默认导出

```javascript
// component.ovs
const comp = div {
  "content"
}

export default comp

// 使用
import Component from './component.ovs'
```

### 多个导出

```javascript
// components.ovs
export const header = div { "Header" }
export const footer = div { "Footer" }
export const sidebar = div { "Sidebar" }

// 使用
import {header, footer, sidebar} from './components.ovs'
```

### 私有代码

```javascript
// component.ovs
const privateData = "private"  // 不导出，外部无法访问

export const publicComponent = div {
  privateData  // 可以在内部使用
}
```

## 编译结果

### 输入

```javascript
export const hello = div {
  const abc = true
  if (abc) {
    123
  }
}
```

### 输出

```javascript
import OvsAPI from 'ovsjs/src/OvsAPI'
export const hello = (function () {
  const children = []
  const abc = true
  if (abc) {
    children.push(123)
  }
  return OvsAPI.createVNode('div', children)
})()
```

## 嵌套组件

```javascript
export const card = div {
  h2 { "Title" }
  
  div {
    p { "Content" }
    
    span {
      "Nested"
    }
  }
  
  button { "Action" }
}
```

## 与 Vue 的集成

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <component :is="hello" />
  </div>
</template>

<script setup>
import {hello} from './hello.ovs'
</script>
```

### 在 render 函数中使用

```javascript
import {hello} from './hello.ovs'

export default {
  render() {
    return hello
  }
}
```

## 最佳实践

### 1. 使用命名导出

更灵活，可以在一个文件中导出多个组件。

### 2. 保持组件简单

每个 OVS 文件专注于一个功能。

### 3. 利用顶层代码

```javascript
// 顶层代码可以定义常量、函数等
const colors = {
  primary: '#007bff',
  secondary: '#6c757d'
}

function getColor(type) {
  return colors[type]
}

// 在组件中使用
export const button = div {
  const color = getColor('primary')
  button { color }
}
```

### 4. 组合使用

```javascript
// buttons.ovs
export const primaryButton = button { "Primary" }
export const secondaryButton = button { "Secondary" }

// page.ovs
import {primaryButton, secondaryButton} from './buttons.ovs'

export const page = div {
  primaryButton
  secondaryButton
}
```

## 注意事项

1. **表达式会被传递给 Vue**：所有表达式都会被渲染，由 Vue 决定如何处理
2. **作用域隔离**：每个 `div { }` 都有自己的 `children` 作用域
3. **IIFE 包装**：每个 OVS 元素都会被包装为 IIFE
4. **自动导入**：`OvsAPI` 会自动导入，无需手动添加

## 调试

如果遇到问题，可以查看编译后的代码：

```bash
# 运行测试查看生成的代码
cd langServer
npx tsx src/testovsplugin.ts
```

