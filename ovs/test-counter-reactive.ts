import { vitePluginOvsTransform } from './src/index.ts'

const code = `
import { ref } from 'vue'

const count = ref(0)

setInterval(() => {
  count.value++
}, 1000)

div {
  p { "计数：" }
  count.value
}
`

console.log('测试响应式计数器')

vitePluginOvsTransform(code, 'test.ovs', false)
  .then(result => {
    console.log('编译结果：')
    console.log(result.code)
    
    console.log('\n分析：')
    
    // 查找 count.value 的使用
    const matches = result.code.matchAll(/count\.value/g)
    let matchCount = 0
    for (const m of matches) {
      matchCount++
    }
    
    console.log('count.value 出现次数：', matchCount)
    
    // 检查是否在 children 数组中
    if (result.code.includes('[count.value,]') || result.code.includes('[count.value]')) {
      console.log('✅ count.value 在数组中（会被取值）')
      console.log('   问题：编译时就取值了，变成固定数字')
    }
    
    // 检查应该怎么处理
    console.log('\n应该的处理方式：')
    console.log('方案1：使用函数包裹')
    console.log('  () => count.value  // 延迟取值')
    console.log('')
    console.log('方案2：直接传递 count（ref 对象）')
    console.log('  count  // ReactiveVNode 自动处理 unref')
    
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })

