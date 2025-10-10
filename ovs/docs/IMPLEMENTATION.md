# OVS 实现原理

> OVS 的架构设计、编译流程和技术细节

## 核心功能

OVS 实现了以下核心机制：
1. 自动渲染所有 `ExpressionStatement`
2. 保留控制流语句（if/for/while 等）
3. 支持嵌套的 OVS 元素
4. 智能导出系统（根据是否有 export default）

---

## 编译流程

```
OVS 源代码
  ↓
1. 词法分析 (SubhutiLexer)
  ↓
Tokens
  ↓
2. 语法分析 (OvsParser)
  ↓
CST (具体语法树)
  ↓
3. 语法转换 (OvsCstToSlimeAst.toProgram)
  ↓
JavaScript AST
  ↓
4. 添加 import (ensureOvsAPIImport)
  ↓
带 import 的 AST
  ↓
5. 包裹顶层表达式 (wrapTopLevelExpressions) ⭐
  ↓
处理后的 AST
  ↓
6. 代码生成 (SlimeGenerator.generator)
  ↓
JavaScript 代码
  ↓
7. 格式化 (Prettier - 仅生产环境)
  ↓
最终代码
```

---

## 核心实现

### 1. 计数器机制

使用 `ovsRenderDomViewDepth` 计数器标记当前是否在 `OvsRenderDomViewDeclaration` 内部。

**位置：** `ovs/src/factory/OvsCstToSlimeAstUtil.ts`

```typescript
export class OvsCstToSlimeAst extends SlimeCstToAst {
  private ovsRenderDomViewDepth = 0;

  createOvsRenderDomViewDeclarationAst(cst: SubhutiCst) {
    this.ovsRenderDomViewDepth++  // 进入，+1
    
    try {
      // 转换 StatementList
      const bodyStatements = this.createStatementListAst(statementListCst)
      
      // 生成 IIFE 函数体
      const iifeFunctionBody = [
        // const children = []
        // ...bodyStatements
        // return OvsAPI.createVNode('div', children)
      ]
      
      return this.createIIFE(iifeFunctionBody)
    } finally {
      this.ovsRenderDomViewDepth--  // 退出，-1（确保恢复）
    }
  }

  createExpressionStatementAst(cst: SubhutiCst) {
    const expr = this.createExpressionAst(cst.children[0])
    
    if (this.ovsRenderDomViewDepth > 0) {
      // 在 OvsRenderDomViewDeclaration 内，转换为 children.push(expr)
      return createChildrenPushStatement(expr)
    } else {
      // 不在内部，保持原样
      return super.createExpressionStatementAst(cst)
    }
  }
}
```

**优势：**
- 简单：只需一个整数变量
- 自动传递：实例变量，所有嵌套调用自动继承
- 支持嵌套：多层 div 通过 IIFE 作用域自动隔离

---

### 2. 智能导出系统

**位置：** `ovs/src/index.ts`

```typescript
function wrapTopLevelExpressions(ast: SlimeProgram): SlimeProgram {
  const declarations: any[] = []
  const expressions: SlimeStatement[] = []
  let hasExportDefault = false
  
  // 1. 分类 declarations 和 expressions
  for (const statement of ast.body) {
    if (statement.type === 'ExportDefaultDeclaration') {
      hasExportDefault = true
      declarations.push(statement)
    } else if (isDeclaration(statement)) {
      declarations.push(statement)
    } else {
      expressions.push(statement)
    }
  }
  
  // 2. 如果有 export default，不做包裹
  if (hasExportDefault) {
    return ast
  }
  
  // 3. 如果没有表达式，保持原样
  if (expressions.length === 0) {
    return ast
  }
  
  // 4. 包裹所有表达式到 IIFE
  const iifeBody = [
    // const children = []
    // ...处理所有表达式（OVS 视图 push 到 children）
    // return children
  ]
  
  const iife = createIIFE(iifeBody)
  const exportDefault = createExportDefaultDeclaration(iife)
  
  return createProgram([...declarations, exportDefault])
}
```

**规则：**
1. **Declaration 始终保持顶层** - const/let/function/class/import/export
2. **有 export default** - 只处理 default，其他不管
3. **无 export default** - IIFE 包裹所有表达式，返回 children 数组

---

### 3. 转换示例

#### 输入代码
```javascript
export const hello = div {
  const abc = true
  if (abc) {
    123
  }
}

export default div{
    123
}

div{456}
div{789}
```

#### 输出代码
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

export default (function () {
  const children = []
  children.push(123)
  return OvsAPI.createVNode('div', children)
})()

// div{456} 和 div{789} 保持原样（有 default 就不管）
(function () {
  const children = []
  children.push(456)
  return OvsAPI.createVNode('div', children)
})()

(function () {
  const children = []
  children.push(789)
  return OvsAPI.createVNode('div', children)
})()
```

---

## 修改的文件

### 核心文件

#### 1. `slime/slime-ast/src/SlimeAstType.ts`
**添加的类型：**
- 控制流语句类型（IfStatement, ForStatement 等）
- `BinaryExpression` - 二元运算
- `ArrowFunctionExpression` - 箭头函数

#### 2. `slime/slime-parser/src/language/es2015/Es6Parser.ts`
**修改：**
- 完善 `ArrowParameters()` - 从空实现到完整实现

#### 3. `slime/slime-parser/src/language/SlimeCstToAstUtil.ts`
**新增方法：**
- `createArrowFunctionAst()` - 箭头函数转换
- `createArrowParametersAst()` - 箭头函数参数
- `createConciseBodyAst()` - 箭头函数体

**完善方法：**
- `createFunctionDeclarationAst()` - 从 TODO 到完整实现
- `createFunctionExpressionAst()` - 支持命名函数
- `createMultiplicativeExpressionAst()` - 支持乘法运算
- `createMethodDefinitionAst()` - 修复 Class 方法
- `createStatementListItemAst()` - 自动转换 Function/Class

**修复方法：**
- `createStatementDeclarationAst()` - 添加所有控制流语句
- `createBlockStatementAst()` - 支持多种输入

#### 4. `slime/slime-generator/src/SlimeGenerator.ts`
**新增方法：**
- `generatorArrowFunctionExpression()` - 箭头函数代码生成
- `generatorBinaryExpression()` - 二元运算代码生成

**完善方法：**
- `generatorFunctionDeclaration()` - 添加空格处理
- 所有控制流语句的代码生成方法

#### 5. `ovs/src/factory/OvsCstToSlimeAstUtil.ts`
**核心机制：**
- 添加 `ovsRenderDomViewDepth` 计数器
- 重写 `createExpressionStatementAst` 方法
- 简化 `toProgram` 方法（移除 import 处理，交给插件层）

#### 6. `ovs/src/index.ts`
**核心函数：**
- `wrapTopLevelExpressions()` - 智能导出逻辑 ⭐
- `ensureOvsAPIImport()` - 自动添加 import
- `isDeclaration()` - 判断是否是声明
- `isOvsRenderDomViewIIFE()` - 判断是否是 OVS 视图

**修改：**
- 禁用开发环境的 Prettier（避免破坏注释）
- 添加导入 `SlimeVariableDeclarationKindValue`

---

## 设计原则

### 1. 单一职责
- **CST/AST 转换层**：只负责语法转换
- **插件层**：负责文件级别的包装和导出逻辑

### 2. 解耦
- 不同层次的职责清晰分离
- 容易测试和维护

### 3. 可插拔
- 可以轻松切换不同的导出方式
- 可以适配不同的框架

### 4. 复用
- 充分利用现有的编译原理模块
- 使用 AST 操作而不是字符串处理

---

## 嵌套支持

### 原理

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

// 输出
(function(){
  const children = []        // 外层 children
  children.push(123)
  children.push(
    (function(){             // 内层 IIFE
      const children = []    // 新作用域的 children
      children.push(456)
      return OvsAPI.createVNode('span', children)
    })()
  )
  children.push(789)
  return OvsAPI.createVNode('div', children)
})()
```

### 自动作用域隔离

每个 `div { }` 都有自己的 `children` 变量，通过 IIFE 自动隔离：

```javascript
div {
  const children = []  // 外层的 children
  
  span {
    const children = []  // 内层的 children（不冲突）
  }
}
```

---

## 性能优化

### 编译时处理
所有转换都在编译时完成，运行时无额外开销：
- ✅ 零运行时转换
- ✅ 直接生成优化的 JavaScript
- ✅ Vue 可以直接执行

### 类型安全
完整的 TypeScript 支持：
- ✅ 所有 AST 节点都有类型定义
- ✅ 编译期类型检查
- ✅ IDE 智能提示

---

## 测试

### 运行编译测试
```bash
npx tsx ovs/src/test-final.ts
```

### 查看测试用例
```bash
ls ovs/test-cases/
# case1-simple.ovs
# case2-nested.ovs
# ... 等9个用例
```

### 浏览器测试
```bash
cd ovs
npm run dev
# 访问 http://localhost:5173
```

---

## 技术栈

### 编译器技术
- **Subhuti** - Parser 框架
- **Slime** - AST 工具链（ast, parser, generator）
- **TypeScript** - 类型系统

### 运行时
- **Vue 3** - 渲染引擎
- **Vite** - 构建工具和开发服务器

---

## 架构图

```
┌─────────────────┐
│  OVS 源代码      │
└────────┬────────┘
         │
         ├─ SubhutiLexer ───→ Tokens
         │
         ├─ OvsParser ──────→ CST
         │
         ├─ OvsCstToSlimeAst ──→ JavaScript AST
         │                        │
         │                        ├─ ovsRenderDomViewDepth (计数器)
         │                        └─ ExpressionStatement → children.push()
         │
         ├─ ensureOvsAPIImport ─→ 添加 import
         │
         ├─ wrapTopLevelExpressions ⭐
         │   │
         │   ├─ 有 export default? → 不包裹
         │   └─ 无 export default? → IIFE 包裹表达式
         │
         ├─ SlimeGenerator ────→ JavaScript 代码
         │
         └─ Prettier (可选) ──→ 格式化
```

---

## 设计决策

### 为什么使用计数器而不是遍历？

**计数器方案（采用）：**
```typescript
private ovsRenderDomViewDepth = 0;

createOvsRenderDomViewDeclarationAst(cst) {
  this.ovsRenderDomViewDepth++  // 简单
  try {
    // 转换逻辑
  } finally {
    this.ovsRenderDomViewDepth--
  }
}
```

**优势：**
- ✅ 简单：只需一个整数
- ✅ 自动传递：实例变量，嵌套调用自动继承
- ✅ 支持嵌套：通过 IIFE 作用域自动隔离
- ✅ 不易出错：finally 确保恢复

### 为什么分层处理？

**CST/AST 转换层（OvsCstToSlimeAst）：**
- 只负责语法转换
- 纯函数式，无副作用
- 易于测试

**插件层（index.ts）：**
- 负责导出逻辑
- 负责文件级别的包装
- 负责 import 管理

**优势：**
- ✅ 单一职责
- ✅ 解耦清晰
- ✅ 易于扩展

### 为什么使用 IIFE？

**IIFE 优势：**
- ✅ 自动创建新作用域
- ✅ 避免变量名冲突（children）
- ✅ 立即执行，返回 VNode
- ✅ 符合函数式编程思想

---

## 核心代码解析

### createOvsRenderDomViewDeclarationAst

```typescript
createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeCallExpression {
  checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
  
  // 获取元素名称（如 'div'）
  const id = this.createIdentifierAst(cst.children[0])

  // 进入 OvsRenderDomViewDeclaration，计数器 +1
  this.ovsRenderDomViewDepth++
  
  try {
    // 转换 StatementList
    const bodyStatements = this.createStatementListAst(cst.children[2])
    
    // 生成 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. const children = []
      createChildrenDeclaration(),
      
      // 2. 转换后的语句（ExpressionStatement 已变成 children.push()）
      ...bodyStatements,
      
      // 3. return OvsAPI.createVNode('div', children)
      createReturnOvsAPICreateVNode(id)
    ]
    
    // 生成 IIFE
    return this.createIIFE(iifeFunctionBody)
  } finally {
    // 退出时恢复计数器
    this.ovsRenderDomViewDepth--
  }
}
```

### wrapTopLevelExpressions

```typescript
function wrapTopLevelExpressions(ast: SlimeProgram): SlimeProgram {
  const declarations: any[] = []
  const expressions: SlimeStatement[] = []
  let hasExportDefault = false
  
  // 1. 分类
  for (const statement of ast.body) {
    if (statement.type === SlimeAstType.ExportDefaultDeclaration) {
      hasExportDefault = true
      declarations.push(statement)
    } else if (isDeclaration(statement)) {
      declarations.push(statement)  // const, let, function, class, import, export
    } else if (statement.type === SlimeAstType.ExpressionStatement) {
      expressions.push(statement)   // console.log, div{}, 等
    }
  }
  
  // 2. 如果有 export default，不做包裹
  if (hasExportDefault) {
    return ast
  }
  
  // 3. 如果没有表达式，保持原样
  if (expressions.length === 0) {
    return ast
  }
  
  // 4. 包裹所有表达式
  const iifeBody: SlimeStatement[] = [
    // const children = []
    createChildrenDeclaration()
  ]
  
  // 处理所有表达式
  for (const expr of expressions) {
    if (isOvsRenderDomViewIIFE(expr)) {
      // OVS 视图 → children.push(vnode)
      iifeBody.push(createChildrenPushStatement(vnodeExpr))
    } else {
      // 其他表达式保持原样（如 console.log）
      iifeBody.push(expr)
    }
  }
  
  // return children
  iifeBody.push(createReturnStatement('children'))
  
  // 创建 export default IIFE
  const iife = createIIFE(iifeBody)
  const exportDefault = createExportDefaultDeclaration(iife)
  
  return createProgram([...declarations, exportDefault])
}
```

---

## 与 Vue 的集成

### 在 render 函数中使用
```javascript
import DefaultViews from './hello.ovs'

export const App = {
  render() {
    return DefaultViews  // 数组或单个 VNode
  }
}
```

### 使用命名导出
```javascript
import {header, footer} from './components.ovs'

export const App = {
  render() {
    return h('div', [header, footer])
  }
}
```

---

## 性能指标

- **编译速度：** < 100ms（中等复杂度）
- **运行时开销：** 0（编译时转换）
- **包大小：** 无额外运行时库
- **类型检查：** 完整支持

---

## 扩展性

### 支持的 HTML 标签
所有标准 HTML 标签都支持：
- div, span, p, h1-h6
- button, input, form
- ul, li, table, tr, td
- 等等...

### 未来扩展
- [ ] 支持组件属性（props）
- [ ] 支持事件处理
- [ ] 支持 ref
- [ ] 支持自定义组件

---

## 开发和调试

### 查看编译结果
```bash
npx tsx ovs/src/test-final.ts
```

### 调试提示
1. 使用 `console.log` 输出调试信息
2. 查看浏览器控制台
3. 检查生成的 JavaScript 代码
4. 使用 TypeScript 类型检查

---

## 相关文档

- **[用户指南](USER_GUIDE.md)** - 完整语法和示例
- **[渲染机制](OVS_RENDER_DOM_VIEW_DECLARATION.md)** - 渲染原理
- **[测试用例](../test-cases/README.md)** - 9个完整示例

---

**返回主文档：** [aireadme.md](../aireadme.md)

