// 快速验证 ConciseBody 修复
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import {SlimeCstToAst} from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

// 关键测试用例
const tests = [
    {
        name: '函数体（块语句）',
        code: 'const f = x => { return x + 1; }',
        expected: 'return'  // 应该包含return关键字
    },
    {
        name: '对象字面量表达式',
        code: 'const f = x => ({ value: x })',
        expected: 'value'  // 应该包含属性名
    },
    {
        name: '普通表达式',
        code: 'const f = x => x + 1',
        expected: '+'  // 应该包含加号
    }
]

console.log('\n🧪 ConciseBody规则顺序修复验证\n' + '='.repeat(60))

for (const test of tests) {
    console.log(`\n测试: ${test.name}`)
    console.log(`输入: ${test.code}`)
    
    try {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(test.code)
        const parser = new Es6Parser(tokens)
        const cst = parser.Program()
        const slimeCstToAst = new SlimeCstToAst()
        const ast = slimeCstToAst.toProgram(cst)
        const result = SlimeGenerator.generator(ast, tokens)
        
        console.log(`输出: ${result.code}`)
        
        if (result.code.includes(test.expected)) {
            console.log(`✅ 通过 - 包含预期内容: "${test.expected}"`)
        } else {
            console.log(`❌ 失败 - 未找到预期内容: "${test.expected}"`)
        }
    } catch (error) {
        console.log(`❌ 解析失败: ${error.message}`)
    }
}

console.log('\n' + '='.repeat(60))
console.log('验证完成！\n')












