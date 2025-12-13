# cssts-compiler

> CssTs 编译器 - 解析器、AST 转换器与类型生成器

## 设计理念

`cssts-compiler` 负责所有**编译时**的工作：

1. **解析** - 解析 `css { }` 语法
2. **转换** - CST 到 AST 转换
3. **生成** - 生成 TypeScript 类型定义和属性映射数据

生成的数据通过 vite-plugin-cssts 注入到 cssts-runtime，实现编译时和运行时的解耦。

## 架构

```
用户配置 (vite.config.ts)
        │
        ▼
┌─────────────────────────────────────────┐
│           cssts-compiler                │
│                                         │
│  ┌─────────────┐    ┌────────────────┐  │
│  │   解析器    │    │    生成器      │  │
│  │             │    │                │  │
│  │ css { }     │    │ properties.json│──┼──> 注入到运行时
│  │ 语法解析    │    │ .d.ts 文件     │──┼──> IDE 类型提示
│  └─────────────┘    └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 安装

```bash
npm install cssts-compiler
```

## 核心功能

### 1. 类型生成器

```typescript
import { 
  generate, 
  generatePropertiesJsonSync, 
  generateDtsAsync,
  createConfig 
} from 'cssts-compiler'

// 完整生成
const result = await generate({
  outDir: './node_modules/.cssts',
  config: createConfig({ /* 自定义配置 */ }),
  generateDts: true  // 开发环境需要
})

// 同步生成 properties.json（vite 启动时，阻塞）
generatePropertiesJsonSync({ outDir: './node_modules/.cssts' })

// 异步生成 .d.ts（不阻塞启动）
await generateDtsAsync({ outDir: './node_modules/.cssts' })
```

### 2. 生成的文件

| 文件 | 用途 | 使用者 |
|------|------|--------|
| `properties.json` | 属性映射表 | cssts-runtime |
| `CsstsAtoms.d.ts` | 原子类类型 | IDE |
| `global.d.ts` | 全局变量声明 | IDE |
| `runtime.d.ts` | 运行时类型 | IDE |

### 3. 配置系统

新的配置结构：**属性 → 单位 → 配置**

```typescript
import { createConfig } from 'cssts-compiler'

const config = createConfig({
  // 全局默认（字段级回退）
  defaults: {
    px: { max: 500 },
    rem: { min: 0.25, max: 50, step: 0.25 },
  },
  
  // 属性配置
  properties: {
    padding: {
      zero: true,           // 生成 padding0
      px: { max: 1000 },    // 覆盖默认
      rem: {},              // 使用默认
      ratio: {},            // 支持百分比
    },
    'border-width': {
      zero: true,
      px: { max: 20 },
    },
    'z-index': {
      unitless: { max: 9999, negative: true },
    },
  }
})
```

### 4. 单位配置项

```typescript
interface UnitConfig {
  min?: number          // 最小值
  max?: number          // 最大值
  step?: number         // 步长（不设置则用渐进步长）
  presets?: number[]    // 额外预设值
  negative?: boolean    // 是否支持负数
}
```

### 5. 配置回退机制

```typescript
// 优先级：属性配置 > defaults > systemDefaults

config = {
  defaults: { px: { max: 500 } },
  properties: {
    padding: { px: { max: 1000 } },  // 用 1000
    margin: { px: {} },               // 用 defaults 的 500
  }
}
```

### 6. 支持的单位类型

| 单位 | 说明 | CSS 后缀 |
|------|------|----------|
| `zero` | 是否生成 0 值 | (布尔值) |
| `px` | 像素 | `px` |
| `rem` | 相对单位 | `rem` |
| `ratio` | 百分比 | `%` |
| `unitless` | 无单位 | (无) |
| `deg` | 角度 | `deg` |
| `ms` | 时间 | `ms` |
| `fr` | Grid 弹性单位 | `fr` |

### 7. 渐进步长策略

当不设置 `step` 时，使用渐进步长：

| 范围 | 生成规则 |
|------|---------|
| 1-100 | 每个整数 |
| 100-200 | 能被 2 或 5 整除 |
| 200-500 | 能被 5 整除 |
| 500-1000 | 能被 10 整除 |
| 1000+ | 更稀疏 |

### 8. 解析器和 AST

```typescript
import { CssTsParser, cssTsCstToAst } from 'cssts-compiler'

const parser = new CssTsParser(`
  const style = css { colorRed, fontBold }
`)
const cst = parser.Program()
const ast = cssTsCstToAst.toProgram(cst)

// 获取使用的原子类
const usedAtoms = cssTsCstToAst.getUsedAtoms()
```

## Vite 插件集成示例

```typescript
// vite-plugin-cssts 内部实现
import { 
  generatePropertiesJsonSync, 
  generateDtsAsync,
  generatePropertiesJson,
  generateAtoms
} from 'cssts-compiler'

function csstsPlugin(options) {
  let properties = {}
  
  return {
    name: 'vite-plugin-cssts',
    
    configResolved(config) {
      // 1. 生成属性数据
      const atoms = generateAtoms(options.config)
      properties = generatePropertiesJson(atoms)
      
      // 2. 写入 properties.json（运行时需要）
      generatePropertiesJsonSync({
        outDir: './node_modules/.cssts',
        config: options.config
      })
      
      // 3. 开发环境生成 .d.ts（IDE 需要）
      if (config.mode === 'development') {
        generateDtsAsync({
          outDir: './node_modules/.cssts',
          config: options.config
        })
      }
    },
    
    // 4. 注入初始化代码到运行时
    transform(code, id) {
      if (isEntryFile(id)) {
        return `
          import { initProperties } from 'cssts-runtime';
          initProperties(${JSON.stringify(properties)});
        ` + code
      }
    }
  }
}
```

## 许可证

MIT
