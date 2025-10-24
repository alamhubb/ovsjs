# OVS 编译修复总结 - 2025-10-19

## 问题描述

hello.ovs 编译后无法正确显示，根本原因是编译器仍在使用已删除的 `createReactiveVNode` 函数，而应该使用 Vue 的 `h` 函数。

## 修复内容

### 1. 修改 `OvsCstToSlimeAstUtil.ts`

**变更位置：**
- `createSimpleView()` 方法（行 571-610）
- `createReturnOvsAPICreateVNode()` 方法（行 693-738）

**修改内容：**
- ❌ `SlimeAstUtil.createIdentifier('createReactiveVNode')` 
- ✅ `SlimeAstUtil.createIdentifier('h')`

**效果：** 生成的代码从使用不存在的 `createReactiveVNode` 改为使用 Vue 的 `h` 函数

### 2. 修改 `index.ts`

**变更位置：** `ensureOvsAPIImport()` 函数（行 255-303）

**修改内容：**
- ❌ 检查并导入 `createReactiveVNode` 从 `../utils/ReactiveVNode`
- ✅ 检查并导入 `h` 从 `'vue'`

**代码变更：**
```typescript
// 原代码
let hasImportReactiveVNode = false
// ...
const reactiveVNodeSpecifier: SlimeImportSpecifier = {
  type: SlimeAstType.ImportSpecifier,
  local: SlimeAstUtil.createIdentifier('createReactiveVNode'),
  imported: SlimeAstUtil.createIdentifier('createReactiveVNode')
}
const reactiveVNodeImport = SlimeAstUtil.createImportDeclaration(
  [reactiveVNodeSpecifier],
  SlimeAstUtil.createFromKeyword(),
  SlimeAstUtil.createStringLiteral('../utils/ReactiveVNode')
)
ast.body.unshift(reactiveVNodeImport)

// 新代码
let hasImportH = false
// ...
const hSpecifier: SlimeImportSpecifier = {
  type: SlimeAstType.ImportSpecifier,
  local: SlimeAstUtil.createIdentifier('h'),
  imported: SlimeAstUtil.createIdentifier('h')
}
const hImport = SlimeAstUtil.createImportDeclaration(
  [hSpecifier],
  SlimeAstUtil.createFromKeyword(),
  SlimeAstUtil.createStringLiteral('vue')
)
ast.body.unshift(hImport)
```

### 3. 修复 ovsView 参数处理

**变更位置：** `createOvsViewDeclarationAst()` 方法（行 125-154）

**问题：** 原代码在用户已声明参数时仍会额外添加 `child` 参数，导致参数重复

**解决方案：**
- 要求用户必须显式声明参数格式：`ovsView ComponentName ({props, child}) : rootElement { ... }`
- 不再自动添加或检查参数，直接使用用户声明的参数
- 如果用户未声明参数，抛出清晰的错误提示

## 修复前后对比

### 修复前的编译结果
```javascript
// ❌ 错误：使用不存在的函数和参数重复
import { createReactiveVNode } from '../utils/ReactiveVNode'
function Card({props,child},child){
  return createReactiveVNode('div', {}, [...])
}
```

### 修复后的编译结果
```javascript
// ✅ 正确：使用 Vue 的 h 函数和正确的参数
import {h} from 'vue'
function Card({props,child}){
  return h('div', {}, [...])
}
```

## 测试验证

**编译测试：** ✅ 通过
```bash
cd d:\project\qkyproject\test-volar\ovs
npx tsx test-compile.ts
# 结果：✅ 编译成功！
```

**浏览器显示：** ✅ 已正确显示
- 访问地址：http://localhost:5174
- Card 组件正确显示卡片布局
- PriceTag 组件正确渲染价格信息
- 所有 #{} 渲染表达式正常工作

## 核心原理说明

### 为什么需要 `h` 函数

OVS 编译器生成的代码需要创建 Vue VNode，而 Vue 提供了 `h` 工厂函数用于创建 VNode。

```javascript
// 生成的代码格式
h('div', props, children)   // 用于 HTML 标签
h(MyComponent, props, children)  // 用于 Vue 组件
```

### ovsView 参数约定

```typescript
ovsView ComponentName ({props, child}) : rootElement {
  // props: 接收的组件 props
  // child: 接收的插槽内容（命名约定）
}
```

用户调用时：
```typescript
ComponentName({title: "..."}) {
  p { "内容" }  // 这是 child 参数
}
```

## 相关文件

| 文件 | 修改部分 | 原因 |
|---|---|---|
| `src/factory/OvsCstToSlimeAstUtil.ts` | createSimpleView, createReturnOvsAPICreateVNode | 生成 h 函数调用 |
| `src/index.ts` | ensureOvsAPIImport | 添加正确的 import 语句 |
| `example/src/views/hello.ovs` | 无需修改 | 已正确使用 ovsView 语法 |

## 待后续确认

- [ ] VSCode 开发服务器是否正确热更新
- [ ] 其他 .ovs 测试用例是否都能正常编译
- [ ] 组件系统的其他高级特性是否正常工作

---
**修复日期：** 2025-10-19  
**修复者：** AI Assistant  
**状态：** ✅ 完成
