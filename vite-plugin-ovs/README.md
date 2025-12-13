# vite-plugin-ovs

> Vite 插件，用于处理 `.ovs` 文件并支持 CssTs 原子类语法

## 核心特性

- **OVS 语法支持** - 处理 `.ovs` 文件，转换为 Vue 组件
- **CssTs 集成** - 内部集成 `vite-plugin-cssts`，自动处理 `css {}` 语法
- **按需 CSS** - 只生成项目中使用的原子类样式
- **HMR 支持** - 开发时热更新

## 安装

```bash
npm install vite-plugin-ovs -D
```

## 使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ovs from 'vite-plugin-ovs'

export default defineConfig({
  plugins: [
    vue(),
    ovs({
      cssts: {
        classPrefix: '', // 可选：CSS 类名前缀
      }
    })
  ]
})
```

## 架构设计

### 插件集成

`vite-plugin-ovs` 返回一个插件数组 `[ovsPlugin, csstsPlugin]`：

```typescript
export default function vitePluginOvs(options): Plugin[] {
  return [
    ovsPlugin,           // 处理 .ovs 文件转换
    cssTsPlugin(options.cssts)  // 处理 CSS 生成
  ]
}
```

这种设计的优点：
- **用户只需配置一个插件** - 无需分别配置 OVS 和 CssTs
- **配置透传** - cssts 配置通过 `options.cssts` 透传
- **职责分离** - OVS 负责语法转换，CssTs 负责 CSS 生成

### 工作流程

#### 简化流程

```
.ovs 文件 → vite-plugin-ovs 转换 → 收集原子类 → vite-plugin-cssts 生成 CSS
```

#### 详细流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           编译时 (Vite Build)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OvsButton.ovs                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ const baseStyle = css {                                          │   │
│  │   displayInlineFlex,                                             │   │
│  │   height32px                                                     │   │
│  │ }                                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              vite-plugin-ovs (transform)                         │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  1. OVS Parser 解析（继承 CssTsCstToAst）                         │   │
│  │     - 解析 css {} 语法                                           │   │
│  │     - 收集原子类名: displayInlineFlex, height32px                │   │
│  │                                                                  │   │
│  │  2. AST 转换                                                     │   │
│  │     css { displayInlineFlex, height32px }                        │   │
│  │         ↓                                                        │   │
│  │     cssts.$cls(csstsAtom.displayInlineFlex, csstsAtom.height32px)│   │
│  │                                                                  │   │
│  │  3. 注册原子类到全局收集器                                        │   │
│  │     globalUsedAtoms.add('displayInlineFlex')                     │   │
│  │     globalUsedAtoms.add('height32px')                            │   │
│  │                                                                  │   │
│  │  4. 注入虚拟 CSS 导入                                            │   │
│  │     import 'virtual:cssts.css'                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              vite-plugin-cssts (load)                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  当 Vite 请求 virtual:cssts.css 时：                             │   │
│  │                                                                  │   │
│  │  1. 读取 globalUsedAtoms                                         │   │
│  │     Set { 'displayInlineFlex', 'height32px', ... }               │   │
│  │                                                                  │   │
│  │  2. 调用 generateUsedAtomsCss()                                  │   │
│  │     - getCssClassName('displayInlineFlex') → 'display_inline-flex'│   │
│  │     - getCssProperty('displayInlineFlex') → 'display'            │   │
│  │     - getCssValue('displayInlineFlex') → 'inline-flex'           │   │
│  │                                                                  │   │
│  │  3. 生成 CSS 字符串                                              │   │
│  │     .display_inline-flex { display: inline-flex; }               │   │
│  │     .height_32px { height: 32px; }                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           运行时 (Browser)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. CSS 已加载到页面                                                    │
│     <style>                                                             │
│       .display_inline-flex { display: inline-flex; }                    │
│       .height_32px { height: 32px; }                                    │
│     </style>                                                            │
│                                                                         │
│  2. csstsAtom 对象（来自 cssts-theme-element）                          │
│     csstsAtom.displayInlineFlex = { 'display_inline-flex': true }       │
│     csstsAtom.height32px = { 'height_32px': true }                      │
│                                                                         │
│  3. cssts.$cls() 合并样式                                               │
│     cssts.$cls(csstsAtom.displayInlineFlex, csstsAtom.height32px)       │
│         ↓                                                               │
│     { 'display_inline-flex': true, 'height_32px': true }                │
│                                                                         │
│  4. Vue :class 绑定                                                     │
│     <button class="display_inline-flex height_32px">                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 关键代码位置

| 功能 | 文件 | 说明 |
|------|------|------|
| OVS 解析 | `ovs-compiler/src/factory/OvsCstToSlimeAstUtil.ts` | 继承自 `CssTsCstToAst` |
| 原子类收集 | `ovs-compiler` | `getUsedAtoms()` 方法 |
| 代码转换 | `vite-plugin-ovs/src/index.ts` | `transform()` 钩子 |
| CSS 生成 | `vite-plugin-cssts/src/index.ts` | `generateUsedAtomsCss()` |
| 命名转换 | `cssts/src/runtime/index.ts` | `getCssClassName()`, `getCssProperty()` |
| 运行时合并 | `cssts/src/runtime/index.ts` | `cssts.$cls()` |
| 原子类对象 | `cssts-theme-element/src/index.ts` | `csstsAtom` Proxy |

#### 为什么不会重复解析？

`vite-plugin-cssts` 的 `transform` 钩子只处理 `.cssts` 和 `.vue` 文件，不会处理 `.ovs` 文件：

```typescript
// vite-plugin-cssts transform
transform(code, id) {
  if (id.endsWith('.vue')) { /* 处理 Vue 文件 */ }
  if (id.endsWith('.cssts')) { /* 处理 cssts 文件 */ }
  return null  // .ovs 文件直接跳过
}
```

所以 `.ovs` 文件只会被 `vite-plugin-ovs` 解析一次，`vite-plugin-cssts` 只负责：
- 提供 `virtual:cssts.css` 虚拟模块
- 根据 `globalUsedAtoms` 生成 CSS

## css {} 语法

在 `.ovs` 文件中使用 `css {}` 语法定义样式：

```javascript
// OvsButton.ovs
import { computed } from 'vue'

// 基础样式
const baseStyle = css {
  displayInlineFlex,
  justifyContentCenter,
  alignItemsCenter,
  height32px,
  paddingLeft15px,
  paddingRight15px,
  fontSize14px,
  borderRadius4px,
  cursorPointer
}

// 类型样式
const typeStyles = {
  primary: css { bgPrimary, colorWhite },
  success: css { bgSuccess, colorWhite },
  danger: css { bgDanger, colorWhite }
}

// 组合样式
const buttonClass = computed(() => {
  return css {
    ...baseStyle,
    ...typeStyles[props.type],
    props.disabled && css { opacity0p6, cursorNotAllowed }
  }
})

button(class = buttonClass.value) {
  props.children
}
```

## 命名规范

遵循 CssTs 统一命名规范（详见 `cssts-types/README.md`）：

### CSS 类名格式

`{property}_{value}` - 用下划线分隔属性和值

```css
.display_flex { display: flex; }
.height_32px { height: 32px; }
.justify-content_center { justify-content: center; }
```

### TypeScript 变量名格式

`{property}{Value}` - camelCase 格式

```typescript
displayFlex           // → .display_flex
height32px            // → .height_32px
justifyContentCenter  // → .justify-content_center
```

**重要：数值必须带单位！**
```typescript
// ✅ 正确
height32px, fontSize14px, paddingLeft15px

// ❌ 错误
height32, fontSize14, paddingLeft15
```

## 配置选项

```typescript
interface OvsPluginOptions {
  /**
   * cssts 插件配置（透传给 vite-plugin-cssts）
   */
  cssts?: {
    classPrefix?: string      // CSS 类名前缀
    atomOutput?: string       // 原子类文件输出路径
    autoGenerate?: boolean    // 是否自动生成文件
  }
}
```

## 与其他包的关系

```
vite-plugin-ovs
    ├── 依赖 ovs-compiler      # OVS 语法编译
    ├── 集成 vite-plugin-cssts # CSS 生成
    └── 使用 cssts-theme-element # 主题原子类
```

## License

MIT
