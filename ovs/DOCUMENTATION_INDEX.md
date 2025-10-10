# OVS 文档索引

> 所有文档的导航指南

## 📖 主文档

### **[aireadme.md](aireadme.md)** - 项目主入口 🚪
- 5分钟快速开始
- 核心特性概览
- 功能矩阵
- 示例代码
- 文档导航

**推荐首先阅读！**

---

## 👤 用户文档

### **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - 完整用户指南
**内容：**
- 详细的语法规则
- 所有支持的功能（基础 + 高级）
- 完整代码示例
- 最佳实践
- 常见问题解答

**适合：** 想深入学习 OVS 的开发者

---

### **[test-cases/README.md](test-cases/README.md)** - 测试用例集合
**内容：**
- 8个完整测试用例
- 每个用例的代码和说明
- 使用方法
- 测试矩阵

**适合：** 想通过示例快速学习

---

## 🔧 技术文档

### **[docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** - 实现原理
**内容：**
- 编译流程详解
- 核心实现机制（计数器、智能导出）
- 架构设计
- 修改的文件清单
- 设计决策说明

**适合：** 想了解内部实现的开发者

---

### **[docs/OVS_RENDER_DOM_VIEW_DECLARATION.md](docs/OVS_RENDER_DOM_VIEW_DECLARATION.md)** - 渲染机制
**内容：**
- OVS 元素的渲染规则
- ExpressionStatement 自动渲染原理
- 计数器机制详解
- 嵌套支持实现

**适合：** 想理解渲染原理的开发者

---

## 🧪 测试和示例

### 测试用例文件（test-cases/）

**基础功能（5个）：**
1. `case1-simple.ovs` - 基础声明和表达式
2. `case2-nested.ovs` - 多层嵌套
3. `case3-conditional.ovs` - if 条件渲染
4. `case4-multiple-views.ovs` - 多个视图
5. `case5-variables.ovs` - 变量使用

**高级功能（3个）：**
6. `case7-function.ovs` - Function 声明
7. `case8-arrow-function.ovs` - 箭头函数 ⭐ 已验证
8. `case9-loops.ovs` - For/While 循环
9. `case10-class.ovs` - Class 声明 ⚠️

---

## 📁 文档结构

```
ovs/
├── aireadme.md                    # 📖 主入口
├── readme.md                      # 简介（指向 aireadme.md）
├── DOCUMENTATION_INDEX.md         # 📋 本文件
│
├── docs/                          # 详细文档
│   ├── USER_GUIDE.md             # 👤 用户指南
│   ├── IMPLEMENTATION.md         # 🔧 实现原理
│   └── OVS_RENDER_DOM_VIEW_DECLARATION.md  # 渲染机制
│
└── test-cases/                    # 测试用例
    ├── README.md                  # 🧪 用例说明
    ├── case1-simple.ovs
    ├── case2-nested.ovs
    ├── case3-conditional.ovs
    ├── case4-multiple-views.ovs
    ├── case5-variables.ovs
    ├── case7-function.ovs
    ├── case8-arrow-function.ovs
    ├── case9-loops.ovs
    └── case10-class.ovs
```

---

## 🎯 推荐阅读路径

### 路径 1: 快速上手
1. **aireadme.md** - 了解核心特性
2. **test-cases/README.md** - 查看示例
3. 复制用例到 hello.ovs - 开始实践

### 路径 2: 深入学习
1. **aireadme.md** - 核心概念
2. **docs/USER_GUIDE.md** - 完整语法
3. **docs/IMPLEMENTATION.md** - 实现原理
4. **test-cases/** - 实践所有示例

### 路径 3: 技术研究
1. **docs/IMPLEMENTATION.md** - 架构设计
2. **docs/OVS_RENDER_DOM_VIEW_DECLARATION.md** - 渲染原理
3. **源码** - src/ 目录

---

## 🔍 快速查找

### 想学习语法？
→ [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

### 想看示例？
→ [test-cases/README.md](test-cases/README.md)

### 想了解原理？
→ [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)

### 想快速开始？
→ [aireadme.md](aireadme.md)

---

## 📞 相关链接

- **开发服务器：** http://localhost:5173
- **测试命令：** `npx tsx ovs/src/test-final.ts`
- **GitHub：** https://github.com/alamhubb/ovs

---

**返回主文档：** [aireadme.md](aireadme.md)

