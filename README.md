# OVS - Object View Script

> 声明式 UI 语法，JavaScript 的超集，编译为 Vue 渲染函数，完全兼容vue生态

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
div({ class: 'container' }) {
  h1 { 'Hello OVS!' }
  button({ onClick: handleClick }) { 'Click Me' }
}
```

**特点：**
- ✅ **纯 JavaScript 超集** - 所有 JS 语法都可用
- ✅ **无需 JSX** - 原生大括号语法
- ✅ **完整 IDE 支持** - 代码补全、类型检查、跳转定义
- ✅ **Vue 3 运行时** - 编译为高效的 Vue 渲染函数

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

在 VSCode 扩展商店搜索 **"Ovs Language"** 并安装。

### 3. 开始编写

创建 `.ovs` 文件：

```javascript
// src/components/Hello.ovs
import { ref } from 'vue'

const count = ref(0)

div({ class: 'hello' }) {
  h1 { 'Hello OVS!' }
  p { `Count: ${count.value}` }
  button({ onClick: () => count.value++ }) { '+1' }
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

### 属性传递

使用 `标签名(属性对象) { 内容 }` 传递属性：

```javascript
div({ class: 'container', id: 'app' }) {
  a({ href: 'https://example.com', target: '_blank' }) {
    'Click here'
  }
}

// 事件处理
button({ onClick: () => console.log('clicked') }) {
  'Click Me'
}
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

---

## 进阶用法

### 组件定义

使用 `ovsView` 关键字定义可复用组件：

```javascript
// 定义组件
ovsView Card(state):
div({ class: 'card' }) {
  h2 { state.props.title }
  p { state.props.content }
  state.children  // 渲染子元素
}

// 使用组件
Card({ title: 'Hello', content: 'World' }) {
  span { 'Extra content' }
}
```

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
  button({ onClick: () => count.value++ }) { 'Add' }
}
```

---

## 完整示例

```javascript
// HelloWorld.ovs
import { ref } from 'vue'

const msg = "You did it!"
const count = ref(0)

div({ class: 'greetings', onClick: () => count.value = 0 }) {
  h1({ class: 'green' }) { msg }

  #{
    // 纯逻辑代码，不渲染
    console.log('Component rendered')
  }

  h2 { `Clicked ${count.value} times` }

  h3 {
    "Built with "
    a({ href: 'https://vuejs.org/', target: '_blank' }) { 'Vue 3' }
    ' + '
    a({ href: 'https://github.com/aspect-apps/ovsjs', target: '_blank' }) { 'OVS' }
  }

  button({ onClick: () => count.value++ }) { 'Click Me' }
}
```

---

# 设计理念与原理

## 设计理念

### 1. JavaScript 超集，最小侵入

OVS 只添加了两个语法扩展：
- `tag {}` / `tag() {}` - 元素声明
- `#{}` - 不渲染块

其他都是标准 JavaScript，学习成本极低。

### 2. 声明式 UI，无需 JSX

不需要学习 JSX 语法，使用原生大括号 `{}` 更符合 JavaScript 习惯：

```javascript
// JSX 方式
<div className="container">
  <h1>{title}</h1>
</div>

// OVS 方式
div({ class: 'container' }) {
  h1 { title }
}
```

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
div({ class: 'container' }) {
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
├── vite-plugin-ovs/        # Vite 插件
├── slime/                  # JS/TS 解析器
└── subhuti/                # Parser 框架
```

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

**OVS** - _WEB 端声明式 UI，简洁优雅_ ✨