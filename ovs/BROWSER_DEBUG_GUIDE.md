# 浏览器调试指南 🔍

## 访问地址
👉 **http://localhost:5174/**

---

## 应该看到的内容

### 第 1 个区块（简单视图）
```
Simple Views Test
All optimizations working!
Nested view
```

### 第 2 个区块（for 循环视图）⭐
```
Complex Views Test
apple
banana
cherry
```

### 第 3 个区块（if 条件视图）
```
Conditional Test
Extra content shown!
```

---

## 调试步骤

### 1. 打开浏览器开发者工具（F12）

### 2. 查看 Console 控制台

你应该看到 **14 条** `console.log` 输出（来自 `OvsAPI.createVNode`）：

```
chufale
h1
{type: Symbol(Fragment), children: Array(1), ...}
chufale
p
{type: Symbol(Fragment), children: Array(1), ...}
chufale
span
...
chufale
p
...   (← 这里应该有 apple)
chufale
p
...   (← 这里应该有 banana)
chufale
p
...   (← 这里应该有 cherry)
```

### 3. 检查 Elements 面板

DOM 结构应该是：

```html
<div id="app">
  <div>
    <div>
      <h1>Simple Views Test</h1>
      <p>All optimizations working!</p>
      <div>
        <span>Nested</span>
        <span> view</span>
      </div>
    </div>
    
    <div>
      <h2>Complex Views Test</h2>
      <p>apple</p>
      <p>banana</p>
      <p>cherry</p>
    </div>
    
    <div>
      <h2>Conditional Test</h2>
      <p>Extra content shown!</p>
    </div>
  </div>
</div>
```

---

## 如果内容没有显示

### 检查项 1: 控制台错误
- 是否有 Vue 错误？
- 是否有 import 错误？

### 检查项 2: Vue createVNode 参数
打开控制台，展开 `OvsAPI.createVNode` 的输出对象，查看：
- `children` 数组是否正确
- for 循环的 3 个 `<p>` 是否都创建了

### 检查项 3: app.ts 返回值
在 `app.ts` 的 render 函数中添加 `console.log`：

```typescript
export const App = {
    render() {
        console.log('App render, DefaultViews:', DefaultViews)
        return h('div', {}, DefaultViews)
    }
};
```

---

## 快速验证命令

在项目根目录运行（我已经为你准备好了）：

```bash
npx tsx ovs/check-browser-output.ts
```

这会显示编译后代码的模拟执行结果。

---

## 预期 createVNode 调用顺序

1. h1 - "Simple Views Test"
2. p - "All optimizations working!"
3. span - "Nested"
4. span - " view"
5. div - (嵌套的 div)
6. div - (第 1 个完整 div) ⭐ **简单视图**
7. h2 - "Complex Views Test"
8. p - "apple" ⭐ **for 循环**
9. p - "banana" ⭐ **for 循环**
10. p - "cherry" ⭐ **for 循环**
11. div - (第 2 个完整 div) ⭐ **复杂视图**
12. h2 - "Conditional Test"
13. p - "Extra content shown!" ⭐ **if 条件**
14. div - (第 3 个完整 div) ⭐ **复杂视图**

---

## 如果看到了所有内容 ✅

恭喜！所有优化都正常工作：
- ✅ 简单视图无 IIFE（性能最优）
- ✅ 复杂视图有 IIFE（支持逻辑）
- ✅ for 循环正确渲染
- ✅ if 条件正确执行

## 如果 apple/banana/cherry 没有显示 ❌

可能的原因：
1. Vue 的 h() 函数参数问题
2. OvsAPI.createVNode 返回值格式问题
3. children 数组嵌套问题

**请将浏览器控制台的截图或错误信息发给我，我会继续帮你调试！** 🔧

