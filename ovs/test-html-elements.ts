import { vitePluginOvsTransform } from './src/index.ts'

// 测试简单 HTML 标签
const code1 = `div {
  h1 { "Hello" }
  p { "World" }
}`

console.log('=== 测试1：简单 HTML 标签 ===')
const result1 = vitePluginOvsTransform(code1)
console.log(result1.code)
console.log('\n')

// 测试复杂情况（带 attrs）
const code2 = `div {
  name = "test"
  p { name }
}`

console.log('=== 测试2：带 attrs 的 HTML 标签 ===')
const result2 = vitePluginOvsTransform(code2)
console.log(result2.code)
console.log('\n')

// 测试组件（应该使用 createReactiveVNode）
const code3 = `MyComponent {
  div { "content" }
}`

console.log('=== 测试3：组件（应该使用 createReactiveVNode） ===')
const result3 = vitePluginOvsTransform(code3)
console.log(result3.code)

