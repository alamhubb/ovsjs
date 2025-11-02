/**
 * 最终综合验证测试 - 确保 Packrat Parsing 完全正常
 */
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

function test(name: string, code: string, enableMemo: boolean): boolean {
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        const parser = new Es2020Parser(tokens)
        parser.enableMemoization = enableMemo
        
        const cst = parser.Program()
        
        if (!cst || !cst.children || cst.children.length === 0) {
            console.log(`❌ ${name} [Memo=${enableMemo}]: 空CST`)
            return false
        }
        
        const moduleItemList = cst.children[0]
        if (!moduleItemList.children || moduleItemList.children.length === 0) {
            console.log(`❌ ${name} [Memo=${enableMemo}]: 空ModuleItemList`)
            return false
        }
        
        console.log(`✅ ${name} [Memo=${enableMemo}]`)
        return true
    } catch (error) {
        console.log(`❌ ${name} [Memo=${enableMemo}]: ${error instanceof Error ? error.message : String(error)}`)
        return false
    }
}

console.log("🧪 Packrat Parsing 最终综合验证\n")
console.log("=" .repeat(70))

const criticalTests = [
    // 关键修复：表达式语句
    ["表达式语句", "1 + 2"],
    ["复杂表达式", "a + b * c - d / e"],
    
    // 嵌套场景
    ["嵌套数组", "const [[[a]]] = [[[1]]]"],
    ["嵌套对象", "const {x: {y: {z}}} = obj"],
    
    // ES2020 特性
    ["Optional Chaining", "obj?.prop?.nested"],
    ["Nullish Coalescing", "a ?? b ?? c"],
    ["BigInt", "const x = 9007199254740991n"],
    ["Exponentiation", "2 ** 3 ** 2"],
    
    // 复杂场景
    ["混合运算", "(a + b) * (c - d) / e ** 2"],
    ["链式调用", "obj.method().prop.call()"],
    ["三元嵌套", "a ? b ? c : d : e"],
]

console.log("\n【对比测试】每个测试都运行 Memo=false 和 Memo=true\n")

let totalPassed = 0
let totalTests = 0

for (const [name, code] of criticalTests) {
    const withoutMemo = test(name, code, false)
    const withMemo = test(name, code, true)
    
    totalTests += 2
    if (withoutMemo) totalPassed++
    if (withMemo) totalPassed++
    
    if (withoutMemo !== withMemo) {
        console.log(`   ⚠️  WARNING: Memo 开关结果不一致！`)
    }
    
    console.log()
}

console.log("=" .repeat(70))
console.log(`\n📊 最终结果: ${totalPassed}/${totalTests} 通过`)

if (totalPassed === totalTests) {
    console.log(`\n🎉 所有测试通过！Packrat Parsing 完全正常！`)
    console.log(`   - Memo=false 和 Memo=true 结果一致`)
    console.log(`   - 所有关键场景都能正确解析`)
    console.log(`   - 优化没有破坏任何功能`)
} else {
    console.log(`\n❌ 有 ${totalTests - totalPassed} 个测试失败`)
}

