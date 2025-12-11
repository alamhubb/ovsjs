import {readFileSync} from 'fs'
import { vitePluginOvsTransform } from '../src/index'

const code = readFileSync('../../create-ovs/template/src/components/HelloWorld.ovs', 'utf-8')
console.log('源代码:')
console.log(code)
console.log('---')

const result = vitePluginOvsTransform(code)
console.log('生成的代码:')
console.log(result.code)

console.log('\n--- Mapping 分析 ---')
console.log('Mapping 数量:', result.mapping.length)

// 查找 h1 相关的 mapping
const h1Mappings = result.mapping.filter(m => {
    if (!m.source || !m.source.value) return false
    return m.source.value.includes('h1') || m.source.value === 'h1'
})

console.log('\nh1 相关的 mappings:')
h1Mappings.forEach((m, i) => {
    console.log(`[${i}] source: "${m.source.value}" @ ${m.source.index} (len=${m.source.length})`)
    console.log(`    generate: @ ${m.generate.index} (len=${m.generate.length})`)
    console.log(`    generated text: "${result.code.substring(m.generate.index, m.generate.index + m.generate.length)}"`)
})

// 显示所有 mapping 的前 20 个
console.log('\n前20个 mappings:')
result.mapping.slice(0, 20).forEach((m, i) => {
    if (m.source && m.source.value) {
        console.log(`[${i}] "${m.source.value}" (src:${m.source.index}) -> (gen:${m.generate.index})`)
    }
})

