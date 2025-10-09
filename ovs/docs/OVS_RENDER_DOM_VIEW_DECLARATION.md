# OvsRenderDomViewDeclaration 渲染机制

## 概述

`OvsRenderDomViewDeclaration` 是 OVS 的核心语法，用于声明式地编写 UI 组件。本文档说明其渲染规则和实现原理。

## 渲染规则

### 核心原则

**在 `OvsRenderDomViewDeclaration` 中，所有的 `ExpressionStatement`（表达式语句）都会被渲染，其他类型的语句保持原样。**

### 会被渲染的（ExpressionStatement）

```javascript
div {
  123                    // ✅ 数字字面量
  "hello"                // ✅ 字符串字面量
  true                   // ✅ 布尔字面量
  variable               // ✅ 变量引用
  obj.property           // ✅ 属性访问
  func()                 // ✅ 函数调用
  a + b                  // ✅ 二元表达式
  a ? b : c              // ✅ 条件表达式
  !flag                  // ✅ 一元表达式
  [1, 2, 3]              // ✅ 数组字面量
  { name: "value" }      // ✅ 对象字面量
  
  span { "nested" }      // ✅ 嵌套的 OVS 元素
}
```

### 不会被渲染的（其他语句）

```javascript
div {
  const a = 1            // ❌ 变量声明（保留但不渲染）
  let b = 2              // ❌ 变量声明
  function f() {}        // ❌ 函数声明
  class C {}             // ❌ 类声明
  
  // 控制流语句保留，但内部的 ExpressionStatement 会被渲染
  if (condition) {       // ❌ if 语句本身不渲染
    123                  // ✅ 但内部的表达式会渲染
  }
  
  for (let i = 0; i < 3; i++) {  // ❌ for 语句本身不渲染
    i                    // ✅ 但内部的表达式会渲染
  }
}
```

## 实现原理

### 1. 计数器机制

使用 `ovsRenderDomViewDepth` 计数器标记当前是否在 `OvsRenderDomViewDeclaration` 内部：

```typescript
class OvsCstToSlimeAst {
  private ovsRenderDomViewDepth = 0;
  
  createOvsRenderDomViewDeclarationAst(cst) {
    this.ovsRenderDomViewDepth++  // 进入，+1
    try {
      // 转换逻辑
    } finally {
      this.ovsRenderDomViewDepth--  // 退出，-1
    }
  }
  
  createExpressionStatementAst(cst) {
    if (this.ovsRenderDomViewDepth > 0) {
      // 在 OvsRenderDomViewDeclaration 内，转换为 children.push()
    } else {
      // 不在内部，保持原样
    }
  }
}
```

### 2. 编译时转换

```javascript
// 输入
div {
  const abc = true
  if (abc) {
    123
  }
}

// 编译为
(function(){
  const children = []
  const abc = true
  if(abc){
    children.push(123)
  }
  return OvsAPI.createVNode('div', children)
})()
```

### 3. 嵌套支持

通过 IIFE（立即执行函数表达式）自动创建新作用域：

```javascript
// 输入
div {
  123
  span {
    456
  }
  789
}

// 编译为
(function(){
  const children = []
  children.push(123)
  children.push(
    (function(){              // 内层 IIFE
      const children = []     // 新作用域的 children
      children.push(456)
      return OvsAPI.createVNode('span', children)
    })()
  )
  children.push(789)
  return OvsAPI.createVNode('div', children)
})()
```

## 与 Vue 的一致性

所有的表达式都会被传递给 Vue，由 Vue 决定如何渲染：

```javascript
div {
  123                    // 传递给 Vue
  variable               // 传递给 Vue
  func()                 // 传递给 Vue
  a++                    // 传递给 Vue（Vue 会报错）
  a = b                  // 传递给 Vue（Vue 会报错）
}
```

这样保证了与 Vue 的渲染规则完全一致。

## 技术细节

### 修改的文件

1. **`slime/slime-ast/src/SlimeAstType.ts`**
   - 添加控制流语句类型定义

2. **`slime/slime-parser/src/language/SlimeCstToAstUtil.ts`**
   - 完善 `createStatementDeclarationAst` 方法
   - 添加所有控制流语句的 AST 创建方法
   - 修复 `createBlockStatementAst` 处理 BlockStatement 和 StatementList

3. **`slime/slime-generator/src/SlimeGenerator.ts`**
   - 添加所有控制流语句的代码生成方法

4. **`ovs/src/factory/OvsCstToSlimeAstUtil.ts`**
   - 添加 `ovsRenderDomViewDepth` 计数器
   - 重写 `createExpressionStatementAst` 方法
   - 重构 `createOvsRenderDomViewDeclarationAst` 方法

### 核心代码

```typescript
// 重写 ExpressionStatement 处理
createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
  const expr = this.createExpressionAst(cst.children[0])
  
  if (this.ovsRenderDomViewDepth > 0) {
    // 在 OvsRenderDomViewDeclaration 内，转换为 children.push(expr)
    return {
      type: SlimeAstType.ExpressionStatement,
      expression: SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createMemberExpression(
          SlimeAstUtil.createIdentifier('children'),
          'push'
        ),
        [expr]
      ),
      loc: cst.loc
    }
  } else {
    // 不在内部，保持原样
    return super.createExpressionStatementAst(cst)
  }
}
```

## 优势

1. **简单优雅**：只需要一个计数器和一个重写方法
2. **自动传递**：计数器在实例上，嵌套调用自动继承
3. **不破坏架构**：不需要修改 Slime 的核心逻辑
4. **完全兼容**：与 Vue 的渲染规则完全一致
5. **性能优秀**：编译时处理，运行时无额外开销

## Vue 组件生成

### 自动包装为函数组件

OVS 文件会自动包装为 Vue 函数组件：

```javascript
// 输入：hello.ovs
div {
  const abc = true
  if (abc) {
    123
  }
}

// 输出：
import OvsAPI from 'ovsjs/src/OvsAPI'
export default function Hello() {
  return (function () {
    const children = []
    const abc = true
    if (abc) {
      children.push(123)
    }
    return OvsAPI.createVNode('div', children)
  })()
}
```

### 组件名称规则

组件名称根据文件名自动生成（PascalCase）：
- `hello.ovs` → `Hello`
- `my-component.ovs` → `MyComponent`
- `hello_world.ovs` → `HelloWorld`

### 支持多个顶层元素

```javascript
// 输入：multi-elements.ovs
const data = [1, 2, 3]

div { data }
span { "separator" }

// 输出：
export default function MultiElements() {
  const data = [1, 2, 3]
  return [
    (function () { ... })(),
    (function () { ... })()
  ]
}
```

### 在 Vite 中使用

```javascript
// main.ts
import { createApp } from 'vue'
import HelloWorld from './components/hello-world.ovs'

createApp(HelloWorld).mount('#app')
```

或在其他组件中使用：

```vue
<template>
  <HelloWorld />
</template>

<script setup>
import HelloWorld from './hello-world.ovs'
</script>
```

## 示例

查看 `langServer/src/testovsplugin.ts` 获取更多测试用例。

