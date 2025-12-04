# OvsParser 需求文档

## 1. 概述

OvsParser 是 OVS（Object-oriented View Syntax）语言的解析器，它**继承自 SlimeParser（ES2025 JavaScript 解析器）**，在标准 JavaScript 语法基础上扩展了声明式 UI 语法。

### 1.1 核心理念

OVS 是 JavaScript 的**超集**：
- ✅ 所有 ES2025 JavaScript 语法都应该正常工作
- ✅ 额外支持 OVS 特有的 UI 声明语法
- ✅ 编译后输出标准 JavaScript 代码

## 2. OVS 特有语法

### 2.1 OvsRenderFunction（视图渲染函数）

**语法**: `tagName { ... }` 或 `tagName(args) { ... }`

**示例**:
```javascript
div {
  h1 { "Hello" }
  p { greeting }
}

// 带参数
div(style) {
  content
}
```

**解析规则**:
- `IdentifierName` - 标签名（div, h1, p 等）
- `Arguments?` - 可选的参数
- `LBrace` - 左大括号
- `StatementList?` - 可选的语句列表
- `RBrace` - 右大括号

### 2.2 OvsViewDeclaration（ovsView 组件声明）

**语法**: `ovsView ComponentName(params): tagName { ... }`

**示例**:
```javascript
export ovsView MyCard(state): div {
  h2 { state.props.title }
  p { state.props.content }
}
```

**解析规则**:
- `OvsViewToken` - 关键字 "ovsView"
- `IdentifierName` - 组件名
- `FunctionFormalParameters?` - 可选的参数列表
- `Colon` - 冒号
- `OvsRenderFunction` - 视图内容

### 2.3 NoRenderBlock（不渲染代码块）

**语法**: `#{ ... }`

**示例**:
```javascript
div {
  #{
    const x = 1
    console.log("debug:", x)  // 这些语句不会被渲染为 VNode
  }
  
  p { "hello" }  // 这个会被渲染
}
```

**解析规则**:
- `Hash` - `#` 符号
- `LBrace` - 左大括号
- `StatementList?` - 可选的语句列表
- `RBrace` - 右大括号

## 3. OvsParser 需要覆盖的规则

### 3.1 Statement 规则

**目的**: 在标准 Statement 中添加 `NoRenderBlock` 支持

**SlimeParser 原始规则**:
```javascript
Statement → BlockStatement | VariableStatement | EmptyStatement | ExpressionStatement | ...
```

**OvsParser 修改**:
```javascript
Statement → NoRenderBlock | BlockStatement | VariableStatement | ...
```

⚠️ **注意**: 应该调用 `VariableStatement`，不是 `VariableDeclaration`

### 3.2 Declaration 规则

**目的**: 添加 `OvsViewDeclaration` 支持

**SlimeParser 原始规则**:
```javascript
Declaration → HoistableDeclaration | ClassDeclaration | LexicalDeclaration
```

**OvsParser 修改**:
```javascript
Declaration → OvsViewDeclaration | HoistableDeclaration | ClassDeclaration | LexicalDeclaration
```

⚠️ **注意**: 应该调用 `LexicalDeclaration`，不是 `VariableDeclaration`

### 3.3 PrimaryExpression 规则

**目的**: 支持 `OvsRenderFunction` 作为原子表达式

#### 3.3.1 设计理念

JavaScript 表达式有层次结构，从最底层到最高层：

```
Expression（最高层 - 逗号表达式）
  └─ AssignmentExpression（赋值、箭头函数）
       └─ ConditionalExpression（三元 a ? b : c）
            └─ 各种二元运算（||, &&, +, *, ...）
                 └─ UnaryExpression（!x, -x）
                      └─ CallExpression（foo()）
                           └─ MemberExpression（obj.prop）
                                └─ PrimaryExpression（最底层 - 原子）
```

**PrimaryExpression（原子表达式）** 是不能再分解的最小单位：
- `this`, `123`, `"hello"`, `true`, `null`（字面量）
- `foo`（变量引用）
- `[1, 2]`, `{a: 1}`（数组/对象字面量）
- `function() {}`（函数表达式）

**OvsRenderFunction（`div { }`）本质上是一种"调用"**，和 `foo()` 是同级别的：
- `foo()` = `PrimaryExpression(foo)` + `Arguments()`
- `div {}` = `IdentifierName(div)` + `Arguments?` + `{ StatementList }`

因此 `OvsRenderFunction` 应该放在 **PrimaryExpression** 层，而不是 AssignmentExpression。

#### 3.3.2 语法规则

**SlimeParser 原始规则**:
```javascript
PrimaryExpression → this | IdentifierReference | Literal | ArrayLiteral | ObjectLiteral | ...
```

**OvsParser 修改**:
```javascript
PrimaryExpression → this | AsyncGeneratorExpr | AsyncFunctionExpr
                  | OvsRenderFunction    // ← 放在 IdentifierReference 之前
                  | IdentifierReference | Literal | ...
```

#### 3.3.3 为什么放在 IdentifierReference 之前？

利用 Or 的回溯机制区分 `div {}` 和普通变量 `div`：

```
输入: div { }
  ├─ OvsRenderFunction 尝试匹配 "div" + "{" + "}" → ✅ 成功

输入: div（普通变量）
  ├─ OvsRenderFunction 尝试匹配 "div"，期望 "{"，失败 → 回溯
  └─ IdentifierReference 匹配 "div" → ✅ 成功
```

#### 3.3.4 为什么不能放在 AssignmentExpression？

如果放在 AssignmentExpression 末尾作为"兜底"：

```
输入: div { }
  ├─ ArrowFunction ❌
  ├─ ConditionalExpression → 成功匹配 "div"（作为变量）→ 返回！
  └─ OvsRenderFunction ← 永远不会执行到这里
```

`ConditionalExpression` 会先成功匹配 `div`（它是有效的 IdentifierReference），然后 Or 就返回了，`{ }` 没有被消费。

### 3.4 AssignmentExpression 规则

**目的**: 完整复制 SlimeParser 实现，确保 ES2025 兼容性

**OvsParser 修改**:
- 完整复制 SlimeParser 的 AssignmentExpression
- 包含 `AsyncArrowFunction` 分支
- 包含所有复合赋值运算符（`&&=`, `||=`, `??=`）
- `Yield` 参数正确控制 `YieldExpression` 分支
- **不包含 OvsRenderFunction**（已移到 PrimaryExpression）

## 4. Token 定义

OVS 在 SlimeTokens 基础上添加了两个 token：

| Token 名 | 模式 | 说明 |
|---------|------|------|
| `OvsViewToken` | `ovsView` | 组件声明关键字 |
| `Hash` | `#` | 不渲染块标记 |

## 5. 转换流程

```
OVS 源码 → OvsParser.Program() → CST → OvsCstToSlimeAstUtil → JavaScript AST → wrapTopLevelExpressions → SlimeGenerator → JavaScript 代码
```

### 5.1 代码生成规则

OVS 编译器会将 `tagName { }` 语法转换为**函数调用**形式，开发者需要自己导入对应的函数：

| OVS 源码 | 编译输出 |
|----------|----------|
| `div { "hello" }` | `div({}, ["hello"])` |
| `h1(props) { content }` | `h1(props, [content])` |

**函数签名**: `tagName(props?: object, children?: any[]) => VNode`

### 5.2 转换示例

**输入**:
```javascript
import { div, h1 } from './utils/htmlElements'

div {
  h1 { "Hello" }
}
```

**输出**:
```javascript
import { div, h1 } from './utils/htmlElements';
export default div({}, [h1({}, ["Hello"])])
```

## 6. CST 转 AST 逻辑（OvsCstToSlimeAstUtil）

### 6.1 两个关键计数器

| 计数器 | 作用 | 进入时 | 退出时 |
|--------|------|--------|--------|
| `ovsRenderDomViewDepth` | 标记是否在 `div {}` 内部 | +1 | -1 |
| `noRenderDepth` | 标记是否在 `#{}` 内部 | +1 | -1 |

### 6.2 ExpressionStatement 渲染规则

**优先级**: OvsRenderFunction > noRenderDepth > ovsRenderDomViewDepth

| 场景 | 渲染？ | 输出 |
|------|--------|------|
| `div { p {} }` | ✅ 是 | `children.push(h('p', ...))` |
| `div { func() }` | ✅ 是 | `children.push(func())` |
| `div { #{ func() } }` | ❌ 否 | `func()` (保持原样) |
| `div { #{ p {} } }` | ✅ 是 | `children.push(h('p', ...))` (OvsRenderFunction 优先) |
| 顶层 `func()` | ❌ 否 | `func()` (保持原样) |

### 6.3 NoRenderBlock 特殊处理

进入新的 `div {}` 时，会**临时清零** `noRenderDepth`：
```javascript
// createOvsRenderDomViewDeclarationAst 中
const savedNoRenderDepth = this.noRenderDepth
this.noRenderDepth = 0  // 临时清零
try {
  // 处理内部语句
} finally {
  this.noRenderDepth = savedNoRenderDepth  // 恢复
}
```

**含义**: `#{}` 对其内部嵌套的 `div {}` 元素不生效。

### 6.4 顶层表达式包裹规则（wrapTopLevelExpressions）

编译器根据两个条件决定输出格式：

1. **是否包含 `#{}`** - 决定是否使用 IIFE
2. **节点数量** - 决定是否使用 Fragment 包裹

#### 判断规则

| 条件 | 节点数量 | 输出格式 |
|------|---------|---------|
| 无 `#{}` | 1个 | `export default div({}, [...])` |
| 无 `#{}` | 多个 | `export default h(Fragment, null, [div(), h1()])` |
| 有 `#{}` | 1个 | `export default (function(){ ...; return div(...) })()` |
| 有 `#{}` | 多个 | `export default (function(){ ...; return h(Fragment, null, [...]) })()` |

#### 示例

**单节点，无 `#{}`**（最简单情况）:
```javascript
// 输入
import { div } from './utils/htmlElements'
div { "hello" }

// 输出
import { div } from './utils/htmlElements';
export default div({}, ["hello"]);
```

**多节点，无 `#{}`**（使用 Fragment）:
```javascript
// 输入
import { div, h1 } from './utils/htmlElements'
div { "hello" }
h1 { "world" }

// 输出
import { Fragment, h } from 'vue';
import { div, h1 } from './utils/htmlElements';
export default h(Fragment, null, [div({}, ["hello"]), h1({}, ["world"])]);
```

**单节点，有 `#{}`**（使用 IIFE）:
```javascript
// 输入
import { div, p } from './utils/htmlElements'
let count = 0
div { #{ count++ } p { count } }

// 输出
import { div, p } from './utils/htmlElements';
export default (function(){
  let count = 0;
  return div({}, [(function(){
    count++;
    return p({}, [count]);
  })()]);
})();
```

**多节点，有 `#{}`**（IIFE + Fragment）:
```javascript
// 输入
import { div, h1 } from './utils/htmlElements'
let count = 0
div { #{ count++ } count }
h1 { "world" }

// 输出
import { Fragment, h } from 'vue';
import { div, h1 } from './utils/htmlElements';
export default (function(){
  let count = 0;
  return h(Fragment, null, [
    div({}, [count]),
    h1({}, ["world"])
  ]);
})();
```

#### 为什么使用 `#{}` 判断？

`#{}` 是 OVS 的响应式表达式语法，它内部的代码需要在 IIFE 作用域中执行，以便：
- 变量声明不会污染全局作用域
- 副作用代码（如 `count++`）能正确执行

如果没有 `#{}`，代码是纯声明式的，可以直接导出表达式。

#### Fragment 自动导入

当有多个顶层节点时，编译器会自动添加 `import { Fragment, h } from 'vue'`。如果已有 vue 导入，会在现有导入中添加 Fragment 和 h
```

## 7. 修改记录

### 7.1 修改记录（2025-12-04）

#### 7.1.1 ✅ 代码生成改为函数调用格式

**修改前**: `createComponentVNode('div', {}, [...])`
**修改后**: `div({}, [...])`

**理由**:
- 支持 IDE 智能提示和自动导入
- 开发者可以自定义 HTML 标签函数
- 更直观的代码输出

**影响的文件**:
- `OvsCstToSlimeAstUtil.ts` - `createSimpleView` 和 `createReturnOvsAPICreateVNode` 方法

#### 7.1.2 ✅ 简化顶层表达式包裹逻辑

**修改前**: 根据是否有声明/控制流语句判断是否使用 IIFE
**修改后**: 根据是否包含 `#{}` 判断是否使用 IIFE

**新规则**:
- 无 `#{}` → 直接导出表达式
- 有 `#{}` → 使用 IIFE 包裹

**理由**:
- 逻辑更简单明了
- `#{}` 是唯一需要 IIFE 作用域的场景

#### 7.1.3 ✅ 多节点使用 Fragment 包裹

**修改前**: 多节点返回数组 `[div(), h1()]`
**修改后**: 多节点使用 Vue Fragment `h(Fragment, null, [div(), h1()])`

**理由**:
- 与 Vue 3 多根节点设计一致
- 返回单个 VNode，便于使用

**影响**:
- 自动添加 `import { Fragment, h } from 'vue'`

#### 7.1.4 ✅ 移除自动导入逻辑

**修改前**: 编译器自动添加 HTML 标签函数的导入
**修改后**: 开发者根据 IDE 智能提示自己导入

**理由**:
- 与正常开发工作流一致
- 支持自定义函数来源

---

### 7.2 修改记录（2025-12-03）

#### 7.2.1 ✅ OvsRenderFunction 语义位置确定

**设计决策**: `OvsRenderFunction` 放在 `PrimaryExpression` 层

**理由**:
- `div { }` 本质上是一种"原子表达式"，和 `foo()`（函数调用）同级别
- 放在 PrimaryExpression 符合表达式层次结构的语义
- 放在 IdentifierReference 之前，利用 Or 回溯区分 `div {}` 和普通变量 `div`

**为什么不能放在 AssignmentExpression**:
- ConditionalExpression 会先成功匹配 `div`（作为变量），导致 `{}` 无法消费

#### 7.2.2 ✅ Statement 规则
- 使用正确的 `VariableStatement()` 而非 `VariableDeclaration()`
- 正确传递 `params` 参数

#### 7.2.3 ✅ Declaration 规则
- 使用正确的 `LexicalDeclaration()` 而非 `VariableDeclaration()`
- 正确传递 `params` 参数

#### 7.2.4 ✅ AssignmentExpression 规则
- 完整复制 SlimeParser 的实现
- 包含 `AsyncArrowFunction` 分支
- 包含所有复合赋值运算符（`&&=`, `||=`, `??=`）
- `Yield` 参数正确控制 `YieldExpression` 分支

#### 7.2.5 ✅ Token 优先级
- `OvsViewToken` 和 `Hash` 放在 `SlimeTokens` 之前
- 确保 `ovsView` 不会被错误识别为 `IdentifierName`

#### 7.2.6 ✅ FormalParameters 修复
- 改用 `ArrowFormalParameters()` 替代不存在的 `FunctionFormalParameters()`

#### 7.2.7 旧代码标记废弃
- `OvsLexicalBinding` 规则标记为 `@deprecated`
- `exec()` 和 `transCst()` 方法标记为 `@deprecated`
- 保留向后兼容，新代码应使用 `OvsCstToSlimeAstUtil`
