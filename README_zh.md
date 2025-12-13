# OVS - Object View Script

> **OVS** - 一个纯 JavaScript 的声明式 UI，一种 Vue DSL，让你用更简洁、优雅、灵活的语法编写 Vue，灵感来自 Kotlin-HTML、SwiftUI 和 SolidJS。

[![Documentation](https://img.shields.io/badge/docs-deepwiki-blue)](https://deepwiki.com/alamhubb/ovsjs/)
[![VSCode Extension](https://img.shields.io/badge/VSCode-Extension-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=alamhubb.ovs-language)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**[English](README.md)** | 中文

<p align="center">
  <a href="#快速开始">快速开始</a> •
  <a href="#基础语法">基础语法</a> •
  <a href="#进阶用法">进阶用法</a> •
  <a href="#设计理念">设计理念</a> •
  <a href="#编译原理">编译原理</a>
</p>

---

## 简介

OVS 是一种声明式 UI 语法扩展，让你用更简洁的方式编写 Vue 组件：

```javascript
// OVS 语法
div(class = 'container') {
  h1 { 'Hello OVS!' }
  button(onClick() { handleClick() }) { 'Click Me' }
}
```

**特点：**
- ✅ **纯 JavaScript 超集** - 所有 JS 语法都可用
- ✅ **零模板指令** - 没有 `v-if`、`v-for`，直接用原生 `if/for`
- ✅ **无需 JSX** - 原生大括号语法，没有 `className`，没有 `{}` 包裹
- ✅ **完整 IDE 支持** - 代码补全、类型检查、跳转定义
- ✅ **Vue 3 运行时** - 编译为高效的 Vue 渲染函数

---

## 为什么选择 OVS？

OVS 解决了 Vue 模板不够灵活的问题，同时比 JSX 写起来更优雅。

### Vue Template vs JSX vs OVS

**条件渲染：**

```javascript
// ❌ Vue Template - 自定义指令，灵活性受限
<template>
  <div v-if="isLoggedIn">Welcome, {{ username }}</div>
  <div v-else>Please login</div>
</template>

// ❌ JSX - 三元表达式，嵌套时难以阅读
{isLoggedIn ? <div>Welcome, {username}</div> : <div>Please login</div>}

// ✅ OVS - 原生 JavaScript，干净直观
if (isLoggedIn) {
  div { `Welcome, ${username}` }
} else {
  div { 'Please login' }
}
```

**列表渲染：**

```javascript
// ❌ Vue Template - v-for 指令，特殊的 :key 语法
<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>

// ❌ JSX - .map() 回调，需要 return 和 key 属性
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// ✅ OVS - 原生 for...of，简单直接
ul {
  for (const item of items) {
    li { item.name }
  }
}
```

**复杂逻辑：**

```javascript
// ❌ Vue Template - 复杂逻辑需要 computed 或 methods
// ❌ JSX - 内联逻辑用 && 和三元链会变得混乱

// ✅ OVS - 直接写 JavaScript！
div {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  if (total > 100) {
    span(class = 'discount') { '免运费！' }
  }

  for (const item of items) {
    if (item.inStock) {
      ProductCard(product = item) { }
    }
  }
}
```

### 核心优势对比

| 特性 | Vue Template | JSX | OVS |
|------|-------------|-----|-----|
| 控制流 | `v-if`, `v-for` 指令 | `&&`, `? :`, `.map()` | 原生 `if`, `for` |
| Class 属性 | `class` | `className` | `class` |
| 表达式语法 | `{{ }}` | `{ }` | 直接引用 |
| 学习成本 | 模板语法 | JSX 规则 | 只需 JavaScript |
| 灵活性 | 有限 | 高 | 高 |
| 可读性 | 简单场景好 | 嵌套复杂 | 干净直观 |

---

## 快速开始

### 1. 创建项目

```bash
npm create ovs@latest my-app
cd my-app
npm install
npm run dev
```

### 2. 安装 VSCode 插件

安装 **[Ovs Language](https://marketplace.visualstudio.com/items?itemName=alamhubb.ovs-language)** 插件。

### 3. 开始编写

创建 `.ovs` 文件：

```javascript
// src/components/Hello.ovs
import { ref } from 'vue'

const count = ref(0)

div(class = 'hello') {
  h1 { 'Hello OVS!' }
  p { `Count: ${count.value}` }
  button(onClick() { count.value++ }) { '+1' }
}
```

---

## 基础语法

### 元素声明

使用 `标签名 { 内容 }` 声明元素：

```javascript
div { 'Hello World' }

// 嵌套元素
div {
  h1 { 'Title' }
  p { 'Content' }
}
```

### 属性传递 (OvsArguments)

使用 `标签名(属性 = 值) { 内容 }` 传递属性：

```javascript
div(class = 'container', id = 'app') {
  a(href = 'https://example.com', target = '_blank') {
    'Click here'
  }
}

// 事件处理 - 方法简写
button(onClick() { console.log('clicked') }) {
  'Click Me'
}

// 简写属性（类似 ES6 对象简写）
const disabled = true
button(disabled) { 'Submit' }

// 展开属性
const props = { class: 'btn', id: 'submit' }
button(...props) { 'Submit' }
```

### 文本和表达式

直接写字符串或 JavaScript 表达式：

```javascript
div {
  'Static text'           // 静态文本
  `Dynamic: ${value}`     // 模板字符串
  someVariable            // 变量
  computedValue()         // 函数调用
}
```

### 条件渲染

使用标准 JavaScript 条件语句：

```javascript
div {
  if (isLoggedIn) {
    span { `Welcome, ${username}` }
  } else {
    button { 'Login' }
  }
}
```

### 列表渲染

使用 `for...of` 循环：

```javascript
ul {
  for (const item of items) {
    li { item.name }
  }
}
```

### 组件定义

使用 `view` 软关键字定义可复用组件：

```javascript
// 定义组件
view Card(props) {
  div(class = 'card') {
    h2 { props.title }
    p { props.content }
    props.children  // 渲染子元素
  }
}

// 使用组件
Card(title = 'Hello', content = 'World') {
  span { 'Extra content' }
}
```

> **注意**：`view` 是软关键字（上下文关键字），只在组件声明位置有特殊含义。
> 你仍然可以在其他地方使用 `view` 作为变量名：`const view = someValue`

---

## 进阶用法

### 不渲染块 `#{}`

在 `#{}` 内的代码不会被渲染到 DOM，用于纯逻辑操作：

```javascript
div {
  #{
    // 这里是纯 JS 逻辑，不渲染
    const data = processData(rawData)
    console.log('Processing...')
  }

  // 这里会渲染
  span { data.result }

  #{
    // 但 #{} 内的 OVS 元素仍然会渲染
    p { 'This will render!' }
  }
}
```

**规则：**
- `#{}` 内的普通表达式/语句 → 不渲染
- `#{}` 内的 OVS 元素（如 `p {}`） → 仍然渲染（OVS 元素优先级最高）

### 响应式数据

配合 Vue 的 `ref` 和 `reactive` 使用：

```javascript
import { ref, reactive } from 'vue'

const count = ref(0)
const user = reactive({ name: 'Alice', age: 25 })

div {
  p { `Count: ${count.value}` }
  p { `Name: ${user.name}` }
  button(onClick() { count.value++ }) { 'Add' }
}
```

---

## 完整示例

```javascript
// HelloWorld.ovs
import { ref } from 'vue'

// 定义子组件
view CountDisplay(props) {
  div(class = 'count-display') {
    span { 'Current count: ' }
    strong(style = 'color: #42b883; font-size: 24px;') { props.count }
  }
}

// 主视图
div(class = 'greetings', onClick() { count.value = 0 }) {
  const msg = "You did it!"
  let count = ref(0)

  // 定时器每秒+1
  const timer = setInterval(() => {
    count.value = count.value + 1
  }, 1000)

  h1(class = 'green') { msg }

  h3 {
    "Built with "
    a(href = 'https://vuejs.org/', target = '_blank') { 'Vue 3' }
    ' + '
    a(href = 'https://github.com/alamhubb/ovsjs', target = '_blank') { 'OVS' }
  }

  // 内联元素赋值
  const countView = span { count }

  // 使用组件传递 props
  CountDisplay(count = countView) { }

  p(style = 'color: #888; font-size: 12px;') { '(Click anywhere to reset)' }
}
```

---

# 设计理念与原理

## 设计理念

### 1. JavaScript 超集，最小侵入

OVS 只添加了三个语法扩展：
- `tag {}` / `tag(props) {}` - 元素声明，使用 OvsArguments 语法
- `view Name(props) {}` - 组件声明（`view` 是软关键字）
- `#{}` - 不渲染块

其他都是标准 JavaScript，学习成本极低。

### 2. OvsArguments - 更简洁的属性语法

OVS 使用特殊的属性语法，比对象字面量更简洁：

```javascript
// OvsArguments 语法 (OVS)
div(class = 'container', id = 'app', onClick() { handle() }) {
  'content'
}

// 编译为：
$OvsHtmlTag.div({ class: 'container', id: 'app', onClick() { handle() } }, ['content'])
```

**OvsArguments 特性：**
- `prop = value` - 属性赋值（使用 `=` 而不是 `:`）
- `method() {}` - 方法简写
- `shorthand` - 简写属性（类似 ES6）
- `...spread` - 展开运算符

### 3. 完整类型支持

OVS 编译时生成精确的 Source Map，IDE 能够：
- 准确定位到原始 `.ovs` 文件位置
- 提供完整的 TypeScript 类型检查
- 支持跳转定义、重命名等重构功能

---

## 编译原理

### OVS 元素的双重身份

OVS 元素（如 `div { }`）既可以作为**语句**，也可以作为**表达式**：

```javascript
// 作为语句（OvsRenderStatement）
div { 'hello' }

// 作为表达式（OvsRenderFunction）
const element = div { 'hello' }
```

**设计原因：解决 ASI（自动分号插入）问题**

在 JavaScript 中，以下代码会因为 ASI 规则失败：
```javascript
div { 'a' } div { 'b' }  // 两个连续的 OVS 元素
```

如果 OVS 元素只作为表达式，需要通过 `ExpressionStatement` 包装，而 ASI 规则无法识别 `}` 后面紧跟标识符的情况。

**解决方案：借鉴 ES 规范的设计**

类似于 `function` 和 `class` 可以同时作为声明和表达式：
- 在语句位置 → 解析为 `OvsRenderStatement`（不需要分号）
- 在表达式位置 → 解析为 `OvsRenderFunction`（用于赋值等场景）

```javascript
// 这些都可以正确解析
div { 'a' } div { 'b' }           // 两个 OvsRenderStatement
div { span { 'a' } span { 'b' } } // 嵌套的 OvsRenderStatement
const x = div { 'hello' }         // OvsRenderFunction 作为表达式
```

### HTML 标签自动转换

OVS 编译器会将 HTML 标签自动转换为 `$OvsHtmlTag.xxx()` 调用：

```javascript
// 输入（OVS）
div(class = 'container') {
  h1 { 'Hello' }
}

// 输出（JavaScript）
$OvsHtmlTag.div({ class: 'container' }, [
  $OvsHtmlTag.h1({}, ['Hello'])
])
```

**为什么用 `$OvsHtmlTag`？**

避免与用户变量冲突。如果直接使用 `div`，用户定义的 `const div = ...` 会覆盖它。

### 编译为 Vue 渲染函数

OVS 最终编译为 Vue 的 `h()` 函数调用：

```javascript
// $OvsHtmlTag.div 内部实现
function div(props, children) {
  return defineComponent(() => {
    return () => h('div', props, children)
  })
}
```

### 表达式渲染规则

在 OVS 渲染上下文（`div {}` 内部）中，**求值表达式**会被渲染，**副作用表达式**不会被渲染：

| 表达式类型 | 示例 | 渲染？ | 说明 |
|-----------|------|--------|------|
| 字符串/数字字面量 | `'hello'`, `123` | ✅ 渲染 | 求值表达式 |
| 变量引用 | `count`, `user.name` | ✅ 渲染 | 求值表达式 |
| 函数调用 | `func()`, `getData()` | ✅ 渲染 | 求值表达式（渲染返回值） |
| OVS 元素 | `div {}`, `span { 'hi' }` | ✅ 渲染 | 求值表达式 |
| 赋值表达式 | `x = 1`, `x += 1` | ❌ 不渲染 | 副作用表达式 |
| 更新表达式 | `x++`, `++x`, `x--` | ❌ 不渲染 | 副作用表达式 |
| delete 表达式 | `delete obj.prop` | ❌ 不渲染 | 副作用表达式 |
| void 表达式 | `void doSomething()` | ❌ 不渲染 | 显式丢弃返回值 |

**示例：**
```javascript
div {
  // 这些会渲染
  'hello'              // → children.push('hello')
  count                // → children.push(count)
  func()               // → children.push(func())

  // 这些不会渲染（副作用表达式）
  x = 1                // → x = 1
  count++              // → count++
  void doSomething()   // → void doSomething()
}
```

**设计原因：**
- 赋值和更新的主要目的是产生**副作用**，返回值只是副产品
- `void` 的语义就是"执行但丢弃返回值"
- 如果需要同时赋值并渲染，可以显式写两行

```javascript
div {
  x = getNewValue()    // 只赋值
  x                    // 显式渲染
}
```

### 简单视图 vs 复杂视图

编译器会智能判断视图复杂度：

**简单视图（无 IIFE）：**
```javascript
// 输入
div { h1 { 'Hello' } }

// 输出（直接调用，无包装）
$OvsHtmlTag.div({}, [$OvsHtmlTag.h1({}, ['Hello'])])
```

**复杂视图（使用 IIFE）：**
```javascript
// 输入
div {
  const x = 1
  h1 { x }
}

// 输出（IIFE 包装）
(function() {
  const children = []
  const x = 1
  children.push($OvsHtmlTag.h1({}, [x]))
  return $OvsHtmlTag.div({}, children)
})()
```

**IIFE 判断规则：**

只要满足以下任一条件，就使用 IIFE（复杂模式）：
1. 有非 ExpressionStatement（变量声明、控制流语句等）
2. 有来自 `#{}` 不渲染块的语句
3. 有副作用表达式（赋值/更新/delete/void）

### 不渲染块 `#{}` 的处理

`#{}` 内的代码会被展开，但不会被 `children.push()` 包装：

```javascript
// 输入
div {
  #{ const x = compute() }
  h1 { x }
}

// 输出
(function() {
  const children = []
  const x = compute()           // 展开，不 push
  children.push($OvsHtmlTag.h1({}, [x]))  // 正常 push
  return $OvsHtmlTag.div({}, children)
})()
```

**特例：`#{}` 内的 OVS 元素仍然渲染**

```javascript
// 输入
div {
  #{ p { 'Still renders!' } }
}

// 输出 - p {} 仍然被 push
(function() {
  const children = []
  children.push($OvsHtmlTag.p({}, ['Still renders!']))
  return $OvsHtmlTag.div({}, children)
})()
```

---

## 核心技术栈

| 组件 | 描述 |
|------|------|
| **[Subhuti](./subhuti/)** | Parser 生成器框架，使用装饰器定义语法规则 |
| **[Slime](./slime/)** | JavaScript/TypeScript 容错解析器 |
| **[Volar](https://volarjs.dev/)** | Language Server 框架，提供 IDE 支持 |
| **[Vue 3](https://vuejs.org/)** | 运行时框架 |

### 项目结构

```
test-volar/
├── ovs/                    # OVS 编译器 + 运行时
│   ├── ovs-compiler/       # 编译器（Parser + AST 转换）
│   └── ovs-runtime/        # 运行时（$OvsHtmlTag + defineOvsComponent）
├── ovs-language/           # VSCode 插件
├── create-ovs/             # 项目脚手架
├── vite-plugin-ovs/        # Vite 插件（集成 cssts）
├── cssts/                  # CssTs 核心（css {} 语法编译器）
├── cssts-types/            # CssTs 类型定义
├── cssts-theme-element/    # Element Plus 主题原子类
├── cssts-ui/               # Element Plus 源码（CssTs 实现对比）
├── vite-plugin-cssts/      # CssTs Vite 插件
├── slime/                  # JS/TS 解析器
└── subhuti/                # Parser 框架
```

---

## CssTs-UI - Element Plus 的 CssTs 实现

`cssts-ui/` 是 [Element Plus](https://github.com/element-plus/element-plus) 的 fork，用于演示如何使用 CssTs 原子类重写组件库。

### 目录结构

```
cssts-ui/
├── packages/
│   ├── components/         # 原始 Element Plus 组件（Vue SFC + SCSS）
│   ├── cssts-components/   # CssTs 重写的组件（OVS + css {}）
│   └── theme-chalk/        # 原始 SCSS 主题
```

### 对比：原始版本 vs CssTs 版本

**原始 Element Plus（Vue SFC + SCSS）：**
- 组件位于 `packages/components/`
- 样式位于 `packages/theme-chalk/`
- 使用 BEM 命名规范
- 需要 SCSS 编译

**CssTs 版本（OVS + css {}）：**
- 组件位于 `packages/cssts-components/`
- 样式使用 `css {}` 语法内联定义
- 类型安全的原子类
- 无需外部 CSS 文件

---

## CssTs - CSS-in-TypeScript

OVS 集成了 CssTs，提供类型安全的原子类样式：

```javascript
// 使用 css {} 语法定义样式
const buttonStyle = css {
  displayInlineFlex,
  justifyContentCenter,
  alignItemsCenter,
  height32px,
  paddingLeft15px,
  paddingRight15px,
  fontSize14px,
  borderRadius4px,
  cursorPointer
}

// 在 OVS 中使用
button(class = buttonStyle) { '点击我' }
```

### 命名规范

CssTs 使用 `property_value` 格式作为 CSS 类名：

| TS 变量名 | CSS 类名 | CSS 规则 |
|-----------|----------|----------|
| `displayFlex` | `.display_flex` | `display: flex` |
| `height32px` | `.height_32px` | `height: 32px` |
| `justifyContentCenter` | `.justify-content_center` | `justify-content: center` |

**重要：数值必须带单位！**
```typescript
// ✅ 正确
height32px, fontSize14px, paddingLeft15px

// ❌ 错误（缺少单位）
height32, fontSize14, paddingLeft15
```

详细文档请参考：
- [cssts/README.md](./cssts/README.md) - 核心编译器
- [cssts-types/README.md](./cssts-types/README.md) - 命名规范
- [vite-plugin-cssts/README.md](./vite-plugin-cssts/README.md) - Vite 插件

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🔗 链接

- **文档**: [deepwiki.com/alamhubb/ovsjs](https://deepwiki.com/alamhubb/ovsjs/)
- **关键词**: `vue-kotlin` `vue-dsl` `declarative-vue` `declarative-ui-syntax-in-vue` `vue-swiftui` `vue-flutter` `vue-solidjs` `vue-dsl-in-pure-javascript` `declarative-dsl-vue`

---

**OVS** - _WEB 端声明式 UI，简洁优雅_ ✨
