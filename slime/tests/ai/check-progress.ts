import { readFileSync, existsSync } from 'fs'

// 快速检查进度脚本 - 读取一次progress.json立即退出
// AI可以每5秒调用一次此脚本查看最新进度

const progressFile = 'progress.json'

if (!existsSync(progressFile)) {
  console.log('⏳ 测试尚未启动（progress.json不存在）')
  process.exit(0)
}

try {
  const data = JSON.parse(readFileSync(progressFile, 'utf-8'))
  const elapsed = data.startTime ? ((Date.now() - data.startTime) / 1000).toFixed(1) : '0.0'
  
  console.log('\n' + '═'.repeat(60))
  console.log(`📊 测试进度快照 (${new Date().toLocaleTimeString()})`)
  console.log('═'.repeat(60))
  
  console.log(`\n📌 状态: ${data.status}`)
  
  if (data.status === 'running' || data.status === 'completed') {
    console.log(`📊 进度: ${data.progress || '未知'}`)
    console.log(`✅ 通过: ${data.passCount || 0} | ❌ 失败: ${data.failCount || 0}`)
    console.log(`⏱️  已运行: ${elapsed}秒`)
    
    if (data.current) {
      console.log(`📝 当前测试: ${data.current}`)
    }
    
    if (data.stage) {
      console.log(`🎯 当前阶段: ${data.stage}`)
    }
  }
  
  if (data.status === 'completed') {
    console.log('\n✅ 测试已完成！')
    console.log(`📊 最终结果: ${data.passCount}/${data.total} 通过`)
    if (data.slowTests && data.slowTests.length > 0) {
      console.log(`⚠️  慢测试(>500ms): ${data.slowTests.length}个`)
    }
  }
  
  if (data.status === 'failed') {
    console.log('\n❌ 测试失败')
    if (data.error) {
      console.log(`错误: ${data.error}`)
    }
  }
  
  console.log('\n' + '═'.repeat(60) + '\n')
  
} catch (e: any) {
  console.log(`⚠️ 读取进度文件失败: ${e.message}`)
  console.log('（文件可能正在被写入，请稍后重试）')
}
