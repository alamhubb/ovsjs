// 快速日志工具 - AI专用
// AI使用步骤（仅2步）：
// 1. search_replace 修改下面的 MSG 变量
// 2. 运行: node tests/ai/quick-log.js

const fs = require('fs');
const path = require('path');

// ===== AI: 修改这里 =====
const MSG = '默认消息';
// =======================

const file = path.join(__dirname, '../../.cursor/rules/project.mdc');
const time = new Date().toLocaleString('zh-CN', {hour12: false}).replace(/\//g, '-');
const entry = `\n**【进度】${time}**\n- ${MSG}\n`;

fs.appendFileSync(file, entry, 'utf8');
console.log('✅', MSG);

