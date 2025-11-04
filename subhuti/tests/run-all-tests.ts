/**
 * SubhutiParser 测试运行器
 * 
 * 依次运行所有测试用例
 */

import { execSync } from 'child_process'
import * as path from 'path'

const tests = [
  'subhutiparsertest-token-001.ts',
  'subhutiparsertest-or-002.ts',
  'subhutiparsertest-or-order-003.ts',
  'subhutiparsertest-many-004.ts',
  'subhutiparsertest-option-005.ts',
  'subhutiparsertest-nested-006.ts',
]

console.log('='.repeat(70))
console.log('SubhutiParser 测试套件')
console.log('='.repeat(70))
console.log(`共 ${tests.length} 个测试用例\n`)

let totalPassed = 0
let totalFailed = 0
const results: Array<{name: string, status: 'pass' | 'fail', error?: string}> = []

for (let i = 0; i < tests.length; i++) {
  const testFile = tests[i]
  const testNum = i + 1
  
  console.log(`\n[${ testNum}/${tests.length}] 运行: ${testFile}`)
  console.log('-'.repeat(70))
  
  try {
    const testPath = path.join(__dirname, testFile)
    execSync(`npx tsx ${testPath}`, {
      stdio: 'inherit',
      cwd: path.dirname(testPath)
    })
    
    console.log(`\n✅ 测试 ${testNum} 通过`)
    results.push({ name: testFile, status: 'pass' })
    totalPassed++
  } catch (e: any) {
    console.log(`\n❌ 测试 ${testNum} 失败`)
    results.push({ name: testFile, status: 'fail', error: e.message })
    totalFailed++
  }
}

// ============================================
// 总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log('测试总结')
console.log('='.repeat(70))

results.forEach((result, i) => {
  const status = result.status === 'pass' ? '✅' : '❌'
  console.log(`${status} [${i + 1}] ${result.name}`)
})

console.log('\n' + '='.repeat(70))
console.log(`总计: ${totalPassed + totalFailed} 个测试`)
console.log(`通过: ${totalPassed}`)
console.log(`失败: ${totalFailed}`)
console.log('='.repeat(70))

if (totalFailed === 0) {
  console.log('\n🎉 所有测试通过！SubhutiParser 工作正常！')
  process.exit(0)
} else {
  console.log('\n⚠️  有测试失败，请检查')
  process.exit(1)
}






















