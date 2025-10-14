import { vitePluginOvsTransform } from './src/index.ts'
import { readFileSync } from 'fs'

// AI临时测试区 - 可以随意修改这里的代码

const testCases = [
  // Single特性测试（01-10）
  'tests/cases/single/01-simple.ovs',
  'tests/cases/single/02-variables.ovs',
  'tests/cases/single/03-nested.ovs',
  'tests/cases/single/04-conditional.ovs',
  'tests/cases/single/05-loops.ovs',
  'tests/cases/single/06-functions.ovs',
  'tests/cases/single/07-arrow-functions.ovs',
  'tests/cases/single/08-class.ovs',
  'tests/cases/single/09-named-export.ovs',
  'tests/cases/single/10-default-export.ovs',
  // Combined组合测试（01-02）
  'tests/cases/combined/01-export-class.ovs',
  'tests/cases/combined/02-multiple-exports.ovs'
]

async function runTests() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' OVS 完整测试（12个用例）'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  let passCount = 0
  let failCount = 0
  const failedCases = []
  
  for (const testCase of testCases) {
    const fileName = testCase.split('/').pop()
    console.log(`\n📝 测试: ${fileName}`)
    console.log('─'.repeat(80))
    
    try {
      const code = readFileSync(testCase, 'utf-8')
      const result = await vitePluginOvsTransform(code, fileName, false)
      
      // 基本验证
      if (result.code && result.code.includes('OvsAPI.createVNode')) {
        console.log(`✅ 编译成功 - ${fileName}`)
        passCount++
      } else {
        console.log(`⚠️  编译结果异常 - ${fileName}`)
        failCount++
        failedCases.push(fileName)
      }
    } catch (e) {
      console.log(`❌ 编译失败 - ${fileName}`)
      console.log(`   错误: ${e.message}`)
      if (fileName === '08-class.ovs') {
        console.log('   详细堆栈:')
        console.log(e.stack)
      }
      failCount++
      failedCases.push(fileName)
    }
  }
  
  console.log('\n' + '═'.repeat(80))
  console.log(`📊 测试总结: ${passCount}/${testCases.length} 通过`)
  console.log('═'.repeat(80))
  
  if (failCount === 0) {
    console.log('\n🎉 所有测试用例编译通过！')
  } else {
    console.log(`\n⚠️  ${failCount} 个用例编译失败：${failedCases.join(', ')}`)
  }
}

runTests().catch(console.error)


