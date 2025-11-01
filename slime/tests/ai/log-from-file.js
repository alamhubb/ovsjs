// 断点重续工具：将临时消息追加到project.mdc
const fs = require('fs');
const path = require('path');

const msgFile = path.join(__dirname, '.msg.txt');
const projectMdc = path.join(__dirname, '../../.cursor/rules/project.mdc');

if (!fs.existsSync(msgFile)) {
    console.log('No .msg.txt file found');
    process.exit(0);
}

const msg = fs.readFileSync(msgFile, 'utf-8');
if (!msg.trim()) {
    console.log('Empty message');
    process.exit(0);
}

const timestamp = new Date().toLocaleString('zh-CN');
const logEntry = `【${timestamp}】\n${msg}\n\n`;

if (fs.existsSync(projectMdc)) {
    const content = fs.readFileSync(projectMdc, 'utf-8');
    fs.writeFileSync(projectMdc, content + logEntry);
    console.log('✅ 进度已追加到 project.mdc');
} else {
    console.log('⚠️ project.mdc 不存在');
}

// 清空msg.txt
fs.writeFileSync(msgFile, '');
console.log('✅ .msg.txt 已清空');

