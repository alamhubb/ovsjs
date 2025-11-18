# 🔄 切换检测模式指南

## 📍 切换位置

**文件**：`subhuti/src/validation/SubhutiGrammarAnalyzer.ts`

**方法**：`computePaths(ruleName: string): Path[]`

**行号**：约第138-145行

---

## 🎯 两种模式

### 模式1：完全展开（默认）✅

```typescript
// 模式1：完全展开（精确但可能路径爆炸）
const paths = this.computeNodePaths(ruleNode)

// 模式2：First集合（快速但不够精确）
// const firstSet = this.computeNodeFirst(ruleNode)
// const paths = this.convertFirstSetToPaths(firstSet)
```

**特点**：
- ✅ 精确检测
- ⚠️ 可能路径爆炸

---

### 模式2：First集合

```typescript
// 模式1：完全展开（精确但可能路径爆炸）
// const paths = this.computeNodePaths(ruleNode)

// 模式2：First集合（快速但不够精确）
const firstSet = this.computeNodeFirst(ruleNode)
const paths = this.convertFirstSetToPaths(firstSet)
```

**特点**：
- ✅ 快速，不会路径爆炸
- ⚠️ 可能误报

---

## 📊 效果对比

### 示例规则

```typescript
IdentifierReference: Or([
    Identifier,      // 分支#0
    YieldTok,        // 分支#1
    AwaitTok         // 分支#2
])
```

### 完全展开模式

```
路径：
  分支#0: ['Identifier,Identifier,']
  分支#1: ['YieldTok,']
  分支#2: ['AwaitTok,']

检测结果：无冲突 ✅
```

### First集合模式

```
First集合：
  分支#0: {'Identifier'}
  分支#1: {'YieldTok'}
  分支#2: {'AwaitTok'}

转换为路径：
  分支#0: ['Identifier,']
  分支#1: ['YieldTok,']
  分支#2: ['AwaitTok,']

检测结果：无冲突 ✅
```

---

## ⚠️ 注意事项

### First集合模式的局限性

**示例：可能误报**

```typescript
Arguments: Or([
    LParen + RParen,                    // 分支#0
    LParen + ArgumentList + RParen      // 分支#1
])
```

**完全展开模式**：
```
分支#0: ['LParen,RParen,']
分支#1: ['LParen,Identifier,RParen,', 'LParen,Ellipsis,Identifier,RParen,', ...]

检测结果：无冲突 ✅（分支#0是'LParen,RParen,'，分支#1是'LParen,Identifier,...'，不冲突）
```

**First集合模式**：
```
分支#0: ['LParen,']
分支#1: ['LParen,']

检测结果：有冲突 ⚠️（误报！两个分支的First都是'LParen'）
```

---

## 💡 建议

1. **默认使用完全展开模式**
   - 对于大部分规则都能正常工作
   - 检测精确

2. **遇到路径爆炸时切换到First集合模式**
   - 如果看到"Path count reached limit"警告
   - 如果验证时间过长

3. **混合使用**
   - 简单规则：完全展开
   - 复杂规则：First集合
   - （需要自己实现混合逻辑）

---

## 🚀 快速切换

只需要注释/取消注释对应的行即可，无需其他修改！

