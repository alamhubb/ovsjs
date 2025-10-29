# GuideBot - OVS 完整应用示例

> 一个使用 OVS 语法构建的 AI 驱动的网站开发工具 UI 演示

## 🎯 项目简介

**GuideBot** 是一个使用 OVS（Object-oriented View Syntax）语法构建的完整 Web 应用示例，展示了如何用 OVS 创建具有复杂交互的现代 Web 应用。

### 功能特性

- ✅ **三栏布局**：聊天面板 + 实时预览 + 需求文档
- ✅ **响应式交互**：任务管理功能（添加、完成、删除）
- ✅ **OVS 语法**：完整展示 OVS 的 `div { }` 语法
- ✅ **Vue 3 集成**：与 Vue 3 响应式系统完美配合
- ✅ **现代 UI**：简洁美观的用户界面

---

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录
npm install

# 进入 guidebot 目录
cd guidebot
```

### 运行项目

```bash
npm run dev
```

访问 http://localhost:5173/ 查看效果

### 构建生产版本

```bash
npm run build
```

---

## 📂 项目结构

```
guidebot/
├── src/
│   ├── views/
│   │   └── GuideBot.ovs      # 主应用组件（OVS 语法）
│   ├── main.ts               # 应用入口
│   └── style.css             # 样式文件
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── package.json              # 项目配置
└── README.md                 # 本文件
```

---

## 💡 核心代码说明

### GuideBot.ovs - OVS 语法示例

```javascript
export class GuideBot {
    render() {
        return div({ class: 'container' }) {
            // 左侧聊天面板
            div({ class: 'chat-panel' }) {
                h1 { 'GuideBot' }
                // ... 更多内容
            }
            
            // 中间预览区
            div({ class: 'preview-panel' }) {
                // 任务列表
                this.tasks.map(task =>
                    div({ class: 'task-item' }) {
                        span { task.title }
                    }
                )
            }
            
            // 右侧文档区
            div({ class: 'doc-panel' }) {
                h2 { '需求文档' }
            }
        }
    }
}
```

### 响应式数据

GuideBot 使用 Vue 3 的响应式系统管理状态：

```javascript
initData() {
    this.tasks = [
        { id: 1, title: '完成项目需求文档', completed: false },
        { id: 2, title: '设计页面布局', completed: true }
    ]
    this.newTaskInput = ''
}

addTask() {
    if (this.newTaskInput.trim()) {
        this.tasks.push({
            id: Date.now(),
            title: this.newTaskInput,
            completed: false
        })
        this.newTaskInput = ''
    }
}
```

---

## 🎨 技术栈

- **OVS** - Object-oriented View Syntax
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 超集

---

## 📖 学习要点

### 1. OVS 语法的实际应用

GuideBot 展示了 OVS 的核心语法特性：

- **嵌套结构**：`div { div { h1 { } } }`
- **属性传递**：`div({ class: 'container' })`
- **事件处理**：`onClick: () => this.addTask()`
- **列表渲染**：`this.tasks.map(task => ...)`
- **条件样式**：动态 class 绑定

### 2. 组件化设计

使用 class 封装组件逻辑：

```javascript
export class GuideBot {
    constructor() { }      // 构造函数
    initData() { }         // 数据初始化
    addTask() { }          // 业务方法
    render() { }           // 渲染方法
}
```

### 3. Vue 3 集成

在 `main.ts` 中挂载组件：

```typescript
import { createApp } from 'vue'
import { GuideBot } from './views/GuideBot.ovs'

const app = createApp(GuideBot)
app.mount('#app')
```

### 4. Vite 插件配置

在 `vite.config.ts` 中启用 OVS 支持：

```typescript
import vitePluginOvs from '../ovs/src/index.ts'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginOvs()  // 处理 .ovs 文件
  ]
})
```

---

## 🌟 特色功能

### 三栏自适应布局

- **左侧（30%）**：AI 对话交互区
- **中间（50%）**：实时预览区
- **右侧（20%）**：需求文档区

### 任务管理功能

- ✅ 添加新任务
- ✅ 标记任务完成
- ✅ 实时更新界面
- ⏳ 删除任务（待添加）

### 交互式选项卡

提供快捷操作选项：
- 💡 添加删除按钮
- 🎨 修改颜色风格
- 📝 添加任务分类
- ✏️ 自定义描述

---

## 🎯 应用场景

### 1. OVS 语法学习

完整展示 OVS 的各种语法特性和最佳实践。

### 2. 快速原型开发

演示如何用 OVS 快速构建交互式应用原型。

### 3. UI 组件开发

展示如何用 OVS 创建可复用的 UI 组件。

### 4. 设计系统参考

提供现代 Web 应用的布局和交互设计参考。

---

## 🔧 自定义开发

### 添加新功能

1. 在 `GuideBot` 类中添加新方法
2. 在 `render()` 中使用 OVS 语法调用
3. 在 `style.css` 中添加样式

### 示例：添加删除功能

```javascript
// 在 GuideBot 类中添加方法
deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId)
}

// 在 render() 中添加删除按钮
div({ class: 'task-item' }) {
    span { task.title }
    button({ 
        onClick: () => this.deleteTask(task.id) 
    }) { '删除' }
}
```

---

## 💻 开发建议

### VS Code 设置

为获得更好的开发体验，建议安装：
- Volar（Vue 3 支持）
- TypeScript Vue Plugin (Volar)

### 热重载

Vite 支持模块热替换（HMR），修改代码后自动更新页面。

### 调试技巧

1. 使用 Vue DevTools 查看组件状态
2. 在浏览器控制台查看编译后的代码
3. 使用 `console.log` 调试数据流

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 改进方向

- [ ] 添加删除任务功能
- [ ] 实现任务分类
- [ ] 添加搜索过滤
- [ ] 支持数据持久化（localStorage）
- [ ] 添加主题切换
- [ ] 响应式移动端适配

---

## 📄 许可证

MIT License

---

## 👨‍💻 作者

本示例项目展示 OVS 语法的实际应用。

---

_用 OVS 构建现代 Web 应用，简洁、优雅、高效_ ✨

