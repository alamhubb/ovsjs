# cssts-theme-element

> CssTs Element Plus 主题包，提供语义化颜色原子类

## 核心特性

- **语义化颜色** - 基于 Element Plus 设计规范的颜色系统
- **CSS 变量** - 支持运行时主题切换
- **双实现** - 提供 CSS 和 CssTs 两种实现方式
- **动态代理** - `csstsAtom` 代理支持任意原子类

## 安装

```bash
npm install cssts-theme-element
```

## 使用

### 方式一：CSS 实现（推荐用于简单场景）

```typescript
import { injectTheme } from 'cssts-theme-element'

// 注入主题 CSS 到页面
injectTheme()
```

### 方式二：CssTs 实现（推荐用于 OVS 项目）

```typescript
import { csstsAtom } from 'cssts-theme-element'

// 在 css {} 语法中使用
const buttonStyle = css {
  ...csstsAtom.bgPrimary,
  ...csstsAtom.colorWhite
}
```

## 颜色系统

### 主色 (Primary)

| 原子类 | CSS 变量 | 用途 |
|--------|----------|------|
| `bgPrimary` | `--el-color-primary` | 主要背景色 |
| `colorPrimary` | `--el-color-primary` | 主要文字色 |
| `borderPrimary` | `--el-color-primary` | 主要边框色 |

### 语义色

| 类型 | 背景原子类 | 文字原子类 | 边框原子类 |
|------|-----------|-----------|-----------|
| Success | `bgSuccess` | `colorSuccess` | `borderSuccess` |
| Warning | `bgWarning` | `colorWarning` | `borderWarning` |
| Danger | `bgDanger` | `colorDanger` | `borderDanger` |
| Info | `bgInfo` | `colorInfo` | `borderInfo` |

### 文字颜色

| 原子类 | CSS 变量 | 用途 |
|--------|----------|------|
| `colorTextPrimary` | `--el-text-color-primary` | 主要文字 |
| `colorTextRegular` | `--el-text-color-regular` | 常规文字 |
| `colorTextSecondary` | `--el-text-color-secondary` | 次要文字 |
| `colorWhite` | `#ffffff` | 白色文字 |

## csstsAtom 动态代理

`csstsAtom` 是一个 Proxy 对象，支持动态生成任意原子类：

```typescript
import { csstsAtom } from 'cssts-theme-element'

// 主题原子类（语义化）
csstsAtom.bgPrimary      // → { 'bg-primary': true }
csstsAtom.colorWhite     // → { 'color-white': true }

// 标准原子类（遵循 property_value 命名规范）
csstsAtom.displayFlex    // → { 'display_flex': true }
csstsAtom.height32px     // → { 'height_32px': true }
```

### 工作原理

```typescript
export const csstsAtom = new Proxy({}, {
  get(_target, prop: string) {
    // 1. 先检查是否是主题原子类
    if (prop in themeAtoms) {
      return themeAtoms[prop]
    }
    // 2. 否则使用 getCssClassName 动态生成
    const className = getCssClassName(prop)
    return { [className]: true }
  }
})
```

## 命名规范

### 主题原子类（语义化）

主题原子类使用语义化命名，不遵循 `property_value` 格式：

```css
.bg-primary { background-color: var(--el-color-primary); }
.color-white { color: #ffffff; }
.border-success { border-color: var(--el-color-success); }
```

### 标准原子类

标准原子类遵循 CssTs 统一命名规范：

```css
.display_flex { display: flex; }
.height_32px { height: 32px; }
```

## 主题定制

### 运行时更新

```typescript
import { updateTheme } from 'cssts-theme-element'

// 更新主题变量
updateTheme({
  '--el-color-primary': '#ff6600',
  '--el-color-success': '#00cc00'
})
```

### 自定义主题

```typescript
import { injectTheme } from 'cssts-theme-element'

// 注入自定义主题
injectTheme({
  '--el-color-primary': '#ff6600',
  '--el-color-success': '#00cc00',
  // ... 其他变量
})
```

## 导出 API

```typescript
// CSS 实现
export { injectTheme, updateTheme, generateThemeCss, themeVariables }

// CssTs 实现
export { csstsAtom, themeAtoms, colorAtoms, bgAtoms, borderAtoms }
```

## 与其他包的关系

```
cssts-theme-element
    ├── 依赖 cssts              # 运行时命名转换
    ├── 被 vite-plugin-ovs 使用 # OVS 项目中的主题支持
    └── 被 .ovs 文件导入        # 提供 csstsAtom
```

## License

MIT
