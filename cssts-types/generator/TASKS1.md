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
  'number': 'none',
  'integer': 'none',
  'angle': 'deg',
  'time': 'ms',
  'alpha-value': 'none',      // opacity 等
}

// 需要递归展开的复合类型
const expandableTypes = ['length-percentage', 'alpha-value', 'font-weight-absolute']
```

#### 手动覆盖配置

```typescript
const propertyOverrides: Record<string, Partial<PropertyDefinition>> = {
  // 补充负数支持信息
  'padding': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'margin': { numeric: [{ unit: 'px', value: 'integer' }] },  // 无 min = 支持负数
  
  // 补充数值范围
  'opacity': { numeric: [{ unit: 'none', value: 'number', min: 0, max: 1 }] },
  'z-index': { numeric: [{ unit: 'none', value: 'integer' }] },  // 支持负数
  
  // 特殊处理
  'line-height': { numeric: [{ unit: 'none', value: 'number', min: 0 }] },
}
```

**待决定**：是否采用此方案？

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
type UnitType = 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'none'

const unitToSuffixes: Record<UnitType, string[]> = {
  'px': ['px'],                              // 像素（绝对单位）
  'rem': ['rem', 'em'],                      // 相对单位（字体相关）
  'ratio': ['%', 'vh', 'vw', 'vmin', 'vmax'], // 比例单位（合并百分比和视口单位）
  'deg': ['deg', 'rad', 'turn'],             // 角度
  'ms': ['ms', 's'],                         // 时间
  'none': [],                                // 无单位
}
```

**设计说明**：
- `px`: 像素值，最常用的绝对单位
- `rem`: 字体相对单位，`em` 也归入此类
- `ratio`: 合并 `%`、`vh`、`vw` 等，因为它们的数值预设相同（0-100 范围）
- `deg`: 角度单位
- `ms`: 时间单位
- `none`: 无单位数字（如 `opacity`、`z-index`、`line-height`）

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
interface NumericType {
  unit: UnitType      // 单位类型
  value: ValueType    // 数值类型（integer/number）
  min?: number        // 最小值（undefined = 支持负数）
  max?: number        // 最大值
  step?: number       // 步长（用于自动生成预设值）
}

interface PropertyDefinition {
  keywords: string[]       // 关键字值（来自 css-tree）
  numeric?: NumericType[]  // 数值类型数组
}
```

**step 属性说明**：
- 当同时存在 `min`、`max`、`step` 时，自动生成预设值
- 生成逻辑：从 `min` 开始，每次加 `step`，直到 `max`
- 如果没有 `step`，则使用默认预设列表

#### 13.4 属性示例

| 属性 | unit | value | min | max | step | 说明 |
|------|------|-------|-----|-----|------|------|
| `padding` | `px` | `integer` | 0 | - | - | 像素整数，不支持负数，使用默认预设 |
| `margin` | `px` | `integer` | - | - | - | 像素整数，支持负数，使用默认预设 |
| `width` | `ratio` | `number` | 0 | 100 | 25 | 比例，生成 `[0, 25, 50, 75, 100]` |
| `opacity` | `none` | `number` | 0 | 1 | 0.25 | 无单位小数，生成 `[0, 0.25, 0.5, 0.75, 1]` |
| `z-index` | `none` | `integer` | 0 | 50 | 10 | 无单位整数，生成 `[0, 10, 20, 30, 40, 50]` |
| `line-height` | `none` | `number` | 1 | 2 | 0.25 | 无单位小数，生成 `[1, 1.25, 1.5, 1.75, 2]` |
| `font-weight` | `none` | `integer` | 100 | 900 | 100 | 无单位整数，生成 `[100, 200, ..., 900]` |
| `rotate` | `deg` | `number` | 0 | 360 | 45 | 角度，生成 `[0, 45, 90, ..., 360]` |
| `transition-duration` | `ms` | `number` | 0 | 1000 | 100 | 时间，生成 `[0, 100, 200, ..., 1000]` |

**step 生成示例**：

```typescript
// font-weight: min=100, max=900, step=100
// 生成: [100, 200, 300, 400, 500, 600, 700, 800, 900]

// opacity: min=0, max=1, step=0.25
// 生成: [0, 0.25, 0.5, 0.75, 1]

// z-index: min=0, max=50, step=10
// 生成: [0, 10, 20, 30, 40, 50]
```

#### 13.5 数值预设配置

每种单位类型有独立的数值预设：

```typescript
const valuePresets: Record<UnitType, number[]> = {
  'px': [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80, 100, 120],
  'rem': [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
  'ratio': [0, 25, 33.33, 50, 66.67, 75, 100],
  'deg': [0, 45, 90, 180, 270, 360],
  'ms': [0, 100, 150, 200, 300, 500, 1000],
  'none': [], // 由属性单独配置
}

// 无单位属性的特殊预设
const noneValuePresets: Record<string, number[]> = {
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
  'number': 'none',
  'integer': 'none',
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
| `px` | `padding16px` | `.padding_16px` | `padding: 16px;` |
| `px` | `marginN100px` | `.margin_-100px` | `margin: -100px;` |
| `rem` | `fontSize1p5rem` | `.font-size_1\.5rem` | `font-size: 1.5rem;` |
| `ratio` | `width50pct` | `.width_50\%` | `width: 50%;` |
| `ratio` | `height100vh` | `.height_100vh` | `height: 100vh;` |
| `ratio` | `width33p33vw` | `.width_33\.33vw` | `width: 33.33vw;` |
| `none` | `opacity0p25` | `.opacity_0\.25` | `opacity: 0.25;` |
| `none` | `zIndexN1` | `.z-index_-1` | `z-index: -1;` |
| `none` | `lineHeight1p5` | `.line-height_1\.5` | `line-height: 1.5;` |
| `none` | `fontWeight700` | `.font-weight_700` | `font-weight: 700;` |
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

  // 关键字 + 无单位整数（有范围）
  'font-weight': {
    keywords: ['normal', 'bold', 'bolder', 'lighter'],
    numeric: [
      { unit: 'none', value: 'integer', min: 1, max: 1000 }
    ],
  },

  // 无单位整数，支持负数（无 min）
  'z-index': {
    keywords: ['auto'],
    numeric: [
      { unit: 'none', value: 'integer' }
    ],
  },

  // 无单位小数，有范围
  opacity: {
    keywords: [],
    numeric: [
      { unit: 'none', value: 'number', min: 0, max: 1 }
    ],
  },

  // 像素 + 比例单位，不支持负数
  width: {
    keywords: ['auto', 'min-content', 'max-content', 'fit-content'],
    numeric: [
      { unit: 'px', value: 'integer', min: 0 },
      { unit: 'ratio', value: 'number', min: 0 }
    ],
  },

  // 像素 + 比例单位，支持负数
  margin: {
    keywords: ['auto'],
    numeric: [
      { unit: 'px', value: 'integer' },
      { unit: 'ratio', value: 'number' }
    ],
  },

  // 无单位小数
  'line-height': {
    keywords: ['normal'],
    numeric: [
      { unit: 'none', value: 'number', min: 0 }
    ],
  },

  // rem 单位
  'font-size': {
    keywords: ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
    numeric: [
      { unit: 'px', value: 'integer', min: 0 },
      { unit: 'rem', value: 'number', min: 0 }
    ],
  },

  // 角度单位，支持负数
  'rotate': {
    keywords: ['none'],
    numeric: [
      { unit: 'deg', value: 'number' }
    ],
  },

  // 时间单位
  'transition-duration': {
    keywords: [],
    numeric: [
      { unit: 'ms', value: 'number', min: 0 }
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
  numericType.min === undefined || numericType.min < 0

// 获取单位后缀列表
const getUnitSuffixes = (unitType: UnitType) => unitToSuffixes[unitType]

// 获取数值预设
const getValuePresets = (unitType: UnitType, property?: string) => {
  if (unitType === 'none' && property) {
    return noneValuePresets[property] || []
  }
  return valuePresets[unitType]
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