/**
 * 快速性能测试 - 仅测试到三层
 */
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

function testPerf(name: string, code: string) {
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const start = performance.now()
    const parser = new Es2020Parser(tokens)
    parser.Program()
    const time = performance.now() - start
    
    console.log(`${name}: ${time.toFixed(2)}ms`)
    return time
}

console.log("🚀 快速性能测试\n")
const t1 = testPerf("单层", "const [a] = [1]")
const t2 = testPerf("双层", "const [[a]] = [[1]]")
const t3 = testPerf("三层", "const [[[a]]] = [[[1]]]")

console.log(`\n📊 增长率：`)
console.log(`  单→双: ${(t2/t1).toFixed(1)}x`)
console.log(`  双→三: ${(t3/t2).toFixed(1)}x`)
console.log(`  单→三: ${(t3/t1).toFixed(1)}x`)

if (t3 > 1000) {
    console.log("\n❌ 严重性能问题！三层嵌套 > 1秒")
} else if (t3 > 500) {
    console.log("\n⚠️  性能问题明显，需要优化")
} else {
    console.log("\n✅ 性能可接受")
}

