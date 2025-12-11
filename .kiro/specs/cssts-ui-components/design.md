# Design Document: CssTs-UI Components

## Overview

CssTs-UI 是一个使用 OVS (Object View Syntax) 和 CssTs 技术栈重写的 Vue 3 组件库。组件源码使用 OVS 语法编写，编译后生成标准的 Vue `h()` 函数，因此可以在任何 Vue 3 项目中使用。

**核心原则：逻辑和样式完全参照 Element UI 原有实现，仅语法改写**

- **组件逻辑** - 直接复用 Element UI 的 `use-*.ts` 组合式函数，保持相同的状态管理和事件处理逻辑
- **样式规则** - 参照 Element UI 的 SCSS 变量和样式规则，转换为 CssTs 格式
- **Props/Emits** - 保持与 Element UI 相同的接口定义
- **视图结构** - 将 Vue SFC template 改写为 OVS 语法

核心设计理念：
1. **类型安全的样式系统** - 通过 CssTs 提供编译时类型检查和 IDE 智能提示
2. **原子化 CSS 设计** - 基础样式原子可组合，组件样式由原子组合而成
3. **OVS 声明式语法** - 使用 `tag({ props }) { children }` 语法编写组件
4. **Vue 3 兼容** - 编译输出为标准 Vue 组件，支持 Composition API

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      cssts-ui Package                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Button    │  │    Input    │  │    Icon     │  ...    │
│  │   (.ovs)    │  │   (.ovs)    │  │   (.ovs)    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OVS Compiler (ovs-compiler)             │   │
│  │         Transforms OVS → Vue h() functions           │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Button.js  │  │  Input.js   │  │   Icon.js   │  ...    │
│  │ (Vue Comp)  │  │ (Vue Comp)  │  │ (Vue Comp)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  CssTs Style System                  │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐    │   │
│  │  │  Atomic   │  │ Component │  │   Runtime     │    │   │
│  │  │  Classes  │  │  Styles   │  │  ($cls func)  │    │   │
│  │  └───────────┘  └───────────┘  └───────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Button Component

```typescript
// Button Props Interface
interface ButtonProps {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  plain?: boolean
  round?: boolean
  circle?: boolean
  icon?: Component
  nativeType?: 'button' | 'submit' | 'reset'
}

// Button Emits
interface ButtonEmits {
  click: (event: MouseEvent) => void
}
```

### Input Component

```typescript
// Input Props Interface
interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'textarea' | 'number'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
  prefixIcon?: Component
  suffixIcon?: Component
  rows?: number
  maxlength?: number
  showWordLimit?: boolean
}

// Input Emits
interface InputEmits {
  'update:modelValue': (value: string | number) => void
  input: (value: string | number) => void
  change: (value: string | number) => void
  focus: (event: FocusEvent) => void
  blur: (event: FocusEvent) => void
  clear: () => void
}
```

### Icon Component

```typescript
// Icon Props Interface
interface IconProps {
  size?: number | string
  color?: string
}
```

## Data Models

### CssTs Style System Design

CssTs 样式系统采用三层架构：

#### 1. 设计令牌 (Design Tokens)

基础设计变量，定义颜色、尺寸、间距等：

```typescript
// 颜色令牌
const colors = {
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399',
  white: '#ffffff',
  black: '#000000',
  // 文本颜色
  textPrimary: '#303133',
  textRegular: '#606266',
  textSecondary: '#909399',
  textPlaceholder: '#a8abb2',
  textDisabled: '#c0c4cc',
  // 边框颜色
  borderBase: '#dcdfe6',
  borderLight: '#e4e7ed',
  borderLighter: '#ebeef5',
  // 填充颜色
  fillBase: '#f0f2f5',
  fillLight: '#f5f7fa',
  fillBlank: '#ffffff',
}

// 尺寸令牌
const sizes = {
  large: '40px',
  default: '32px',
  small: '24px',
}

// 间距令牌
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
}

// 圆角令牌
const borderRadius = {
  base: '4px',
  small: '2px',
  round: '20px',
  circle: '50%',
}
```

#### 2. 原子样式类 (Atomic Classes)

基于设计令牌生成的原子 CSS 类：

```typescript
export const CssCls = {
  // ==================== 布局原子 ====================
  inlineFlex: { 'inline-flex': true },
  flexCenter: { 'flex-center': true },
  flexAlignCenter: { 'flex-align-center': true },
  flexJustifyCenter: { 'flex-justify-center': true },
  
  // ==================== 尺寸原子 ====================
  sizeLarge: { 'size-large': true },
  sizeDefault: { 'size-default': true },
  sizeSmall: { 'size-small': true },
  
  // ==================== 颜色原子 ====================
  // 背景色
  bgPrimary: { 'bg-primary': true },
  bgSuccess: { 'bg-success': true },
  bgWarning: { 'bg-warning': true },
  bgDanger: { 'bg-danger': true },
  bgInfo: { 'bg-info': true },
  bgWhite: { 'bg-white': true },
  bgTransparent: { 'bg-transparent': true },
  
  // 文本色
  textPrimary: { 'text-primary': true },
  textSuccess: { 'text-success': true },
  textWarning: { 'text-warning': true },
  textDanger: { 'text-danger': true },
  textInfo: { 'text-info': true },
  textWhite: { 'text-white': true },
  textRegular: { 'text-regular': true },
  textDisabled: { 'text-disabled': true },
  
  // 边框色
  borderPrimary: { 'border-primary': true },
  borderSuccess: { 'border-success': true },
  borderWarning: { 'border-warning': true },
  borderDanger: { 'border-danger': true },
  borderInfo: { 'border-info': true },
  borderBase: { 'border-base': true },
  borderTransparent: { 'border-transparent': true },
  
  // ==================== 边框原子 ====================
  border: { 'border': true },
  borderNone: { 'border-none': true },
  
  // ==================== 圆角原子 ====================
  roundedBase: { 'rounded-base': true },
  roundedSmall: { 'rounded-small': true },
  roundedRound: { 'rounded-round': true },
  roundedCircle: { 'rounded-circle': true },
  
  // ==================== 状态原子 ====================
  disabled: { 'is-disabled': true },
  loading: { 'is-loading': true },
  active: { 'is-active': true },
  focus: { 'is-focus': true },
  
  // ==================== 交互原子 ====================
  cursorPointer: { 'cursor-pointer': true },
  cursorNotAllowed: { 'cursor-not-allowed': true },
  pointerEventsNone: { 'pointer-events-none': true },
  userSelectNone: { 'user-select-none': true },
  
  // ==================== 过渡原子 ====================
  transition: { 'transition': true },
  transitionFast: { 'transition-fast': true },
  
  // ==================== 字体原子 ====================
  fontBase: { 'font-base': true },
  fontSmall: { 'font-small': true },
  fontMedium: { 'font-medium': true },
  fontBold: { 'font-bold': true },
  
  // ==================== 间距原子 ====================
  paddingXs: { 'padding-xs': true },
  paddingSm: { 'padding-sm': true },
  paddingMd: { 'padding-md': true },
  paddingLg: { 'padding-lg': true },
  
} as const
```

#### 3. 组件样式 (Component Styles)

由原子类组合而成的组件级样式：

```typescript
export const CssClsButton = {
  // 基础按钮样式
  base: {
    'cu-button': true,
    'inline-flex': true,
    'flex-center': true,
    'border': true,
    'rounded-base': true,
    'cursor-pointer': true,
    'user-select-none': true,
    'transition': true,
  },
  
  // 类型变体
  primary: { 'cu-button--primary': true },
  success: { 'cu-button--success': true },
  warning: { 'cu-button--warning': true },
  danger: { 'cu-button--danger': true },
  info: { 'cu-button--info': true },
  
  // 尺寸变体
  large: { 'cu-button--large': true },
  default: { 'cu-button--default': true },
  small: { 'cu-button--small': true },
  
  // 状态变体
  disabled: { 'is-disabled': true },
  loading: { 'is-loading': true },
  plain: { 'is-plain': true },
  round: { 'is-round': true },
  circle: { 'is-circle': true },
} as const

export const CssClsInput = {
  // 基础输入框样式
  wrapper: {
    'cu-input': true,
    'inline-flex': true,
    'flex-align-center': true,
  },
  
  inner: {
    'cu-input__inner': true,
  },
  
  // 尺寸变体
  large: { 'cu-input--large': true },
  default: { 'cu-input--default': true },
  small: { 'cu-input--small': true },
  
  // 状态变体
  disabled: { 'is-disabled': true },
  focus: { 'is-focus': true },
  
  // 插槽样式
  prefix: { 'cu-input__prefix': true },
  suffix: { 'cu-input__suffix': true },
  clearIcon: { 'cu-input__clear': true },
} as const

export const CssClsIcon = {
  base: {
    'cu-icon': true,
    'inline-flex': true,
    'flex-center': true,
  },
} as const
```

### 样式组合与复用机制

CssTs 采用编译时 + 运行时混合方案，支持原子类复用和组合对象复用。

#### 1. 基础语法

```typescript
// 编译前 (CssTs 语法)
const customFont = css { colorRed, fontBold }
customFont.color = css colorGreen

// 编译后 (JavaScript)
let customFont = cssts.$cls(colorRed, fontBold)
cssts.$replace(customFont, 'color', colorGreen)
```

#### 2. 原子类定义与复用

```typescript
// 定义原子类 - 每个原子对应一个 CSS 属性
const fontSize14 = css { 'font-size-14': true }
const fontSize18 = css { 'font-size-18': true }
const bgPrimary = css { 'bg-primary': true }
const bgDanger = css { 'bg-danger': true }
const colorWhite = css { 'text-white': true }
const colorBlack = css { 'text-black': true }
const rounded4 = css { 'rounded-4': true }
const rounded8 = css { 'rounded-8': true }

// 原子类可以在任何地方复用
const title = css { colorRed, fontBold, fontSize14 }
const subtitle = css { colorPrimary, fontSize14 }  // fontSize14 复用
```

#### 3. 组合对象复用

```typescript
// 定义基础组合
const buttonBase = css { bgWhite, fontSize14, colorBlack, rounded4 }

// 复用 buttonBase，通过 CSS 属性名替换
const buttonPrimary = css { buttonBase }
buttonPrimary.backgroundColor = css bgPrimary  // 替换背景色
buttonPrimary.color = css colorWhite           // 替换文字色

const buttonDanger = css { buttonBase }
buttonDanger.backgroundColor = css bgDanger    // 替换背景色
buttonDanger.color = css colorWhite            // 替换文字色

// 结果:
// buttonBase:    { 'bg-white': true, 'font-size-14': true, 'text-black': true, 'rounded-4': true }
// buttonPrimary: { 'bg-primary': true, 'font-size-14': true, 'text-white': true, 'rounded-4': true }
// buttonDanger:  { 'bg-danger': true, 'font-size-14': true, 'text-white': true, 'rounded-4': true }
```

#### 4. 属性替换语法

支持两种属性替换方式：标准 CSS 属性和自定义属性。

##### 4.1 标准 CSS 属性替换

使用标准 CSS 属性名作为替换的 key：

```typescript
// 替换语法: object.cssProperty = css newAtom
buttonLarge.fontSize = css fontSize18        // 替换 font-size
buttonLarge.backgroundColor = css bgPrimary  // 替换 background-color
buttonLarge.color = css colorWhite           // 替换 color
buttonLarge.borderRadius = css rounded8      // 替换 border-radius
buttonLarge.padding = css paddingLg          // 替换 padding

// 整体替换语法: object = css { newStyles }
buttonLarge = css { fontSize18, bgPrimary }  // 完全替换
```

##### 4.2 自定义属性替换

除了标准 CSS 属性，还支持开发者自定义的语义化属性名：

```typescript
// 定义组合时使用自定义属性名
const card = css {
  themeColor: colorPrimary,     // 自定义: 主题色
  themeBg: bgLight,             // 自定义: 主题背景
  brandIcon: iconDefault,       // 自定义: 品牌图标样式
  fontSize: fontSize14          // 标准 CSS 属性
}

// 通过自定义属性名替换
card.themeColor = css colorDark    // 替换主题色
card.themeBg = css bgDark          // 替换主题背景
card.brandIcon = css iconBrand     // 替换品牌图标样式

// 混合使用标准和自定义属性
const button = css {
  // 标准 CSS 属性
  backgroundColor: bgWhite,
  color: colorBlack,
  fontSize: fontSize14,
  // 自定义属性
  hoverStyle: hoverLight,
  activeStyle: activeLight
}

button.hoverStyle = css hoverDark   // 替换悬停样式
button.activeStyle = css activeDark // 替换激活样式
```

##### 4.3 属性类型

| 属性类型 | 示例 | 说明 |
|---------|------|------|
| 标准 CSS 属性 | `fontSize`, `backgroundColor`, `padding` | 对应真实 CSS 属性 |
| 自定义属性 | `themeColor`, `brandStyle`, `hoverEffect` | 开发者定义的语义化名称 |

编译器会根据属性名自动判断是标准 CSS 属性还是自定义属性，并生成相应的运行时代码。

##### 4.4 智能属性替换（通过原子类名替换）

支持通过原子类名进行替换，编译器会自动查找该原子对应的 CSS 属性：

```typescript
// 定义原子类
const colorRed = css { 'color-red': true }    // 对应 CSS 属性: color
const colorGreen = css { 'color-green': true } // 对应 CSS 属性: color
const fontBold = css { 'font-bold': true }     // 对应 CSS 属性: fontWeight

// 通过原子类名替换
const color1 = css { colorRed }
color1.colorRed = css colorGreen
// 逻辑: 找到 colorRed 原子，获取其 CSS 属性 (color)，替换为 colorGreen
// 结果: { 'color-green': true }

// 等效于通过 CSS 属性名替换
color1.color = css colorGreen
// 结果相同: { 'color-green': true }
```

##### 4.5 原子类 → CSS 属性映射表

编译器维护一个映射表，记录每个原子类对应的 CSS 属性：

```typescript
// 原子类 → CSS 属性 映射表
const atomToCssPropertyMap = {
  // 颜色相关
  colorRed: 'color',
  colorGreen: 'color',
  colorBlue: 'color',
  colorWhite: 'color',
  colorBlack: 'color',
  colorPrimary: 'color',
  
  // 背景相关
  bgPrimary: 'backgroundColor',
  bgSuccess: 'backgroundColor',
  bgWarning: 'backgroundColor',
  bgDanger: 'backgroundColor',
  bgWhite: 'backgroundColor',
  
  // 字体相关
  fontBold: 'fontWeight',
  fontNormal: 'fontWeight',
  fontSize14: 'fontSize',
  fontSize18: 'fontSize',
  fontBase: 'fontSize',
  fontSmall: 'fontSize',
  
  // 边框相关
  rounded4: 'borderRadius',
  rounded8: 'borderRadius',
  roundedBase: 'borderRadius',
  roundedCircle: 'borderRadius',
  
  // 间距相关
  paddingXs: 'padding',
  paddingSm: 'padding',
  paddingMd: 'padding',
  paddingLg: 'padding',
  
  // ... 其他原子类
} as const
```

##### 4.6 智能替换逻辑流程

```
1. 解析 obj.xxx = css newAtom

2. 判断 xxx 是什么类型:
   a. 如果 xxx 是原子类名 (如 colorRed):
      - 从映射表查找该原子类对应的 CSS 属性 (color)
      - 验证 newAtom 的 CSS 属性是否相同 (可选校验)
      - 替换该 CSS 属性的值
   
   b. 如果 xxx 是 CSS 属性名 (如 color):
      - 直接按 CSS 属性替换
   
   c. 如果 xxx 是自定义属性名 (如 themeColor):
      - 按自定义属性名替换

3. 执行替换:
   - 移除旧属性对应的所有类
   - 添加新原子的类
```

##### 4.7 替换值的形式

替换值可以是单个原子或组合对象：

```typescript
// 单个原子值替换
card.themeColor = css colorDark

// 组合值替换 (多个原子)
card.themeBg = css { bgDark, shadowLg, borderDark }

// 整体替换
card = css { colorGreen, bgWhite }
```

#### 5. 运行时函数

```typescript
// $cls - 合并多个样式对象
function $cls(...styles: StyleObject[]): StyleObject {
  const result: StyleObject = {}
  for (const style of styles) {
    if (style) Object.assign(result, style)
  }
  return result
}

// $replace - 按 CSS 属性替换样式（原地修改）
function $replace(
  target: StyleObject,      // 要修改的对象
  cssProperty: string,      // CSS 属性名 (如 'fontSize', 'backgroundColor')
  newAtom: StyleObject      // 新的原子样式
): void {
  // 1. 找到并移除该 CSS 属性对应的所有类
  const keysToRemove = findKeysByCssProperty(target, cssProperty)
  for (const key of keysToRemove) {
    delete target[key]
  }
  // 2. 添加新原子的所有 key
  Object.assign(target, newAtom)
}
```

#### 6. 动态条件（运行时处理）

```typescript
// 动态条件必须在运行时处理
const buttonStyle = css {
  buttonBase,
  props.disabled && disabledStyle,
  props.loading && loadingStyle
}

// 编译后
const buttonStyle = cssts.$cls(
  buttonBase,
  props.disabled && disabledStyle,
  props.loading && loadingStyle
)
```

#### 7. 多层嵌套复用

```typescript
// 第一层: 原子
const colorWhite = css { 'text-white': true }
const rounded = css { 'rounded-base': true }

// 第二层: 基础组合
const buttonBase = css { rounded, fontBold, fontSize14 }

// 第三层: 变体组合
const buttonPrimary = css { buttonBase, bgPrimary, colorWhite }

// 第四层: 尺寸变体
const buttonPrimaryLarge = css { buttonPrimary }
buttonPrimaryLarge.fontSize = css fontSize18
buttonPrimaryLarge.padding = css paddingLg
```

#### 覆盖规则

1. `css { a, b, c }` - 后面的样式对象会覆盖前面的同名属性
2. `obj.cssProperty = css newAtom` - 移除该 CSS 属性的旧值，添加新值
3. `obj = css { ... }` - 完全替换整个对象
4. falsy 值（false, null, undefined）会被忽略

### 样式序列化格式

为了支持调试和测试，CssTs 样式对象可以序列化为字符串：

```typescript
// 序列化格式: 按字母顺序排列的类名，用空格分隔
// { 'cu-button': true, 'is-disabled': true, 'bg-primary': true }
// → "bg-primary cu-button is-disabled"

function serializeStyle(style: Record<string, boolean>): string {
  return Object.keys(style)
    .filter(key => style[key])
    .sort()
    .join(' ')
}

function parseStyle(str: string): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  str.split(' ').filter(Boolean).forEach(cls => {
    result[cls] = true
  })
  return result
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Button type prop applies correct CSS class
*For any* valid button type value ("primary", "success", "warning", "danger", "info"), when the type prop is set, the rendered button SHALL have the corresponding CSS class (e.g., "cu-button--primary").
**Validates: Requirements 1.2**

### Property 2: Button size prop applies correct CSS class
*For any* valid button size value ("large", "default", "small"), when the size prop is set, the rendered button SHALL have the corresponding CSS class (e.g., "cu-button--large").
**Validates: Requirements 1.3**

### Property 3: Disabled button has correct state
*For any* button with disabled=true, the button SHALL have the "is-disabled" class AND clicking the button SHALL NOT emit a click event.
**Validates: Requirements 1.4**

### Property 4: Loading button has correct state
*For any* button with loading=true, the button SHALL have the "is-loading" class AND the button SHALL be non-interactive.
**Validates: Requirements 1.5**

### Property 5: Button boolean props apply correct classes
*For any* combination of boolean props (plain, round, circle), when set to true, the button SHALL have the corresponding CSS classes ("is-plain", "is-round", "is-circle").
**Validates: Requirements 1.6, 1.7, 1.8**

### Property 6: Enabled button emits click event
*For any* enabled button (disabled=false, loading=false), when clicked, the button SHALL emit a click event with the native MouseEvent object.
**Validates: Requirements 1.9**

### Property 7: Input v-model two-way binding
*For any* input value, when the modelValue prop changes, the input element's value SHALL update; when the user types, the component SHALL emit 'update:modelValue' with the new value.
**Validates: Requirements 2.2**

### Property 8: Input type prop renders correct element
*For any* valid input type ("text", "password", "textarea", "number"), the component SHALL render the corresponding HTML element with the correct type attribute.
**Validates: Requirements 2.3**

### Property 9: Input size prop applies correct CSS class
*For any* valid input size value ("large", "default", "small"), when the size prop is set, the input wrapper SHALL have the corresponding CSS class.
**Validates: Requirements 2.8**

### Property 10: Clearable input shows clear icon when has content
*For any* input with clearable=true and non-empty value, the clear icon SHALL be visible; when the value is empty, the clear icon SHALL be hidden.
**Validates: Requirements 2.6**

### Property 11: Clear action clears value and emits event
*For any* clearable input with content, when the clear icon is clicked, the input value SHALL become empty AND the component SHALL emit 'update:modelValue' with empty string AND emit 'clear' event.
**Validates: Requirements 2.7**

### Property 12: Style merge function combines styles correctly
*For any* set of style objects passed to cssts.$cls(), the result SHALL contain all truthy class names from all input objects, with later objects overriding earlier ones for same keys.
**Validates: Requirements 4.3**

### Property 13: Style serialization round-trip consistency
*For any* valid CssCls style object, serializing then parsing SHALL produce an equivalent object (same keys with true values).
**Validates: Requirements 6.3**

### Property 14: OVS compilation produces valid Vue render functions
*For any* valid OVS component source, the compiled output SHALL be a valid Vue component that can be mounted and rendered.
**Validates: Requirements 5.5**

### Property 15: npm workspace dependencies resolve correctly
*For any* workspace dependency declaration using "workspace:*" protocol, npm SHALL resolve the dependency to the correct local package.
**Validates: Requirements 7.3, 7.5**

### Property 16: npm scripts execute correctly
*For any* npm script defined in package.json, running `npm run <script>` SHALL execute the script without errors related to package manager differences.
**Validates: Requirements 7.3**

### Property 17: Style composition merges correctly
*For any* set of atomic styles combined using `css { a, b, c }` syntax, the result SHALL contain all class names from all input atoms, with later atoms overriding earlier ones for the same CSS property.
**Validates: Requirements 4.3**

### Property 18: CSS property replacement works correctly
*For any* composite style object and CSS property name, using `obj.cssProperty = css newAtom` SHALL remove all classes related to that CSS property and add the new atom's classes.
**Validates: Requirements 4.6**

### Property 19: Atomic style reuse preserves independence
*For any* atomic style used in multiple composite styles, modifying one composite style SHALL NOT affect other composite styles using the same atom.
**Validates: Requirements 4.8**

### Property 20: Custom property replacement works correctly
*For any* composite style object with custom property names, using `obj.customProperty = css newAtom` SHALL remove the old custom property value and add the new atom's classes.
**Validates: Requirements 4.10, 4.11**

### Property 21: Smart atom-based replacement works correctly
*For any* composite style object containing an atom, using `obj.atomName = css newAtom` SHALL find the CSS property of that atom from the mapping table and replace all classes related to that CSS property.
**Validates: Requirements 4.12**

### Property 22: Atom to CSS property mapping is consistent
*For any* atom definition, the mapping table SHALL correctly map the atom name to its corresponding CSS property, and this mapping SHALL be used consistently during replacement operations.
**Validates: Requirements 4.13**

## Package Manager Migration (pnpm → npm)

### 迁移策略

将 cssts-ui 从 pnpm 迁移到 npm，需要进行以下更改：

#### 1. 移除 pnpm 特定配置

```json
// 移除 package.json 中的 pnpm 配置
{
  // 删除
  "packageManager": "pnpm@9.5.0",
  "pnpm": { ... }
}
```

#### 2. 更新脚本命令

将所有 `pnpm` 命令替换为 `npm` 等效命令：

| pnpm 命令 | npm 等效命令 |
|-----------|-------------|
| `pnpm run -C play dev` | `npm run dev --workspace=play` |
| `pnpm run -r --parallel clean` | `npm run clean --workspaces --if-present` |
| `pnpm run -C internal/build start` | `npm run start --workspace=@element-plus/build` |
| `pnpm run -C docs dev` | `npm run dev --workspace=docs` |

#### 3. 更新 package.json scripts

```json
{
  "scripts": {
    "dev": "npm run dev --workspace=play",
    "clean": "npm run clean:dist && npm run clean --workspaces --if-present",
    "build": "npm run start --workspace=@element-plus/build",
    "build:theme": "npm run build --workspace=@element-plus/theme-chalk",
    "docs:dev": "npm run dev --workspace=docs",
    "docs:build": "npm run build --workspace=docs",
    "docs:serve": "npm run serve --workspace=docs",
    "stub": "npm run stub --workspaces --if-present",
    "postinstall": "npm run stub && concurrently \"npm run gen:version\" \"npm run dev --workspace=@element-plus/metadata\""
  }
}
```

#### 4. 处理 workspace 依赖

npm 7+ 支持 workspaces，语法与 pnpm 类似：

```json
{
  "workspaces": [
    "packages/*",
    "play",
    "docs",
    "internal/*"
  ],
  "dependencies": {
    "@element-plus/components": "workspace:*",
    // ... 其他 workspace 依赖保持不变
  }
}
```

#### 5. 处理 patchedDependencies

pnpm 的 `patchedDependencies` 需要使用 npm 的 `overrides` 或 `patch-package` 替代：

```json
{
  "scripts": {
    "postinstall": "patch-package"
  },
  "devDependencies": {
    "patch-package": "^8.0.0"
  }
}
```

#### 6. 删除 pnpm-lock.yaml

迁移后删除 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml`，使用 `package-lock.json`。

### 迁移后的 package.json 结构

```json
{
  "private": true,
  "workspaces": [
    "packages/*",
    "play",
    "docs",
    "internal/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=play",
    "test": "vitest",
    "build": "npm run start --workspace=@element-plus/build",
    "clean": "rimraf dist && npm run clean --workspaces --if-present",
    "docs:dev": "npm run dev --workspace=docs",
    "docs:build": "npm run build --workspace=docs",
    "prepare": "husky",
    "postinstall": "npm run stub && patch-package"
  },
  "devDependencies": {
    "patch-package": "^8.0.0"
  }
}
```

## Design Guidelines (设计指南)

### 设计原则概述

CssTs-UI 遵循四大核心设计原则，确保组件库提供一致、高效、可控的用户体验。

### 1. Consistency (一致性)

#### 与现实生活一致
- 组件行为应符合用户在现实生活中的认知和习惯
- 使用用户熟悉的语言和交互模式
- 遵循平台原生的交互规范

#### 界面内部一致
- 所有组件保持统一的设计风格
- 图标、文字、颜色使用保持一致
- 元素位置和布局遵循统一规则
- 交互反馈方式保持一致

```typescript
// 一致性示例：所有组件使用相同的尺寸系统
const sizes = {
  large: '40px',
  default: '32px', 
  small: '24px',
}

// Button、Input、Select 等组件都使用相同的 size prop
interface SizeProps {
  size?: 'large' | 'default' | 'small'
}
```

### 2. Feedback (反馈)

#### 操作反馈
- 用户操作后应立即获得视觉或交互反馈
- 按钮点击应有明显的状态变化
- 表单提交应显示加载状态

#### 视觉反馈
- 通过元素状态变化反映当前状态
- 使用动画过渡增强状态变化的感知
- 错误状态应有明确的视觉提示

```typescript
// 反馈示例：Button 的状态样式
export const CssClsButton = {
  // 悬停状态
  hover: { 'cu-button--hover': true },
  // 按下状态
  active: { 'cu-button--active': true },
  // 聚焦状态
  focus: { 'cu-button--focus': true },
  // 加载状态
  loading: { 'is-loading': true },
}
```

### 3. Efficiency (效率)

#### 简化流程
- 减少用户完成任务所需的步骤
- 提供合理的默认值
- 支持键盘快捷操作

#### 清晰明确
- 组件用途和功能应一目了然
- 避免歧义的文案和图标
- 提供清晰的操作引导

#### 易于识别
- 界面元素应直观易懂
- 减少用户的记忆负担
- 使用熟悉的图标和模式

```typescript
// 效率示例：Input 组件提供合理的默认值
const inputDefaultProps = {
  type: 'text',
  size: 'default',
  clearable: false,
  disabled: false,
}
```

### 4. Controllability (可控性)

#### 决策权
- 可以提供操作建议，但不替用户做决定
- 重要操作应有确认步骤
- 提供撤销和重做功能

#### 可控后果
- 用户应能取消、中止或终止当前操作
- 危险操作应有明确警告
- 提供操作历史和恢复机制

```typescript
// 可控性示例：Dialog 组件的关闭控制
interface DialogProps {
  // 是否显示关闭按钮
  showClose?: boolean
  // 点击遮罩是否关闭
  closeOnClickModal?: boolean
  // 按 ESC 是否关闭
  closeOnPressEscape?: boolean
  // 关闭前的回调，返回 false 可阻止关闭
  beforeClose?: (done: () => void) => void
}
```

### 设计令牌与设计原则的对应

| 设计原则 | 对应的设计令牌 |
|---------|--------------|
| 一致性 | 统一的颜色系统、尺寸系统、间距系统 |
| 反馈 | 过渡动画时间、状态颜色变化 |
| 效率 | 合理的默认值、清晰的视觉层次 |
| 可控性 | 禁用状态样式、交互状态样式 |

## Error Handling

### Component Props Validation

```typescript
// Button type validation
const validButtonTypes = ['default', 'primary', 'success', 'warning', 'danger', 'info']
if (props.type && !validButtonTypes.includes(props.type)) {
  console.warn(`[CssTs-UI] Invalid button type: ${props.type}`)
}

// Size validation
const validSizes = ['large', 'default', 'small']
if (props.size && !validSizes.includes(props.size)) {
  console.warn(`[CssTs-UI] Invalid size: ${props.size}`)
}
```

### Style System Errors

```typescript
// cssts.$cls handles invalid inputs gracefully
function $cls(...args: ClassValue[]): ClassObject {
  const result: ClassObject = {}
  for (const arg of args) {
    if (!arg) continue  // Skip falsy values
    if (typeof arg === 'string') {
      result[arg] = true
    } else if (typeof arg === 'object' && !Array.isArray(arg)) {
      Object.assign(result, arg)
    }
    // Invalid types are silently ignored
  }
  return result
}
```

## Testing Strategy

### Property-Based Testing Framework

使用 **fast-check** 作为属性测试库，配置每个测试运行至少 100 次迭代。

### Unit Tests

1. **组件导出测试** - 验证所有组件正确导出
2. **Props 默认值测试** - 验证 props 默认值正确
3. **插槽渲染测试** - 验证 slot 内容正确渲染
4. **事件触发测试** - 验证事件正确触发

### Property-Based Tests

每个属性测试必须标注对应的正确性属性：

```typescript
// **Feature: cssts-ui-components, Property 1: Button type prop applies correct CSS class**
test.prop([fc.constantFrom('primary', 'success', 'warning', 'danger', 'info')], { numRuns: 100 })(
  'button type prop applies correct CSS class',
  (type) => {
    const wrapper = mount(Button, { props: { type } })
    expect(wrapper.classes()).toContain(`cu-button--${type}`)
  }
)

// **Feature: cssts-ui-components, Property 13: Style serialization round-trip consistency**
test.prop([fc.dictionary(fc.string(), fc.boolean())], { numRuns: 100 })(
  'style serialization round-trip',
  (style) => {
    const serialized = serializeStyle(style)
    const parsed = parseStyle(serialized)
    // Only truthy values should survive
    const expected = Object.fromEntries(
      Object.entries(style).filter(([_, v]) => v)
    )
    expect(parsed).toEqual(expected)
  }
)
```

### Project File Structure

```
cssts-ui/
├── src/
│   │
│   ├── components/                    # 组件目录
│   │   │
│   │   ├── button/                    # Button 组件
│   │   │   ├── Button.ovs             # OVS 源码 - 组件视图逻辑
│   │   │   ├── button.ts              # Props/Emits 类型定义
│   │   │   ├── use-button.ts          # 组合式函数 - 按钮逻辑
│   │   │   ├── button.test.ts         # 单元测试 + 属性测试
│   │   │   └── index.ts               # 组件导出
│   │   │
│   │   ├── input/                     # Input 组件
│   │   │   ├── Input.ovs              # OVS 源码 - 组件视图逻辑
│   │   │   ├── input.ts               # Props/Emits 类型定义
│   │   │   ├── use-input.ts           # 组合式函数 - 输入框逻辑
│   │   │   ├── input.test.ts          # 单元测试 + 属性测试
│   │   │   └── index.ts               # 组件导出
│   │   │
│   │   ├── icon/                      # Icon 组件
│   │   │   ├── Icon.ovs               # OVS 源码 - 组件视图逻辑
│   │   │   ├── icon.ts                # Props 类型定义
│   │   │   ├── icon.test.ts           # 单元测试 + 属性测试
│   │   │   └── index.ts               # 组件导出
│   │   │
│   │   └── index.ts                   # 所有组件统一导出
│   │
│   ├── styles/                        # CssTs 样式系统
│   │   │
│   │   ├── tokens.ts                  # 设计令牌 - 颜色/尺寸/间距等基础变量
│   │   │
│   │   ├── atomic/                    # 原子样式类
│   │   │   ├── layout.ts              # 布局原子: flex, grid, position
│   │   │   ├── sizing.ts              # 尺寸原子: width, height, padding, margin
│   │   │   ├── colors.ts              # 颜色原子: bg-*, text-*, border-*
│   │   │   ├── typography.ts          # 字体原子: font-size, font-weight
│   │   │   ├── effects.ts             # 效果原子: shadow, transition, cursor
│   │   │   ├── states.ts              # 状态原子: disabled, loading, active
│   │   │   └── index.ts               # 原子样式统一导出
│   │   │
│   │   ├── components/                # 组件样式
│   │   │   ├── button.ts              # Button 组件样式: CssClsButton
│   │   │   ├── input.ts               # Input 组件样式: CssClsInput
│   │   │   ├── icon.ts                # Icon 组件样式: CssClsIcon
│   │   │   └── index.ts               # 组件样式统一导出
│   │   │
│   │   ├── CssCls.ts                  # 样式总入口 - 合并所有原子和组件样式
│   │   ├── serializer.ts              # 样式序列化/反序列化工具
│   │   ├── styles.test.ts             # 样式系统测试
│   │   └── index.ts                   # 样式系统导出
│   │
│   ├── utils/                         # 工具函数
│   │   ├── props.ts                   # Props 工具函数
│   │   └── index.ts                   # 工具导出
│   │
│   ├── css/                           # CSS 文件
│   │   ├── tokens.css                 # CSS 变量定义
│   │   ├── atomic.css                 # 原子样式 CSS
│   │   ├── button.css                 # Button 组件 CSS
│   │   ├── input.css                  # Input 组件 CSS
│   │   ├── icon.css                   # Icon 组件 CSS
│   │   └── index.css                  # CSS 总入口
│   │
│   └── index.ts                       # 包主入口 - 导出所有组件和样式
│
├── package.json                       # 包配置
├── tsconfig.json                      # TypeScript 配置
├── vite.config.ts                     # Vite 构建配置
└── vitest.config.ts                   # Vitest 测试配置
```

### 文件职责详解

#### 组件文件 (以 Button 为例)

| 文件 | 职责 |
|------|------|
| `Button.ovs` | OVS 语法编写的组件视图，定义 UI 结构和样式绑定 |
| `button.ts` | TypeScript 类型定义：ButtonProps, ButtonEmits 接口 |
| `use-button.ts` | Vue Composition API 逻辑：状态管理、事件处理、计算属性 |
| `button.test.ts` | 测试文件：单元测试 + fast-check 属性测试 |
| `index.ts` | 导出入口：export { default as CuButton } from './Button.ovs' |

#### 样式文件

| 文件 | 职责 |
|------|------|
| `tokens.ts` | 设计令牌：定义颜色、尺寸、间距等基础变量 |
| `atomic/*.ts` | 原子样式：可复用的基础样式类定义 |
| `components/*.ts` | 组件样式：由原子组合而成的组件级样式 |
| `CssCls.ts` | 样式总入口：合并导出所有样式供组件使用 |
| `serializer.ts` | 序列化工具：样式对象 ↔ 字符串转换 |
| `css/*.css` | 实际 CSS：与 TypeScript 样式对象对应的 CSS 规则 |

#### 入口文件

| 文件 | 职责 |
|------|------|
| `src/index.ts` | 包主入口，导出所有组件和样式 |
| `src/components/index.ts` | 组件统一导出 |
| `src/styles/index.ts` | 样式系统统一导出 |
