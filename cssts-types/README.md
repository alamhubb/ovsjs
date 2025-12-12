# CssTs Types

CssTs 原子类类型定义包，提供完整的 CSS 原子类 TypeScript 类型支持。

## 核心设计

### 数据结构

生成器的核心是一个 **属性定义 Map**：`Map<cssProperty, PropertyDefinition>`

```typescript
// 类型定义
interface NumericRange {
  min: number
  max: number
  types: string[]  // css-tree 类型：'length' | 'percentage' | 'number' | 'integer' | ...
}

interface PropertyDefinition {
  keywords: string[]       // 关键字值（来自 css-tree）
  numeric?: NumericRange   // 数值范围（来自 css-tree）
}

// 类型到单位的映射
const typeToUnits: Record<string, string[]> = {
  'length': ['px', 'rem', 'em', 'vh', 'vw'],
  'percentage': ['%'],
  'number': [],      // 无单位纯数字
  'integer': [],     // 无单位整数
  'angle': ['deg', 'rad', 'turn'],
  'time': ['s', 'ms'],
}
```

**属性定义示例**：

```typescript
const cssPropertyMap = {
  // 纯关键字属性
  'display': {
    keywords: ['flex', 'block', 'inline', 'grid', 'none', ...],
  },
  
  // 关键字 + 数值范围
  'font-weight': {
    keywords: ['normal', 'bold', 'bolder', 'lighter'],
    numeric: { min: 1, max: 1000, types: ['number'] }
  },
  
  // 纯数值属性
  'opacity': {
    keywords: [],
    numeric: { min: 0, max: 1, types: ['number'] }
  },
  
  // 多类型数值
  'padding': {
    keywords: [],
    numeric: { min: 0, max: Infinity, types: ['length', 'percentage'] }
  },
  
  // 关键字 + 多类型数值
  'width': {
    keywords: ['auto', 'min-content', 'max-content', 'fit-content'],
    numeric: { min: 0, max: Infinity, types: ['length', 'percentage'] }
  },
  
  'line-height': {
    keywords: ['normal'],
    numeric: { min: 0, max: Infinity, types: ['number', 'length', 'percentage'] }
  },
}
```

**数据来源**：
- `keywords`：自动从 css-tree 提取（权威数据）
- `numeric.min/max`：自动从 css-tree 提取（如 font-weight 的 1-1000）
- `numeric.types`：自动从 css-tree 提取（如 padding 接受 `<length>` 和 `<percentage>`）
- `typeToUnits`：手动配置（设计系统层面决定支持哪些单位）

### CSS 类名命名规则

采用 `{property}_{value}` 格式，用 `_` 下划线分隔属性和值：

```css
/* 属性_值 格式 */
.display_flex { display: flex; }
.position_relative { position: relative; }
.justify-content_center { justify-content: center; }
.align-items_flex-start { align-items: flex-start; }
.flex-direction_row-reverse { flex-direction: row-reverse; }
.overflow-x_auto { overflow-x: auto; }
```

**为什么用 `_` 分隔？**

CSS 属性名和值都可能包含 `-`，如果统一用 `-` 会产生歧义：
```
justify-content-flex-start  // 歧义：哪里是属性和值的分界？
justify-content_flex-start  // 清晰：_ 左边是属性，右边是值
```

### TypeScript 变量名

采用 `{property}{Value}` 的 camelCase 格式：

```typescript
// TS 变量名（camelCase）→ CSS 类名（property_value）
displayFlex           → .display_flex
positionRelative      → .position_relative
justifyContentCenter  → .justify-content_center
alignItemsFlexStart   → .align-items_flex-start
cursorPointer         → .cursor_pointer
```

### 特殊符号转换

CSS 值中的特殊符号需要分别处理：**TS 标识符**需要转换为别名，**CSS 类名**需要转义。

#### 两个转换映射

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

#### 转换示例

| CSS 值 | TS 变量名 | CSS 类名（选择器） |
|--------|-----------|-------------------|
| `1.5` | `lineHeight1p5` | `.line-height_1\.5` |
| `0.25` | `opacity0p25` | `.opacity_0\.25` |
| `50%` | `width50pct` | `.width_50\%` |
| `100%` | `padding100pct` | `.padding_100\%` |
| `-1` | `zIndexN1` | `.z-index_-1` |
| `-100px` | `marginN100px` | `.margin_-100px` |
| `16/9` | `aspectRatio16s9` | `.aspect-ratio_16\/9` |
| `1/2` | `gridColumn1s2` | `.grid-column_1\/2` |

#### 设计说明

**TS 标识符**：
- 不能包含 `.`、`%`、`/`、`-`（开头）等特殊字符
- 使用别名替换：`p`、`pct`、`s`、`n`

**CSS 类名**：
- 可以包含特殊字符，但需要用 `\` 转义
- `-` 在 `_` 分隔符后面不会产生歧义，无需转义
- 这与 Tailwind 的处理方式一致

**复杂度分析**：符号转换是 O(n) 操作，不会导致原子类数量爆炸。

### 数值类原子类

数值类原子类的生成逻辑：

1. **关键字值**：直接从 css-tree 提取，自动生成
2. **数值范围**：从 css-tree 提取 min/max，具体数值由设计系统配置
3. **单位**：通过 `typeToUnits` 映射，从 css-tree 类型转换为具体单位

```typescript
// font-weight: 规范定义 1-1000，生成常用值
fontWeight100, fontWeight200, ..., fontWeight900
fontWeightNormal, fontWeightBold  // 关键字

// padding: 接受 length 和 percentage
padding0, padding4, padding8, padding16...  // px 单位
padding50p  // 50% (p 代表 percentage)

// opacity: 规范定义 0-1
opacity0, opacity0p25, opacity0p5, opacity0p75, opacity1

// width: 关键字 + 数值
widthAuto, widthMinContent, widthMaxContent  // 关键字
width100, width200...  // px 单位
widthFull  // 100%
```

## 生成的文件

### 发布时生成（npm publish）

| 文件 | 用途 |
|------|------|
| `CsstsAtoms.d.ts` | 接口定义（唯一数据源） |
| `global.generated.d.ts` | 全局类型声明（引用接口） |
| `dist/atoms.json` | 原子类名称列表（编译时查找用） |

### 用户编译时生成（vite build）

| 文件 | 用途 |
|------|------|
| `CsstsAtom.ts` | 运行时原子类实现 |
| `atoms.css` | 按需生成的 CSS 样式 |

## 数据来源

使用 [css-tree](https://github.com/csstree/csstree) v3.1.0 库递归解析 W3C CSS 语法定义，自动提取所有属性的关键字值。

### 权威性

css-tree 是业界广泛使用的 CSS 解析库，被 PostCSS、Stylelint 等主流工具采用。其数据直接来源于 W3C CSS 规范语法定义。

**数据统计**：
- CSS 属性：651 个
- CSS 类型：456 个

### 与 MDN 文档对比验证

| 属性 | css-tree | MDN | 结果 |
|------|----------|-----|------|
| display | 29 个值 | 24 个值 | ✅ 完全覆盖，额外包含 Ruby 注音相关值 |
| position | 5 个值 | 5 个值 | ✅ 完全匹配 |
| flex-direction | 4 个值 | 4 个值 | ✅ 完全匹配 |
| justify-content | 14 个值 | 14 个值 | ✅ 完全匹配 |
| align-items | 14 个值 | 12 个值 | ✅ 完全覆盖 |
| cursor | 37 个值 | 36 个值 | ✅ 完全覆盖 |

### 设计说明

**组合值拆分**：css-tree 按 W3C 语法定义解析，如 `first baseline` 被拆分为独立的 `first` 和 `baseline` 关键字。这符合原子类的设计理念——最小粒度、可自由组合。

**额外值来源**：
| 值 | 来源 |
|----|------|
| `ruby-base`, `ruby-text` 等 | W3C CSS Ruby 规范（东亚文字注音） |
| `hand` | IE 浏览器兼容值 |
| `overlay` | WebKit 扩展值 |
| `self-start`, `self-end` | CSS Box Alignment 规范 |

### css-tree 的优势

- 内置 lexer 可递归展开语法引用（如 `<display-outside>` → `block | inline | run-in`）
- 自动提取所有关键字值，无需手动维护
- 数据来源权威，与 MDN 文档高度一致

## 使用方法

### 生成类型定义

```bash
cd cssts-types
npm run generate
```

### 在项目中使用

```typescript
// tsconfig.json 中引入全局类型
{
  "compilerOptions": {
    "types": ["cssts-types/global"]
  }
}

// 使用原子类
const style = css { displayFlex, alignItemsCenter, gap8 }
```

## 类型架构

```
CsstsAtoms.d.ts (唯一数据源)
       ↓
global.generated.d.ts (引用接口)
       ↓
全局变量声明 (const displayFlex: CsstsAtoms['displayFlex'])
```

这种设计确保类型一致性，只需维护一个数据源。

## 命名规则总结

| 场景 | TS 标识符 | CSS 类名 | 示例 |
|------|----------|----------|------|
| 属性-值分隔 | camelCase | `_` 下划线 | `displayFlex` → `.display_flex` |
| 值内部分隔 | PascalCase | `-` 连字符 | `flexStart` → `flex-start` |
| 小数点 `.` | `p` (point) | `\.` (转义) | `1p5` → `1\.5` |
| 百分号 `%` | `pct` (percent) | `\%` (转义) | `50pct` → `50\%` |
| 斜杠 `/` | `s` (slash) | `\/` (转义) | `16s9` → `16\/9` |
| 负数 `-` | `n` (negative) | 保持原样 | `N100px` → `-100px` |
