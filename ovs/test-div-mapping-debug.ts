import { vitePluginOvsTransform } from './src/index'

const ovsCode = `div { "Hello" }`

console.log('📄 OVS源码：')
console.log(ovsCode)

const result = vitePluginOvsTransform(ovsCode)

console.log('\n✅ 编译后的代码：')
console.log(result.code)

console.log('\n📍 完整源码映射：')
result.mapping.forEach((m, i) => {
  console.log(`[${i}] 源码: "${m.source.value}"`)
  console.log(`    完整位置信息:`, JSON.stringify(m.source.loc, null, 2))
  console.log(`    生成: ${m.generate.index} (长${m.generate.length})`)
  console.log('')
})

















