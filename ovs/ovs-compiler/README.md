# ovs-compiler

> OVS (Object-oriented View Syntax) 编译器

## 概述

`ovs-compiler` 是 OVS DSL 的编译时处理器，继承自 `cssts-compiler`，支持 OVS 特有的视图声明语法和 CSSTS 原子类集成。

## Parser Authority

OVS 语法解析走 generated Qin parser 继承链：`OvsParser extends CssTsParser`，而 `CssTsParser extends QinParser`。`QinParser` 由 Java 版 QinParser 生成到 TypeScript，是 OVS/CSSTS 共享的语法核心。

OVS 自己新增的 `view`、`tag {}`、`#{}` 等语法只通过 `@SubhutiRule`/PEG 规则扩展 parser；不要用正则扫描、字符串补丁或 fallback transform 来接受语法。`slime-parser` 只在 CST-to-AST 转换注册边界保留，用于让转换层复用和扩展既有 AST lowering。

## Canonical Element Props Syntax

OVS 元素/组件的标准参数语法是声明列表，不是 JavaScript object literal：

```ovs
div(class = "a", style = "color:red", onClick() { console.log(123) }) {
  div { 123 }
}
```

`tag(...)` 内部和 class/声明体类似，但属性项支持逗号分隔。标准项包括
`name = expression`、布尔 shorthand（如 `disabled`）以及方法体形式的事件处理
器（如 `onClick() { save() }`）。`div({ class: "a" }) { ... }` 是错误 OVS
源码语法，不是兼容写法或第二套正确写法；不能通过改业务 `.ovs` 文件为 object props
来绕过 parser、CST-to-AST、lowering、emitter 或 runtime 缺陷。

## 核心职责

1. **解析** - 解析 `.ovs` 文件中的 OVS DSL 语法
2. **转换** - CST 到 AST 转换，支持 `view`、`div {}`、`css {}` 等语法
3. **组件包装** - 自动包装为 Vue 组件 (`defineOvsComponent`)
4. **CSSTS 集成** - 继承 CSSTS 的原子类转换能力

## OvsCstToSlimeAst 模块化架构

`OvsCstToSlimeAst` 采用分层继承架构，每层负责不同的转换职责：

```
CssTsCstToAst (cssts-compiler)
    ↓
OvsCstToSlimeAstHelpers - 基础辅助方法
    ↓
OvsCstToSlimeAstJudgement - 判断逻辑 (needsParentIIFE, needsReactiveWrap)
    ↓
OvsCstToSlimeAstIIFE - IIFE 和响应式包裹
    ↓
OvsCstToSlimeAstView - 视图创建 (createSimpleView, createComplexIIFE)
    ↓
OvsCstToSlimeAstProperty - OVS 属性转换
    ↓
OvsCstToSlimeAstStatement - 语句转换 (StatementList, if/for 响应式包裹)
    ↓
OvsCstToSlimeAstImport - 导入管理
    ↓
OvsCstToSlimeAst - 主类 ⭐
```

### Bridge Facade 与继承链

#### 核心机制

1. **标准类继承**：`OvsCstToSlimeAst extends CssTsCstToAst`，业务扩展通过实例方法覆盖和 `super` 调用完成。
2. **显式 facade**：`OvsCstToSlimeAstUtils` 是固定对象，方法 forward 到当前注册实例，不使用 Proxy 或动态服务定位器。
3. **generated bridge 注册**：转换入口把 OVS 实例注册到 generated `SlimeCstToAstBridge`，让 CST-to-AST lowering 使用同一个实例。

#### 实现方式

```typescript
// ovs-compiler/src/factory/OvsCstToSlimeAstUtils.ts
import { CssTsCstToAst, registerCssTsCstToAst } from 'cssts-compiler'

export class OvsCstToSlimeAst extends CssTsCstToAst {
  // 重写方法，处理 OVS 特有语法
  createDeclarationAst(cst) {
    const first = cst.children?.[0]
    if (first?.name === 'OvsViewDeclaration') {
      return this.createOvsViewDeclarationAst(first)
    }
    return super.createDeclarationAst(cst)
  }

  createPrimaryExpressionAst(cst) {
    const first = cst.children?.[0]
    if (first?.name === 'OvsRenderFunction') {
      return this.createOvsRenderDomViewDeclarationAst(first)
    }
    return super.createPrimaryExpressionAst(cst)  // 调用 cssts 的处理
  }
}

// 全局注册机制
let _ovsCstToSlimeAstUtils: OvsCstToSlimeAst

export function registerOvsCstToSlimeAst(instance: OvsCstToSlimeAst): void {
  _ovsCstToSlimeAstUtils = instance
}

// Facade: 启动时绑定方法，调用时 forward 到当前 OVS 实例
export const OvsCstToSlimeAstUtils = {} as OvsCstToSlimeAst

// 构造链会先注册到 CSSTS/generated bridge，再注册到 OVS facade
new OvsCstToSlimeAst()

export default OvsCstToSlimeAstUtils
```

### 为什么需要 bridge facade？

#### 问题场景

generated CST-to-AST bridge 会通过共享入口调用当前 lowering 实例：

```typescript
SlimeCstToAstBridge.createPrimaryExpressionAst(cst)
```

如果转换入口注册的是基础实例，OVS 的 `view`、`tag {}`、`#{}` 等节点就不会走 OVS 覆盖方法。

#### 解决方案

通过 **构造链注册 + facade forwarders**，让 generated bridge、CSSTS facade、OVS facade 指向同一个 `OvsCstToSlimeAst` 实例：

1. **构造链注册**：`OvsCstToSlimeAst` 调用 `super()`，CSSTS 构造函数会把当前实例注册到 CSSTS/generated bridge；OVS 构造函数再注册到 OVS facade。
2. **facade forwarders**：公开稳定的 `OvsCstToSlimeAstUtils.xxx()` 调用形状。
3. **实例多态**：内部递归和扩展使用普通 `this` / `super` 调用。

```
调用 OvsCstToSlimeAstUtils.xxx()
    ↓
facade forwarder
    ↓
_ovsCstToSlimeAstUtil 指向 OvsCstToSlimeAst 实例
    ↓
调用 OvsCstToSlimeAst 的方法 ✅
```


### 继承链注册流程

```typescript
new OvsCstToSlimeAst()
  → super() → CssTsCstToAst.constructor()
    → registerCssTsCstToAst(this)
      → registerSlimeCstToAstUtil(this)
  → registerOvsCstToSlimeAst(this)

// 最终结果：generated bridge、CSSTS facade、OVS facade 都指向同一个 OVS 实例。
```

### 为什么这样设计有效

**JavaScript 继承的关键特性**：覆盖方法里的 `this` 指向当前实例，`super` 明确调用父类实现。

```typescript
class OvsCstToSlimeAst extends CssTsCstToAst {
  createPrimaryExpressionAst(cst) {
    if (this.isOvsRender(cst)) return this.createOvsRenderAst(cst)
    return super.createPrimaryExpressionAst(cst)
  }
}
```

这种方式保持 Java/TypeScript 都能理解的长期模型：扩展点是类方法，不是动态代理或 fallback。

### 方法调用流程示例

```typescript
// 1. 用户代码：转换 .ovs 文件
vitePluginOvsTransform(code) 
  → OvsCstToSlimeAstUtils.toFileAst(cst)
    → facade forward 到 OvsCstToSlimeAst 实例
    → 调用实例的 toFileAst 方法

// 2. toFileAst 内部调用 createDeclarationAst
toFileAst(cst)
  → createDeclarationAst(cst)  // OvsCstToSlimeAst 的方法
    → 如果是 OvsViewDeclaration → 处理 OVS 语法
    → 否则 → super.createDeclarationAst(cst)  // 调用 CssTsCstToAst

// 3. CssTsCstToAst 处理 css {} 语法
super.createDeclarationAst(cst)
  → CssTsCstToAst.createPrimaryExpressionAst(cst)
    → 如果是 CssExpression → 处理 CSSTS 语法
    → 否则 → super.createPrimaryExpressionAst(cst)  // 调用 SlimeCstToAst

// 4. 最终回到基类处理标准 JS 语法
super.createPrimaryExpressionAst(cst)
  → SlimeCstToAst.createPrimaryExpressionAst(cst)
    → 处理标准 JavaScript 表达式
```

## 响应式表达式包裹

### 背景

在 OVS 组件 body 中，需要让动态内容能够响应式更新。通过 `defineReactiveExpression` 包裹，可以将任意内容转换为响应式组件。

### 核心设计

编译器使用 **AST 判断逻辑**（而非 CST）来决定如何处理不同类型的语句。

### 三种处理方式

| 类型 | 示例 | 处理方式 |
|------|------|----------|
| **需要父级 IIFE** | `let x = ref(0)`、`#{ ... }`、`x++` | 触发父容器使用复杂模式（IIFE 包裹），语句本身不包裹 |
| **需要响应式 IIFE 包裹** | `if (...) { ... }`、`for (...) { ... }` | 包裹为 `defineReactiveExpression(() => { const children = []; ...; return children })` |
| **需要响应式简单包裹** | `"Hello"`、`count.value` | 包裹为 `defineReactiveExpression(() => expr)` |

### 判断函数

#### 1. `needsParentIIFE(stmt)` - 判断是否需要父级复杂模式

```typescript
private needsParentIIFE(stmt: SlimeStatement): boolean {
  // 1. 变量声明 → 需要父级 IIFE（作用域隔离）
  if (stmt.type === 'VariableDeclaration') return true

  // 2. NoRenderBlock 子节点（带标记）→ 需要父级 IIFE
  if (stmt._isFromNoRenderBlock) return true

  // 3. 副作用表达式（赋值、更新等）→ 需要父级 IIFE
  if (stmt.type === 'ExpressionStatement') {
    return isSideEffectExpression(stmt.expression)  // x++, x = 1
  }

  return false
}
```

#### 2. `needsReactiveWrap(stmt)` - 判断是否需要在 createStatementListItemAst 中包裹

```typescript
private needsReactiveWrap(stmt: SlimeStatement): boolean {
  // 复用：needsParentIIFE 返回 true 的不需要响应式包裹
  if (this.needsParentIIFE(stmt)) return false
  
  // ExpressionStatement 已在 createExpressionStatementAst 中处理
  if (stmt.type === 'ExpressionStatement') return false
  
  // 其他（控制流语句 if/for/while/switch 等）→ 需要响应式包裹
  return true
}
```

#### 3. `isSideEffectExpression(expr)` - 判断是否是副作用表达式

```typescript
private isSideEffectExpression(expr: SlimeExpression): boolean {
  // 赋值表达式：x = 1, x += 1
  if (expr.type === 'AssignmentExpression') return true
  
  // 更新表达式：x++, ++x
  if (expr.type === 'UpdateExpression') return true
  
  // delete/void 表达式
  if (expr.type === 'UnaryExpression') {
    if (expr.operator === 'delete' || expr.operator === 'void') return true
  }
  
  return false
}
```

### 编译示例

#### 简单表达式

```ovs
div {
  "Hello"
  count.value
}
```

**编译为**：
```typescript
$OvsHtmlTag.div({}, [
  "Hello",  // 静态字符串，不包裹
  defineReactiveExpression(() => count.value)  // 动态内容，包裹
])
```

#### `if` 语句（控制流）

```ovs
div {
  if (isVisible) {
    p { "Visible" }
  }
}
```

**编译为**：
```typescript
$OvsHtmlTag.div({}, [
  defineReactiveExpression(() => {
    const children = [];
    if (isVisible) {
      children.push($OvsHtmlTag.p({}, [
        defineReactiveExpression(() => "Visible")
      ]));
    }
    return children;
  })
])
```

#### 变量声明（触发父级 IIFE）

```ovs
div {
  let count = ref(0)
  span { count.value }
}
```

**编译为**：
```typescript
defineOvsComponent(() => {
  const children = [];
  let count = ref(0);  // 变量声明在 IIFE 内，不包裹
  children.push($OvsHtmlTag.span({}, [
    defineReactiveExpression(() => count.value)
  ]));
  return $OvsHtmlTag.div({}, children);
})({}, [])
```

### 双层模式架构

OVS 编译器使用双层模式来处理渲染元素：

1. **简单模式 (`createSimpleView`)**：当标签内部只有简单表达式和渲染语句时，直接生成数组形式的 children
2. **复杂模式 (`createComplexIIFE`)**：当标签内部包含变量声明、NoRenderBlock 或副作用表达式时，生成 IIFE 包裹以保持变量作用域

模式选择由 `needsParentIIFE` 函数判断。

### 设计优势

1. **AST 判断更准确**：使用 AST 类型判断，避免 CST 嵌套结构导致的误判
2. **统一响应式处理**：所有动态内容通过 `defineReactiveExpression` 包裹
3. **作用域隔离**：变量声明通过父级 IIFE（`defineOvsComponent`）处理，保持作用域
4. **控制流响应式**：`if`/`for` 等语句通过 `defineReactiveExpression` IIFE 包裹，内容可响应式更新
5. **副作用表达式隔离**：`x++`、`x = 1` 等不渲染，只执行副作用
6. **静态 Literal 优化**：字符串、数字等静态内容不需要 `defineReactiveExpression` 包裹

## NoRenderBlock `#{}` 语法

`#{}` 块用于执行副作用代码，块内的代码不会被渲染到 children 中。

### 示例

```ovs
div {
  "Hello"
  
  #{
    console.log("副作用代码，不渲染")
    let sideEffectVar = count.value * 2
  }
  
  count.value
}
```

**编译为**：
```typescript
defineOvsComponent(() => {
  const children = [];
  children.push("Hello");
  console.log("副作用代码，不渲染");  // 直接执行，不放入 children
  let sideEffectVar = count.value * 2;  // 直接执行
  children.push(defineReactiveExpression(() => count.value));
  return $OvsHtmlTag.div({}, children);
})({},[]);
```

## API


### vitePluginOvsTransform

Vite 插件专用的转换函数，包含完整的后处理逻辑。

```typescript
import { vitePluginOvsTransform } from 'ovs-compiler'

const result = vitePluginOvsTransform(code, {
  globalStyles: new Set<string>()  // 共享的样式集合
})
```

### ovsTransformFile

完整转换函数（包含导入处理和组件包装）。

```typescript
import { ovsTransformFile } from 'ovs-compiler'

const { ast, tokens } = ovsTransformFile(code)
```

### ovsTransformBase

基础转换函数（纯 AST 转换，不做后处理）。

```typescript
import { ovsTransformBase } from 'ovs-compiler'

const { ast, tokens } = ovsTransformBase(code)
```

## 许可证

MIT License
