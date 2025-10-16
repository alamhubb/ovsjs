// 从临时文件读取消息并写入日志
// AI使用步骤：
// 1. write工具创建 tests/ai/.msg.txt 文件，内容是要记录的消息
// 2. 运行: node tests/ai/log-from-file.js
// 3. 临时文件自动删除

const fs = require('fs');
const path = require('path');

const MSG_FILE = path.join(__dirname, '.msg.txt');
const PROJECT_MDC = path.join(__dirname, '../../.cursor/rules/project.mdc');

// 检查临时文件是否存在
if (!fs.existsSync(MSG_FILE)) {
  console.error('❌ 找不到消息文件:', MSG_FILE);
  console.log('请先创建 tests/ai/.msg.txt 文件');
  process.exit(1);
}

// 读取消息
const message = fs.readFileSync(MSG_FILE, 'utf8').trim();

if (!message) {
  console.error('❌ 消息文件为空');
  process.exit(1);
}

// 生成时间戳
const now = new Date();
const time = now.toLocaleString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).replace(/\//g, '-');

// 写入日志
const logEntry = `\n**【进度】${time}**\n- ${message}\n`;
fs.appendFileSync(PROJECT_MDC, logEntry, 'utf8');

// 删除临时文件
fs.unlinkSync(MSG_FILE);

console.log('✅ 已记录:', message);

