/**
 * 最终测试 - 验证所有核心用例
 */

import { vitePluginOvsTransform } from './index.ts'

async function test(name: string, code: string, expectedFeatures: string[]) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ ${name}`)
  console.log('='.repeat(60))
  console.log('输入:')
  console.log(code)
  
  try {
    const result = await vitePluginOvsTransform(code, undefined, true)
    console.log('\n输出:')
    console.log(result.code)
    
    console.log('\n验证点:')
    for (const feature of expectedFeatures) {
      const has = result.code.includes(feature)
      console.log(`  ${has ? '✅' : '❌'} ${feature}`)
    }
  } catch (error: any) {
    console.error(`\n❌ 错误: ${error.message}`)
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('开始最终测试')
  console.log('='.repeat(60))
  
  // 测试1: 有 export default - 不包裹
  await test(
    '测试1: 有 export default',
    `export default div{123}
div{456}`,
    ['export default', 'OvsAPI.createVNode']
  )
  
  // 测试2: 无 export default - 包裹所有表达式
  await test(
    '测试2: 无 export default - 包裹表达式',
    `div{456}
div{789}`,
    ['export default (function', 'const children = []', 'children.push', 'return children']
  )
  
  // 测试3: 混合声明和表达式 - 声明保持顶层
  await test(
    '测试3: 混合声明和表达式',
    `const shared = 100
console.log('init')
div{456}`,
    ['const shared = 100', 'export default (function', 'console.log', 'children.push']
  )
  
  // 测试4: export const - 保持导出
  await test(
    '测试4: export const',
    `export const hello = div {
  123
}`,
    ['export const hello', 'OvsAPI.createVNode']
  )
  
  // 测试5: 实际 hello.ovs 场景
  await test(
    '测试5: 实际 hello.ovs',
    `export const hello = div {
  const abc = true
  if (abc) {
    123
  }
}

export default div{123}`,
    ['export const hello', 'export default', 'const abc = true', 'if (abc)']
  )
  
  console.log('\n' + '='.repeat(60))
  console.log('所有测试完成！')
  console.log('='.repeat(60))
}

main().catch(console.error)

