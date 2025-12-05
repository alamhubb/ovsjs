/**
 * 测试 OvsParser 修复后的解析能力
 */
import OvsParser from '../src/parser/OvsParser.ts'

// 测试用例
const testCases = [
    {
        name: '基础 JS - const 声明',
        code: 'const a = 1'
    },
    {
        name: '基础 JS - let 声明',
        code: 'let x = 2'
    },
    {
        name: '基础 JS - 函数声明',
        code: 'function foo() { return 1 }'
    },
    {
        name: '基础 JS - 箭头函数',
        code: 'const fn = () => 123'
    },
    {
        name: '基础 JS - async 箭头函数',
        code: 'const fn = async () => 123'
    },
    {
        name: '基础 JS - 复合赋值 &&=',
        code: 'a &&= b'
    },
    {
        name: '基础 JS - 复合赋值 ||=',
        code: 'a ||= b'
    },
    {
        name: '基础 JS - 复合赋值 ??=',
        code: 'a ??= b'
    },
    {
        name: 'OVS - 简单视图',
        code: 'div { }'
    },
    {
        name: 'OVS - 嵌套视图',
        code: 'div { h1 { } }'
    },
    {
        name: 'OVS - 带字符串的视图',
        code: 'div { "hello" }'
    },
    {
        name: 'OVS - NoRenderBlock',
        code: 'div { #{ console.log(1) } }'
    },
    {
        name: 'OVS - ovsView 声明',
        code: 'ovsView MyCard(state): div { }'
    }
]

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' OvsParser 修复测试'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')

let passed = 0
let failed = 0

for (const testCase of testCases) {
    try {
        const parser = new OvsParser(testCase.code)
        const result = parser.Program()
        
        if (result && result.name === 'Program') {
            console.log(`✅ ${testCase.name}`)
            console.log(`   代码: ${testCase.code}`)
            console.log(`   Tokens: ${parser.parsedTokens.map(t => t.tokenName).join(', ')}`)
            passed++
        } else {
            console.log(`❌ ${testCase.name} - 解析结果无效`)
            console.log(`   代码: ${testCase.code}`)
            failed++
        }
    } catch (error: any) {
        console.log(`❌ ${testCase.name} - 解析失败`)
        console.log(`   代码: ${testCase.code}`)
        console.log(`   错误: ${error.message}`)
        failed++
    }
    console.log()
}

console.log('─'.repeat(80))
console.log(`结果: ${passed} 通过, ${failed} 失败`)

