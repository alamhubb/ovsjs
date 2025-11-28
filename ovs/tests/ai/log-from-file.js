#!/usr/bin/env node
/**
 * 进度日志追加脚本
 * 读取 tests/ai/.msg.txt 中的进度内容，自动追加到 project.mdc 的修复进度记录部分
 * 
 * 使用方法：
 * node tests/ai/log-from-file.js
 */

const fs = require('fs')
const path = require('path')

const msgFile = path.join(__dirname, '.msg.txt')
const projectFile = path.join(__dirname, '../../.cursor/rules/project.mdc')

try {
  // 读取进度文件
  const content = fs.readFileSync(msgFile, 'utf-8').trim()
  
  if (!content) {
    console.log('ℹ️  .msg.txt 文件为空，无需追加进度')
    process.exit(0)
  }

  // 读取项目信息文件
  let projectContent = fs.readFileSync(projectFile, 'utf-8')
  
  // 构建时间戳标记
  const now = new Date()
  const dateTime = now.toISOString().split('T')[0] + ' ' + 
                   now.toTimeString().split(' ')[0]
  
  // 构建追加内容
  const logEntry = `
【${dateTime}】
${content}
`
  
  // 在 "# 变更记录" 后面追加
  const changelogMarker = '# 变更记录\n'
  if (projectContent.includes(changelogMarker)) {
    const idx = projectContent.indexOf(changelogMarker) + changelogMarker.length
    projectContent = projectContent.slice(0, idx) + logEntry + projectContent.slice(idx)
  } else {
    // 如果没找到标记，在文件末尾追加
    projectContent += '\n' + logEntry
  }
  
  // 写回项目信息文件
  fs.writeFileSync(projectFile, projectContent, 'utf-8')
  
  // 清空进度文件
  fs.writeFileSync(msgFile, '', 'utf-8')
  
  console.log('✅ 进度已追加到 project.mdc，并清空 .msg.txt')
} catch (err) {
  console.error('❌ 追加进度失败:', err.message)
  process.exit(1)
}
