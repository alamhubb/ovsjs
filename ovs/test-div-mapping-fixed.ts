import { vitePluginOvsTransform } from './src/index'

const ovsCode = `const name = "World"

div { name }
`

console.log('📄 OVS源码：')
console.log(ovsCode)

const result = vitePluginOvsTransform(ovsCode)

console.log('\n✅ 编译后的代码：')
console.log(result.code)

console.log('\n📍 源码映射详情：')
console.log(`总映射数: ${result.mapping.length}`)

// 查找 div 相关的映射
const divMappings = result.mapping.filter(m => 
  m.source && m.source.value && m.source.value === 'div'
)

console.log(`\n🔍 包含"div"的完整映射:`)
divMappings.forEach((m, i) => {
  console.log(`[${i}] 源码值: "${m.source.value}"`)
  console.log(`    源码位置: line=${m.source.line}, col=${m.source.column}`)
  console.log(`    生成代码位置: index=${m.generate.index}, length=${m.generate.length}`)
})

console.log(`\n📌 【修复验证】：`)
if (divMappings.length > 0 && divMappings[0].source.line !== undefined) {
  console.log(`✅ 找到了div的完整映射（带位置信息）`)
  console.log(`   源码位置: 行${divMappings[0].source.line}, 列${divMappings[0].source.column}`)
  console.log(`\n✅ LSP现在可以：`)
  console.log(`   1. 精确定位div在源代码中的位置`)
  console.log(`   2. 提供"导入div"的快速修复建议`)
} else {
  console.log(`⚠️ div的映射信息仍然不完整（位置行为undefined或未找到映射）`)
}
