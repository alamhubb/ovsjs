# CssTs

> CSS-in-TS：编译时原子 CSS 类管理系统

CssTs 是一个类型安全的原子 CSS 解决方案，通过 TypeScript 提供完整的 IDE 支持，在编译时生成优化的 CSS。

## 特性

- 🎯 **类型安全** - 完整的 TypeScript 类型定义，IDE 代码补全
- 🚀 **编译时优化** - CSS 在构建时按需生成，零运行时开销
- 🔧 **灵活配置** - 属性 → 单位 → 配置的直观配置结构
- ⚡ **冲突处理** - 智能检测并替换同属性样式
- 📦 **零依赖运行时** - runtime 包无任何依赖，体积最小

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                           编译时                                 │
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │ cssts-compiler  │         │     vite-plugin-cssts       │   │
│  │                 │ 生成    │                             │   │
│  │ • 解析配置      │ ──────> │ • 调用 compiler 生成数据    │   │
│  │ • 生成 .d.ts    │         │ • 注入 properties 到 runtime│   │
│  │ • 生成 json     │         │ • 转换 css { } 语法         │   │
│  └─────────────────┘         └──────────────┬──────────────┘   │
└─────────────────────────────────────────────┼───────────────────┘
                                              │ 注入
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           运行时                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    cssts-runtime                         │   │
│  │                                                          │   │
│  │  initProperties(data)  ← 接收编译时生成的属性映射数据     │   │
│  │  $cls()                ← 样式合并                        │   │
│  │  replace()             ← 样式替换（基于属性冲突检测）     │   │
│  │                                                          │   │
│  │  ⚠️ 零依赖：不依赖 compiler，数据由 vite 插件注入        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

1. **编译时**：`cssts-compiler` 根据配置生成 `properties.json` 和 `.d.ts` 文件
2. **注入**：`vite-plugin-cssts` 将 properties 数据注入到应用入口
3. **运行时**：`cssts-runtime` 通过 `initProperties()` 接收数据，实现样式解析

### 为什么这样设计？

- **运行时零依赖**：不依赖 compiler，打包体积最小
- **按需生成**：属性数据根据用户配置动态生成，不是硬编码
- **properties.json 用途**：用于"最长前缀匹配"，将 TS 变量名解析为 CSS 属性名

## 快速开始

```bash
npm install cssts cssts-runtime cssts-compiler
```

### 使用

```typescript
// 基础用法
const buttonStyle = css {
  displayFlex,
  alignItemsCenter,
  paddingX16px,
  paddingY8px,
  bgPrimary,
  colorWhite
}

// 条件样式
const style = css {
  colorRed,
  isDisabled && opacity50pct
}

// 在 Vue 中使用
<template>
  <button :class="buttonStyle">点击我</button>
</template>
```

## 包结构

```
cssts/
├── packages/
│   ├── cssts-runtime/    # 运行时（$cls, replace）- 零依赖
│   └── cssts-compiler/   # 编译器 + 类型生成器
└── src/
    └── index.ts          # 统一导出
```

### cssts-runtime

**零依赖**的运行时工具函数，通过 `initProperties()` 接收编译时生成的数据：

```typescript
import { $cls, replace, replaceAll, initProperties } from 'cssts-runtime'

// ⚠️ 由 vite-plugin-cssts 自动注入，无需手动调用
// initProperties({ paddingTop: 'padding-top', ... })

// 合并样式
const style = $cls(colorRed, fontBold, padding16px)

// 替换样式（基于属性冲突检测）
const newStyle = replace(style, 'color', 'colorGreen')
```

### cssts-compiler

编译时处理 + 类型生成，生成两类文件：

| 文件 | 用途 | 使用者 |
|------|------|--------|
| `properties.json` | 属性映射表（最长前缀匹配） | cssts-runtime |
| `.d.ts` 文件 | TypeScript 类型定义 | IDE |

```typescript
import { 
  createConfig, 
  generate,
  generatePropertiesJsonSync,
  generateDtsAsync,
  CssTsParser, 
  cssTsCstToAst 
} from 'cssts-compiler'

// 自定义配置
const config = createConfig({
  properties: {
    padding: {
      zero: true,
      px: { max: 500 },
      rem: {},
    },
    'border-width': {
      px: { max: 20 },
    }
  }
})

// 同步生成 properties.json（vite 启动时）
generatePropertiesJsonSync({ outDir: './node_modules/.cssts', config })

// 异步生成 .d.ts（开发环境，不阻塞启动）
await generateDtsAsync({ outDir: './node_modules/.cssts', config })
```

## 配置系统

新的配置结构：属性 → 单位 → 配置

```typescript
interface CsstsConfig {
  // 全局默认（字段级回退）
  defaults?: {
    px?: UnitConfig
    rem?: UnitConfig
    // ...
  }
  
  // 属性配置
  properties: {
    [property: string]: {
      zero?: boolean        // 是否生成 0 值
      px?: UnitConfig       // 像素配置
      rem?: UnitConfig      // rem 配置
      ratio?: UnitConfig    // 百分比配置
      unitless?: UnitConfig // 无单位配置
      deg?: UnitConfig      // 角度配置
      ms?: UnitConfig       // 时间配置
      fr?: UnitConfig       // grid fr 配置
    }
  }
}

interface UnitConfig {
  min?: number          // 最小值
  max?: number          // 最大值
  step?: number         // 步长（不设置则用渐进步长）
  presets?: number[]    // 额外预设值
  negative?: boolean    // 是否支持负数
}
```

### 配置示例

```typescript
const config = createConfig({
  defaults: {
    px: { max: 500 },
  },
  properties: {
    padding: {
      zero: true,
      px: { max: 1000 },    // 覆盖默认
      rem: {},              // 使用默认
      ratio: {},
    },
    'z-index': {
      unitless: { max: 9999, negative: true },
    },
  }
})
```

## 命名规范

| TS 变量名 | CSS 类名 | CSS 规则 |
|-----------|----------|----------|
| `displayFlex` | `display_flex` | `display: flex` |
| `paddingTop16px` | `padding-top_16px` | `padding-top: 16px` |
| `width50pct` | `width_50\%` | `width: 50%` |
| `zIndexN1` | `z-index_-1` | `z-index: -1` |

## 与 Vite 集成

```typescript
// vite.config.ts
import { cssts } from 'vite-plugin-cssts'
import { createConfig } from 'cssts-compiler'

export default {
  plugins: [
    cssts({
      config: createConfig({
        properties: {
          padding: { px: { max: 500 } }
        }
      })
    })
  ]
}
```

## 许可证

MIT
