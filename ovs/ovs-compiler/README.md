# ovs-compiler

> OVS (Object-oriented View Syntax) 编译器

## 概述

`ovs-compiler` 是 OVS DSL 的编译时处理器，继承自 `cssts-compiler`，支持 OVS 特有的视图声明语法和 CSSTS 原子类集成。

## 核心职责

1. **解析** - 解析 `.ovs` 文件中的 OVS DSL 语法
2. **转换** - CST 到 AST 转换，支持 `view`、`div {}`、`css {}` 等语法
3. **组件包装** - 自动包装为 Vue 组件 (`defineOvsComponent`)
4. **CSSTS 集成** - 继承 CSSTS 的原子类转换能力

## OvsCstToSlimeAst 扩展机制

`OvsCstToSlimeAst` 继承自 `cssts-compiler` 的 `CssTsCstToAst`，形成三层继承链：

```
SlimeCstToAst (slime-parser)
    ↓
CssTsCstToAst (cssts-compiler)
    ↓
OvsCstToSlimeAst (ovs-compiler)
```

### 全局注册与继承链

#### 核心机制

1. **三层 Proxy 代理**：每层都有自己的 Proxy，动态代理到注册的实例
2. **自动链式注册**：通过 `super()` 调用，一个实例自动注册到所有层
3. **多态行为**：所有层的方法调用都会路由到最终子类实例

#### 实现方式

```typescript
// ovs-compiler/src/factory/OvsCstToSlimeAstUtils.ts
import { CssTsCstToAst, registerCssTsCstToAst } from 'cssts-compiler'

export class OvsCstToSlimeAst extends CssTsCstToAst {
  constructor() {
    super()  // 继承链自动注册到 cssts 和 slime 层
    registerOvsCstToSlimeAst(this)  // 注册到 ovs 层
  }

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

// Proxy: 动态代理到当前注册的实例
export const OvsCstToSlimeAstUtils = new Proxy({} as OvsCstToSlimeAst, {
  get(_, prop) {
    const val = (_ovsCstToSlimeAstUtils as any)[prop]
    return typeof val === 'function' ? val.bind(_ovsCstToSlimeAstUtils) : val
  }
})

// 初始化默认实例
new OvsCstToSlimeAst()

export default OvsCstToSlimeAstUtils
```

### 继承链注册流程

```typescript
// 实例化时的完整注册流程
new OvsCstToSlimeAst()
  → OvsCstToSlimeAst.constructor()
    → super() → CssTsCstToAst.constructor()
      → super() → SlimeCstToAst.constructor()
        → registerSlimeCstToAstUtil(this)  // this = OvsCstToSlimeAst 实例 ✅
      → registerCssTsCstToAst(this)  // this = OvsCstToSlimeAst 实例 ✅
    → registerOvsCstToSlimeAst(this)  // this = OvsCstToSlimeAst 实例 ✅

// 最终结果：
// - slime-parser 的 _SlimeCstToAstUtils = OvsCstToSlimeAst 实例
// - cssts-compiler 的 _cssTsCstToAstUtils = OvsCstToSlimeAst 实例
// - ovs-compiler 的 _ovsCstToSlimeAstUtils = OvsCstToSlimeAst 实例
// 三层全局变量都指向同一个实例，实现完美的多态！
```

### 为什么这样设计有效

**JavaScript 继承的关键特性**：当子类调用 `super()` 时，父类构造函数中的 `this` 指向的是最终的子类实例。

```typescript
class Parent {
  constructor() {
    console.log(this.constructor.name)  // 输出 "Child"
    register(this)  // 注册的是 Child 实例
  }
}

class Child extends Parent {
  constructor() {
    super()  // Parent 构造中的 this 是 Child 实例
  }
}
```

利用这个特性，我们不需要在每层手动调用父层注册，只需要：
1. 每层在自己的构造函数中注册 `this`
2. 通过 `super()` 触发父类构造
3. 父类构造中的 `this` 自动是最终子类实例

### 方法调用流程示例

```typescript
// 1. 用户代码：转换 .ovs 文件
vitePluginOvsTransform(code) 
  → OvsCstToSlimeAstUtils.toFileAst(cst)
    → 通过 Proxy 路由到 OvsCstToSlimeAst 实例
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

### 注意事项

⚠️ **避免循环引用**：全局变量必须先声明再初始化

```typescript
// ❌ 错误：循环引用
let _ovsCstToSlimeAstUtils: OvsCstToSlimeAst = new OvsCstToSlimeAst()

// ✅ 正确：分两步
let _ovsCstToSlimeAstUtils: OvsCstToSlimeAst  // 先声明

export function registerOvsCstToSlimeAst(instance: OvsCstToSlimeAst): void {
  _ovsCstToSlimeAstUtils = instance
}

// ... Proxy 定义 ...

new OvsCstToSlimeAst()  // 再初始化
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
  defineReactiveExpression(() => "Hello"),
  defineReactiveExpression(() => count.value)
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
