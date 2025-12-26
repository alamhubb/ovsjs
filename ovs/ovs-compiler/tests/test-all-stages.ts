/**
 * OVS 各阶段测试脚本
 * 测试: 1. 词法分析 2. 语法分析(CST) 3. AST转换 4. 代码生成
 */
import { readFileSync } from 'fs'
import OvsParser from '../src/parser/OvsParser'
import {OvsCstToSlimeAstUtils} from '../src/factory/OvsCstToSlimeAstUtils'
import { SlimeGenerator } from 'slime-generator'
import { vitePluginOvsTransform } from '../src/index'

const testCode = `
import { ref } from 'vue';

const msg = "Hello OVS!"
let count = ref(0)

// 定义一个小组件（view 是软关键字，可以在其他地方作为变量名使用）
view Counter(props) {
  div({ class: 'counter' }) {
    span { 'Count: ' }
    strong { props.count }
  }
}

// 主视图
div({ class: 'app' }) {
  h1 { msg }
  Counter({ count: count.value })
}
`.trim()

console.log('=' .repeat(60))
console.log('OVS 各阶段测试')
console.log('=' .repeat(60))

console.log('\n【阶段0】源代码:')
console.log('-'.repeat(40))
console.log(testCode)

// 阶段1: 词法分析
console.log('\n【阶段1】词法分析 (Lexer)')
console.log('-'.repeat(40))
try {
    const parser = new OvsParser(testCode)
    // 触发词法分析
    parser.Program()
    const tokens = parser.parsedTokens
    console.log(`✅ 词法分析成功, Token 数量: ${tokens.length}`)
    console.log('前10个Token:', tokens.slice(0, 10).map(t => `${t.type}:"${t.value}"`).join(', '))
} catch (e: any) {
    console.log('❌ 词法分析失败:', e.message)
}

// 阶段2: 语法分析 (CST)
console.log('\n【阶段2】语法分析 (Parser -> CST)')
console.log('-'.repeat(40))
let cst: any = null
try {
    const parser = new OvsParser(testCode)
    cst = parser.Program()
    console.log('✅ 语法分析成功')
    console.log('CST 根节点:', cst?.name)
    console.log('CST children 数量:', cst?.children?.length)
    
    // 查找 ovsView 声明
    function findNodes(node: any, name: string, results: any[] = []): any[] {
        if (!node) return results
        if (node.name === name) results.push(node)
        if (node.children) {
            for (const child of node.children) {
                findNodes(child, name, results)
            }
        }
        return results
    }
    
    const ovsViews = findNodes(cst, 'OvsViewDeclaration')
    console.log(`找到 ${ovsViews.length} 个 ovsView 声明`)
} catch (e: any) {
    console.log('❌ 语法分析失败:', e.message)
}

// 阶段3: AST 转换
console.log('\n【阶段3】AST 转换 (CST -> AST)')
console.log('-'.repeat(40))
let ast: any = null
try {
    if (cst) {
        ast = OvsCstToSlimeAstUtils.toProgram(cst)
        console.log('✅ AST 转换成功')
        console.log('AST body 数量:', ast?.body?.length)
        console.log('AST body 类型:', ast?.body?.map((n: any) => n.type).join(', '))
    }
} catch (e: any) {
    console.log('❌ AST 转换失败:', e.message)
    console.log('错误堆栈:', e.stack?.split('\n').slice(0, 5).join('\n'))
}

// 阶段4: 代码生成
console.log('\n【阶段4】代码生成 (AST -> JavaScript)')
console.log('-'.repeat(40))
try {
    if (ast) {
        const result = SlimeGenerator.generator(ast, [])
        console.log('✅ 代码生成成功')
        console.log('生成代码长度:', result.code.length)
        console.log('\n生成的代码:')
        console.log(result.code)
    }
} catch (e: any) {
    console.log('❌ 代码生成失败:', e.message)
}

// 阶段5: 完整 Vite 插件转换
console.log('\n【阶段5】完整 Vite 插件转换')
console.log('-'.repeat(40))
try {
    const result = vitePluginOvsTransform(testCode)
    console.log('✅ Vite 插件转换成功')
    console.log('最终代码:')
    console.log(result.code)
} catch (e: any) {
    console.log('❌ Vite 插件转换失败:', e.message)
}

console.log('\n' + '='.repeat(60))
console.log('测试完成')
console.log('='.repeat(60))

