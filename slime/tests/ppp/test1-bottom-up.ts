import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `1 + 2`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens:', tokens.map(t => `${t.tokenName}="${t.tokenValue}"`).join(', '))

// 从最底层开始逐级测试
const tests = [
    // Level 1: 最基础
    { name: 'Literal', rule: 'Literal' },
    { name: 'PrimaryExpression', rule: 'PrimaryExpression' },
    
    // Level 2: 表达式层级
    { name: 'UnaryExpression', rule: 'UnaryExpression' },
    { name: 'UpdateExpression', rule: 'UpdateExpression' },
    { name: 'ExponentiationExpression', rule: 'ExponentiationExpression' },
    { name: 'MultiplicativeExpression', rule: 'MultiplicativeExpression' },
    { name: 'AdditiveExpression', rule: 'AdditiveExpression' },
    
    // Level 3: 位运算和逻辑运算
    { name: 'ShiftExpression', rule: 'ShiftExpression' },
    { name: 'RelationalExpression', rule: 'RelationalExpression' },
    { name: 'EqualityExpression', rule: 'EqualityExpression' },
    { name: 'BitwiseANDExpression', rule: 'BitwiseANDExpression' },
    { name: 'BitwiseXORExpression', rule: 'BitwiseXORExpression' },
    { name: 'BitwiseORExpression', rule: 'BitwiseORExpression' },
    
    // Level 4: ES2020 新特性
    { name: 'CoalesceExpression', rule: 'CoalesceExpression' },
    { name: 'ShortCircuitExpression', rule: 'ShortCircuitExpression' },
    { name: 'LogicalANDExpression', rule: 'LogicalANDExpression' },
    { name: 'LogicalORExpression', rule: 'LogicalORExpression' },
    
    // Level 5: 条件和赋值
    { name: 'ConditionalExpression', rule: 'ConditionalExpression' },
    { name: 'AssignmentExpression', rule: 'AssignmentExpression' },
    { name: 'Expression', rule: 'Expression' },
]

console.log('\n=== 逐级测试（从底层到顶层）：\n')

for (const test of tests) {
    try {
        const parser = new Es2020Parser(tokens) as any
        const result = parser[test.rule]()
        
        // 检查是否消费了所有tokens
        const consumed = parser.tokenIndex
        const hasChildren = result.children && result.children.length > 0
        
        console.log(`✅ ${test.name.padEnd(30)} - 成功 (consumed: ${consumed}/${tokens.length}, has children: ${hasChildren})`)
        
    } catch (e: any) {
        console.log(`❌ ${test.name.padEnd(30)} - 失败: ${e.message}`)
        console.log(`   错误位置: ${test.rule}`)
        break // 在第一个失败处停止
    }
}

