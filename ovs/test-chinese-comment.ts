import { vitePluginOvsTransform } from './src/index.ts'

const testCode = `// 这是中文注释
function test() {
  return "hello"
}

/* 
 * 多行中文注释
 * 第二行
 */
div {
  h1 { "测试" }  // 行尾中文注释
}`

async function test() {
  console.log('测试中文注释...\n')
  console.log('源代码：')
  console.log(testCode)
  console.log('\n编译：')
  
  try {
    const result = await vitePluginOvsTransform(testCode, 'test.ovs', true)
    console.log('✅ 成功！')
    console.log(result.code)
  } catch (e) {
    console.log('❌ 失败:', e.message)
  }
}

test().catch(console.error)

