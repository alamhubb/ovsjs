// AI进度日志工具 - 支持中文
// 使用base64编码绕过PowerShell编码问题
// 
// 使用方式:
// node tests/ai/log.js <base64编码的消息>
// 
// PowerShell调用示例:
// $msg = "中文消息"; $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($msg)); node tests/ai/log.js $b64

const fs = require('fs');
const path = require('path');

const PROJECT_MDC = path.join(__dirname, '../../.cursor/rules/project.mdc');

function formatTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 获取命令行参数（base64编码）
const base64Message = process.argv[2];

if (!base64Message) {
  console.error('❌ 请提供base64编码的消息');
  console.log('使用方式:');
  console.log('  $msg = "中文消息"');
  console.log('  $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($msg))');
  console.log('  node tests/ai/log.js $b64');
  process.exit(1);
}

// 解码base64
let message;
try {
  message = Buffer.from(base64Message, 'base64').toString('utf8');
} catch (err) {
  console.error('❌ Base64解码失败:', err.message);
  process.exit(1);
}

// 构建日志条目
const timestamp = formatTimestamp();
const logEntry = `\n**【进度】${timestamp}**\n- ${message}\n`;

// 写入文件
try {
  fs.appendFileSync(PROJECT_MDC, logEntry, 'utf8');
  console.log('✅ 已记录:', message);
} catch (err) {
  console.error('❌ 写入失败:', err.message);
  process.exit(1);
}

