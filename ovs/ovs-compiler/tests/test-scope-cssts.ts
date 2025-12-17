/**
 * 测试 OVS 编译器的 CSSTS 作用域分析
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const code = `
import { defineComponent, computed, h } from 'vue'

export default defineComponent({
  setup() {
    const baseStyles = css { colorRed, fontBold }
    const primary = css { baseStyles, backgroundBlue }
    return () => h('div', { class: primary })
  }
})
`

console.log('输入代码:')
console.log(code)
console.log('\n' + '='.repeat(60) + '\n')

const result = vitePluginOvsTransform(code)

console.log('输出代码:')
console.log(result.code)
console.log('\n' + '='.repeat(60) + '\n')

// 检查 baseStyles 是否被正确处理
if (result.code.includes('csstsAtom.baseStyles')) {
  console.log('❌ 错误: baseStyles 被错误地转换为 csstsAtom.baseStyles')
} else if (result.code.includes('baseStyles,') || result.code.includes('baseStyles)')) {
  console.log('✅ 正确: baseStyles 保持为变量引用')
} else {
  console.log('⚠️ 未知: 请检查输出')
}
