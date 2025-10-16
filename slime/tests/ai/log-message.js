// AI进度日志工具 - 通过修改此文件来记录日志
// AI使用步骤：
// 1. 修改下面的 MESSAGE 变量
// 2. 运行: node tests/ai/log-message.js
// 3. 查看 project.mdc 确认写入成功

const fs = require('fs');
const path = require('path');

// ============================================
// AI: 在这里修改要记录的消息
// ============================================
const MESSAGE = '✅ 问题已解决！AI可以通过修改脚本文件来记录中文日志了';
// ============================================

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

const timestamp = formatTimestamp();
const logEntry = `\n**【进度】${timestamp}**\n- ${MESSAGE}\n`;

try {
  fs.appendFileSync(PROJECT_MDC, logEntry, 'utf8');
  console.log('✅ 已记录:', MESSAGE);
  console.log('📝 文件位置:', PROJECT_MDC);
} catch (err) {
  console.error('❌ 写入失败:', err.message);
  process.exit(1);
}

