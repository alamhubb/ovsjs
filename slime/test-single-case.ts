// 单独测试一个用例的快速脚本
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import {SlimeCstToAst} from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'

const testFile = process.argv[2] || 'tests/cases/55-arrow-function-concise-body.js'

console.log(`\n测试文件: ${testFile}`)
console.log('='.repeat(60))

try {
    // 读取测试文件
    const code = fs.readFileSync(testFile, 'utf-8')
    console.log(`✅ 文件读取成功，代码长度: ${code.length}字符\n`)

    // 1. 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    console.log(`✅ 词法分析完成，Token数: ${tokens.length}`)

    // 2. 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ 语法分析完成，CST节点: ${cst?.name || 'null'}`)

    if (!cst || !cst.children || cst.children.length === 0) {
        console.error('❌ CST为空，解析失败')
        process.exit(1)
    }

    // 3. CST -> AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    console.log(`✅ AST转换完成，顶层语句数: ${ast.body?.length || 0}`)

    if (!ast.body || ast.body.length === 0) {
        console.error('❌ AST为空，转换失败')
        process.exit(1)
    }

    // 4. 代码生成
    const result = SlimeGenerator.generator(ast, tokens)
    console.log(`✅ 代码生成完成，代码长度: ${result.code.length}字符\n`)

    // 5. 显示生成的代码（前500字符）
    console.log('生成的代码（前500字符）:')
    console.log('-'.repeat(60))
    console.log(result.code.substring(0, 500))
    if (result.code.length > 500) {
        console.log('...(省略剩余 ' + (result.code.length - 500) + ' 字符)')
    }
    console.log('-'.repeat(60))

    // 6. 关键验证：检查是否包含关键语法
    const checks = [
        { pattern: /=>\s*\{/, desc: '函数体（{ ... }）' },
        { pattern: /=>\s*\(\{/, desc: '对象字面量表达式（({ ... })）' },
        { pattern: /=>\s*[^{(]/, desc: '普通表达式' },
    ]

    console.log('\n关键语法检查:')
    for (const check of checks) {
        const found = check.pattern.test(result.code)
        console.log(`${found ? '✅' : '⚠️'} ${check.desc}: ${found ? '发现' : '未发现'}`)
    }

    console.log('\n🎉 测试完成！\n')

} catch (error) {
    console.error('\n❌ 测试失败:')
    console.error(error.message)
    console.error(error.stack)
    process.exit(1)
}

