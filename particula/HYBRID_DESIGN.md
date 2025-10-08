# Particula + Subhuti 混合架构设计方案

## 📋 文档概述

本文档定义了 **Particula 和 Subhuti 的混合架构设计**，用于解决多继承场景下的 Parser 组合问题。

**设计原则：**
- **单继承场景** → 使用 Subhuti 继承模式 ✅
- **多继承场景** → 使用 Particula 组合模式 ✅

---

## 🎯 设计目标

### 核心问题

在构建 Parser 时，我们面临以下场景：

1. **单一扩展**（单继承）
   ```
   ES5 → ES6 → ObjectScript  ✅ 继承可以处理
   ```

2. **多个扩展**（多继承）
   ```
   ES6 → ObjectScript (添加 object 关键字)
   ES6 → GenericScript (添加 <T> 泛型)
   
   想要：ObjectScript + GenericScript  ❌ 继承无法处理（菱形继承）
   ```

### 解决方案

**混合架构：**
- 保留 Subhuti 的继承优势（简单、类型安全）
- 引入 Particula 的组合能力（灵活、可扩展）

---

## 🏗️ 总体架构

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    应用层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 单继承场景   │  │ 多继承场景   │  │ 主从模式     │  │
│  │ (Subhuti)    │  │ (Particula)  │  │ (混合)       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    适配层                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         SubhutiParserAdapter                      │  │
│  │  - 将 Subhuti Parser 转为 Particula Plugin       │  │
│  │  - 提取规则、Token、依赖                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    核心层                                │
│  ┌──────────────┐              ┌──────────────────┐    │
│  │   Subhuti    │              │   Particula      │    │
│  │   (继承)     │              │   (组合)         │    │
│  └──────────────┘              └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 核心组件设计

### 1. SubhutiParserAdapter（适配器）

**职责：** 将 Subhuti Parser 转换为 Particula Plugin

**接口设计：**

```typescript
class SubhutiParserAdapter {
  /**
   * 将 Subhuti Parser 转为 Particula Plugin
   * 
   * @param name - 插件名称
   * @param ParserClass - Subhuti Parser 类
   * @param options - 配置选项
   * @returns Particula Plugin
   */
  static toPlugin(
    name: string,
    ParserClass: typeof SubhutiParser,
    options?: {
      // 要提取哪些规则（方法名）
      extractRules?: string[]
      
      // Token 定义
      tokens?: SubhutiCreateToken[]
      
      // 依赖的其他插件
      dependencies?: string[]
      
      // Token Consumer 类
      tokenConsumerClass?: typeof SubhutiTokenConsumer
    }
  ): ParticulaPlugin
  
  /**
   * 从 Parser 实例中提取所有规则方法名
   */
  static extractRuleNames(parser: SubhutiParser): string[]
  
  /**
   * 从 Parser 类中提取所有 @SubhutiRule 装饰的方法
   */
  static extractDecoratedRules(ParserClass: typeof SubhutiParser): string[]
}
```

**实现要点：**

1. **规则提取**
   - 扫描 Parser 类的所有方法
   - 识别 @SubhutiRule 装饰器
   - 提取方法名作为规则名

2. **规则包装**
   - 将 Subhuti 方法包装为 Particula 规则
   - 保持调用上下文（this 绑定）
   - 处理参数和返回值

3. **Token 处理**
   - 收集 Parser 的 TokenConsumer 的所有 tokens
   - 合并到 Plugin 的 tokens 中
   - 处理 token 冲突

---

### 2. HybridParticulaParser（混合 Parser）

**职责：** 扩展 ParticulaParser，支持直接使用 Subhuti Parser

**接口设计：**

```typescript
class HybridParticulaParser extends ParticulaParser {
  /**
   * 注册 Subhuti Parser
   * 
   * @param name - 插件名称
   * @param ParserClass - Subhuti Parser 类
   * @param options - 配置选项
   */
  useSubhutiParser(
    name: string,
    ParserClass: typeof SubhutiParser,
    options?: {
      extractRules?: string[]
      tokens?: SubhutiCreateToken[]
      dependencies?: string[]
      tokenConsumerClass?: typeof SubhutiTokenConsumer
    }
  ): this
  
  /**
   * 批量注册多个 Subhuti Parser
   */
  useSubhutiParsers(
    parsers: Array<{
      name: string
      ParserClass: typeof SubhutiParser
      options?: any
    }>
  ): this
}
```

**使用示例：**

```typescript
const parser = new HybridParticulaParser()
  .useSubhutiParser('Object', ObjectScriptParser, {
    extractRules: ['ObjectDeclaration', 'ObjectTail']
  })
  .useSubhutiParser('Generic', GenericParser, {
    extractRules: ['GenericDeclaration', 'TypeParameter']
  })

parser.parse(tokens, 'Program')
```

---

### 3. MainSecondaryParser（主从模式）

**职责：** 实现主从 Parser 模式，优先使用主 Parser，失败时尝试从 Parser

**接口设计：**

```typescript
class MainSecondaryParser {
  /**
   * 构造函数
   * 
   * @param MainParserClass - 主 Parser 类
   * @param mainTokenConsumerClass - 主 Parser 的 TokenConsumer
   */
  constructor(
    MainParserClass: typeof SubhutiParser,
    mainTokenConsumerClass?: typeof SubhutiTokenConsumer
  )
  
  /**
   * 添加从 Parser（Subhuti）
   */
  addSecondarySubhuti(
    name: string,
    ParserClass: typeof SubhutiParser,
    options?: {
      extractRules?: string[]
      tokens?: SubhutiCreateToken[]
      priority?: number  // 优先级（数字越大越优先）
    }
  ): this
  
  /**
   * 添加从 Parser（Particula Plugin）
   */
  addSecondaryPlugin(plugin: ParticulaPlugin): this
  
  /**
   * 解析
   * 
   * @param tokens - Token 数组
   * @param startRule - 起始规则名
   * @param mode - 解析模式
   */
  parse(
    tokens: SubhutiMatchToken[],
    startRule?: string,
    mode?: 'primary-first' | 'try-all' | 'smart'
  ): SubhutiCst
  
  /**
   * 设置解析模式
   */
  setMode(mode: 'primary-first' | 'try-all' | 'smart'): this
}
```

**解析模式：**

1. **primary-first（主优先）**
   ```typescript
   // 1. 先用主 Parser
   // 2. 主失败才用从 Parser
   // 3. 按优先级尝试从 Parser
   ```

2. **try-all（全尝试）**
   ```typescript
   // 1. 所有 Parser（主+从）都尝试
   // 2. 计算每个结果的质量分数
   // 3. 选择分数最高的
   ```

3. **smart（智能模式）**
   ```typescript
   // 1. 先看 token 特征
   // 2. 预判哪个 Parser 最合适
   // 3. 直接用该 Parser
   // 4. 失败才回退到其他 Parser
   ```

---

## 📊 使用场景

### 场景 1: 单一扩展（Subhuti 继承）

**适用：** 明确的单一扩展链

```typescript
// ES6 → ObjectScript
class ObjectScriptParser extends ES6Parser {
  @SubhutiRule
  ObjectDeclaration() {
    this.tokenConsumer.ObjectToken()
    this.BindingIdentifier()
    this.ObjectTail()
  }
}

// 使用
const parser = new ObjectScriptParser(tokens, ObjectScriptTokenConsumer)
parser.Program()
```

**何时使用：**
- ✅ 只需要一个扩展
- ✅ 扩展关系明确
- ✅ 不需要组合其他特性

---

### 场景 2: 多继承组合（Particula 组合）

**适用：** 需要组合多个扩展（菱形继承）

```typescript
// 方式 1: 使用 HybridParticulaParser
const parser = new HybridParticulaParser()
  .useSubhutiParser('Object', ObjectScriptParser, {
    extractRules: ['ObjectDeclaration', 'ObjectTail']
  })
  .useSubhutiParser('Generic', GenericParser, {
    extractRules: ['GenericDeclaration', 'TypeParameter']
  })

parser.parse(tokens, 'Program')

// 方式 2: 手动转换
const ObjectPlugin = SubhutiParserAdapter.toPlugin(
  'Object',
  ObjectScriptParser,
  { extractRules: ['ObjectDeclaration'] }
)

const GenericPlugin = SubhutiParserAdapter.toPlugin(
  'Generic',
  GenericParser,
  { extractRules: ['GenericDeclaration'] }
)

const parser = new ParticulaParser()
  .use(ObjectPlugin)
  .use(GenericPlugin)

parser.parse(tokens, 'Program')
```

**何时使用：**
- ✅ 需要多个扩展特性
- ✅ 菱形继承问题
- ✅ 特性可独立使用

---

### 场景 3: 主从模式（推荐）

**适用：** 有明确的主 Parser，扩展为辅助

```typescript
// ES6 为主，Object 和 Generic 为从
const parser = new MainSecondaryParser(ES6Parser, ES6TokenConsumer)
  .addSecondarySubhuti('Object', ObjectScriptParser, {
    extractRules: ['ObjectDeclaration'],
    priority: 10
  })
  .addSecondarySubhuti('Generic', GenericParser, {
    extractRules: ['GenericDeclaration'],
    priority: 5
  })
  .setMode('primary-first')

parser.parse(tokens, 'Program')
```

**何时使用：**
- ✅ 有明确的主 Parser（如 ES6）
- ✅ 扩展是可选的附加功能
- ✅ 需要优先级控制
- ✅ 需要回退机制

---

## 🔄 执行流程

### 流程 1: HybridParticulaParser 解析流程

```
1. 用户调用 parser.parse(tokens, 'Program')
   ↓
2. ParticulaParser 查找 'Program' 规则
   ↓
3. 找到规则（可能来自 Subhuti Parser）
   ↓
4. 调用规则的 parse(ctx)
   ↓
5. parse 内部调用原 Subhuti Parser 的方法
   ↓
6. Subhuti Parser 执行，生成 CST
   ↓
7. 返回 CST
```

### 流程 2: MainSecondaryParser 解析流程

**模式：primary-first**

```
1. 用户调用 parser.parse(tokens, 'Program', 'primary-first')
   ↓
2. 尝试主 Parser
   ↓
3. 主 Parser 成功？
   ├─ Yes → 返回 CST
   └─ No  → 继续
       ↓
4. 按优先级尝试从 Parser
   ↓
5. 某个从 Parser 成功？
   ├─ Yes → 返回 CST
   └─ No  → 抛出错误
```

**模式：try-all**

```
1. 用户调用 parser.parse(tokens, 'Program', 'try-all')
   ↓
2. 所有 Parser（主+从）都尝试解析
   ↓
3. 收集所有结果
   ↓
4. 计算每个结果的质量分数
   - 消费 token 数量
   - AST 深度
   - 错误节点数量
   ↓
5. 选择分数最高的返回
```

**模式：smart**

```
1. 用户调用 parser.parse(tokens, 'Program', 'smart')
   ↓
2. 分析 token 特征
   - 第一个 token 是什么
   - token 序列模式
   ↓
3. 预判最合适的 Parser
   ↓
4. 直接用该 Parser 解析
   ↓
5. 成功？
   ├─ Yes → 返回 CST
   └─ No  → 回退到 primary-first 模式
```

---

## 🎨 项目结构

### 新增文件

```
particula/
├── src/
│   ├── adapters/                    # 适配器（新增）
│   │   ├── SubhutiParserAdapter.ts  # Subhuti → Particula 适配器
│   │   └── index.ts
│   │
│   ├── hybrid/                      # 混合 Parser（新增）
│   │   ├── HybridParticulaParser.ts # 混合 Parser
│   │   ├── MainSecondaryParser.ts   # 主从模式 Parser
│   │   └── index.ts
│   │
│   ├── types.ts                     # 类型定义（扩展）
│   ├── ...                          # 现有文件
│   └── index.ts                     # 导出新增内容
│
├── examples/
│   ├── hybridUsage.ts               # 混合使用示例（新增）
│   ├── mainSecondary.ts             # 主从模式示例（新增）
│   └── ...
│
├── HYBRID_DESIGN.md                 # 本文档
└── ...
```

---

## 📝 类型定义扩展

### 新增类型

```typescript
// adapters/types.ts

/**
 * Subhuti Parser 适配选项
 */
export interface SubhutiAdapterOptions {
  // 要提取的规则名称列表
  extractRules?: string[]
  
  // Token 定义
  tokens?: SubhutiCreateToken[]
  
  // 依赖的其他插件
  dependencies?: string[]
  
  // TokenConsumer 类
  tokenConsumerClass?: typeof SubhutiTokenConsumer
  
  // 是否自动提取所有 @SubhutiRule 方法
  autoExtract?: boolean
}

/**
 * 主从模式配置
 */
export interface MainSecondaryConfig {
  // 解析模式
  mode: 'primary-first' | 'try-all' | 'smart'
  
  // 是否启用调试
  debug?: boolean
  
  // 质量分数计算器
  scoreCalculator?: (ast: SubhutiCst, tokens: SubhutiMatchToken[]) => number
}

/**
 * 从 Parser 配置
 */
export interface SecondaryParserConfig {
  name: string
  parser: SubhutiParser | ParticulaPlugin
  priority: number
  extractRules?: string[]
}
```

---

## 🔍 关键实现细节

### 1. 规则提取机制

```typescript
// 从 Subhuti Parser 提取 @SubhutiRule 装饰的方法

class SubhutiParserAdapter {
  static extractDecoratedRules(ParserClass: typeof SubhutiParser): string[] {
    const rules: string[] = []
    const proto = ParserClass.prototype
    
    // 遍历原型链
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor') continue
      
      const descriptor = Object.getOwnPropertyDescriptor(proto, key)
      if (!descriptor?.value || typeof descriptor.value !== 'function') {
        continue
      }
      
      // 检查是否有 @SubhutiRule 装饰器元数据
      const metadata = Reflect.getMetadata('subhuti:rule', proto, key)
      if (metadata) {
        rules.push(key)
      }
    }
    
    return rules
  }
}
```

### 2. 规则调用桥接

```typescript
// 在 Particula 中调用 Subhuti 规则

class SubhutiParserAdapter {
  static toPlugin(name: string, ParserClass: typeof SubhutiParser, options) {
    // 创建 Parser 实例（用于规则调用）
    const parserInstance = new ParserClass()
    
    const rules = options.extractRules || this.extractDecoratedRules(ParserClass)
    
    return {
      name,
      rules: rules.map(ruleName => ({
        name: ruleName,
        parse: (ctx: ParseContext) => {
          // 获取底层 Subhuti Parser
          const subhutiParser = ctx.parser.getBaseParser()
          
          // 临时替换为适配的 parser 实例的状态
          const originalTokens = subhutiParser.tokens
          const originalCst = subhutiParser.getCurCst()
          
          // 设置当前状态
          parserInstance.setTokens(ctx.getTokens())
          parserInstance.setCurCst(ctx.getCst())
          
          // 调用 Subhuti 规则
          const method = (parserInstance as any)[ruleName]
          method.call(parserInstance)
          
          // 恢复状态
          subhutiParser.setTokens(originalTokens)
          subhutiParser.setCurCst(originalCst)
        }
      })),
      tokens: options.tokens || []
    }
  }
}
```

### 3. Token 合并策略

```typescript
// 合并多个 Parser 的 Tokens

class HybridParticulaParser extends ParticulaParser {
  private mergeAllTokens(): SubhutiCreateToken[] {
    const tokenMap = new Map<string, SubhutiCreateToken>()
    
    // 1. 收集所有 tokens
    for (const plugin of this.getPlugins()) {
      for (const token of plugin.tokens || []) {
        const tokenName = (token as any).tokenName || token.name
        
        // 2. 处理冲突
        if (tokenMap.has(tokenName)) {
          const existing = tokenMap.get(tokenName)
          // 使用优先级更高的（后注册的优先）
          if ((token as any).priority >= (existing as any).priority) {
            tokenMap.set(tokenName, token)
          }
        } else {
          tokenMap.set(tokenName, token)
        }
      }
    }
    
    return Array.from(tokenMap.values())
  }
}
```

### 4. 质量分数计算

```typescript
// 计算 AST 质量分数

class MainSecondaryParser {
  private defaultScoreCalculator(
    ast: SubhutiCst,
    originalTokens: SubhutiMatchToken[]
  ): number {
    let score = 0
    
    // 1. Token 消费率（0-100分）
    const consumedTokens = this.countConsumedTokens(ast)
    const consumeRate = consumedTokens / originalTokens.length
    score += consumeRate * 100
    
    // 2. AST 深度（0-50分）
    const depth = this.calculateASTDepth(ast)
    score += Math.min(depth * 5, 50)
    
    // 3. 错误节点惩罚（-50分/个）
    const errorNodes = this.countErrorNodes(ast)
    score -= errorNodes * 50
    
    // 4. 完整性奖励（0-50分）
    if (this.isComplete(ast)) {
      score += 50
    }
    
    return Math.max(0, score)
  }
}
```

---

## ✅ 实现检查清单

### 第一阶段：核心适配器

- [ ] 实现 SubhutiParserAdapter
  - [ ] toPlugin 方法
  - [ ] extractRuleNames 方法
  - [ ] extractDecoratedRules 方法
  - [ ] 规则调用桥接逻辑
  - [ ] Token 收集和合并

### 第二阶段：混合 Parser

- [ ] 实现 HybridParticulaParser
  - [ ] useSubhutiParser 方法
  - [ ] useSubhutiParsers 批量注册
  - [ ] Token 合并逻辑
  - [ ] 规则调用代理

### 第三阶段：主从模式

- [ ] 实现 MainSecondaryParser
  - [ ] 构造函数和初始化
  - [ ] addSecondarySubhuti 方法
  - [ ] addSecondaryPlugin 方法
  - [ ] parse 方法（三种模式）
  - [ ] 质量分数计算
  - [ ] 智能 Parser 选择

### 第四阶段：测试和示例

- [ ] 编写单元测试
  - [ ] 适配器测试
  - [ ] 混合 Parser 测试
  - [ ] 主从模式测试
  
- [ ] 编写示例代码
  - [ ] 基础混合使用示例
  - [ ] 主从模式示例
  - [ ] 完整项目示例

### 第五阶段：文档和优化

- [ ] 完善文档
  - [ ] API 文档
  - [ ] 使用指南
  - [ ] 最佳实践
  
- [ ] 性能优化
  - [ ] 规则调用优化
  - [ ] Token 合并优化
  - [ ] 质量分数计算优化

---

## 📚 参考资料

### 相关设计模式

1. **适配器模式（Adapter Pattern）**
   - SubhutiParserAdapter 使用此模式
   - 将 Subhuti 接口适配为 Particula 接口

2. **组合模式（Composite Pattern）**
   - Particula 的核心设计
   - 规则组合成插件，插件组合成 Parser

3. **策略模式（Strategy Pattern）**
   - MainSecondaryParser 的解析模式
   - 不同的解析策略可切换

4. **桥接模式（Bridge Pattern）**
   - 规则调用桥接
   - 连接 Particula 上下文和 Subhuti 执行

### 相关文档

- [Particula 设计文档](./PROJECT_SUMMARY.md)
- [Subhuti vs Particula 对比](./COMPARISON.md)
- [使用指南](./GUIDE.md)

---

## 🎯 总结

### 设计核心

**混合架构 = Subhuti 继承 + Particula 组合**

- **单继承** → Subhuti（简单、直接）
- **多继承** → Particula（灵活、强大）

### 关键组件

1. **SubhutiParserAdapter** - 适配器，连接两个世界
2. **HybridParticulaParser** - 混合 Parser，简化使用
3. **MainSecondaryParser** - 主从模式，实际应用

### 使用建议

- 新项目：优先考虑 Particula
- 现有项目：保持 Subhuti，需要时引入 Particula
- 复杂场景：使用主从模式

---

## 📝 后续计划

### 短期（当前迭代）

1. 实现 SubhutiParserAdapter
2. 实现 HybridParticulaParser
3. 基础测试和示例

### 中期（下一迭代）

1. 实现 MainSecondaryParser
2. 完善三种解析模式
3. 性能优化

### 长期（未来版本）

1. 可视化工具
2. 规则市场
3. 更多语言支持

---

**本文档版本：** 1.0  
**创建日期：** 2025-10-09  
**状态：** 设计阶段 - 待实现

---

_注：在开始代码实现前，请确保已充分理解本设计文档的所有内容。如有疑问，请及时提出讨论。_

