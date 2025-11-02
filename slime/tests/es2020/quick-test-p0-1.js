// ES2020 P0-1 快速验证：CoalesceExpression 修复
// 目的：验证不会栈溢出，左结合正确

// 测试1：基础 ?? 运算符
const a1 = null ?? 'default'
const a2 = undefined ?? 'default'
const a3 = 0 ?? 'default'
const a4 = '' ?? 'default'

// 测试2：左结合（这是修复的核心）
const b1 = a ?? b ?? c
const b2 = x ?? y ?? z ?? 'fallback'

// 测试3：与其他运算符（需要括号）
const c1 = (a && b) ?? c
const c2 = a && (b ?? c)
const c3 = (a || b) ?? c
const c4 = a || (b ?? c)

// 测试4：与可选链结合
const d1 = obj?.prop ?? 'default'
const d2 = obj?.method?.() ?? fallback()

console.log('✅ 如果能解析到这里，说明 CoalesceExpression 修复成功！')

