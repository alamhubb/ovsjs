/**
 * 功能验证测试 - 确保 Packrat Parsing 没有破坏功能
 */
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

function test(name: string, code: string): boolean {
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        if (!cst || !cst.children || cst.children.length === 0) {
            console.log(`❌ ${name}: 解析失败（空CST）`)
            return false
        }
        
        console.log(`✅ ${name}`)
        return true
    } catch (error) {
        console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`)
        return false
    }
}

console.log("🧪 ES2020 功能验证测试\n")

const tests = [
    // 基础语法
    ["基础声明", "const x = 1"],
    ["箭头函数", "const f = () => 1"],
    
    // 解构
    ["数组解构", "const [a, b] = [1, 2]"],
    ["对象解构", "const {x, y} = obj"],
    ["嵌套解构", "const [[[deep]]] = [[[1]]]"],
    
    // ES2020 特性
    ["Optional Chaining", "obj?.prop"],
    ["Nullish Coalescing", "a ?? b"],
    ["BigInt", "const x = 123n"],
    ["Dynamic Import", "import('module')"],
    ["Export as", "export * as ns from './mod.js'"],
    
    // ES2016
    ["Exponentiation", "2 ** 3"],
    ["Exponentiation Assign", "x **= 2"],
    
    // 复杂表达式
    ["链式调用", "obj.method().prop"],
    ["三元运算符", "a ? b : c"],
    ["逻辑运算符", "a && b || c"],
    
    // 函数
    ["普通函数", "function foo() { return 1 }"],
    ["Async函数", "async function foo() { return 1 }"],
    ["Generator", "function* gen() { yield 1 }"],
    
    // 类
    ["基础类", "class Foo {}"],
    ["类继承", "class Bar extends Foo {}"],
    
    // 模块
    ["Export default", "export default class Foo {}"],
    ["Named export", "export const x = 1"],
    ["Import", "import {x} from './mod.js'"],
]

let passed = 0
let failed = 0

for (const [name, code] of tests) {
    if (test(name, code)) {
        passed++
    } else {
        failed++
    }
}

console.log(`\n${'='.repeat(70)}`)
console.log(`📊 测试结果: ${passed}/${tests.length} 通过`)
console.log(`${'='.repeat(70)}`)

if (failed === 0) {
    console.log(`\n🎉 所有功能测试通过！Packrat Parsing 工作正常！`)
} else {
    console.log(`\n⚠️  ${failed} 个测试失败，请检查`)
}

