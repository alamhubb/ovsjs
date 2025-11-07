import SubhutiTraceDebugger from "../src/SubhutiDebug.ts";

console.log('\n🧪 测试深度调整逻辑')
console.log('='.repeat(60))

const tracer = new SubhutiTraceDebugger([])
const outputs: Array<{text: string, depth: number}> = []

// 捕获输出
const originalLog = console.log
console.log = (...args: any[]) => {
    const text = args.join(' ')
    // 计算缩进深度（每2个空格算1层）
    const match = text.match(/^(\s*)/)
    const depth = match ? match[1].length / 2 : 0
    outputs.push({ text: text.trim(), depth })
}

// 模拟解析 "let a = 1" 的事件序列
tracer.onRuleEnter('Script')           // depth=0
tracer.onRuleEnter('StatementList')    // depth=1
tracer.onRuleEnter('StatementListItem') // depth=2
tracer.onRuleEnter('Declaration')      // depth=3
tracer.onRuleEnter('LexicalDeclaration') // depth=4
tracer.onRuleEnter('LetOrConst')       // depth=5
tracer.onOrBranch?.(0, 2)

// 消费 let 并退出 LetOrConst
tracer.onTokenConsume(0, 'let', 'LetTok', true)
tracer.onRuleExit('LetOrConst', false, 0)

tracer.onRuleEnter('BindingList')      // depth=5 (LetOrConst已退出)
tracer.onRuleEnter('LexicalBinding')   // depth=6
tracer.onRuleEnter('BindingIdentifier') // depth=7
tracer.onOrBranch?.(0, 3)
tracer.onRuleEnter('Identifier')       // depth=8

// 消费 a
tracer.onTokenConsume(1, 'a', 'Identifier', true)

// 恢复 console.log
console.log = originalLog

// 验证输出
console.log('捕获的输出：')
outputs.forEach((output, i) => {
    console.log(`[${i}] depth=${output.depth}: ${output.text}`)
})

// 期望的深度（基于用户需求）
const expected = [
    { text: /Script.*LexicalDeclaration/, depth: 0 },  // 折叠链
    { text: /LetOrConst.*\[Or\]/, depth: 1 },         // LexicalDeclaration 的子节点
    { text: /token.*let/, depth: 2 },                 // LetOrConst 的子节点（token）
    { text: /BindingList.*LexicalBinding/, depth: 1 }, // 和 LetOrConst 同级！
    { text: /BindingIdentifier.*\[Or\]/, depth: 2 },  // LexicalBinding 的子节点
    { text: /Identifier/, depth: 3 },                 // BindingIdentifier 的子节点
    { text: /token.*a/, depth: 4 }                    // Identifier 的子节点（token）
]

console.log('\n验证结果：')
let passed = true
for (let i = 0; i < expected.length; i++) {
    const actual = outputs[i]
    const exp = expected[i]
    const match = exp.text.test(actual.text)
    const depthOk = actual.depth === exp.depth
    const ok = match && depthOk

    if (!ok) {
        console.log(`❌ [${i}] 失败`)
        console.log(`   期望: depth=${exp.depth}, pattern=${exp.text}`)
        console.log(`   实际: depth=${actual.depth}, text=${actual.text}`)
        passed = false
    } else {
        console.log(`✅ [${i}] 通过 - depth=${actual.depth}`)
    }
}

console.log('\n' + '='.repeat(60))
if (passed) {
    console.log('🎉 所有测试通过！')
} else {
    console.log('❌ 测试失败！')
}
console.log('='.repeat(60))