# 火速帮 HelloWorld

这是一个使用 Vite + Vue 3 + OVS 构建的简单示例项目。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
huosubang/
├── src/
│   ├── assets/          # 样式文件
│   ├── components/      # 组件
│   │   └── HelloWorld.ovs  # OVS 组件
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
└── tsconfig.json        # TypeScript 配置
```

## 技术栈

- [Vite](https://vite.dev/) - 下一代前端构建工具
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [OVS](https://github.com/alamhubb/ovsjs) - Vue 的 DSL 语法扩展
