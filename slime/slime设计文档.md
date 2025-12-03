# Slime 设计文档

## 项目概述

Slime 是一个适用于编辑器场景的高容错 JavaScript/TypeScript 解析器和生成器。就像儿童玩具史莱姆一样，能够尽可能地支持包含各种错误的 JS 代码。

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Slime 项目结构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ slime-token │───▶│slime-parser │───▶│  slime-ast  │     │
│  │  (词法定义)  │    │  (语法解析)  │    │ (AST 类型)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                  │             │
│                            ▼                  ▼             │
│                     ┌─────────────┐    ┌─────────────┐     │
│                     │slime-syntax │    │slime-generat│     │
│                     │ (语法规则)  │    │ (代码生成)  │     │
│                     └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 包说明

| 包名 | 职责 |
|------|------|
| `slime-token` | Token 类型定义和词法规则 |
| `slime-parser` | CST 解析器和 CST→AST 转换 |
| `slime-ast` | ESTree 兼容的 AST 类型定义和工厂方法 |
| `slime-generator` | AST→代码 生成器 |
| `slime-syntax` | ECMAScript 语法规则定义 |

## CST 转 AST 两层架构

### 设计原则

Slime 采用两层架构将 CST (具体语法树) 转换为 AST (抽象语法树)：

```
┌────────────────────────────────────────────────────────────┐
│                    第一层：AST 工厂层                        │
│                   (SlimeNodeCreate.ts)                      │
├────────────────────────────────────────────────────────────┤
│  - 方法名与 ESTree AST 类型名一致                            │
│  - 纯粹的节点创建，不依赖 CST 结构                            │
│  - 示例：createArrayExpression(), createCatchClause()       │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │ 调用
┌────────────────────────────────────────────────────────────┐
│                    第二层：CST 转换层                        │
│                   (SlimeCstToAstUtil.ts)                    │
├────────────────────────────────────────────────────────────┤
│  - 方法名与 CST 规则名一致                                   │
│  - 解析 CST 结构，提取信息，调用 AST 工厂层                   │
│  - 示例：createArrayLiteralAst(), createCatchAst()          │
└────────────────────────────────────────────────────────────┘
```

### 命名规范

| 层级 | 方法命名 | 示例 |
|------|----------|------|
| CST 转换层 | `createXxxAst` (Xxx = CST 规则名) | `createArrayLiteralAst` |
| AST 工厂层 | `createXxx` (Xxx = AST 类型名) | `createArrayExpression` |

### 映射关系示例

```typescript
// CST 规则名 ≠ AST 类型名 的情况：

// SlimeCstToAstUtil.ts (CST 转换层)
createArrayLiteralAst(cst) {
    // 解析 ArrayLiteral CST...
    return SlimeAstUtil.createArrayExpression(elements, loc)
}

createObjectLiteralAst(cst) {
    // 解析 ObjectLiteral CST...
    return SlimeAstUtil.createObjectExpression(properties, loc)
}

createCatchAst(cst) {
    // 解析 Catch CST...
    return SlimeAstUtil.createCatchClause(body, param, loc)
}
```

### 中心分发方法

`createAstFromCst` 是 CST→AST 转换的核心入口，使用显式 if 判断分发：

```typescript
createAstFromCst(cst: SubhutiCst): any {
    const name = cst.name

    // 按类别组织的显式分发
    if (name === SlimeParser.prototype.ArrayLiteral?.name)
        return this.createArrayLiteralAst(cst)
    if (name === SlimeParser.prototype.ObjectLiteral?.name)
        return this.createObjectLiteralAst(cst)
    // ... 更多规则

    // 透传处理：单子节点直接递归
    if (cst.children?.length === 1)
        return this.createAstFromCst(cst.children[0])

    throw new Error(`No conversion method for: ${name}`)
}
```

## ES2025 Parser 支持

### 内部辅助方法

ES2025 Parser 的 CST 结构与 ES6 有差异，需要专门的处理逻辑。这些方法标记为 `private`：

```typescript
// ES2025 类方法处理
private createEs2025MethodDefinitionAst(...)
private createEs2025GetterMethodAst(...)
private createEs2025SetterMethodAst(...)
private createEs2025GeneratorMethodAst(...)
private createEs2025AsyncMethodAst(...)
private createEs2025AsyncGeneratorMethodAst(...)
```

## 文件结构

```
slime/
├── packages/
│   ├── slime-ast/
│   │   └── src/
│   │       ├── SlimeAstType.ts      # AST 类型定义
│   │       ├── SlimeNodeCreate.ts   # AST 工厂方法 (第一层)
│   │       └── SlimeAstUtil.ts      # AST 工具方法
│   │
│   ├── slime-parser/
│   │   └── src/
│   │       └── language/
│   │           ├── SlimeCstToAstUtil.ts  # CST→AST 转换 (第二层)
│   │           ├── SlimeParser.ts        # 语法解析器
│   │           └── SlimeTokenConsumer.ts # Token 消费器
│   │
│   ├── slime-generator/
│   │   └── src/
│   │       └── SlimeGenerator.ts    # AST→代码 生成器
│   │
│   ├── slime-token/
│   │   └── src/
│   │       └── SlimeTokenCreate.ts  # Token 创建工具
│   │
│   └── slime-syntax/
│       └── src/
│           └── ...                  # 语法规则定义
│
└── tests/
    └── ...                          # 测试用例
```

## 使用示例

### 解析代码

```typescript
import { SlimeParser } from 'slime-parser'
import { SlimeCstToAst } from 'slime-parser'

// 1. 解析代码得到 CST
const parser = new SlimeParser()
const cst = parser.parse('const x = [1, 2, 3]')

// 2. 将 CST 转换为 AST
const cstToAst = new SlimeCstToAst()
const ast = cstToAst.toProgram(cst)

console.log(ast)
// {
//   type: 'Program',
//   body: [{
//     type: 'VariableDeclaration',
//     declarations: [{
//       type: 'VariableDeclarator',
//       id: { type: 'Identifier', name: 'x' },
//       init: {
//         type: 'ArrayExpression',
//         elements: [...]
//       }
//     }],
//     kind: 'const'
//   }],
//   sourceType: 'script'
// }
```

### 生成代码

```typescript
import { SlimeGenerator } from 'slime-generator'

const generator = new SlimeGenerator()
const code = generator.generate(ast)

console.log(code)
// 'const x = [1, 2, 3]'
```

## 容错设计

Slime 的核心特性是高容错性，能够解析包含语法错误的代码：

```typescript
// 不完整的代码也能解析
const cst = parser.parse('let a =')  // 其他解析器会报错
const ast = cstToAst.toProgram(cst)  // Slime 能处理
```

这使得 Slime 特别适合编辑器场景，用户输入代码时往往是不完整的。

## 与其他解析器对比

| 特性 | Slime | Babel | ESPrima | TypeScript |
|------|-------|-------|---------|------------|
| 容错解析 | ✅ | ❌ | ❌ | ✅ |
| ESTree 兼容 | ✅ | ✅ | ✅ | ❌ |
| 代码生成 | ✅ | ✅ | ❌ | ✅ |
| 适合编辑器 | ✅ | ❌ | ❌ | ✅ |

## 贡献指南

### 添加新的 CST 规则转换

1. 在 `SlimeCstToAstUtil.ts` 中添加 `createXxxAst` 方法（Xxx = CST 规则名）
2. 在 `createAstFromCst` 中添加对应的 if 分发
3. 如果需要新的 AST 类型，在 `SlimeNodeCreate.ts` 中添加工厂方法

### 运行测试

```bash
npx tsx ovs/tests/utils/test-stage2.ts
```
