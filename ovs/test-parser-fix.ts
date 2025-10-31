/**
 * 测试Parser修复效果
 * 验证嵌套函数调用不再导致回溯爆炸
 */

import * as fs from 'fs'
import * as path from 'path'

// 读取测试文件
const testFile = path.join(__dirname, 'example/src/views/hello.ovs')
const content = fs.readFileSync(testFile, 'utf-8')

console.log('=== Parser修复测试 ===\n')
console.log('测试文件:', testFile)
console.log('文件内容（前500字符）:')
console.log(content.substring(0, 500))
console.log('...\n')

// 导入OVS编译器
const startTime = Date.now()
console.log('开始解析（5秒超时）...')

try {
  // 动态导入编译器
  import('./src/index').then(module => {
    const {ovsTransform} = module
    
    try {
      const result = ovsTransform(content)
      const endTime = Date.now()
      const elapsed = endTime - startTime
      
      console.log(`✅ 解析成功! 耗时: ${elapsed}ms`)
      console.log('\n编译结果（前500字符）:')
      console.log(result.code.substring(0, 500))
      console.log('...\n')
      
      if (elapsed > 1000) {
        console.log('⚠️ 解析时间较长（>1s），可能还有性能问题')
      } else if (elapsed > 500) {
        console.log('✅ 解析速度可接受（<1s）')
      } else {
        console.log('🎉 解析速度优秀（<500ms）')
      }
      
      process.exit(0)
    } catch (err: any) {
      const endTime = Date.now()
      const elapsed = endTime - startTime
      console.log(`❌ 解析失败! 耗时: ${elapsed}ms`)
      console.error('错误:', err.message)
      process.exit(1)
    }
  }).catch(err => {
    console.error('❌ 无法导入编译器:', err.message)
    process.exit(1)
  })
  
  // 5秒超时检测
  setTimeout(() => {
    console.error('❌ 解析超时（>5s），问题未解决!')
    process.exit(1)
  }, 5000)
  
} catch (err: any) {
  console.error('❌ 执行错误:', err.message)
  process.exit(1)
}

