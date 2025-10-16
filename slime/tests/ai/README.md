# AI 进度日志工具使用说明

## ✅ 最终解决方案（推荐）

通过**临时文件传递消息**，完美绕过PowerShell中文编码问题。

### 使用方法（仅2步）

```javascript
// 步骤1: 创建临时文件（使用write工具）
write("slime/tests/ai/.msg.txt", "要记录的中文消息")

// 步骤2: 运行脚本
run_terminal_cmd("cd d:\\project\\qkyproject\\test-volar\\slime; node tests/ai/log-from-file.js")
```

### 工作原理

1. AI使用`write`工具创建临时文件`.msg.txt`（UTF-8编码，不经过PowerShell）
2. 运行`log-from-file.js`脚本读取临时文件
3. 脚本将消息追加到`project.mdc`
4. 自动删除临时文件
5. ✅ 中文、emoji完美显示！

### 示例

```javascript
// 记录进度
write("slime/tests/ai/.msg.txt", "已定位Exclamation运算符问题，准备修复")
run_terminal_cmd("cd slime; node tests/ai/log-from-file.js")

// 记录思路
write("slime/tests/ai/.msg.txt", "假设：需要在SlimeCstToAstUtil.ts中添加createUnaryExpressionAst方法")
run_terminal_cmd("cd slime; node tests/ai/log-from-file.js")
```

## 其他方案（备用）

### 方案2：修改脚本变量

适合长文本记录。

```javascript
// 1. 修改脚本中的MSG变量
search_replace("slime/tests/ai/quick-log.js", 
  'const MSG = "默认消息";',
  'const MSG = "你的消息内容";')

// 2. 运行脚本
run_terminal_cmd("cd slime; node tests/ai/quick-log.js")
```

### 方案3：直接使用search_replace

适合简单追加。

```javascript
search_replace("slime/.cursor/rules/project.mdc",
  "文件最后一行",
  "文件最后一行\n\n**【进度】时间戳**\n- 新消息\n")
```

## 问题根源

Cursor集成的PowerShell环境对中文编码支持不完整：
- ❌ 命令行参数传递中文 → 乱码
- ❌ 环境变量传递中文 → 乱码  
- ❌ stdin管道传递中文 → 乱码
- ✅ **文件内容中文** → 完全正常
- ✅ **write工具写入** → 完全正常
