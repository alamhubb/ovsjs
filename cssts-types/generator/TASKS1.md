# CssTs 原子类生成器设计文档

## 目标

完善基于 css-tree 的原子类生成器，生成正确的类型定义文件。

---

## 设计理念

### 1. 权威数据源优先

**css-tree 作为唯一数据源**，而非手动维护属性列表。

- css-tree 是 CSS 语法解析的权威库，包含完整的 CSS 规范定义
- 属性名、关键字、语法结构都从 css-tree 自动提取
- 避免手动维护带来的遗漏和错误
- 当 CSS 规范更新时，只需更新 css-tree 版本

### 2. 自动检测 + 手动配置

**能自动化的自动化，必须手动的才手动**。

| 数据 | 来源 | 说明 |
|------|------|------|
| 属性名 | 自动（css-tree） | 651 个属性 |
| 关键字 | 自动（css-tree） | 递归解析语法树 |
| 颜色属性检测 | 自动（css-tree） | 检测 `<color>` 类型 |
| 复杂类型检测 | 自动（css-tree） | 检测 `<image>`, `<filter-function>` 等 |
| 数值单位配置 | 手动（配置表） | 每个属性支持的单位类型 |

### 3. 类型安全

**TypeScript 类型系统保证配置正确性**。

```typescript
// 联合类型确保 zero 不需要 value
type NumericType = 
  | { unit: 'zero' }
  | { unit: Exclude<UnitType, 'zero'>; value: ValueType; ... }

// 编译时检查配置错误
const config: NumericType = { unit: 'zero', value: 'integer' } // ❌ 类型错误
const config: NumericType = { unit: 'zero' } // ✅ 正确
```

### 4. 分层设计

**关注点分离，各司其职**。

```
┌─────────────────────────────────────────────────────────┐
│                    生成器 (Generator)                    │
│  - 组合 keywords + numeric 生成原子类                    │
│  - 处理命名转换（TS 标识符、CSS 类名）                    │
└─────────────────────────────────────────────────────────┘
                           ↑
          ┌────────────────┴────────────────┐
          ↓                                 ↓
┌─────────────────────┐       ┌─────────────────────────┐
│   css-tree 数据层    │       │      配置层              │
│  - 属性名            │       │  - propertyNumericTypes │
│  - 关键字            │       │  - 单位类型映射          │
│  - 语法结构          │       │  - 数值预设              │
└─────────────────────┘       └─────────────────────────┘
```

### 5. 排除优于包含

**明确排除不适合的属性，而非手动选择要包含的**。

- 颜色属性 → 由设计系统（cssts-theme-element）处理
- 复杂类型属性 → 无法预生成，需运行时处理
- 其他所有属性 → 自动生成原子类

这样做的好处：
- 不会遗漏新增的 CSS 属性
- 排除规则清晰可追溯
- 减少手动维护工作量

### 6. 渐进式设计

**分阶段实现，每阶段聚焦核心问题**。

| 阶段 | 聚焦 | 状态 |
|------|------|------|
| 第一阶段 | 数据结构、类型系统、配置设计 | ✅ 完成 |
| 第二阶段 | 属性筛选、简写属性处理 | 🔄 进行中 |
| 第三阶段 | 响应式变体、状态变体 | ⏳ 待定 |

---

## 实现原理

### 核心思路

原子类生成器的核心是将 CSS 属性分解为两类值：
1. **关键字值** - 如 `auto`, `flex`, `none` 等（从 css-tree 获取）
2. **数值** - 如 `16px`, `50%`, `0` 等（从配置表获取）

### 数据流

```
css-tree (权威数据源)
    │
    ├─→ 属性名列表 (651 个)
    │
    ├─→ 关键字列表 (keywords)
    │       └─→ 递归解析语法树，提取所有关键字
    │
    └─→ 数值类型分析 (numericTypes)
            │
            ├─→ 颜色属性 (38 个) ──→ 排除（由设计系统处理）
            │
            ├─→ 复杂类型属性 (13 个) ──→ 排除（无法预生成）
            │       如 filter, transform, box-shadow
            │
            └─→ 数值属性 (203 个) ──→ 生成配置
                    └─→ property-numeric-config.ts
```

### 属性分类

| 分类 | 数量 | 处理方式 |
|------|------|---------|
| **数值属性** | 203 | 生成数值原子类 |
| **颜色属性** | 38 | 排除（由 cssts-theme-element 处理） |
| **复杂类型属性** | 13 | 排除（无法预生成） |
| **纯关键字属性** | ~400 | 只生成关键字原子类 |

### 颜色属性检测原理

通过递归解析 css-tree 的语法树，检测属性是否包含 `<color>` 类型：

```typescript
// 递归解析时遇到以下类型则停止：
const STOP_TYPES = [
  '<color>',           // 颜色类型
  '<image>',           // 图片类型
  '<filter-function>', // 滤镜函数
  '<transform-function>', // 变换函数
  '<shadow>',          // 阴影类型
  '<shape>',           // 形状类型
]

// 判断逻辑：
// 如果属性的 numericTypes 只包含 <color>（或 <color> + alpha-value）
// 则标记为 colorProperty: true
```

### 复杂类型检测原理

如果属性的 numericTypes 只包含复杂类型（无真正的数值类型），则标记为 `complexOnly: true`：

```typescript
// 复杂类型列表
const COMPLEX_TYPES = ['<image>', '<filter-function>', '<transform-function>', '<shadow>', '<shape>']

// 示例：
// background-image: [<image>] → complexOnly: true
// filter: [<filter-function>] → complexOnly: true
// transform: [<transform-function>] → complexOnly: true
```

### 生成覆盖分析

**可以生成的属性**：
1. **数值属性** (203 个) - 有 `propertyNumericTypes` 配置，生成数值类 + 关键字类
2. **纯关键字属性** (~400 个) - 只生成关键字类（如 `display-flex`, `position-absolute`）

**不生成的属性**：
1. **颜色属性** (38 个) - 由 cssts-theme-element 设计系统处理
2. **复杂类型属性** (13 个) - 无法预生成（filter, transform, box-shadow 等）

**生成逻辑**：
```typescript
// 对于每个属性：
function canGenerate(property: string): boolean {
  // 1. 检查是否有 keywords（从 css-tree）
  const hasKeywords = getKeywordsFromCssTree(property).length > 0
  
  // 2. 检查是否有数值配置
  const hasNumeric = property in propertyNumericTypes
  
  // 只要有 keywords 或 numeric，就可以生成
  return hasKeywords || hasNumeric
}
```

---

## 现有实现

### 文件结构

```
cssts-types/generator/
├── types.ts                    # 核心类型定义
├── property-numeric-config.ts  # 属性数值配置（203 个属性）
├── extract-numeric-types.ts    # css-tree 数据提取脚本
├── generate-property-config.ts # 配置生成脚本
├── csstree-numeric-analysis.json # css-tree 分析结果
└── TASKS1.md                   # 本设计文档
```

### 类型系统 (types.ts)

#### 单位类型 (UnitType)

```typescript
type UnitType = 'zero' | 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'fr' | 'unitless'
```

| 单位类型 | 说明 | CSS 后缀 |
|---------|------|---------|
| `zero` | 特殊值 0（无单位） | `''` |
| `px` | 像素 | `px` |
| `rem` | 相对单位 | `rem`, `em` |
| `ratio` | 比例单位 | `%`, `vh`, `vw`, `vmin`, `vmax` |
| `deg` | 角度 | `deg`, `rad`, `turn` |
| `ms` | 时间 | `ms`, `s` |
| `fr` | Grid 弹性单位 | `fr` |
| `unitless` | 无单位数值 | `''` |

#### 数值类型 (NumericType)

使用联合类型，`zero` 不需要 `value` 字段：

```typescript
type NumericType = 
  | { unit: 'zero' }  // 只有 0，不需要 value
  | {
      unit: Exclude<UnitType, 'zero'>
      value: ValueType     // 'integer' | 'number'
      min?: number         // 最小值
      max?: number         // 最大值
      step?: number        // 步长
      presets?: number[]   // 额外预设值（与步长生成的值合并）
      negative?: boolean   // 是否支持负数（默认 false）
    }
```

#### 全局默认配置

```typescript
export const globalDefaults = {
  min: 1,
  max: 100,
  step: 1,
}
```

所有单位类型共用一个全局默认配置，属性可以通过 `min/max/step` 覆盖。

#### 数值生成策略

1. **zero 类型** → 返回 `[0]`
2. **使用配置的 min/max/step**，未配置的使用全局默认值
3. **特殊情况**：`min=0, max=1` 时，默认 `step=0.1`（适用于 opacity 等）
4. **negative 支持**：如果 `negative=true`，遍历时同时 push 正负值
5. **presets 合并**：额外预设值与步长生成的值合并（去重并排序）

```typescript
// 示例：ratio 类型配置
const ratio: NumericType = { 
  unit: 'ratio', 
  value: 'number',
  presets: [33.33, 66.67]  // 常用的三等分值
}
// 生成: [1, 2, 3, ..., 33.33, ..., 66.67, ..., 100]

// 示例：支持负数的大像素值
const largePxNeg: NumericType = { 
  unit: 'px', 
  value: 'integer',
  max: 10000,
  negative: true
}
// 生成: [-10000, ..., -2, -1, 1, 2, ..., 10000]
```

### 属性配置 (property-numeric-config.ts)

定义 203 个数值属性的配置，使用抽象常量简化配置：

#### 基础 NumericType 常量

```typescript
/** 特殊值 0（无单位） */
const zero: NumericType = { unit: 'zero' }

/** 像素整数 */
const px: NumericType = { unit: 'px', value: 'integer' }

/** 比例/百分比，包含三等分预设值 */
const ratio: NumericType = { unit: 'ratio', value: 'number', presets: [33.33, 66.67] }

/** Grid 弹性单位 */
const fr: NumericType = { unit: 'fr', value: 'number' }

/** 角度 */
const deg: NumericType = { unit: 'deg', value: 'number' }

/** 时间（毫秒） */
const ms: NumericType = { unit: 'ms', value: 'integer' }

/** 无单位整数 */
const int: NumericType = { unit: 'unitless', value: 'integer' }

/** 无单位小数 */
const num: NumericType = { unit: 'unitless', value: 'number' }

/** 透明度 (0-1, step 0.1) */
const alpha: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1 }

/** 字重 (1-1000, step 100) */
const fontWeight: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 1000, step: 100 }

/** 大像素值 (max: 10000) - 用于 width、height、padding */
const heightWidthPx: NumericType = { unit: 'px', value: 'integer', max: 10000 }
```

#### 待添加的抽象常量（支持负数）

```typescript
/** 大像素值 + 支持负数 (用于 margin、定位) */
const largePxNeg: NumericType = { unit: 'px', value: 'integer', max: 10000, negative: true }

/** 支持负数的整数 (用于 z-index、order) */
const intNeg: NumericType = { unit

```typescript
export const propertyNumericTypes: Record<string, NumericType[]> = {
  // sizing - 使用 zero + px + ratio 组合
  'width': [zero, px, ratio],
  'height': [zero, px, ratio],
  
  // spacing
  'margin': [zero, px, ratio],
  'padding': [zero, px, ratio],
  
  // layout
  'z-index': [int],
  'flex-grow': [num],
  'grid-template-columns': [zero, px, ratio, fr],
  
  // opacity - 使用 alpha 常量（0-1 范围）
  'opacity': [alpha],
  'fill-opacity': [alpha],
  
  // typography - 使用 fontWeight 常量
  'font-weight': [fontWeight],
  
  // ... 共 203 个属性
}
```

#### 特殊配置说明

| 常量 | min | max | step | presets | 说明 |
|------|-----|-----|------|---------|------|
| `alpha` | 0 | 1 | 0.1（自动） | - | 透明度，min=0 且 max=1 时自动使用 step=0.1 |
| `fontWeight` | 1 | 1000 | 100 | - | 字重，来自 css-tree 规范 |
| `ratio` | 1 | 100 | 1 | [33.33, 66.67] | 百分比，包含三等分预设值 |

### 属性分类统计

| 分类 | 属性数量 | 示例 |
|------|---------|------|
| sizing | 6 | width, height, min-width, max-height |
| spacing | 12 | margin, padding, gap, column-gap |
| positioning | 4 | top, right, bottom, left |
| layout | 18 | z-index, order, flex-grow, grid-* |
| typography | 22 | font-size, line-height, letter-spacing |
| border | 26 | border-width, border-radius |
| background | 5 | background-position, background-size |
| opacity | 2 | opacity, fill-opacity |
| transform | 5 | rotate, scale, translate, perspective |
| animation | 11 | animation-delay, transition-duration |
| scroll | 28 | scroll-margin, scroll-padding |
| other | 64 | aspect-ratio, clip-path, stroke-width |

### 排除的属性

#### 颜色属性 (38 个)

由 cssts-theme-element 设计系统统一处理：

```
color, background-color, border-color, border-top-color, border-right-color,
border-bottom-color, border-left-color, border-block, border-block-end,
border-block-start, border-inline, border-inline-end, border-inline-start,
outline-color, text-decoration-color, text-emphasis-color, caret-color,
accent-color, column-rule-color, fill, stroke, scrollbar-color,
flood-color, lighting-color, stop-color, ...
```

#### 复杂类型属性 (13 个)

无法预生成原子类，需要运行时处理：

| 属性 | 类型 | 原因 |
|------|------|------|
| `background-image` | `<image>` | 需要 url() 或渐变函数 |
| `border-image-source` | `<image>` | 需要 url() |
| `filter` | `<filter-function>` | 需要 blur(), brightness() 等函数 |
| `backdrop-filter` | `<filter-function>` | 同上 |
| `transform` | `<transform-function>` | 需要 rotate(), scale() 等函数 |
| `box-shadow` | `<shadow>` | 复杂的阴影语法 |
| `clip` | `<shape>` | 需要 rect() 函数 |
| `content` | `<image>` | 需要字符串或 url() |
| `list-style-image` | `<image>` | 需要 url() |
| `mask-image` | `<image>` | 需要 url() 或渐变 |
| `mask-border-source` | `<image>` | 需要 url() |

### 数据提取脚本 (extract-numeric-types.ts)

从 css-tree 提取属性的数值类型信息：

```typescript
// 核心逻辑
function extractNumericTypes(property: string): ExtractResult {
  const syntax = lexer.getProperty(property)
  const numericTypes = new Set<string>()
  
  // 递归解析语法树
  function walk(node: SyntaxNode) {
    // 遇到停止类型则标记并返回
    if (STOP_TYPES.includes(node.name)) {
      if (node.name === '<color>') colorProperty = true
      if (COMPLEX_TYPES.includes(node.name)) complexOnly = true
      return
    }
    
    // 收集数值类型
    if (NUMERIC_TYPES.includes(node.name)) {
      numericTypes.add(node.name)
    }
    
    // 递归子节点
    node.children?.forEach(walk)
  }
  
  walk(syntax)
  return { numericTypes, colorProperty, complexOnly }
}
```

### 工具函数 (types.ts)

```typescript
// 判断是否支持小数
function supportsDecimal(valueType: ValueType): boolean {
  return valueType === 'number'
}

// 判断是否支持负数
function supportsNegative(numericType: NumericType): boolean {
  if (numericType.unit === 'zero') return false
  return numericType.min === undefined || numericType.min < 0
}

// 根据 min/max/step 生成数值序列
function generateStepValues(min: number, max: number, step: number): number[] {
  const values: number[] = []
  for (let v = min; v <= max; v += step) {
    values.push(Math.round(v * 1000) / 1000)  // 处理浮点精度
  }
  return values
}

// 生成数值预设（核心函数）
function generateValuePresets(numericType: NumericType): number[] {
  // zero 类型只返回 [0]
  if (numericType.unit === 'zero') return [0]
  
  // 使用配置值或全局默认值
  const min = numericType.min ?? globalDefaults.min
  const max = numericType.max ?? globalDefaults.max
  
  // 特殊情况：min=0, max=1 时使用 0.1，否则使用全局默认值
  const defaultStep = (min === 0 && max === 1) ? 0.1 : globalDefaults.step
  const step = numericType.step ?? defaultStep
  
  // 生成步长值
  const stepValues = generateStepValues(min, max, step)
  
  // 合并额外预设值（去重并排序）
  const presets = numericType.presets ?? []
  if (presets.length === 0) return stepValues
  
  const merged = [...new Set([...stepValues, ...presets])]
  return merged.sort((a, b) => a - b)
}
```

### 生成逻辑（待实现）

```typescript
// 对于每个属性：
function generateAtomicClasses(property: string) {
  const classes = []
  
  // 1. 生成关键字类（从 css-tree）
  const keywords = getKeywordsFromCssTree(property)
  for (const keyword of keywords) {
    classes.push({
      tsName: `${camelCase(property)}${pascalCase(keyword)}`,
      cssClass: `.${property}_${keyword}`,
      cssRule: `${property}: ${keyword};`
    })
  }
  
  // 2. 生成数值类（从配置表）
  const numericTypes = propertyNumericTypes[property]
  if (numericTypes) {
    for (const numericType of numericTypes) {
      const values = generateValues(numericType)
      for (const value of values) {
        classes.push({
          tsName: formatTsName(property, value, numericType.unit),
          cssClass: formatCssClass(property, value, numericType.unit),
          cssRule: `${property}: ${value}${getUnitSuffix(numericType.unit)};`
        })
      }
    }
  }
  
  return classes
}
```

---

## 设计阶段说明

本文档采用**分阶段讨论**的方式：

### 第一阶段（当前）- 最小设计

聚焦核心设计问题：
- ✅ 数据结构组织（类型系统设计）
- ✅ 命名规则（TS 标识符 + CSS 类名）
- ✅ css-tree 到我们类型的映射
- ✅ 配置文件设计

**配置文件**：
- `csstree-overrides.json` - 补充 css-tree 缺失的 min/max（CSS 规范）
- `property-numeric-config.json` - 属性到数值类型的映射配置（核心配置）
  - 定义每个属性支持的 NumericType 数组
  - 包含单位类型、数值类型、是否支持负数、步长范围
- `design-presets.json` - 设计系统配置（用户可配置，已废弃部分功能）
  - ~~`propertyUnits`~~ - 已迁移到 `property-numeric-config.json`
  - ~~`unitPresets`~~ - 已迁移到 `property-numeric-config.json`
  - `propertyPresets` - 特定属性的预设值（保留）

**暂不涉及**：
- ❌ 具体代码生成逻辑
- ❌ 响应式变体（sm/md/lg）
- ❌ 状态变体（hover/focus）
- ❌ 主题/颜色系统

### 第二阶段（后续）

- 属性筛选策略（白名单/黑名单）
- 简写属性 vs 方向属性
- 具体生成逻辑实现

### 第三阶段（未来）

- 响应式变体支持
- 状态变体支持
- 主题系统集成

---

## 已完成任务

### 1. [x] 修复属性名语法错误

**问题**: 当前生成的属性名包含小数点，如 `lineHeight1.25`，在 TypeScript 中不合法。

**解决**: 使用符号转换映射

---

### 2. [x] 确定数据源

**决定**: 使用 **css-tree** 作为唯一数据源（权威、完整）

---

### 3. [x] 完善 css-tree 关键字提取逻辑

**状态**: ✅ css-tree 的 lexer 已能正确递归解析所有语法引用

---

### 4. [x] 实现基础 Map 结构

**已实现**: `getCssPropertyValueMap()` 函数

---

### 5. [x] 完成基础生成器

**已完成**:

- [x] `generateCsstsAtomsDts()` - 生成 CsstsAtoms.d.ts
- [x] `generateGlobalDts()` - 生成 global.generated.d.ts
- [x] `generateAtomsJson()` - 生成 atoms.json

---

### 6. [x] 验证 css-tree 数据权威性

**测试结果**: 与 MDN 文档对比，css-tree 数据完整且权威

---

## 待办任务（设计决策）

### 7. [x] 确定属性到单位类型的映射来源

**问题**：我们如何知道 `padding` 支持 `px` 和 `ratio`，而 `opacity` 只支持 `none`？

#### css-tree 能提供的信息

| 信息类型 | 可获取 | 示例 |
|---------|--------|------|
| **关键字** | ✅ | `auto`, `flex`, `none` |
| **基础类型** | ✅ | `length`, `percentage`, `number`, `integer`, `angle`, `time` |
| **复合类型** | ✅ | `length-percentage`, `alpha-value`, `font-weight-absolute` |
| **数值范围** | ⚠️ 部分 | `font-weight: [1, 1000]`，但 `alpha-value` 无范围 |
| **是否支持负数** | ❌ | 需要手动配置 |

#### 决定：方案 C - 混合方案（优先使用 css-tree）

1. **从 css-tree 自动提取**：
   - 关键字列表
   - 基础类型映射（`length` → `px`, `percentage` → `ratio` 等）
   - `opts.min/max` 数值范围（如 `font-weight-absolute` 有 `min: 1, max: 1000`）

2. **手动配置补充**（仅补充 css-tree 缺失的）：
   - css-tree 未设置 `opts` 的类型（如 `alpha-value` 应该是 0-1）
   - 特殊属性的覆盖
   - 配置文件：`generator/property-overrides.json`

**css-tree 已有范围的类型**：
- `font-weight-absolute` → `min: 1, max: 1000` ✅

**css-tree 缺失范围的类型**（需要补充）：
- `alpha-value` → 应该是 `min: 0, max: 1`
- `length` → 无范围限制
- `percentage` → 无范围限制

#### 类型映射规则

```typescript
// css-tree 类型 → 我们的单位类型
const csstreeToUnit: Record<string, UnitType> = {
  'length': 'px',
  'percentage': 'ratio',
  'length-percentage': 'px',  // 同时生成 px 和 ratio
  'number': 'unitless',
  'integer': 'unitless',
  'angle': 'deg',
  'time': 'ms',
  'alpha-value': 'unitless',  // opacity 等
}

// 需要递归展开的复合类型
const expandableTypes = ['length-percentage', 'alpha-value', 'font-weight-absolute']
```

#### 配置文件

**1. csstree-overrides.json** - 补充 CSS 规范定义的 min/max
```json
{
  "typeOverrides": {
    "alpha-value": { "min": 0, "max": 1 }
  },
  "propertyOverrides": {
    "padding": { "min": 0 },
    "width": { "min": 0 }
  }
}
```

**2. property-numeric-config.json** - 属性到数值类型的映射（核心配置）

定义每个属性支持的 NumericType 数组：

```json
{
  "propertyNumericTypes": {
    "width": [
      { "unit": "px", "value": "integer" },
      { "unit": "ratio", "value": "number", "range": { "min": 0, "max": 100, "step": 5 } }
    ],
    "margin": [
      { "unit": "px", "value": "integer", "allowNegative": true }
    ],
    "opacity": [
      { "unit": "unitless", "value": "number", "range": { "min": 0, "max": 1, "step": 0.05 } }
    ],
    "font-weight": [
      { "unit": "unitless", "value": "integer", "range": { "min": 1, "max": 1000, "step": 100 } }
    ]
  }
}
```

**配置说明**：
- `unit`: 单位类型（px, rem, ratio, deg, ms, unitless）
- `value`: 数值类型（integer, number）
- `allowNegative`: 是否支持负数（默认 false）
- `range`: 固定步长配置（可选，无则使用渐进步长策略）
  - `min`: 最小值
  - `max`: 最大值
  - `step`: 步长

**生成逻辑**：
1. 从 `property-numeric-config.json` 获取属性的 NumericType 数组
2. 对于每个 NumericType：
   - 有 `range` → 使用固定步长 + 对齐补偿算法
   - 无 `range` → 使用渐进步长策略（551 个值）
3. 结合 `csstree-overrides` 的 min/max 过滤

---

### 8. [ ] 确定属性筛选策略

**问题**：css-tree 有 651 个属性，我们要为所有属性生成原子类吗？

#### 分析结果

- css-tree 总属性数：651
- 适合原子类的属性：约 100 个
- 不适合的原因：需要字符串值、复杂函数、动画名称等

#### 讨论中：方案 A - 白名单

使用白名单，按类别组织，共约 100 个属性：

```typescript
const atomicProperties = {
  // 布局 (19)
  layout: [
    'display', 'position', 'float', 'clear',
    'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
    'justify-content', 'align-items', 'align-content', 'align-self',
    'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
    'order', 'z-index',
  ],
  
  // 间距 (13)
  spacing: [
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'gap', 'row-gap', 'column-gap',
  ],
  
  // 尺寸 (6)
  sizing: [
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  ],
  
  // 定位 (5)
  positioning: [
    'top', 'right', 'bottom', 'left', 'inset',
  ],
  
  // 排版 (13)
  typography: [
    'font-size', 'font-weight', 'font-style', 'font-family',
    'line-height', 'letter-spacing', 'word-spacing',
    'text-align', 'text-decoration', 'text-transform',
    'white-space', 'word-break', 'overflow-wrap',
  ],
  
  // 颜色 (5) - 由设计系统处理，但需要生成类型
  colors: [
    'color', 'background-color', 'border-color',
    'outline-color', 'text-decoration-color',
  ],
  
  // 边框 (16)
  borders: [
    'border', 'border-width', 'border-style', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-left-radius', 'border-top-right-radius', 
    'border-bottom-left-radius', 'border-bottom-right-radius',
  ],
  
  // 效果 (14)
  effects: [
    'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
    'box-shadow', 'text-shadow',
    'transform', 'rotate', 'scale', 'translate',
    'transition', 'transition-duration', 'transition-timing-function',
  ],
  
  // 交互 (4)
  interaction: [
    'cursor', 'pointer-events', 'user-select', 'resize',
  ],
  
  // 背景 (6)
  background: [
    'background', 'background-image', 'background-size', 'background-position',
    'background-repeat', 'background-attachment',
  ],
}
```

#### 不生成原子类的属性（黑名单示例）

| 属性 | 原因 |
|------|------|
| `content` | 需要字符串值 |
| `counter-reset/increment` | 计数器相关 |
| `quotes` | 需要字符串对 |
| `animation-name` | 需要 @keyframes 名称 |
| `grid-template-areas` | 复杂字符串模板 |
| `clip-path` | 复杂路径函数 |
| `filter` | 复杂滤镜函数 |
| `mask` | 复杂遮罩 |

**待决定**：是否采用白名单方案？属性列表是否需要调整？

---

### 9. [ ] 确定简写属性 vs 方向属性策略

**问题**：`padding` 和 `padding-top` 都生成吗？

#### 讨论中：方案 A - 都生成

**理由**：
1. 简写属性用于统一设置：`padding16px` = 四边都是 16px
2. 方向属性用于精确控制：`paddingTop16px` = 只设置上边距
3. 两者使用场景不同，都有价值

**生成规则**：
- 简写属性只生成单值版本（不生成 `padding: 10px 20px` 这种多值）
- 方向属性正常生成

**示例**：
```typescript
// 简写属性（单值，四边相同）
padding16px     // padding: 16px
margin8px       // margin: 8px
borderRadius4px // border-radius: 4px

// 方向属性（精确控制）
paddingTop16px  // padding-top: 16px
marginLeft8px   // margin-left: 8px
borderTopLeftRadius4px // border-top-left-radius: 4px
```

**相关属性组**：

| 简写属性 | 方向属性 |
|---------|---------|
| `margin` | `margin-top`, `margin-right`, `margin-bottom`, `margin-left` |
| `padding` | `padding-top`, `padding-right`, `padding-bottom`, `padding-left` |
| `border-radius` | `border-top-left-radius`, `border-top-right-radius`, `border-bottom-left-radius`, `border-bottom-right-radius` |
| `inset` | `top`, `right`, `bottom`, `left` |
| `gap` | `row-gap`, `column-gap` |

**待决定**：是否采用此方案？

---

### 10. [x] 确定属性别名/简写策略

**问题**：是否需要更短的原子类名？

#### 决定：只用完整名称，不支持简写

**理由**：
1. **清晰无歧义**：`paddingTop16px` 比 `pt16px` 更易读
2. **IDE 友好**：完整名称有更好的自动补全体验
3. **降低复杂度**：保持简单
4. **后续可扩展**：如果需要，可以后续添加别名支持

**示例**：
```typescript
// 只支持完整名称
paddingTop16px    // ✅
marginBottom8px   // ✅
backgroundColor   // ✅

// 不支持简写
pt16px            // ❌
mb8px             // ❌
```

---

### 11. [x] 确定响应式变体策略（第三阶段）

**问题**：是否需要支持响应式前缀？

#### 决定：MVP 阶段不支持，后续再考虑

**理由**：
1. **类型爆炸**：每个属性 × 5 个断点 = 5 倍的类型定义
2. **复杂度高**：需要生成对应的媒体查询 CSS
3. **替代方案存在**：可以用 CSS 媒体查询或 JS 处理

> ⏳ 此功能推迟到第三阶段讨论

---

### 12. [x] 确定状态变体策略（第三阶段）

**问题**：hover、focus 等状态如何处理？

#### 决定：MVP 阶段不支持，状态由其他模块处理

**理由**：
1. 原子类聚焦于静态样式
2. 状态变体可由 cssts 运行时或其他模块处理

> ⏳ 此功能推迟到第三阶段讨论

**选项**：

| 方案 | 描述 |
|------|------|
| **A. 不在此生成器处理** | 状态由 cssts 运行时或其他模块处理 |
| **B. 预生成常用状态** | 生成 hover/focus/active/disabled 变体 |
| **C. 只为特定属性生成** | 只为颜色、背景等属性生成状态变体 |

**常用状态**：
- `hover` - 鼠标悬停
- `focus` - 获得焦点
- `active` - 激活状态
- `disabled` - 禁用状态
- `focus-visible` - 键盘焦点
- `first-child`, `last-child` - 位置伪类

**待决定**：选择哪个方案？

---

## 待办任务（实现）


### 13. [ ] 实现新的类型系统（单位类型 + 数值类型分离）

**目标**: 将单位类型和数值类型分开定义，更清晰地描述 CSS 值的特性

#### 13.1 单位类型 (UnitType)

定义有哪些单位，以及每种单位类型包含的具体单位：

```typescript
type UnitType = 'zero' | 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'unitless'

const unitToSuffixes: Record<UnitType, string[]> = {
  'zero': [''],                              // 零值（特殊单位，只生成 0）
  'px': ['px'],                              // 像素（绝对单位）
  'rem': ['rem', 'em'],                      // 相对单位（字体相关）
  'ratio': ['%', 'vh', 'vw', 'vmin', 'vmax'], // 比例单位（合并百分比和视口单位）
  'deg': ['deg', 'rad', 'turn'],             // 角度
  'ms': ['ms', 's'],                         // 时间
  'unitless': [''],                          // 无单位（空字符串）
}
```

**设计说明**：
- `zero`: **特殊单位类型**，只生成值 `0`，不需要单位后缀（CSS 规范：`padding: 0` 不需要单位）
- `px`: 像素值，最常用的绝对单位，数值从 1 开始（0 由 `zero` 处理）
- `rem`: 字体相对单位，`em` 也归入此类
- `ratio`: 合并 `%`、`vh`、`vw` 等，因为它们的数值预设相同（0-100 范围）
- `deg`: 角度单位
- `ms`: 时间单位
- `unitless`: 无单位数字（如 `opacity`、`z-index`、`line-height`），后缀为空字符串

**`zero` 单位类型说明**：
- `zero` 是一个独立的单位类型，与 `px`、`rem` 等平级
- 只生成一个值：`0`
- 生成的类名：`padding0`、`margin0`、`width0`（不带单位后缀）
- 使用场景：需要 `0` 值的属性在预设模板中组合 `[zero, pxInt]`

**概念区分**：
- `none` 是 CSS 关键字（如 `display: none`），从 css-tree keywords 获取
- `zero` 是我们的单位类型，表示数值 `0`（如 `padding: 0`）
- `unitless` 是我们的单位类型，表示非零数值不带单位（如 `opacity: 0.5`）

#### 13.2 数值类型 (ValueType)

定义数值的特性（整数/小数）：

```typescript
type ValueType = 'integer' | 'number'

// integer: 整数，如 z-index, order, font-weight
// number: 小数，如 opacity, line-height
```

#### 13.3 组合类型 (NumericType)

组合单位类型和数值类型：

```typescript
// 固定步长配置（必须同时指定 min, max, step）
interface FixedStepConfig {
  min: number    // 最小值
  max: number    // 最大值
  step: number   // 固定步长
}

interface NumericType {
  unit: UnitType           // 单位类型
  value: ValueType         // 数值类型（integer/number）
  allowNegative?: boolean  // 是否支持负数（默认 false）
  range?: FixedStepConfig  // 固定步长配置（可选）
}

interface PropertyDefinition {
  keywords: string[]       // 关键字值（来自 css-tree）
  numeric?: NumericType[]  // 数值类型数组
}
```

**生成策略说明**：

1. **`zero` 单位**：只生成值 `0`，不需要 range 配置
2. **默认策略**：如果没有指定 `range`，使用**渐进步长策略**（见 13.5），从 1 开始
3. **固定步长**：如果指定了 `range`，必须同时提供 `min`、`max`、`step` 三个属性
   - 生成逻辑：从 `min` 开始，每次加 `step`，直到 `max`

```typescript
// 示例：zero 单位（只生成 0）
{ unit: 'zero', value: 'integer' }  // → 生成 [0]

// 示例：使用默认渐进步长策略（从 1 开始）
{ unit: 'px', value: 'integer' }  // → 使用 generateProgressiveValues()，从 1 开始

// 示例：使用固定步长
{ unit: 'unitless', value: 'integer', range: { min: 100, max: 900, step: 100 } }
// → 生成 [100, 200, 300, 400, 500, 600, 700, 800, 900]
```

#### 13.4 属性示例

| 属性 | NumericType 数组 | 生成结果 |
|------|-----------------|---------|
| `padding` | `[zero, pxInt]` | `0`, `1px`, `2px`, ..., `10000px` |
| `margin` | `[zero, pxIntNeg]` | `0`, `1px`, `-1px`, ..., `10000px`, `-10000px` |
| `width` | `[zero, pxInt, ratio100]` | `0`, `1px`, ..., `5%`, `10%`, ..., `100%` |
| `opacity` | `[unitlessOpacity]` | `0`, `0.05`, `0.1`, ..., `1` |
| `z-index` | `[unitlessZIndex]` | `-10`, `-9`, ..., `0`, `1`, ..., `9999` |
| `font-weight` | `[unitlessFontWeight]` | `100`, `200`, ..., `1000` |

**预设模板示例**：

```javascript
// 基础 NumericType 对象
const zero = { unit: 'zero', value: 'integer' }  // 只生成 0
const pxInt = { unit: 'px', value: 'integer' }   // 1-10000，渐进步长
const pxIntNeg = { ...pxInt, allowNegative: true }

// 预设模板（NumericType 数组）
const spacing = [zero, pxInt]           // padding 系列
const spacingNegative = [zero, pxIntNeg] // margin 系列
const sizing = [zero, pxInt, ratio100]   // width/height 系列
```

**生成示例**：

```typescript
// padding 使用 spacing 预设
// → padding0, padding1px, padding2px, ..., padding10000px

// margin 使用 spacingNegative 预设
// → margin0, margin1px, marginN1px, ..., margin10000px, marginN10000px

// width 使用 sizing 预设
// → width0, width1px, ..., width5pct, width10pct, ..., width100pct
```

#### 13.5 数值生成策略

##### 统一步长策略

所有数值类型都使用 **min/max/step** 三个参数生成数值序列：

```typescript
/**
 * 根据 min/max/step 生成数值序列
 */
function generateStepValues(min: number, max: number, step: number): number[] {
  const values: number[] = []
  for (let v = min; v <= max; v += step) {
    values.push(Math.round(v * 1000) / 1000)  // 处理浮点精度
  }
  return values
}
```

##### 全局默认配置

所有单位类型共用一个全局默认配置，属性可以覆盖：

```typescript
/**
 * 全局默认配置
 */
export const globalDefaults = {
  min: 1,
  max: 100,
  step: 1,
}
```

##### 生成逻辑

```typescript
function generateValuePresets(numericType: NumericType): number[] {
  // zero 类型只返回 [0]
  if (numericType.unit === 'zero') return [0]
  
  // 使用配置值或全局默认值
  const min = numericType.min ?? globalDefaults.min
  const max = numericType.max ?? globalDefaults.max
  const step = numericType.step ?? globalDefaults.step
  
  return generateStepValues(min, max, step)
}
```

##### 配置示例

```typescript
// 使用默认配置（px: 1-100, step 1）
{ unit: 'px', value: 'integer' }
// → [1, 2, 3, ..., 100]

// 覆盖 max
{ unit: 'px', value: 'integer', max: 50 }
// → [1, 2, 3, ..., 50]

// 完全自定义
{ unit: 'px', value: 'integer', min: 100, max: 1000, step: 100 }
// → [100, 200, 300, ..., 1000]

// zero 类型
{ unit: 'zero' }
// → [0]
```

##### 数量统计（全局默认配置）

使用全局默认配置 `{ min: 1, max: 100, step: 1 }` 时：

| 单位类型 | 数量 | 说明 |
|---------|------|------|
| `zero` | 1 | 只有 0 |
| 其他 | 100 | 1, 2, 3, ..., 100 |

属性可以通过配置 `min/max/step` 覆盖默认值。

**子任务**:

- [ ] 13.1 定义 `UnitType` 类型和 `unitToSuffixes` 映射
- [ ] 13.2 定义 `ValueType` 类型
- [ ] 13.3 定义 `NumericType` 和 `PropertyDefinition` 接口
- [ ] 13.4 定义 `valuePresets` 数值预设
- [ ] 13.5 定义 `noneValuePresets` 无单位属性预设
- [ ] 13.6 实现 `isInteger(valueType)` 判断是否支持小数
- [ ] 13.7 实现 `allowsNegative(numericType)` 判断是否支持负数

---

### 14. [ ] 实现 css-tree 类型到我们类型的映射

**目标**: 将 css-tree 的类型转换为我们的 `UnitType` 和 `ValueType`

```typescript
// css-tree 类型 → 我们的单位类型
const csstreeToUnit: Record<string, UnitType> = {
  'length': 'px',           // 默认用 px
  'percentage': 'ratio',    // 归入 ratio
  'angle': 'deg',
  'time': 'ms',
  'number': 'unitless',
  'integer': 'unitless',
}

// css-tree 类型 → 我们的数值类型
const csstreeToValue: Record<string, ValueType> = {
  'integer': 'integer',
  'number': 'number',
  'length': 'number',       // 长度支持小数（如 1.5px）
  'percentage': 'number',   // 百分比支持小数
  'angle': 'number',
  'time': 'number',
}
```

**子任务**:

- [ ] 14.1 定义 `csstreeToUnit` 映射
- [ ] 14.2 定义 `csstreeToValue` 映射
- [ ] 14.3 修改 `extractFromSyntax()` 提取完整的类型信息（包括 min/max）
- [ ] 14.4 更新 `getPropertyDefinition()` 返回新结构

---

### 15. [ ] 实现符号转换映射

**目标**: 将特殊符号转换为合法标识符（TS）或转义（CSS）

```typescript
// Map 1: TS 标识符转换（符号 → 别名）
const symbolToAlias: Record<string, string> = {
  '.': 'p',      // point (小数点)
  '%': 'pct',    // percent (百分号)
  '/': 's',      // slash (斜杠)
  '-': 'n',      // negative (负号，仅值开头时转换)
}

// Map 2: CSS 类名转义（符号 → 转义后）
const symbolToEscape: Record<string, string> = {
  '.': '\\.',    // 小数点需要转义
  '%': '\\%',    // 百分号需要转义
  '/': '\\/',    // 斜杠需要转义
  // '-' 不需要转义，CSS 类名中可以直接用
}
```

**子任务**:

- [ ] 15.1 定义 `symbolToAlias` 映射（用于 TS 标识符）
- [ ] 15.2 定义 `symbolToEscape` 映射（用于 CSS 类名）
- [ ] 15.3 更新 `formatForTsIdentifier()` 使用 `symbolToAlias`
- [ ] 15.4 更新 `formatForClassName()` 使用 `symbolToEscape`
- [ ] 15.5 更新 `generateAtomName()` 使用新函数
- [ ] 15.6 更新 `generateClassName()` 使用新函数

---

### 16. [ ] 更新原子类生成逻辑

**目标**: 基于新数据结构生成原子类

**子任务**:

- [ ] 16.1 生成关键字原子类（来自 `keywords`）
- [ ] 16.2 生成数值原子类（来自 `numeric`，结合 `typeToUnits`）
- [ ] 16.3 处理特殊符号转换

---

### 17. [ ] 验证生成结果

**测试用例**:

| 单位类型 | TS 变量名 | CSS 类名（选择器） | CSS 规则 |
|---------|-----------|-------------------|----------|
| `zero` | `padding0` | `.padding_0` | `padding: 0;` |
| `zero` | `margin0` | `.margin_0` | `margin: 0;` |
| `zero` | `width0` | `.width_0` | `width: 0;` |
| `px` | `padding16px` | `.padding_16px` | `padding: 16px;` |
| `px` | `marginN100px` | `.margin_-100px` | `margin: -100px;` |
| `rem` | `fontSize1p5rem` | `.font-size_1\.5rem` | `font-size: 1.5rem;` |
| `ratio` | `width50pct` | `.width_50\%` | `width: 50%;` |
| `ratio` | `height100vh` | `.height_100vh` | `height: 100vh;` |
| `ratio` | `width33p33vw` | `.width_33\.33vw` | `width: 33.33vw;` |
| `unitless` | `opacity0p25` | `.opacity_0\.25` | `opacity: 0.25;` |
| `unitless` | `zIndexN1` | `.z-index_-1` | `z-index: -1;` |
| `unitless` | `lineHeight1p5` | `.line-height_1\.5` | `line-height: 1.5;` |
| `unitless` | `fontWeight700` | `.font-weight_700` | `font-weight: 700;` |
| `deg` | `rotate45deg` | `.rotate_45deg` | `rotate: 45deg;` |
| `deg` | `rotateN90deg` | `.rotate_-90deg` | `rotate: -90deg;` |
| `ms` | `transitionDuration300ms` | `.transition-duration_300ms` | `transition-duration: 300ms;` |
| 关键字 | `displayFlex` | `.display_flex` | `display: flex;` |
| 关键字 | `positionRelative` | `.position_relative` | `position: relative;` |

---

## 命名规则总结

| 场景       | TS 标识符        | CSS 类名                  |
| ---------- | ---------------- | ------------------------- |
| 属性-值    | camelCase        | `_` 下划线分隔            |
| 值内部     | PascalCase       | `-` 连字符                |
| 零值 `0`   | `属性0`          | `.属性_0`                 |
| 小数点 `.` | `p` (point)      | `\.` (转义)               |
| 百分号 `%` | `pct` (percent)  | `\%` (转义)               |
| 斜杠 `/`   | `s` (slash)      | `\/` (转义)               |
| 负数 `-`   | `n` (negative)   | 保持原样                  |

---

## 数据结构示例

```typescript
const cssPropertyMap = {
  // 纯关键字
  display: {
    keywords: ['flex', 'block', 'inline', 'grid', 'none'],
  },

  // 关键字 + 无单位整数（固定步长，CSS 规范 1-1000，对齐后 100-1000）
  'font-weight': {
    keywords: ['normal', 'bold', 'bolder', 'lighter'],
    numeric: [
      { unit: 'unitless', value: 'integer', range: { min: 1, max: 1000, step: 100 } }
      // 对齐补偿：alignedMin = ceil(1/100)*100 = 100, alignedMax = floor(1000/100)*100 = 1000
      // 生成: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    ],
  },

  // 无单位整数，支持负数（固定步长）
  'z-index': {
    keywords: ['auto'],
    numeric: [
      { unit: 'unitless', value: 'integer', allowNegative: true, range: { min: -10, max: 9999, step: 10 } }
    ],
  },

  // 无单位小数（固定步长）
  opacity: {
    keywords: [],
    numeric: [
      { unit: 'unitless', value: 'number', range: { min: 0, max: 1, step: 0.25 } }
    ],
  },

  // 像素 + 比例单位，不支持负数（渐进步长）
  width: {
    keywords: ['auto', 'min-content', 'max-content', 'fit-content'],
    numeric: [
      { unit: 'px', value: 'integer' },  // 渐进步长策略
      { unit: 'ratio', value: 'number', range: { min: 0, max: 100, step: 25 } }
    ],
  },

  // 像素 + 比例单位，支持负数（渐进步长）
  margin: {
    keywords: ['auto'],
    numeric: [
      { unit: 'px', value: 'integer', allowNegative: true },  // 渐进步长策略
      { unit: 'ratio', value: 'number', allowNegative: true }
    ],
  },

  // 无单位小数（固定步长）
  'line-height': {
    keywords: ['normal'],
    numeric: [
      { unit: 'unitless', value: 'number', range: { min: 1, max: 2, step: 0.25 } }
    ],
  },

  // rem 单位（渐进步长）
  'font-size': {
    keywords: ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
    numeric: [
      { unit: 'px', value: 'integer' },  // 渐进步长策略
      { unit: 'rem', value: 'number' }   // 渐进步长策略
    ],
  },

  // 角度单位（固定步长）
  'rotate': {
    keywords: ['none'],
    numeric: [
      { unit: 'deg', value: 'number', allowNegative: true, range: { min: 0, max: 360, step: 45 } }
    ],
  },

  // 时间单位（固定步长）
  'transition-duration': {
    keywords: [],
    numeric: [
      { unit: 'ms', value: 'number', range: { min: 0, max: 1000, step: 100 } }
    ],
  },
}
```

**判断规则**：
```typescript
// 是否支持小数
const supportsDecimal = (valueType: ValueType) => valueType !== 'integer'

// 是否支持负数
const supportsNegative = (numericType: NumericType) => 
  numericType.allowNegative === true

// 获取单位后缀列表
const getUnitSuffixes = (unitType: UnitType) => unitToSuffixes[unitType]

/**
 * 固定步长生成算法（带对齐补偿）
 * 
 * 当 min 不是 step 的整数倍时，向上对齐到 step 的整数倍
 * 当 max 不是 step 的整数倍时，向下对齐到 step 的整数倍
 * 
 * 示例：
 * - min=1, max=1000, step=100 → [100, 200, 300, ..., 1000]
 * - min=0, max=360, step=45 → [0, 45, 90, ..., 360]
 */
function generateFixedStepValues(min: number, max: number, step: number): number[] {
  const values: number[] = []
  
  // 将 min 向上对齐到 step 的整数倍
  const alignedMin = Math.ceil(min / step) * step
  
  // 将 max 向下对齐到 step 的整数倍
  const alignedMax = Math.floor(max / step) * step
  
  for (let i = alignedMin; i <= alignedMax; i += step) {
    // 处理浮点数精度问题
    values.push(Math.round(i * 1000) / 1000)
  }
  
  return values
}

// 获取数值预设
const getValuePresets = (numericType: NumericType, property?: string) => {
  // 如果有固定步长配置，使用固定步长生成（带对齐补偿）
  if (numericType.range) {
    const { min, max, step } = numericType.range
    const values: number[] = []
    for (let i = min; i <= max; i += step) {
      values.push(i)
    }
    return values
  }
  
  // 否则使用渐进步长策略
  return generateProgressiveValues()
}
```

---

## 设计限制（与 css-tree 对比）

当前 `PropertyDefinition` 结构是 css-tree 语法树的**简化版本**，专为原子类生成优化。以下是有意不支持的特性：

### 不支持的特性

| 特性 | css-tree 原始结构 | 我们的处理 | 原因 |
|------|------------------|-----------|------|
| **精确数值范围** | `Range { min: 1, max: 1000 }` | 使用预设值 | 原子类不需要连续范围，只需离散值 |
| **值组合关系** | `combinator: '\|' \| '\|\|' \| '&&'` | 扁平化为数组 | 原子类是单值的，不需要组合 |
| **重复次数** | `Multiplier { min, max }` | 不支持 | 原子类不支持多值（如 `padding: 10px 20px`） |
| **CSS 函数** | `Function { name: 'calc' }` | 不支持 | 函数值无法预生成，需运行时处理 |
| **颜色值** | `<color>` 类型 | 由设计系统处理 | 颜色由 cssts-theme-element 管理 |

### 设计决策说明

1. **精确数值范围**
   - css-tree: `font-weight` 定义为 `<number [1,1000]>`
   - 我们: 使用 `numericPresets` 预设常用值 `[100, 200, ..., 900]`
   - 原因: 原子类不需要 1-1000 的所有值，只需设计系统定义的离散值

2. **值组合关系**
   - css-tree: `display = <display-outside> || <display-inside>` 表示可组合
   - 我们: 提取所有关键字到扁平数组
   - 原因: 原子类是单值的，`displayFlex` 而非 `displayBlockFlex`

3. **多值属性**
   - css-tree: `padding` 可以有 1-4 个值
   - 我们: 只支持单值原子类
   - 原因: 多值组合应使用多个原子类或自定义样式

4. **CSS 函数**
   - css-tree: 支持 `calc()`, `var()`, `rgb()` 等
   - 我们: 不支持
   - 原因: 函数值是动态的，无法预生成原子类

5. **颜色值**
   - css-tree: 支持 `<color>` 类型
   - 我们: 不在此生成器处理
   - 原因: 颜色由 cssts-theme-element 设计系统统一管理

### 适用场景与替代方案

| 场景 | 支持 | 替代方案 |
|------|------|---------|
| 关键字原子类 | ✅ | `displayFlex`, `positionRelative` |
| 预设数值原子类 | ✅ | `padding16`, `fontSize14` |
| 百分比原子类 | ✅ | `width50pct`, `heightFull` |
| 多值简写 | ❌ | ✅ 拆分为多个方向原子类 |
| 颜色值 | ❌ | ✅ 由 cssts-theme-element 提供 |
| CSS 函数 | ❌ | ⚠️ 需自定义 CSS |
| CSS 变量 | ❌ | ⚠️ 需自定义 CSS |

### 替代方案示例

**多值简写 → 拆分为方向原子类**
```typescript
// 原始 CSS
padding: 10px 20px 30px 40px;

// 原子类组合
paddingTop10, paddingRight20, paddingBottom30, paddingLeft40
```

**颜色值 → 设计系统原子类**
```typescript
// 原始 CSS
color: #ff0000;

// 设计系统原子类（由 cssts-theme-element 提供）
colorRed500, bgPrimary, textSecondary
```

**CSS 函数/变量 → 自定义样式**
```typescript
// 无法用原子类实现，需要自定义 CSS
css { width: calc(100% - 20px); }
css { color: var(--brand-color); }
```

### 原子类的固有限制

这是使用原子类方法论必须接受的限制：
- 原子类是**预生成的离散值**，无法覆盖所有可能的 CSS 值
- 动态计算（`calc()`）和运行时变量（`var()`）超出原子类的能力范围
- 对于这些场景，用户需要使用自定义 CSS 或内联样式

---

## 进度

- 创建时间: 2025-12-12
- 最后更新: 2025-12-12
- 状态: ✅ 第一阶段设计完成

### 已完成

1. ✅ 类型系统设计（UnitType, ValueType, NumericType）
2. ✅ 属性数值配置（203 个属性）
3. ✅ 颜色属性自动检测（38 个）
4. ✅ 复杂类型属性自动检测（13 个）
5. ✅ css-tree 数据提取脚本
6. ✅ 工具函数（supportsNegative, generateValuePresets）

### 下一步

1. 从 css-tree 提取所有属性的 keywords
2. 合并 keywords + numeric 配置
3. 实现生成器核心逻辑