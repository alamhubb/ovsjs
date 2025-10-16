# AI测试工具目录

本目录包含AI测试时使用的工具脚本。

## 文件说明

### check-progress.ts
**作用：** 快速检查测试进度（AI专用）
**用法：** `npx tsx tests/ai/check-progress.ts`
**特点：** 读取一次progress.json立即退出，适合AI每5秒调用一次

### monitor-progress.ts  
**作用：** 持续监控测试进度（人类专用）
**用法：** `npx tsx tests/ai/monitor-progress.ts`
**特点：** 实时监控进度变化，适合人类观察长时间测试

## AI使用流程

```powershell
# 1. 清空进度文件
echo '{"status":"waiting"}' > progress.json

# 2. 后台启动测试
npx tsx test-runner.ts &

# 3. AI每5秒检查进度
npx tsx tests/ai/check-progress.ts

# 4. 重复第3步直到看到 "status: completed"
```

## 文件结构

```
slime/
├── test-runner.ts              # 主入口（运行测试）
├── progress.json               # 进度文件（自动生成）
└── tests/
    └── ai/                     # AI工具目录
        ├── check-progress.ts       # 快速检查（AI用）
        ├── monitor-progress.ts     # 持续监控（人类用）
        └── README.md               # 本文件
```

## 核心价值

- ✅ **解决AI卡住问题**：check-progress.ts快速执行（<1秒），AI不会卡
- ✅ **完全透明**：用户和AI都知道实时进度
- ✅ **及时发现问题**：能区分"测试慢"和"测试卡死"
- ✅ **精准反馈**：告诉用户具体进度，而非"正在执行中"
