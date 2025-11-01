# OVS 源码映射测试套件说明

## 📋 测试用例概述

本目录包含11个渐进式测试用例（00-10），用于验证OVS的LSP源码映射功能是否准确。

## 🎯 测试场景

### 基础场景（00-03）
- **00-single-literal.ovs**: 最简单场景 - 单个字符串字面量
- **01-single-variable.ovs**: 单个变量声明和引用
- **02-simple-element.ovs**: 简单嵌套元素
- **03-variable-in-element.ovs**: 变量在元素中使用

### 中级场景（04-07）
- **04-nested-elements.ovs**: 2层嵌套元素
- **05-conditional-render.ovs**: 条件渲染（if语句）
- **06-simple-loop.ovs**: 简单循环（for...of）
- **07-function-call.ovs**: 函数声明和调用

### 复杂场景（08-10）
- **08-deep-nesting.ovs**: 多层嵌套（3层+）
- **09-complex-expression.ovs**: 复杂表达式和运算符
- **10-mixed-scenario.ovs**: 综合场景（变量+嵌套+条件+循环）

## 🧪 运行测试

```bash
# 运行完整测试套件
npx tsx test-mapping-suite.ts

# 运行单个测试（示例）
npx tsx test-mapping-diagnosis.ts
```

## 📊 测试结果（2025-10-30）

### 总体情况
- **测试数量**: 11个
- **编译成功率**: 100% ✅
- **映射生成成功率**: 100% ✅

### 详细结果

| 测试编号 | 测试名称 | 有效映射 | 无效映射 | 准确率 |
|---------|---------|---------|---------|--------|
| 00 | single-literal | 2 | 18 | 100.0% |
| 01 | single-variable | 6 | 18 | 100.0% |
| 02 | simple-element | 5 | 24 | 100.0% |
| 03 | variable-in-element | 13 | 24 | 100.0% |
| 04 | nested-elements | 8 | 30 | 100.0% |
| 05 | conditional-render | 14 | 29 | 21.4% ⚠️ |
| 06 | simple-loop | 7 | 20 | 100.0% |
| 07 | function-call | 13 | 24 | 100.0% |
| 08 | deep-nesting | 23 | 36 | 100.0% |
| 09 | complex-expression | 18 | 27 | 100.0% |
| 10 | mixed-scenario | 27 | 40 | 48.1% ⚠️ |

### 主要发现

#### ✅ 优点
1. **核心映射准确**: 9/11测试用例的有效映射准确率达到100%
2. **基础语法完美支持**: 变量、元素标签、字符串字面量的映射完全正确
3. **嵌套支持良好**: 多层嵌套场景映射准确

#### ⚠️ 问题
1. **无效映射过多**: 每个测试都有18-40个无效映射
   - 原因：自动添加的`import`语句（`createReactiveVNode from '../utils/ReactiveVNode'`）
   - 影响：这些映射会传递给LSP，但source为空，需要过滤

2. **条件渲染映射质量差**: 测试05准确率仅21.4%
   - 问题：生成的代码中有些映射指向错误位置
   
3. **复杂场景映射质量降低**: 测试10准确率48.1%
   - 问题：混合多种语法时，部分映射偏移

## 💡 改进建议

### 高优先级
1. **过滤无效映射**: 在传递给LSP前，过滤掉source为空的映射
   ```typescript
   const validMappings = mappings.filter(m => 
     m.source && m.source.value && m.source.value !== ''
   )
   ```

2. **修复条件渲染映射**: 检查if语句内部的AST转换逻辑

### 中优先级
3. **改进复杂场景映射**: 优化混合语法场景的映射生成
4. **减少自动生成代码的映射**: import语句不应该创建映射

## 🔧 测试工具

- **test-mapping-suite.ts**: 批量测试工具
- **test-mapping-diagnosis.ts**: 单个测试诊断工具
- **test-mapping-issues.ts**: 映射质量完整验证

## 📝 测试方法

每个测试验证以下内容：
1. **源码能否成功编译**: 无语法错误
2. **映射数量**: 总映射、有效映射、无效映射
3. **映射准确性**: 源码位置与生成代码位置是否匹配
4. **LSP功能**: 映射是否能支持正确的代码提示和跳转





















