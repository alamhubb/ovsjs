# OVS 用户指南

> 完整的 OVS 语法、示例和最佳实践

## 📖 目录

1. [快速开始](#快速开始)
2. [语法规则](#语法规则)
3. [导出方式](#导出方式)
4. [支持的功能](#支持的功能)
5. [代码示例](#代码示例)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 快速开始

### 基础示例
```javascript
const appName = "My App"
const version = "1.0"

div {
  h1 { appName }
  p { version }
}
```

这段代码会自动编译为 Vue 可用的代码。

---

## 语法规则

### OVS 元素语法
```javascript
div {
  // 在这里写内容
}

h1 { "Title" }
p { "Paragraph" }
span { variable }
```

### ExpressionStatement 自动渲染

在 `div { }` 中，所有的**表达式语句**都会被渲染：

```javascript
div {
  123                    // ✅ 渲染数字
  "hello"                // ✅ 渲染字符串
  variable               // ✅ 渲染变量值
  func()                 // ✅ 渲染函数返回值
  a + b                  // ✅ 渲染计算结果
}
```

### 其他语句保持原样

```javascript
div {
  const data = [1, 2, 3]  // ❌ 不渲染（变量声明）
  
  if (data.length > 0) {   // ❌ if 本身不渲染
    data.length            // ✅ 但内部的表达式会渲染
  }
  
  for (let i = 0; i < 3; i++) {  // ❌ for 本身不渲染
    i                      // ✅ 但内部的表达式会渲染
  }
}
```

---

## 导出方式

### 方式 1: 命名导出（推荐）
```javascript
export const myComponent = div {
  "content"
}

// 使用
import {myComponent} from './component.ovs'
```

### 方式 2: 默认导出
```javascript
export default div {
  "content"
}

// 使用
import MyComponent from './component.ovs'
```

### 方式 3: 自动默认导出（无显式 export）
```javascript
// 只有声明和表达式，没有 export default
const data = 100

div{456}
div{789}

// 自动生成：
// export default (function() {
//   const children = []
//   ...返回包含所有视图的数组
// })()
```

### 方式 4: 多个导出
```javascript
export const header = div { "Header" }
export const footer = div { "Footer" }
export const sidebar = div { "Sidebar" }

// 使用
import {header, footer, sidebar} from './components.ovs'
```

---

## 支持的功能

### ✅ 完全支持

#### 1. 变量声明
```javascript
const name = "John"
let count = 0
var legacy = "old"
```

#### 2. 函数（⭐ 新增）
```javascript
// Function 声明
function getGreeting() {
  return "Hello!"
}

function add(a, b) {
  return a + b
}

// 箭头函数
const double = (x) => x * 2
const getValue = () => 42
const multiply = (a, b) => a * b
```

#### 3. 循环（⭐ 新增）
```javascript
// For 循环
for (let i = 0; i < items.length; i++) {
  console.log(items[i])
}

// While 循环
let count = 0
while (count < 5) {
  count = count + 1
}
```

#### 4. 条件渲染
```javascript
const isActive = true

div {
  if (isActive) {
    h1 { "Active" }
  }
  
  if (count > 5) {
    p { "High count" }
  }
}
```

#### 5. 算术运算（⭐ 新增）
```javascript
const a = 10
const b = 20

const sum = a + b       // 加法
const diff = a - b      // 减法
const product = a * b   // 乘法
const mod = a % b       // 取模
```

#### 6. 比较运算
```javascript
const x = 10

if (x > 5) { }
if (x < 20) { }
if (x === 10) { }
if (x !== 0) { }
```

#### 7. 嵌套视图
```javascript
div {
  div {
    div {
      p { "任意深度嵌套" }
    }
  }
}
```

### ⚠️ 有限制

- **除法 `/`** - Lexer 冲突，用 `* 0.5` 代替
- **Class** - 基本可用，constructor 参数有小问题
- **注释** - 不稳定，用有意义的变量名代替

---

## 代码示例

### 示例 1: 个人信息卡片
```javascript
const userName = "Alice"
const userAge = 25
const userRole = "Developer"
const isActive = true

div {
  h1 { userName }
  
  div {
    p { "Age: " }
    p { userAge }
  }
  
  div {
    p { "Role: " }
    p { userRole }
  }
  
  if (isActive) {
    div {
      p { "Status: Active" }
    }
  }
}
```

### 示例 2: 函数与循环结合
```javascript
function calculateSum(numbers) {
  let total = 0
  for (let i = 0; i < numbers.length; i++) {
    total = total + numbers[i]
  }
  return total
}

const double = (x) => x * 2

const items = [10, 20, 30]
const sum = calculateSum(items)
const doubled = double(sum)

div {
  h1 { "Calculation Results" }
  
  div {
    p { "Sum: " }
    p { sum }
  }
  
  div {
    p { "Doubled: " }
    p { doubled }
  }
}
```

### 示例 3: 多视图组件
```javascript
const appTitle = "My Dashboard"

export const HeaderView = div {
  h1 { appTitle }
  p { "Welcome" }
}

export const ContentView = div {
  h2 { "Content" }
  p { "Main content area" }
}

export const FooterView = div {
  p { "Footer" }
}
```

---

## 最佳实践

### ✅ 推荐的代码风格

#### 1. 使用有意义的变量名
```javascript
// ✅ 好
const userWelcomeMessage = "Welcome!"
const isUserAuthenticated = true

// ❌ 避免
const msg = "Welcome!"  // 太简短
const flag = true       // 不明确
```

#### 2. 函数封装逻辑
```javascript
// ✅ 好 - 使用函数
function calculateTotal(items) {
  let sum = 0
  for (let i = 0; i < items.length; i++) {
    sum = sum + items[i]
  }
  return sum
}

const total = calculateTotal(items)
```

#### 3. 箭头函数处理简单转换
```javascript
// ✅ 好 - 简洁的转换
const double = (x) => x * 2
const format = (n) => "Value: " + n

// ❌ 避免 - 复杂逻辑放在箭头函数里
const complex = (x) => {
  let result = x
  for (let i = 0; i < 10; i++) {
    result = result + i
  }
  return result
}  // 改用 function 声明
```

#### 4. 保持组件简单
```javascript
// ✅ 好 - 专注单一功能
export const UserCard = div {
  h2 { userName }
  p { userAge }
}

// ❌ 避免 - 过于复杂
export const ComplexComponent = div {
  // 100 行代码...
}
```

### ❌ 避免的模式

```javascript
// 不要使用注释（不稳定）
// const x = 100  // ❌

// 不要使用除法（Lexer 冲突）
const half = value / 2  // ❌
const half = value * 0.5  // ✅

// 不要过度嵌套
div { div { div { div { div {  // ❌ 太深
```

---

## 常见问题

### Q: 如何调试？
**A:** 打开浏览器控制台（F12），查看：
- Console 输出
- Elements 查看 DOM 结构
- Network 查看编译后的代码

### Q: 如何查看编译后的代码？
**A:** 运行测试：
```bash
npx tsx ovs/src/test-final.ts
```

### Q: 为什么不能使用除法？
**A:** Lexer 把 `/` 当成注释开始。替代方案：用乘法 `* 0.5`

### Q: 如何实现列表渲染？
**A:** 使用 for 循环：
```javascript
const items = ["A", "B", "C"]

for (let i = 0; i < items.length; i++) {
  div {
    p { items[i] }
  }
}
```

### Q: 如何组合多个组件？
**A:** 使用命名导出：
```javascript
// components.ovs
export const Header = div { "Header" }
export const Footer = div { "Footer" }

// app.ovs
import {Header, Footer} from './components.ovs'

div {
  Header
  Footer
}
```

---

## 🧪 实践练习

### 练习 1: 基础
复制 `test-cases/case1-simple.ovs` 到 `hello.ovs`，查看效果

### 练习 2: 条件渲染
复制 `test-cases/case3-conditional.ovs`，修改条件值

### 练习 3: 箭头函数
复制 `test-cases/case8-arrow-function.ovs`，添加自己的函数

### 练习 4: 综合应用
组合 function、循环、条件渲染，创建一个小应用

---

## 🔗 相关文档

- **[测试用例](../test-cases/README.md)** - 9个完整示例
- **[实现原理](IMPLEMENTATION.md)** - 技术细节
- **[渲染机制](OVS_RENDER_DOM_VIEW_DECLARATION.md)** - 核心原理

---

**返回主文档：** [aireadme.md](../aireadme.md)

