# CssTs 原子类生成器任务清单

## 目标

完善基于 css-tree 的原子类生成器，生成正确的类型定义文件。

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

#### 13.5 数值预设配置

##### 渐进步长策略（Progressive Step Strategy）

对于 `px` 等需要大范围数值的单位，使用渐进步长策略：小数值密集，大数值稀疏。

**注意**：渐进步长策略从 **1** 开始，**不包含 0**。`0` 由独立的 `zero` 单位类型处理。

```typescript
/**
 * 生成渐进步长的数值序列（从 1 开始，不含 0）
 * 
 * 策略：
 * - 1-200: 步长 1（200 个）
 * - 200-500: 步长 2（150 个）
 * - 500-1000: 步长 5（100 个）
 * - 1000-2000: 步长 50（20 个）
 * - 2000-5000: 步长 100（30 个）
 * - 5000-10000: 步长 100（50 个）
 * 
 * 总计：约 550 个值（不含 0）
 */
function generateProgressiveValues(max: number = 10000): number[] {
  const values: number[] = []  // 不包含 0，0 由 zero 单位处理
  
  // 1-200: 步长 1
  for (let i = 1; i <= Math.min(200, max); i += 1) {
    values.push(i)
  }
  
  // 200-500: 步长 2
  for (let i = 202; i <= Math.min(500, max); i += 2) {
    values.push(i)
  }
  
  // 500-1000: 步长 5
  for (let i = 505; i <= Math.min(1000, max); i += 5) {
    values.push(i)
  }
  
  // 1000-2000: 步长 50
  for (let i = 1050; i <= Math.min(2000, max); i += 50) {
    values.push(i)
  }
  
  // 2000-5000: 步长 100
  for (let i = 2100; i <= Math.min(5000, max); i += 100) {
    values.push(i)
  }
  
  // 5000-10000: 步长 100
  for (let i = 5100; i <= Math.min(10000, max); i += 100) {
    values.push(i)
  }
  
  return values
}
```

**数量统计**：

| 范围 | 步长 | 数量 |
|------|------|------|
| 0 | - | 1 个 |
| 1-200 | 1 | 200 个 |
| 200-500 | 2 | 150 个 |
| 500-1000 | 5 | 100 个 |
| 1000-2000 | 50 | 20 个 |
| 2000-5000 | 100 | 30 个 |
| 5000-10000 | 100 | 50 个 |
| **总计** | | **551 个** |

##### 单位预设配置

```typescript
const valuePresets: Record<UnitType, number[] | 'progressive'> = {
  'px': 'progressive',  // 使用渐进步长策略，生成 551 个值
  'rem': [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
  'ratio': [0, 25, 33.33, 50, 66.67, 75, 100],
  'deg': [0, 45, 90, 180, 270, 360],
  'ms': [0, 100, 150, 200, 300, 500, 1000],
  'unitless': [], // 由属性单独配置（见 unitlessValuePresets）
}

// 无单位属性的特殊预设
const unitlessValuePresets: Record<string, number[]> = {
  'opacity': [0, 0.25, 0.5, 0.75, 1],
  'z-index': [-1, 0, 10, 20, 30, 40, 50, 100, 999, 9999],
  'line-height': [1, 1.25, 1.5, 1.75, 2],
  'font-weight': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'flex-grow': [0, 1],
  'flex-shrink': [0, 1],
  'order': [-1, 0, 1, 2, 3, 4, 5],
}
```

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
- 状态: 🔄 重构中