/**
 * 测试最小化嵌套调用的性能
 */

import * as fs from 'fs'
import * as path from 'path'

const testFile = path.join(__dirname, 'test-minimal-nested.ovs')
const content = fs.readFileSync(testFile, 'utf-8')

console.log('测试代码:', content)
console.log('\n开始解析...')

const startTime = Date.now()

try {
  import('./src/index').then(module => {
    const {ovsTransform} = module
    
    try {
      const result = ovsTransform(content)
      const endTime = Date.now()
      const elapsed = endTime - startTime
      
      console.log(`✅ 解析成功! 耗时: ${elapsed}ms`)
      console.log('\n编译结果:')
      console.log(result.code)
      
      if (elapsed > 1000) {
        console.log('\n⚠️ 仍有严重性能问题')
      } else {
        console.log('\n🎉 性能正常!')
      }
      
      process.exit(0)
    } catch (err: any) {
      const endTime = Date.now()
      console.log(`❌ 解析失败! 耗时: ${endTime - startTime}ms`)
      console.error('错误:', err.message)
      process.exit(1)
    }
  })
  
  setTimeout(() => {
    console.error('❌ 超时!')
    process.exit(1)
  }, 10000)
  
} catch (err: any) {
  console.error('❌ 执行错误:', err.message)
  process.exit(1)
}











