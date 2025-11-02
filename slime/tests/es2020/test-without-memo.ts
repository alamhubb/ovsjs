/**
 * 测试关闭 Memoization 后是否能正常解析
 */
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import JsonUtil from '../../../subhuti/src/utils/JsonUtil.ts'
import { traverseClearLoc, traverseClearTokens } from '../utils/parserTestUtils.ts'

const code = `1 + 2`

console.log("🧪 测试：关闭 Memoization")
console.log(`代码: ${code}\n`)

// 测试1：关闭缓存
console.log("【测试1】Memoization = false")
{
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const parser = new Es2020Parser(tokens)
    parser.enableMemoization = false  // 关闭缓存
    
    const cst = parser.Program()
    const outCst = JsonUtil.cloneDeep(cst)
    let cstForAst = traverseClearTokens(outCst)
    cstForAst = traverseClearLoc(cstForAst)
    
    console.log('CST children 数量:', cst.children?.length || 0)
    if (cst.children && cst.children.length > 0) {
        console.log('ModuleItemList children:', cst.children[0].children?.length || 0)
    }
    console.log('✅ 完整 CST:\n', JSON.stringify(cstForAst, null, 2))
}

console.log("\n" + "=".repeat(70) + "\n")

// 测试2：开启缓存
console.log("【测试2】Memoization = true（默认）")
{
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const parser = new Es2020Parser(tokens)
    // enableMemoization 默认为 true
    
    const cst = parser.Program()
    const stats = parser.getMemoStats()
    
    const outCst = JsonUtil.cloneDeep(cst)
    let cstForAst = traverseClearTokens(outCst)
    cstForAst = traverseClearLoc(cstForAst)
    
    console.log('CST children 数量:', cst.children?.length || 0)
    if (cst.children && cst.children.length > 0) {
        console.log('ModuleItemList children:', cst.children[0].children?.length || 0)
    }
    console.log('缓存统计:', stats)
    console.log('✅ 完整 CST:\n', JSON.stringify(cstForAst, null, 2))
}

console.log("\n" + "=".repeat(70))

