/**
 * Es6Parser 回归测试 - 验证 Packrat Parsing 没有破坏 Es6Parser
 */
import Es6Parser from '../packages/slime-parser/src/language/es2015/Es6Parser.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es6Tokens } from '../packages/slime-parser/src/language/es2015/Es6Tokens.ts'

function test(name: string, code: string): boolean {
    try {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.tokenize(code)
        const parser = new Es6Parser(tokens)
        const cst = parser.Program()
        
        if (!cst || !cst.children || cst.children.length === 0) {
            console.log(`❌ ${name}`)
            return false
        }
        
        console.log(`✅ ${name}`)
        return true
    } catch (error) {
        console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`)
        return false
    }
}

console.log("🧪 Es6Parser 回归测试（验证 Packrat Parsing）\n")

const tests = [
    ["基础声明", "const x = 1"],
    ["箭头函数", "const f = x => x * 2"],
    ["解构", "const [a, b] = [1, 2]"],
    ["Spread", "const arr = [...[1, 2]]"],
    ["类", "class Foo { constructor() {} }"],
    ["模块", "export default class Bar {}"],
    ["Generator", "function* gen() { yield 1 }"],
    ["Async", "async function foo() {}"],
    ["模板字符串", "const s = `hello ${world}`"],
    ["嵌套数组", "const [[[a]]] = [[[1]]]"],
]

let passed = 0
for (const [name, code] of tests) {
    if (test(name, code)) passed++
}

console.log(`\n📊 测试结果: ${passed}/${tests.length} 通过`)

if (passed === tests.length) {
    console.log(`\n🎉 Es6Parser 回归测试全部通过！`)
} else {
    console.log(`\n⚠️  有测试失败`)
}

