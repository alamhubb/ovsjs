import { vitePluginOvsTransform } from './src/index.ts'
import fs from 'fs'

const code = `
div {
  #{ "hello" }
  h2 { #{ "title" } }
  func()
}
`

console.log('Testing CST structure...')
console.log('Code:', code)

// 测试编译
vitePluginOvsTransform(code, 'test.ovs', false).then(result => {
  console.log('\nCompiled:', result.code)
}).catch(err => {
  console.error('Error:', err.message)
  console.error(err.stack)
})

