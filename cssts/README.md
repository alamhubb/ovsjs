# CssTs - CSS-in-TypeScript

> 编译时 CSS 类名管理系统，提供类型安全的原子类组合能力

## 核心特性

- **类型安全** - TypeScript 原生支持，IDE 智能提示
- **原子类组合** - 使用 `css { }` 语法组合原子类
- **编译时转换** - 语法糖编译为运行时调用
- **智能区分** - 自动区分原子类和局部变量
- **样式冲突替换** - 智能检测并替换同属性类别的样式
- **按需生成** - 只生成项目中使用的原子类和 CSS

## 设计原则

### 1. css 关键字是必须的

`css` 关键字用于标识 CssTs 语法，只有带 `css` 前缀的表达式才会被编译转换：

```typescript
// ✅ 有 css 关键字 → 编译转换
css { isDisabled, cursorNotAllowed }  
// → cssts.$cls(csstsAtom.isDisabled, csstsAtom.cursorNotAllowed)

// ❌ 没有 css 关键字 → 保持原样（标准 JS 语义）
{ isDisabled, cursorNotAllowed }  
// → { isDisabled: isDisabled, cursorNotAllowed: cursorNotAllowed }
```

**设计原因**：`{ A }` 在 JavaScript 中是对象简写语法 `{ A: A }`，我们不应该改变这个语义。

### 2. 嵌套 css {} 是必须的

在 `css { }` 内部使用条件表达式时，内层的原子类组也需要 `css { }` 包裹：

```typescript
// ✅ 正确写法
const buttonClass = computed(() => {
  return css {
    ...baseStyle,
    props.disabled && css { isDisabled, cursorNotAllowed },
    props.round && css { borderRadiusFull }
  }
})

// ❌ 错误写法（内层缺少 css）
const buttonClass = computed(() => {
  return css {
    ...baseStyle,
    props.disabled && { isDisabled, cursorNotAllowed }  // 这是 JS 对象！
  }
})
```

### 3. 智能区分原子类和变量

编译器会自动区分标识符是原子类还是局部变量：

```typescript
const baseStyle = css { displayFlex, alignItemsCenter }  // 定义局部变量

css { ...baseStyle, backgroundColorPrimary }
// baseStyle 是局部变量 → 保持原样
// backgroundColorPrimary 是原子类 → csstsAtom.backgroundColorPrimary
```

**判断逻辑**：
1. 先检查当前作用域是否有该变量声明
2. 如果没有，检查原子类名称表（`atoms.json`）
3. 都不匹配则报警告

### 4. 统一命名规则

原子类采用完整语义命名：`{cssProperty}{Value}`

| CSS 属性 | 原子类名称 | CSS 类名 |
|---------|-----------|---------|
| `display: flex` | `displayFlex` | `display-flex` |
| `display: none` | `displayNone` | `display-none` |
| `flex-direction: column` | `flexDirectionColumn` | `flex-direction-column` |
| `justify-content: center` | `justifyContentCenter` | `justify-content-center` |
| `align-items: center` | `alignItemsCenter` | `align-items-center` |
| `position: absolute` | `positionAbsolute` | `position-absolute` |
| `padding: 16px` | `padding16` | `padding-16` |

**设计原因**：统一的命名规则让所有 CSS 属性保持一致的风格，避免歧义。

## 架构设计

### 文件生成流程

```
┌─────────────────────────────────────────────────────────────┐
│  cssts-types 包发布时（我们维护）                            │
├─────────────────────────────────────────────────────────────┤
│  mdn-data → 生成器 → CsstsAtoms.d.ts (接口，唯一数据源)      │
│                    → global.d.ts (全局声明，引用接口)        │
│                    → atoms.json (名称列表，编译时用)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                        npm publish
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  用户项目编译时 (vite-plugin-cssts)                          │
├─────────────────────────────────────────────────────────────┤
│  1. 加载 atoms.json（判断标识符是否是原子类）                 │
│  2. 作用域分析（区分局部变量和原子类）                        │
│  3. 扫描用户代码中使用的原子类                               │
│  4. 生成 CsstsAtom.ts（只包含使用的原子类实现）              │
│  5. 生成 atoms.css（只包含使用的 CSS 样式）                  │
└─────────────────────────────────────────────────────────────┘
```

### 类型定义结构

```typescript
// CsstsAtoms.d.ts - 唯一数据源
export interface CsstsAtoms {
  readonly displayFlex: { 'display-flex': true }
  readonly positionRelative: { 'position-relative': true }
  // ...
}

// global.d.ts - 引用接口
import type { CsstsAtoms } from './CsstsAtoms'

declare global {
  const displayFlex: CsstsAtoms['displayFlex']
  const positionRelative: CsstsAtoms['positionRelative']
  // ...
}
```

**设计原因**：接口是唯一数据源，全局声明引用接口，保证类型一致性。

## 语法说明

### css {} 表达式

```typescript
// 基础用法
const style = css { displayFlex, alignItemsCenter, padding16 }

// 编译后
const style = cssts.$cls(csstsAtom.displayFlex, csstsAtom.alignItemsCenter, csstsAtom.padding16)
```

### 变量展开

使用 `...` 展开已定义的样式变量：

```typescript
const baseStyle = css { displayFlex, alignItemsCenter }

// 展开变量
const buttonStyle = css { ...baseStyle, backgroundColorPrimary, colorWhite }

// 编译后
const buttonStyle = cssts.$cls(baseStyle, csstsAtom.backgroundColorPrimary, csstsAtom.colorWhite)
```

### 条件样式

```typescript
const buttonClass = computed(() => {
  return css {
    ...baseStyle,
    ...typeStyles[props.type],
    props.disabled && css { isDisabled, cursorNotAllowed },
    props.loading && css { isLoading },
    props.round && css { borderRadiusFull }
  }
})
```

### 样式替换

```typescript
// 原子类替换
const style = css { backgroundColorPrimary, colorWhite }
style.backgroundColorPrimary = css backgroundColorSuccess

// CSS 属性名替换
style.backgroundColor = css backgroundColorDanger
```

## 原子类分类

### 布局 (Layout)
```typescript
css { displayFlex }              // display: flex
css { displayInlineFlex }        // display: inline-flex
css { displayBlock }             // display: block
css { displayNone }              // display: none
css { displayGrid }              // display: grid
```

### Flex 布局
```typescript
css { flexDirectionRow }         // flex-direction: row
css { flexDirectionColumn }      // flex-direction: column
css { justifyContentCenter }     // justify-content: center
css { justifyContentBetween }    // justify-content: space-between
css { alignItemsCenter }         // align-items: center
css { alignItemsStretch }        // align-items: stretch
css { flexWrapWrap }             // flex-wrap: wrap
```

### 定位 (Position)
```typescript
css { positionRelative }         // position: relative
css { positionAbsolute }         // position: absolute
css { positionFixed }            // position: fixed
css { positionSticky }           // position: sticky
```

### 间距 (Spacing)
```typescript
css { padding4 }                 // padding: 4px
css { padding8 }                 // padding: 8px
css { padding16 }                // padding: 16px
css { margin8 }                  // margin: 8px
css { marginAuto }               // margin: auto
css { gap8 }                     // gap: 8px
```

### 尺寸 (Sizing)
```typescript
css { width100 }                 // width: 100px
css { widthFull }                // width: 100%
css { widthAuto }                // width: auto
css { height32 }                 // height: 32px
css { heightFull }               // height: 100%
```

### 排版 (Typography)
```typescript
css { fontSize14 }               // font-size: 14px
css { fontSize16 }               // font-size: 16px
css { fontWeightNormal }         // font-weight: 400
css { fontWeightBold }           // font-weight: 700
css { textAlignCenter }          // text-align: center
```

### 颜色 (Colors)
```typescript
css { colorWhite }               // color: #ffffff
css { colorBlack }               // color: #000000
css { backgroundColorPrimary }   // background-color: var(--color-primary)
css { backgroundColorSuccess }   // background-color: var(--color-success)
```

### 边框 (Border)
```typescript
css { borderNone }               // border: none
css { borderRadius4 }            // border-radius: 4px
css { borderRadius8 }            // border-radius: 8px
css { borderRadiusFull }         // border-radius: 9999px
```

### 效果 (Effects)
```typescript
css { cursorPointer }            // cursor: pointer
css { cursorNotAllowed }         // cursor: not-allowed
css { transitionAll }            // transition: all 0.2s
css { userSelectNone }           // user-select: none
```

### 状态 (States)
```typescript
css { isDisabled }               // 禁用状态
css { isLoading }                // 加载状态
css { isActive }                 // 激活状态
css { isError }                  // 错误状态
```

## 使用示例

### Button 组件

```typescript
view Button(props) {
  // 基础样式
  const baseStyle = css {
    displayInlineFlex,
    justifyContentCenter,
    alignItemsCenter,
    height32,
    padding8,
    fontSize14,
    fontWeightMedium,
    borderRadius4,
    cursorPointer,
    transitionAll
  }
  
  // 类型样式
  const typeStyles = {
    default: css { backgroundColorWhite, colorBlack },
    primary: css { backgroundColorPrimary, colorWhite },
    success: css { backgroundColorSuccess, colorWhite },
    danger: css { backgroundColorDanger, colorWhite }
  }
  
  // 组合样式
  const buttonClass = computed(() => {
    return css {
      ...baseStyle,
      ...typeStyles[props.type || 'default'],
      props.disabled && css { isDisabled, cursorNotAllowed },
      props.round && css { borderRadiusFull }
    }
  })

  button(class = buttonClass.value) {
    props.children
  }
}
```

## 配置

### Vite 插件

```typescript
// vite.config.ts
import cssTsPlugin from 'vite-plugin-cssts'

export default defineConfig({
  plugins: [
    cssTsPlugin({
      // 生成的原子类文件路径
      atomOutput: 'src/cssts/CsstsAtom.ts',
      // 编译后导入路径
      atomImport: './cssts/CsstsAtom',
      // 类名前缀
      classPrefix: 'cu-'
    })
  ]
})
```

## 运行时 API

### cssts.$cls(...args)

合并多个样式，支持条件表达式：

```typescript
cssts.$cls(
  baseStyle,                    // 样式对象
  isActive && activeStyle,      // 条件样式（false 时忽略）
  null,                         // 忽略
  undefined                     // 忽略
)
```

### cssts.replace(style, key, newAtom)

替换样式中的原子类：

```typescript
// 原子类替换
cssts.replace(style, "backgroundColorPrimary", "backgroundColorSuccess")

// CSS 属性名替换
cssts.replace(style, "backgroundColor", "backgroundColorDanger")
```

## 项目结构

```
cssts/                    # 核心编译器
├── src/
│   ├── parser/          # css 软关键字解析器
│   ├── factory/         # CST → AST 转换（含作用域分析）
│   ├── runtime/         # 运行时函数
│   └── utils/           # 工具函数

cssts-types/              # 类型定义包
├── CsstsAtoms.d.ts      # 接口定义（唯一数据源）
├── global.d.ts          # 全局声明（引用接口）
├── dist/atoms.json      # 原子类名称列表（编译时用）
└── generator/           # 生成器（从 mdn-data 生成）

vite-plugin-cssts/        # Vite 插件
└── src/index.ts         # 编译转换 + 按需生成
```

## 数据来源

原子类定义从 `mdn-data` 包自动生成，包含：
- 所有标准 CSS 属性
- 每个属性的可用关键字值
- 常用数值变体（padding、margin、font-size 等）

## License

MIT
