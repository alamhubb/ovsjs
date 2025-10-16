import { readFileSync, existsSync } from 'fs'

// 进度监控脚本 - 实时读取progress.json并输出进度
// 用法: npx tsx tests/ai/monitor-progress.ts [进度文件路径]

const progressFile = process.argv[2] || 'progress.json'
const checkInterval = 1000 // 每秒检查一次
const outputInterval = 5 // 每5秒输出一次详细信息

let lastStatus = ''
let checkCount = 0
let lastTestCount = 0

console.log('🔍 开始监控测试进度...\n')

function checkProgress() {
  try {
    if (!existsSync(progressFile)) {
      if (checkCount % outputInterval === 0) {
        console.log(`⏳ 等待测试启动... (${checkCount}s)`)
      }
      checkCount++
      return
    }
    
    const data = JSON.parse(readFileSync(progressFile, 'utf-8'))
    const elapsed = data.startTime ? ((Date.now() - data.startTime) / 1000).toFixed(1) : '0.0'
    
    // 状态变化时立即输出
    if (data.status !== lastStatus) {
      console.log(`\n📌 状态变更: ${lastStatus || '无'} → ${data.status}`)
      lastStatus = data.status
    }
    
    // 测试数量变化时立即输出
    if (data.passCount + data.failCount !== lastTestCount) {
      const current = data.current ? ` | 当前: ${data.current}` : ''
      console.log(`✅ ${data.passCount} ❌ ${data.failCount} (${elapsed}s)${current}`)
      lastTestCount = data.passCount + data.failCount
    }
    
    // 每5秒输出详细信息
    if (checkCount % outputInterval === 0) {
      console.log(`\n📊 进度报告 (运行${elapsed}秒):`)
      console.log(`   状态: ${data.status}`)
      console.log(`   进度: ${data.progress || '未知'}`)
      console.log(`   通过: ${data.passCount || 0} | 失败: ${data.failCount || 0}`)
      if (data.current) {
        console.log(`   当前测试: ${data.current}`)
      }
      if (data.stage) {
        console.log(`   当前阶段: ${data.stage}`)
      }
    }
    
    // 检查是否完成
    if (data.status === 'completed') {
      console.log('\n' + '═'.repeat(80))
      console.log('✅ 测试完成！')
      console.log(`📊 最终结果: ${data.passCount}/${data.total} 通过`)
      console.log(`⏱️  总耗时: ${elapsed}秒`)
      if (data.slowTests && data.slowTests.length > 0) {
        console.log(`⚠️  慢测试: ${data.slowTests.map((t: any) => `${t.name}(${t.time}ms)`).join(', ')}`)
      }
      console.log('═'.repeat(80))
      process.exit(0)
    }
    
    if (data.status === 'failed') {
      console.log('\n❌ 测试失败！')
      console.log(`错误: ${data.error}`)
      process.exit(1)
    }
    
    checkCount++
  } catch (e: any) {
    // 文件可能正在被写入，忽略解析错误
    if (checkCount % outputInterval === 0 && e.message !== lastStatus) {
      console.log(`⚠️ 读取进度文件失败: ${e.message}`)
    }
  }
}

// 启动监控
const interval = setInterval(checkProgress, checkInterval)

// 120秒超时（足够40个测试用例）
setTimeout(() => {
  console.log('\n⏱️ 监控超时（120秒），测试可能卡住了')
  clearInterval(interval)
  
  // 尝试读取最后的进度
  try {
    const data = JSON.parse(readFileSync(progressFile, 'utf-8'))
    console.log('\n最后的进度信息:')
    console.log(data)
  } catch (e) {
    console.log('无法读取进度文件')
  }
  
  process.exit(1)
}, 120000)

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 监控已停止')
  clearInterval(interval)
  process.exit(0)
})
