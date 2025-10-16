# 进度监控系统使用指南

## 🎯 解决的问题

**原问题：** AI执行长时间脚本时，如果脚本卡住或运行很慢，AI也会卡住，无法给用户实时反馈。

**解决方案：** 使用进度监控系统，让AI能实时看到脚本执行进度。

## 📁 文件说明

### 1. `test-runner.ts`（已修改）
- **作用：** 执行测试，每秒写入进度到 `progress.json`
- **修改内容：**
  - 初始化进度文件
  - 每个测试开始/完成时更新进度
  - 测试结束时写入最终结果

### 2. `progress-monitor.ts`（新增）
- **作用：** 实时监控 `progress.json`，每秒读取并输出进度
- **输出内容：**
  - 状态变化（启动→运行→完成）
  - 测试进度（通过/失败数量）
  - 当前测试文件名
  - 当前阶段
  - 每5秒输出详细报告

### 3. `progress.json`（自动生成）
- **作用：** 进度文件，作为通信桥梁
- **内容：**
  ```json
  {
    "status": "running",
    "startTime": 1697000000000,
    "total": 40,
    "passCount": 10,
    "failCount": 0,
    "current": "01-literals.js",
    "stage": "阶段1-基础语法",
    "progress": "11/40"
  }
  ```

## 🚀 使用方法

### 方式1：AI自动化执行（推荐）

**AI执行流程：**
```bash
# 第1步：清空进度文件
echo '{"status":"waiting"}' > slime/progress.json

# 第2步：后台启动测试脚本
cd slime && npx tsx test-runner.ts &

# 第3步：前台运行监控脚本（AI会看到输出）
cd slime && npx tsx progress-monitor.ts
```

**AI能看到的输出：**
```
🔍 开始监控测试进度...

📌 状态变更: 无 → starting
📌 状态变更: starting → running

✅ 1 ❌ 0 (0.5s) | 当前: 01-literals.js
✅ 2 ❌ 0 (0.8s) | 当前: 02-identifiers.js
✅ 3 ❌ 0 (1.2s) | 当前: 03-binary-ops.js

📊 进度报告 (运行5秒):
   状态: running
   进度: 15/40
   通过: 15 | 失败: 0
   当前测试: 15-class-basic.js
   当前阶段: 阶段2-ES6常用特性

... (继续更新)

✅ 测试完成！
📊 最终结果: 38/40 通过
⏱️  总耗时: 8.5秒
```

### 方式2：手动执行（调试用）

**终端1：** 运行测试
```bash
cd slime
npx tsx test-runner.ts
```

**终端2：** 监控进度
```bash
cd slime
npx tsx progress-monitor.ts
```

## 📊 进度监控特性

### 实时反馈
- ✅ **状态变化立即输出**：启动→运行→完成
- ✅ **测试完成立即显示**：通过/失败数量
- ✅ **当前测试实时更新**：知道正在测试哪个文件

### 定时报告
- 📊 **每5秒输出详细报告**：
  - 运行时长
  - 测试进度（X/总数）
  - 通过/失败统计
  - 当前测试和阶段

### 超时保护
- ⏱️ **120秒超时**：防止监控脚本永久运行
- 📝 **超时时输出最后进度**：即使测试卡住，也能看到进度

### 优雅退出
- 👋 **Ctrl+C支持**：随时可以停止监控
- ✅ **完成自动退出**：测试完成后自动停止

## 🔧 自定义配置

### 修改输出间隔
```typescript
// progress-monitor.ts
const checkInterval = 1000  // 改为2000 = 每2秒检查一次
const outputInterval = 5    // 改为10 = 每10秒输出详细报告
```

### 修改超时时间
```typescript
// progress-monitor.ts
setTimeout(() => {
  // ...
}, 120000)  // 改为60000 = 60秒超时
```

### 修改进度文件路径
```typescript
// test-runner.ts
const PROGRESS_FILE = 'progress.json'  // 改为其他路径

// progress-monitor.ts
const progressFile = process.argv[2] || 'progress.json'
```

## 💡 核心价值

### 对用户
- ✅ **不再焦虑**：知道脚本在运行，不是卡死
- ✅ **实时掌握**：知道进度、预估剩余时间
- ✅ **及时发现问题**：脚本卡住时能立即知道

### 对AI
- ✅ **不再卡住**：监控脚本会定时输出，AI能看到
- ✅ **精准反馈**：能告诉用户具体进度，不是"正在执行"
- ✅ **问题定位**：知道卡在哪个测试

## 🎯 应用场景

### 1. 长时间测试（当前场景）
- 40个测试用例，预计8秒
- AI能看到每个测试的进度

### 2. 大文件处理
- 处理1000+文件时，每处理一个更新进度
- AI能实时告知用户

### 3. 网络请求
- 批量API请求时，记录进度
- AI能看到成功/失败数量

### 4. 编译构建
- 编译多个模块时，记录每个模块
- AI能告知当前编译到哪个模块

## 📝 示例：完整的AI使用流程

```typescript
// AI的执行流程
async function runTestsWithProgress() {
  // 1. 说明要做什么
  console.log('📋 即将执行测试，共40个用例，预计8秒')
  
  // 2. 清空进度文件
  await run('echo \'{"status":"waiting"}\' > slime/progress.json')
  
  // 3. 后台启动测试（is_background: true）
  await run('cd slime && npx tsx test-runner.ts', { background: true })
  
  // 4. 前台运行监控（会看到输出）
  await run('cd slime && npx tsx progress-monitor.ts')
  
  // 5. 监控结束后，AI能看到最终结果
  console.log('✅ 测试完成，查看结果...')
  const result = await readFile('slime/progress.json')
  console.log(result)
}
```

## 🔍 故障排查

### Q: 监控脚本一直显示"等待测试启动"
**A:** 测试脚本可能没有运行，检查：
- 测试脚本是否正常启动
- progress.json文件是否被创建
- 路径是否正确（slime/progress.json）

### Q: 监控脚本读取进度文件失败
**A:** 文件可能正在被写入，这是正常的：
- 监控脚本会自动重试
- 偶尔的错误可以忽略

### Q: 监控脚本超时退出
**A:** 测试可能卡住了：
- 查看 progress.json 的最后内容
- 找到卡住的测试文件
- 单独测试该文件定位问题

### Q: AI还是卡住了
**A:** 可能是：
- 监控脚本也卡住了（很少见）
- 输出被重定向了
- 需要增加输出频率（改为每秒输出）

## 🚀 未来改进方向

1. **可视化进度条**：在终端显示进度条
2. **网页实时监控**：启动HTTP服务器，浏览器查看进度
3. **性能分析**：记录每个测试的耗时分布
4. **失败重试**：自动重试失败的测试
5. **并行测试**：支持多进程并行，聚合进度

## ✅ 总结

**核心机制：**
```
测试脚本 → 写入progress.json → 监控脚本读取 → AI看到输出
```

**核心价值：**
- 🎯 **解决AI卡住问题**：监控脚本定时输出，AI不会卡
- 📊 **完全透明**：用户和AI都知道实时进度
- 🔧 **灵活配置**：可自定义输出频率、超时时间
- 🚀 **通用方案**：适用于任何长时间运行的脚本


