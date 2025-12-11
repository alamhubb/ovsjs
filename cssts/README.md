# CssTs - CSS-in-TypeScript

> 编译时 CSS 类名管理系统，提供类型安全的原子类组合能力

## 核心特性

- **类型安全** - TypeScript 原生支持，IDE 智能提示
- **原子类组合** - 使用 `css` 声明语法或字符串组合原子类
- **编译时转换** - 零运行时开销
- **可配置前缀** - 支持自定义类名前缀（如 `el-`）

## 语法说明

### css {} 表达式语法（推荐）

在 `.ovs` 或 `.vue` 文件中使用 `css { }` 表达式：

```typescript
// 定义样式变量
const baseStyle = css { inlineFlex, justifyCenter, itemsCenter, paddingSm, rounded }

// 在对象中使用
const typeStyles = {
  primary: css { bgPrimary, colorWhite, borderPrimary },
  success: css { bgSuccess, colorWhite, borderSuccess },
  danger: css { bgDanger, colorWhite, borderDanger }
}

// 组合使用
const buttonClass = [baseStyle, typeStyles.primary].join(' ')

// 编译后输出
// baseStyle = "inline-flex justify-center items-center padding-sm rounded"
// typeStyles.primary = "bg-primary color-white border-primary"
```

### 命名规则

原子类名遵循驼峰 → kebab-case 转换：

| 驼峰命名 | CSS 类名 |
|---------|---------|
| `bgPrimary` | `bg-primary` |
| `colorWhite` | `color-white` |
| `fontSize14` | `font-size-14` |
| `height32` | `height-32` |
| `paddingSm` | `padding-sm` |

## 原子类分类

### 布局 (Layout)
```typescript
css { flex }           // display: flex
css { inlineFlex }     // display: inline-flex
css { block }          // display: block
css { hidden }         // display: none
css { itemsCenter }    // align-items: center
css { justifyCenter }  // justify-content: center
css { flexCol }        // flex-direction: column
```

### 间距 (Spacing)
```typescript
css { paddingXs }      // padding: 4px 8px
css { paddingSm }      // padding: 8px 15px
css { paddingMd }      // padding: 10px 20px
css { paddingLg }      // padding: 12px 24px
css { marginRight6 }   // margin-right: 6px
```

### 尺寸 (Sizing)
```typescript
css { height32 }       // height: 32px
css { width100 }       // width: 100px
css { widthFull }      // width: 100%
```

### 排版 (Typography)
```typescript
css { fontSize12 }     // font-size: 12px
css { fontSize14 }     // font-size: 14px
css { fontSize16 }     // font-size: 16px
css { fontMedium }     // font-weight: 500
css { fontBold }       // font-weight: 700
css { textCenter }     // text-align: center
```

### 颜色 (Colors)
```typescript
// 文字颜色
css { colorWhite }     // color: #ffffff
css { colorBlack }     // color: #303133
css { colorRegular }   // color: #606266

// 背景颜色 (Element Plus 主题)
css { bgPrimary }      // background-color: #409eff
css { bgSuccess }      // background-color: #67c23a
css { bgWarning }      // background-color: #e6a23c
css { bgDanger }       // background-color: #f56c6c
css { bgInfo }         // background-color: #909399
css { bgWhite }        // background-color: #ffffff
```

### 边框 (Border)
```typescript
css { border }         // border: 1px solid #dcdfe6
css { borderBase }     // border-color: #dcdfe6
css { borderPrimary }  // border-color: #409eff
css { rounded }        // border-radius: 4px
css { roundedFull }    // border-radius: 9999px
```

### 效果 (Effects)
```typescript
css { cursorPointer }     // cursor: pointer
css { cursorNotAllowed }  // cursor: not-allowed
css { transition }        // transition: 0.1s
css { selectNone }        // user-select: none
css { outlineNone }       // outline: none
```

### 状态 (States)
```typescript
css { isDisabled }     // opacity: 0.5; pointer-events: none
css { isLoading }      // pointer-events: none
```

## 使用示例

### 在 OVS 组件中使用

```typescript
import { computed } from 'vue'

view Button(props) {
  // 基础样式 - css {} 编译为字符串
  const baseStyle = css {
    inlineFlex,
    justifyCenter,
    itemsCenter,
    height32,
    paddingSm,
    fontSize14,
    fontMedium,
    border,
    rounded,
    cursorPointer,
    transition
  }
  
  // 类型样式映射
  const typeStyles = {
    default: css { bgWhite, colorRegular, borderBase },
    primary: css { bgPrimary, colorWhite, borderPrimary },
    success: css { bgSuccess, colorWhite, borderSuccess },
    warning: css { bgWarning, colorWhite, borderWarning },
    danger: css { bgDanger, colorWhite, borderDanger }
  }
  
  // 计算类名
  const buttonClass = computed(() => {
    const classes = [baseStyle]
    const type = props.type || 'default'
    classes.push(typeStyles[type])
    
    if (props.disabled) classes.push(css { isDisabled, cursorNotAllowed })
    if (props.round) classes.push(css { roundedFull })
    
    return classes.join(' ')
  })

  button(class = buttonClass.value) {
    props.children
  }
}
```

### 编译结果

上面的代码编译后：

```javascript
const baseStyle = "inline-flex justify-center items-center height-32 padding-sm font-size-14 font-medium border rounded cursor-pointer transition"

const typeStyles = {
  default: "bg-white color-regular border-base",
  primary: "bg-primary color-white border-primary",
  // ...
}
```

## 配置

### Vite 插件配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssTsPlugin from 'vite-plugin-cssts'

export default defineConfig({
  plugins: [
    cssTsPlugin({
      // 类名前缀（可选）
      classPrefix: 'el-'  // 生成 el-bg-primary 而不是 bg-primary
    }),
    vue()
  ]
})
```

### 前缀配置

通过 `classPrefix` 选项可以为所有生成的类名添加前缀：

```typescript
// 无前缀（默认）
css { bgPrimary }  // → "bg-primary"

// 配置 classPrefix: 'el-'
css { bgPrimary }  // → "el-bg-primary"
```

## 编译原理

### 转换流程

```
源代码                          编译后
css { bgPrimary, colorWhite }  →  "bg-primary color-white"
```

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        编译时                                │
├─────────────────────────────────────────────────────────────┤
│  .ovs / .vue 文件                                           │
│  const style = css { bgPrimary, colorWhite }                │
│                         ↓                                    │
│  vite-plugin-cssts (编译时转换)                              │
│                         ↓                                    │
│  const style = "bg-primary color-white"                     │
├─────────────────────────────────────────────────────────────┤
│                        运行时                                │
├─────────────────────────────────────────────────────────────┤
│  直接使用字符串类名，零运行时开销                             │
│  <button class="bg-primary color-white">                    │
└─────────────────────────────────────────────────────────────┘
```

## 类型定义

CssTs 提供完整的 TypeScript 类型定义，确保原子类名的类型安全：

```typescript
// cssts-types/global.d.ts
declare global {
  // 布局原子类
  const flex: string
  const inlineFlex: string
  const itemsCenter: string
  const justifyCenter: string
  
  // 颜色原子类
  const bgPrimary: string
  const bgSuccess: string
  const colorWhite: string
  
  // ... 更多原子类
}
```

## 项目结构

```
cssts/                    # 核心库
├── src/
│   ├── parser/          # css 软关键字解析器
│   ├── factory/         # CST → AST 转换
│   └── utils/           # 工具函数（camelToKebab 等）
│
cssts-types/              # 类型定义
├── layout/              # 布局相关类型
├── spacing/             # 间距相关类型
├── sizing/              # 尺寸相关类型
├── typography/          # 排版相关类型
├── color/               # 颜色相关类型
├── border/              # 边框相关类型
├── effects/             # 效果相关类型
├── states/              # 状态相关类型
└── global.d.ts          # 全局类型声明
│
cssts-theme-element/      # Element Plus 主题
├── color.d.ts           # 语义化颜色（colorPrimary 等）
├── background-color.d.ts
└── border-color.d.ts
│
vite-plugin-cssts/        # Vite 插件
└── src/index.ts         # 插件实现
│
create-cssts/             # 项目脚手架
└── template/            # Vue + Vite 模板
```

## 样式冲突替换

CssTs 支持智能的样式冲突替换功能。当两个原子类属于同一 CSS 属性类别时，新样式会自动替换旧样式。

### 属性类别映射

每个原子类都有对应的 CSS 属性类别：

| 原子类 | CSS 属性类别 |
|-------|-------------|
| `colorRed`, `colorWhite`, `colorPrimary` | `color` |
| `bgPrimary`, `bgSuccess`, `bgWhite` | `background-color` |
| `fontSize12`, `fontSize14`, `fontSize16` | `font-size` |
| `paddingSm`, `paddingMd`, `paddingLg` | `padding` |
| `rounded`, `roundedFull` | `border-radius` |

### 使用示例

```typescript
import { replaceConflictingStyles } from 'cssts'

// 基础样式
const baseStyle = css { colorRed, fontBold, paddingSm }
// 输出: "color-red font-bold padding-sm"

// 替换颜色
const newStyle = replaceConflictingStyles(
  ['color-red', 'font-bold', 'padding-sm'],
  ['color-green']
)
// 输出: ['font-bold', 'padding-sm', 'color-green']
// color-red 被 color-green 替换（都属于 color 属性）
```

### 在组件中使用

```typescript
view Button(props) {
  const baseStyle = css { bgPrimary, colorWhite, paddingSm }
  
  // 用户可以覆盖样式
  const finalStyle = computed(() => {
    if (props.customBg) {
      // 如果用户传入 bgSuccess，会自动替换 bgPrimary
      return replaceConflictingStyles(
        baseStyle.split(' '),
        props.customBg.split(' ')
      ).join(' ')
    }
    return baseStyle
  })
  
  button(class = finalStyle) { props.children }
}
```

### 自定义属性映射

可以注册自定义的原子类 → CSS 属性映射：

```typescript
import { registerCssPropertyMap } from 'cssts'

registerCssPropertyMap({
  myCustomRed: 'color',
  myCustomBlue: 'color',
  myBgGradient: 'background',
})
```

## 与其他方案对比

| 特性 | 传统 CSS | Tailwind | CssTs |
|------|----------|----------|-------|
| 类型安全 | ❌ | ❌ | ✅ |
| IDE 智能提示 | ❌ | 插件 | ✅ 原生 |
| 编译时检查 | ❌ | ❌ | ✅ |
| 运行时开销 | 无 | 无 | 无 |
| 样式组合 | 手动拼接 | 手动拼接 | css {} 语法 |
| 样式冲突替换 | ❌ | ❌ | ✅ |
| 可配置前缀 | ❌ | ✅ | ✅ |

## License

MIT
