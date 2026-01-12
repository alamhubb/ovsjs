# uni-render-template

[![license](https://img.shields.io/npm/l/uni-render.svg)](https://github.com/AlamHubb/uni-render/blob/main/LICENSE)

> UniApp + Vue 渲染函数项目模板，由 [create-uni-render](https://www.npmjs.com/package/create-uni-render) 脚手架使用

## 📦 快速开始

### 方式一：使用脚手架创建（推荐）

```bash
# 使用 npx 创建新项目
npx create-uni-render

# 或指定项目名
npx create-uni-render my-project

# 进入项目目录
cd my-uni-render-project

# 安装依赖
npm install

# 启动 H5 开发
npm run dev:h5

# 启动微信小程序开发
npm run dev:mp-weixin
```

### 方式二：手动克隆

```bash
# 克隆模板仓库
git clone https://gitee.com/alamhubb/uni-render-template.git my-project

# 进入项目目录
cd my-project

# 安装依赖
npm install

# 启动开发
npm run dev:h5
```

### 方式三：在现有项目中安装

如果你已有 UniApp 项目，需要手动完成以下配置：

#### 1. 安装依赖

```bash
# 安装核心依赖
npm install uni-render vite-plugin-uni-render

# 或使用 pnpm
pnpm add uni-render vite-plugin-uni-render
```

#### 2. 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { uniRender } from 'vite-plugin-uni-render'

export default defineConfig({
  plugins: [
    uniRender(),
    uni()
  ]
})
```

#### 3. 配置 pages.json（必须）

⚠️ **重要**：必须在 `pages.json` 中配置 `easycom`，否则 `<render-component>` 组件无法被识别：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "render-component": "uni-render/src/components/RenderComponent"
    }
  },
  "pages": [
    // ... 你的页面配置
  ]
}
```

## 📁 项目结构

```
uni-render-template/
├── src/
│   ├── pages/
│   │   └── index/
│   │       ├── index.vue                    # Page 组件（渲染函数入口）
│   │       └── components/
│   │           ├── HelloWorld.vue           # 渲染函数组件示例
│   │           └── HelloWorldTemplate.vue   # 模板组件示例
│   ├── static/
│   │   ├── logo.png                         # UniApp logo
│   │   └── renderlogo.png                   # uni-render logo
│   ├── App.vue                              # 应用入口
│   ├── main.ts                              # UniApp 入口文件
│   ├── pages.json                           # 页面配置
│   ├── manifest.json                        # 应用配置
│   ├── style.css                            # 全局样式
│   └── uni.scss                             # UniApp 样式变量
├── vite.config.ts                           # Vite 配置（已配置 uniRender 插件）
├── package.json
├── tsconfig.json
└── index.html
```

## ✨ 模板特性

- ✅ **开箱即用**：已预配置 `uni-render` 和 `vite-plugin-uni-render`
- ✅ **TypeScript 支持**：默认使用 TypeScript 开发
- ✅ **双模式示例**：同时包含渲染函数和模板两种写法的组件示例
- ✅ **多平台支持**：支持 H5、微信小程序、支付宝小程序等平台
- ✅ **RenderComponent 配置**：已在 `pages.json` 中配置 easycom

## 🎯 组件写法对比

### 渲染函数模式（HelloWorld.vue）

```vue
<script lang="ts">
import { ref, h, defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: { type: String, required: true }
  },
  setup(props) {
    const count = ref(0)

    return () => h('div', {}, [
      h('h1', {}, props.msg),
      h('button', {
        onClick: () => count.value++
      }, `count is ${count.value}`)
    ])
  }
})
</script>
```

### 模板模式（HelloWorldTemplate.vue）

```vue
<template>
  <div>
    <h1>{{ msg }}</h1>
    <button @click="count++">count is {{ count }}</button>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: { type: String, required: true }
  },
  setup() {
    const count = ref(0)
    return { count }
  }
})
</script>
```

> **说明**：两种写法都能正常工作，`vite-plugin-uni-render` 会自动处理转换。

## ⚙️ 配置说明

### vite.config.ts

```typescript
import { defineConfig } from "vite"
import { uniRender } from "vite-plugin-uni-render"
import uni from "@dcloudio/vite-plugin-uni"

export default defineConfig({
  plugins: [
    uniRender(),
    uni()
  ]
})
```

### pages.json

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "render-component": "uni-render/src/components/RenderComponent"
    }
  },
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "uni-render"
      }
    }
  ]
}
```

## 📜 可用脚本

### 开发

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发模式 |
| `npm run dev:mp-weixin` | 微信小程序开发模式 |
| `npm run dev:mp-alipay` | 支付宝小程序开发模式 |
| `npm run dev:mp-baidu` | 百度小程序开发模式 |
| `npm run dev:mp-qq` | QQ 小程序开发模式 |
| `npm run dev:mp-toutiao` | 字节跳动小程序开发模式 |
| `npm run dev:mp-lark` | 飞书小程序开发模式 |
| `npm run dev:mp-kuaishou` | 快手小程序开发模式 |
| `npm run dev:mp-jd` | 京东小程序开发模式 |
| `npm run dev:mp-xhs` | 小红书小程序开发模式 |
| `npm run dev:mp-harmony` | 鸿蒙开发模式 |

### 构建

| 命令 | 说明 |
|------|------|
| `npm run build:h5` | H5 生产构建 |
| `npm run build:mp-weixin` | 微信小程序构建 |
| `npm run build:mp-alipay` | 支付宝小程序构建 |
| ... | 其他平台类似 |

### 其他

| 命令 | 说明 |
|------|------|
| `npm run type-check` | TypeScript 类型检查 |

## 🔗 相关链接

- [uni-render](https://www.npmjs.com/package/uni-render) - 核心运行时库
- [vite-plugin-uni-render](https://www.npmjs.com/package/vite-plugin-uni-render) - Vite 插件
- [create-uni-render](https://www.npmjs.com/package/create-uni-render) - 项目脚手架
- [GitHub 仓库](https://github.com/AlamHubb/uni-render)
- [Gitee 仓库](https://gitee.com/alamhubb/uni-render-template)

## 📄 License

MIT
