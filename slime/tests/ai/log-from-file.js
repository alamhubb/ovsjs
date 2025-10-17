// 断点重续工具：将临时消息追加到project.mdc
const fs = require('fs')
const path = require('path')

const msgFile = path.join(__dirname, '.msg.txt')
const projectFile = path.join(__dirname, '../../.cursor/rules/project.mdc')

if (!fs.existsSync(msgFile)) {
  console.log('⚠️ 没有消息需要追加')
  process.exit(0)
}

const message = fs.readFileSync(msgFile, 'utf-8').trim()

if (!message) {
  console.log('⚠️ 消息为空')
  process.exit(0)
}

const timestamp = new Date().toLocaleString('zh-CN', { 
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

const entry = `\n**【进度】${timestamp}**\n${message}\n`

fs.appendFileSync(projectFile, entry, 'utf-8')
console.log('✅ 进度已追加到 project.mdc')

// 清空临时消息文件
fs.writeFileSync(msgFile, '', 'utf-8')
console.log('✅ 临时消息已清空')

