import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `1 + 2`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens:')
tokens.forEach((t, i) => console.log(`  ${i}: ${t.tokenName} = "${t.tokenValue}"`))

try {
    const parser = new Es2020Parser(tokens)
    
    // 测试直接调用 Expression
    console.log('\n=== 测试 Expression()：')
    const exprResult = parser.Expression()
    console.log('Expression CST:', JSON.stringify(exprResult, null, 2))
    
} catch (e: any) {
    console.error('\n=== 解析错误：')
    console.error(e.message)
    console.error(e.stack)
}

// 重新创建 parser 测试 Program
try {
    console.log('\n=== 测试 Program()：')
    const parser2 = new Es2020Parser(tokens)
    const programResult = parser2.Program()
    console.log('Program CST children数量:', programResult.children.length)
    console.log('ModuleItemList children:', programResult.children[0]?.children?.length || 0)
    
} catch (e: any) {
    console.error('\n=== 解析错误：')
    console.error(e.message)
}

