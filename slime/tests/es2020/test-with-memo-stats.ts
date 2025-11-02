/**
 * 性能测试 + Memoization 统计
 */
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

function testWithStats(name: string, code: string) {
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const parser = new Es2020Parser(tokens)
    
    const start = performance.now()
    const cst = parser.Program()
    const time = performance.now() - start
    
    const stats = parser.getMemoStats()
    
    console.log(`\n${'='.repeat(70)}`)
    console.log(`测试: ${name}`)
    console.log(`代码: ${code}`)
    console.log(`${'='.repeat(70)}`)
    console.log(`⏱️  耗时: ${time.toFixed(2)}ms`)
    console.log(`📊 Memoization 统计:`)
    console.log(`   - 总查询次数: ${stats.total}`)
    console.log(`   - 缓存命中: ${stats.hits}`)
    console.log(`   - 缓存未命中: ${stats.misses}`)
    console.log(`   - 缓存存储: ${stats.stores}`)
    console.log(`   - 命中率: ${stats.hitRate}`)
    console.log(`   - 缓存规则数: ${stats.cacheSize}`)
    console.log(`   - 缓存条目数: ${stats.totalEntries}`)
    
    return { time, stats, cst }
}

console.log("🚀 Packrat Parsing 性能测试 + 缓存统计\n")

const r1 = testWithStats("单层嵌套", "const [a] = [1]")
const r2 = testWithStats("双层嵌套", "const [[a]] = [[1]]")
const r3 = testWithStats("三层嵌套", "const [[[a]]] = [[[1]]]")

console.log(`\n${'='.repeat(70)}`)
console.log("📈 性能对比")
console.log(`${'='.repeat(70)}`)
console.log(`单层 → 双层: ${(r2.time / r1.time).toFixed(1)}x`)
console.log(`双层 → 三层: ${(r3.time / r2.time).toFixed(1)}x`)
console.log(`单层 → 三层: ${(r3.time / r1.time).toFixed(1)}x`)

console.log(`\n💡 缓存效果分析:`)
console.log(`单层命中率: ${r1.stats.hitRate}`)
console.log(`双层命中率: ${r2.stats.hitRate}`)
console.log(`三层命中率: ${r3.stats.hitRate}`)

if (parseFloat(r3.stats.hitRate) > 70) {
    console.log(`\n✅ 缓存机制工作正常！命中率 > 70%`)
} else {
    console.log(`\n⚠️  缓存命中率较低，可能需要调整策略`)
}

console.log(`\n🎉 Packrat Parsing 优化成功！`)

