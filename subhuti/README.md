Subhuti (सुभूति)

Automatic conversion between two different programming languages through two grammar files that define the same grammar structure and grammar name

meaning: Make the conversion between programming languages as flexible as the 72 transformations of the Monkey King Sun Wukong, who was taught by Subhuti

---

## 🎉 Latest Update [2025-11-04]

**重大重构：代码简化优化（YAGNI 原则）**

基于 YAGNI、简单优于复杂原则，大幅简化非核心功能：

### 调试系统重构（v3.0）
- ✅ 删除 3 套重复的调试系统，统一为 SubhutiTraceDebugger
- ✅ 代码减少：745 行 → 174 行（**减少 76%**）
- ✅ 新增功能：Or 分支追踪、回溯标识
- ✅ 输出格式：
  ```
  ➡️  ImportDeclaration    ⚡CACHED  (1ms)
    🔹 Consume  token[0] - import - <ImportTok>  ✅
    🔀 Or[2 branches]  trying #0  @token[1]
    ⏪ Backtrack  token[5] → token[2]
  ```

### 错误处理简化（v3.0）
- ✅ 删除 ErrorDiagnoser（与 ParsingError 98% 重复）
- ✅ 删除 ErrorFormatter（7 种格式未被使用）
- ✅ 代码减少：731 行 → 224 行（**减少 69%**）
- ✅ 保留核心：智能错误建议（5 种常见场景）

### 性能分析器合并（v3.0）
- ✅ SubhutiProfiler 功能合并到 SubhutiDebug
- ✅ 删除 SubhutiProfiler.ts（207 行）
- ✅ 保留核心统计（totalCalls, avgTime, cacheHits）
- ✅ 删除过度设计（minTime/maxTime, 表格边框）
- ✅ 统一入口：`debug()` 同时提供调试和性能分析

### 总计优化
- **代码减少：1,387 行**（调试 466 行 + 错误处理 507 行 + 性能分析 207 行 + CLI 工具 207 行）
- **代码减少比例：73%**（1,890 行 → 503 行）
- **测试通过率：100%**（43/43 测试用例）
- **功能完整性：100% 保留核心功能**
- **向后兼容：100%**（profiling() API 仍可用）

---

test
```
1. npm i
2. npm run test
```

todo

需要支持多parser的组合， particula 方式