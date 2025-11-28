# OVS - 声明式 UI 框架

> 使用类似 Flutter/SwiftUI 的语法开发 Vue 应用

![npm version](https://img.shields.io/npm/v/ovsjs?style=flat-square)
![License](https://img.shields.io/npm/l/ovsjs?style=flat-square)

## 📝 简介

OVS 是一个声明式 UI 框架，提供零运行时开销的编译时转换。让你用更直观、更简洁的语法编写 UI。

### ✨ 核心特性

- 🎯 **直观的语法** - 类似 Flutter/SwiftUI，比 JSX 更简洁
- ⚡ **零运行时开销** - 编译时完全转换，无额外运行时库
- 🧩 **完整的组件系统** - 支持 props、children、状态管理
- 📦 **完整 TypeScript 支持** - 编译时类型检查
- 🔄 **智能优化** - 简单视图零 IIFE，代码量减少 40-50%
- 🗺️ **100% Source Map** - 精确的源码映射

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/alamhubb/ovs.git
cd ovs

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器打开
# http://localhost:5173
```

### 第一个 OVS 组件

创建 `hello.ovs` 文件：

```javascript
const greeting = "Hello OVS!"

div {
  h1 { greeting }
  p { "Welcome to declarative UI!" }
}
```

启动开发服务器后，访问 http://localhost:5173 查看结果。

## 📚 完整语法指南

### 基础元素

```javascript
// 简单元素
div { "content" }
h1 { "title" }
p { "paragraph" }

// 嵌套
div {
  h1 { "title" }
  p { "content" }
}

// 表达式
const count = 42
p { count }           // 渲染: 42
p { count + 1 }       // 渲染: 43
```

### 条件渲染

```javascript
const isVisible = true

div {
  if (isVisible) {
    p { "visible" }
  } else {
    p { "hidden" }
  }
}
```

### 循环渲染

```javascript
const items = ["apple", "banana", "cherry"]

div {
  for (let i = 0; i < items.length; i++) {
    p { items[i] }
  }
}
```

### 函数

```javascript
function greet(name) {
  return "Hello, " + name
}

div {
  p { greet("Alice") }
}
```

### 箭头函数

```javascript
const double = (x) => x * 2

p { double(21) }       // 渲染: 42
```

### 纯逻辑隔离 `#{}`

使用 `#{}` 隔离不需要渲染的代码：

```javascript
div {
  #{
    const temp = Math.random()
    console.log("初始化", temp)  // 不显示在页面
  }
  
  p { "visible content" }  // 仍然渲染
}
```

## 🧩 组件系统

### ✅ 方式 1: 箭头函数组件（推荐简单场景）

```javascript
// components.ovs
const theme = { color: "blue" }

export const MyCard = (state) => div {
  h2 { state.props.title }
  p { state.props.content }
}

// 使用
export const App = (state) => div {
  MyCard({
    props: { 
      title: "Card Title", 
      content: "Card content" 
    }
  })
}
```

**编译结果：**
```javascript
export const MyCard = state => createComponentVNode(div, {}, [
  createComponentVNode(h2, {}, [state.props.title]),
  createComponentVNode(p, {}, [state.props.content])
])
```

### ✅ 方式 2: ovsView 组件（推荐正式组件）

```javascript
// components.ovs
export ovsView MyCard(state) : div {
  const { title, content } = state.props
  
  h2 { title }
  p { content }
}

// 使用
export ovsView App(state) : div {
  MyCard({
    props: { 
      title: "Card Title", 
      content: "Card content" 
    }
  })
}
```

**编译结果：**
```javascript
export function MyCard(state) {
  const { title, content } = state.props
  return createComponentVNode(div, {}, [
    createComponentVNode(h2, {}, [title]),
    createComponentVNode(p, {}, [content])
  ])
}
```

**特点：**
- ✅ 正式的函数声明
- ✅ 支持复杂逻辑
- ✅ 代码组织清晰
- ✅ 类型标注友好
- ❌ 比箭头函数多一层函数包裹

---

### ✅ 方式 2.5: 函数声明（更灵活的正式组件）

```javascript
// components.ovs
export function MyCard(state) {
  const { title, content } = state.props
  
  div {
    h2 { title }
    p { content }
  }
}
```

**编译结果：**
```javascript
export function MyCard(state) {
  const { title, content } = state.props
  
  createComponentVNode(div, {}, [
    createComponentVNode(h2, {}, [title]),
    createComponentVNode(p, {}, [content])
  ])
}
```

**特点：**
- ✅ 普通 JavaScript 函数声明
- ✅ 完全的代码灵活性
- ✅ 函数体内只有 `div{}` 等元素会被编译
- ✅ 可以自由组织逻辑（计算、条件、循环等）
- ✅ 适合复杂组件
- **使用场景：** 需要完全代码控制的组件

---

### ✅ 方式 2.6: 函数表达式（另一种正式组件）

```javascript
// components.ovs
export const MyCard = function(state) {
  const { title, content } = state.props
  
  div {
    h2 { title }
    p { content }
  }
}
```

**编译结果：**
```javascript
export const MyCard = function(state) {
  const { title, content } = state.props
  
  createComponentVNode(div, {}, [
    createComponentVNode(h2, {}, [title]),
    createComponentVNode(p, {}, [content])
  ])
}
```

**特点：**
- ✅ 常规函数表达式
- ✅ 完全的代码灵活性
- ✅ 函数体内只有 `div{}` 等元素会被编译
- ✅ 与函数声明功能相同
- **使用场景：** 函数表达式风格的开发者

---

### ✅ 方式 3: 命名导出视图

```javascript
export const Header = div {
  h1 { "Header" }
}

export const Footer = div {
  p { "Footer" }
}

// 使用
import { Header, Footer } from './layout.ovs'

div {
  Header
  p { "main content" }
  Footer
}
```

### ✅ 方式 4: 默认导出

```javascript
export default div {
  "default component"
}

// 使用
import DefaultComponent from './component.ovs'
```

## 🎯 组件对比

| 特性 | 箭头函数 | ovsView | 函数声明 | 函数表达式 | 命名导出 | 默认导出 |
|------|---------|---------|---------|----------|---------|---------|
| **语法简洁度** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **参数接收** | state | state | state | state | - | - |
| **代码灵活性** | 中等 | 中等 | ★★★★★ | ★★★★★ | 低 | 低 |
| **无 IIFE 开销** | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **支持复杂逻辑** | ✅ | ✅ | ✅ | ✅ | ⚠️ 简单 | ⚠️ 简单 |
| **类型标注** | ❌ | ✅ | ⚠️ 部分 | ⚠️ 部分 | - | - |
| **多个导出** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **推荐场景** | 简单组件 | 正式组件 | 复杂组件 | 复杂组件 | 视图元素 | 模块入口 |

## 📦 编译示例

### 输入代码

```javascript
const a = 123

export const mydiv = (state) => div {
  a
  div { 456 }
}

export ovsView dv2(state) : div {
  a
  div { 456 }
}

export function dv3(state) {
  const b = 789
  div { b }
}

export const dv4 = function(state) {
  const c = 101112
  div { c }
}
```

### 编译输出

```javascript
import {createReactiveVNode} from '../utils/ReactiveVNode';

const a = 123;

// 方式1: 箭头函数
export const mydiv = state => createComponentVNode(div, {}, [
  a, 
  createComponentVNode(div, {}, [456])
]);

// 方式2: ovsView
export function dv2(state) {
  return createComponentVNode(div, {}, [
    a,
    createComponentVNode(div, {}, [456])
  ])
}

// 方式3: 函数声明
export function dv3(state) {
  const b = 789;
  createComponentVNode(div, {}, [b])
}

// 方式4: 函数表达式
export const dv4 = function(state) {
  const c = 101112;
  createComponentVNode(div, {}, [c])
}
```

**关键特性：**
- 箭头函数：最简洁，自动返回
- ovsView：正式声明，显式返回
- 函数声明：完全灵活，只编译 `div{}` 元素
- 函数表达式：与函数声明等价

## 💡 最佳实践

### 1. 组织组件库

```javascript
// components/Button.ovs
export const Button = (state) => button {
  state.props.text
}

// components/Card.ovs
export ovsView Card(state) : div {
  h3 { state.props.title }
  div { state.children }
}

// components/Complex.ovs
export function ComplexComponent(state) {
  const { data, config } = state.props
  
  // 可以在这里做复杂的逻辑
  let result = []
  for (let i = 0; i < data.length; i++) {
    result = result + data[i]
  }
  
  div {
    h2 { result }
  }
}

// app.ovs
import { Button, Card, ComplexComponent } from './components/'

export ovsView App(state) : div {
  Card({ props: { title: "Welcome" } })
  Button({ props: { text: "Click me" } })
  ComplexComponent({ props: { data: [1,2,3] } })
}
```

### 2. 按场景选择导出方式

**简单组件（UI 元素）：** 使用箭头函数
```javascript
export const Badge = (state) => span {
  state.props.label
}
```

**正式组件（标准）：** 使用 ovsView
```javascript
export ovsView UserCard(state) : div {
  const { name, email } = state.props
  h2 { name }
  p { email }
}
```

**复杂组件（需要逻辑控制）：** 使用函数声明或函数表达式
```javascript
export function DataTable(state) {
  const { items, sortBy } = state.props
  
  // 预处理数据
  let sorted = items
  if (sortBy) {
    sorted = items.sort((a, b) => a[sortBy] - b[sortBy])
  }
  
  // 渲染
  table {
    for (let i = 0; i < sorted.length; i++) {
      tr {
        td { sorted[i].name }
      }
    }
  }
}
```

### 3. 函数声明 vs 函数表达式

**等价写法 1 - 函数声明：**
```javascript
export function MyComponent(state) {
  div {
    p { state.props.text }
  }
}
```

**等价写法 2 - 函数表达式：**
```javascript
export const MyComponent = function(state) {
  div {
    p { state.props.text }
  }
}
```

两种方式完全等价，选择你更熟悉的风格即可。

### 4. 在函数中自由编程

```javascript
export function FlexibleComponent(state) {
  const { type, items } = state.props
  
  // 可以做任意 JavaScript 操作
  const filtered = items.filter(item => item.active)
  const total = filtered.reduce((sum, item) => sum + item.value, 0)
  
  // 条件渲染
  if (type === "summary") {
    div {
      h3 { "Total: " + total }
    }
  } else if (type === "list") {
    div {
      for (let i = 0; i < filtered.length; i++) {
        p { filtered[i].name }
      }
    }
  } else {
    div {
      "Unknown type"
    }
  }
}
```

### 5. 数据隔离示例

```javascript
const userData = {
  name: "Alice",
  email: "alice@example.com"
}

export const UserCard = (state) => div {
  #{
    const user = state.props.user || userData
    const displayName = user.name.toUpperCase()
  }
  
  h2 { displayName }
  p { state.props.user.email }
}
```

## 🛠️ 工具命令

```bash
# 开发服务器
npm run dev              # 启动 Vite 开发服务器

# 编译和构建
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 测试
npm test                 # 运行测试
npm run test:watch      # 监听模式

# 调试工具
npx tsx tests/utils/show-hello-compiled.ts    # 查看编译结果
npx tsx tests/utils/check-iife-ast.ts         # 检查 AST 结构
```

## 📊 源码映射测试

OVS 提供 100% 准确的源码映射，支持所有 JavaScript 特性：

```bash
# 运行映射测试套件
npx tsx test-mapping-suite.ts

# 结果: 51/51 测试通过 ✅
```

## ⚠️ 已知限制

| 限制 | 状态 | 替代方案 |
|-----|------|--------|
| **除法运算符** `a / b` | ⚠️ Lexer 冲突 | 使用 `a * 0.5` 代替 |
| **双斜杠注释** `//` | ⚠️ 不稳定 | 使用有意义的变量名 |
| **Class constructor 参数** | ⚠️ 部分支持 | 简单场景可用 |

## 🎨 浏览器开发

访问 http://localhost:5173 后：

1. **开发者工具** (F12)
2. **Console** - 查看 `createComponentVNode` 调用日志
3. **Elements** - 检查生成的 DOM 结构
4. **Network** - 查看编译后的代码

## 📚 更多资源

- [完整项目文档](./cursor/rules/project.mdc)
- [语法详细说明](./cursor/rules/project.mdc#完整语法参考)
- [性能优化指南](./cursor/rules/project.mdc#性能特性)
- [测试用例](./tests/cases/)

## 🚀 下一步计划

- [ ] VSCode 扩展集成（P0 优先）
- [ ] 语法高亮优化
- [ ] 错误诊断增强
- [ ] 除法运算符支持
- [ ] 官方组件库

## 📄 许可证

MIT

## 👥 贡献

欢迎 PR 和 Issue！

---

**版本**: v0.2.1 | **更新**: 2025-10-31
