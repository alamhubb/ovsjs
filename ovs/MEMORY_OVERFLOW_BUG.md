# 内存溢出 Bug - 最小复现

## 问题描述
当对包含特定模式的JavaScript代码调用 `ovsTransform` 时，会导致内存溢出（heap out of memory）。

## 最小复现代码

```typescript
import {ovsTransform} from "ovsjs/src";

// ✅ 这段代码可以成功编译
const code1 = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]))
  return children})()
`

const res1 = ovsTransform(code1)  // 成功
console.log(res1.code)

// ❌ 这段代码会导致内存溢出
const code2 = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

const res2 = ovsTransform(code2)  // ❌ 内存溢出！
```

## 触发条件

对比两段代码，第二段多了：
1. **变量声明**: `const appName = 'Simple Test'`
2. **console.log调用**: `children.push(console.log(...))`
3. **更多语句**

当这些元素组合在一起时，触发了某种指数级回溯或无限循环。

## 根本原因

**核心问题**: `ovsTransform` 设计用于编译 **OVS 源代码**，而不是已经编译后的 JavaScript 代码。

用户提供的代码是**编译后的输出**：
```javascript
createComponentVNode(div,{},...)  // ← div 是裸标识符（没有引号）
```

这会触发 `OvsParser.AssignmentExpression` 的误匹配：
1. Parser 看到 `div` 这个 Identifier
2. 尝试匹配为 `OvsRenderFunction: div { ... }`
3. 期望后面是 `{`，但实际是 `,`
4. 匹配失败，回溯
5. 复杂代码触发更多回溯 → 指数级复杂度 → 内存溢出

## 正确用法

**OVS 源代码应该是这样的:**

```javascript
export default div {
  const appName = 'Simple Test';
  const version = '1.0';
  console.log('Starting simple test...');
  h1 { appName }
  p { version }
  console.log('Simple test complete!');
}
```

编译后才会生成：

```javascript
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(h1,{},[appName,]));
  children.push(createComponentVNode(p,{},[version,]));
  children.push(console.log('Simple test complete!'));
  return createComponentVNode(div,{},children)
})()
```

## 解决方案

### 方案1: 文档说明（推荐）
在文档中明确说明：
- ✅ `ovsTransform` 只能处理 OVS 源代码
- ❌ 不能对已编译的 JavaScript 代码再次编译

### 方案2: 提前检测（防御性）
在 `ovsTransform` 开头添加检测：
```typescript
export function ovsTransform(code: string): SlimeGeneratorResult {
    // 检测是否是已编译的代码
    if (code.includes('createComponentVNode') || code.includes('createElementVNode')) {
        throw new Error('ovsTransform只能处理OVS源代码，不能处理已编译的JavaScript代码')
    }
    // ...原有逻辑
}
```

### 方案3: 优化 Parser（复杂）
调整 `OvsParser.AssignmentExpression` 的匹配优先级，避免误匹配。

## 复现步骤

1. 创建测试文件 `test.ts`:
```typescript
import {ovsTransform} from "ovsjs/src";

const code = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),]));
  children.push(console.log('Complete'));
  return children})()
`

ovsTransform(code)  // 内存溢出
```

2. 运行: `npx tsx test.ts`
3. 等待约30-40秒，进程崩溃: `FATAL ERROR: Reached heap limit`

## 影响范围

- 任何尝试对已编译代码再次编译的场景
- 复杂度随着代码中变量声明和函数调用的数量指数增长

## 状态

- [x] 已复现
- [ ] 需修复
- [ ] 建议添加文档说明


