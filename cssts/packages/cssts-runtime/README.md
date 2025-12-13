# cssts-runtime

> CssTs 运行时 - 样式合并与冲突处理

## 设计理念

`cssts-runtime` 是一个**纯净的运行时包**，不包含任何 CSS 属性数据。

属性数据（properties.json）由 `cssts-compiler` 在编译时生成，通过 `vite-plugin-cssts` 注入到运行时。这样设计的好处：

1. **零依赖** - 运行时不依赖任何包，体积最小
2. **按需生成** - 属性数据根据用户配置动态生成
3. **可定制** - 用户可以自定义属性范围和数值配置

## 架构

```
编译时 (cssts-compiler)          运行时 (cssts-runtime)
┌─────────────────────┐         ┌─────────────────────┐
│ 1. 读取用户配置      │         │                     │
│ 2. 生成 properties  │  注入   │ initProperties()    │
│    .json            │ ──────> │ 接收属性映射数据     │
│                     │         │                     │
└─────────────────────┘         │ $cls()              │
                                │ replace()           │
                                │ getCssClassName()   │
                                └─────────────────────┘
```

## 安装

```bash
npm install cssts-runtime
```

## 初始化

运行时需要属性映射数据才能工作，由 vite-plugin-cssts 自动注入：

```typescript
import { initProperties } from 'cssts-runtime'

// vite 插件在编译时注入这段代码
initProperties({
  "paddingTop": "padding-top",
  "zIndex": "z-index",
  // ... 编译时生成的属性映射
})
```

## 核心功能

### $cls - 样式合并

```typescript
import { $cls } from 'cssts-runtime'

const style = $cls(displayFlex, alignItemsCenter, gap16px)
// → { 'display_flex': true, 'align-items_center': true, 'gap_16px': true }

// 条件样式
const buttonStyle = $cls(
  paddingX16px,
  isDisabled && opacity50pct
)
```

### replace - 样式替换

基于 CSS 属性冲突检测，智能替换：

```typescript
import { replace } from 'cssts-runtime'

const style = 'color_red font-weight_bold'
const newStyle = replace(style, 'color', 'colorGreen')
// → 'font-weight_bold color_green'
```

### getCssClassName / getCssProperty

```typescript
import { getCssClassName, getCssProperty } from 'cssts-runtime'

getCssClassName('paddingTop16px')  // → 'padding-top_16px'
getCssProperty('paddingTop16px')   // → 'padding-top'
```

## 属性名解析原理

使用 properties.json 做**最长前缀匹配**：

```typescript
// 输入: "paddingTop16px"
// properties.json: { "paddingTop": "padding-top", "padding": "padding", ... }
// 
// 按长度降序匹配，找到 "paddingTop" → "padding-top"
// 输出: { property: "padding-top", value: "16px" }
```

这就是为什么需要 properties.json - 让运行时知道 `paddingTop` 对应 `padding-top`。

## 命名规范

| TS 变量名 | CSS 类名 | CSS 规则 |
|-----------|----------|----------|
| `displayFlex` | `display_flex` | `display: flex` |
| `paddingTop16px` | `padding-top_16px` | `padding-top: 16px` |
| `width50pct` | `width_50\%` | `width: 50%` |
| `zIndexN1` | `z-index_-1` | `z-index: -1` |

## 许可证

MIT
