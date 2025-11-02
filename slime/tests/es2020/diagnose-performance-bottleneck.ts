/**
 * 性能瓶颈诊断工具
 * 通过继承Es2020Parser并添加性能监控来定位瓶颈规则
 */

import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import Es2020TokenConsumer from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiMatchToken from '../../../subhuti/src/struct/SubhutiMatchToken.ts'
import {Subhuti, SubhutiRule} from 'subhuti/src/parser/SubhutiParser.ts'

// 性能统计数据
interface RuleStats {
    name: string
    callCount: number
    totalTime: number
    selfTime: number
    avgTime: number
}

const stats = new Map<string, RuleStats>()
let currentDepth = 0
const callStack: Array<{name: string, startTime: number}> = []

function initStat(name: string) {
    if (!stats.has(name)) {
        stats.set(name, {
            name,
            callCount: 0,
            totalTime: 0,
            selfTime: 0,
            avgTime: 0
        })
    }
}

function enterRule(name: string) {
    initStat(name)
    const stat = stats.get(name)!
    stat.callCount++
    callStack.push({name, startTime: performance.now()})
    currentDepth++
}

function exitRule(name: string) {
    currentDepth--
    const call = callStack.pop()
    if (!call || call.name !== name) {
        console.warn(`Stack mismatch: expected ${name}, got ${call?.name}`)
        return
    }
    
    const duration = performance.now() - call.startTime
    const stat = stats.get(name)!
    stat.totalTime += duration
    stat.selfTime += duration
    
    // 从父规则的selfTime中减去子规则的时间
    if (callStack.length > 0) {
        const parent = callStack[callStack.length - 1]
        const parentStat = stats.get(parent.name)!
        parentStat.selfTime -= duration
    }
}

/**
 * 带性能监控的 Es2020Parser
 */
@Subhuti
class DiagnosticParser extends Es2020Parser<Es2020TokenConsumer> {
    constructor(tokens?: SubhutiMatchToken[]) {
        super(tokens)
    }

    // ============ 监控 ES2020 关键规则 ============
    
    @SubhutiRule
    ExponentiationExpression() {
        enterRule('ExponentiationExpression')
        try {
            super.ExponentiationExpression()
        } finally {
            exitRule('ExponentiationExpression')
        }
    }

    @SubhutiRule
    UpdateExpression() {
        enterRule('UpdateExpression')
        try {
            super.UpdateExpression()
        } finally {
            exitRule('UpdateExpression')
        }
    }

    @SubhutiRule
    ShortCircuitExpression() {
        enterRule('ShortCircuitExpression')
        try {
            super.ShortCircuitExpression()
        } finally {
            exitRule('ShortCircuitExpression')
        }
    }

    @SubhutiRule
    CoalesceExpression() {
        enterRule('CoalesceExpression')
        try {
            super.CoalesceExpression()
        } finally {
            exitRule('CoalesceExpression')
        }
    }

    @SubhutiRule
    ConditionalExpression() {
        enterRule('ConditionalExpression')
        try {
            super.ConditionalExpression()
        } finally {
            exitRule('ConditionalExpression')
        }
    }

    @SubhutiRule
    LeftHandSideExpression() {
        enterRule('LeftHandSideExpression')
        try {
            super.LeftHandSideExpression()
        } finally {
            exitRule('LeftHandSideExpression')
        }
    }

    @SubhutiRule
    OptionalExpression() {
        enterRule('OptionalExpression')
        try {
            super.OptionalExpression()
        } finally {
            exitRule('OptionalExpression')
        }
    }

    // ============ 监控 ES6 关键规则 ============

    @SubhutiRule
    UnaryExpression() {
        enterRule('UnaryExpression')
        try {
            super.UnaryExpression()
        } finally {
            exitRule('UnaryExpression')
        }
    }

    @SubhutiRule
    PostfixExpression() {
        enterRule('PostfixExpression')
        try {
            super.PostfixExpression()
        } finally {
            exitRule('PostfixExpression')
        }
    }

    @SubhutiRule
    MultiplicativeExpression() {
        enterRule('MultiplicativeExpression')
        try {
            super.MultiplicativeExpression()
        } finally {
            exitRule('MultiplicativeExpression')
        }
    }

    @SubhutiRule
    AdditiveExpression() {
        enterRule('AdditiveExpression')
        try {
            super.AdditiveExpression()
        } finally {
            exitRule('AdditiveExpression')
        }
    }

    @SubhutiRule
    AssignmentExpression() {
        enterRule('AssignmentExpression')
        try {
            super.AssignmentExpression()
        } finally {
            exitRule('AssignmentExpression')
        }
    }

    @SubhutiRule
    LogicalORExpression() {
        enterRule('LogicalORExpression')
        try {
            super.LogicalORExpression()
        } finally {
            exitRule('LogicalORExpression')
        }
    }

    @SubhutiRule
    LogicalANDExpression() {
        enterRule('LogicalANDExpression')
        try {
            super.LogicalANDExpression()
        } finally {
            exitRule('LogicalANDExpression')
        }
    }

    @SubhutiRule
    BitwiseORExpression() {
        enterRule('BitwiseORExpression')
        try {
            super.BitwiseORExpression()
        } finally {
            exitRule('BitwiseORExpression')
        }
    }

    @SubhutiRule
    BitwiseXORExpression() {
        enterRule('BitwiseXORExpression')
        try {
            super.BitwiseXORExpression()
        } finally {
            exitRule('BitwiseXORExpression')
        }
    }

    @SubhutiRule
    BitwiseANDExpression() {
        enterRule('BitwiseANDExpression')
        try {
            super.BitwiseANDExpression()
        } finally {
            exitRule('BitwiseANDExpression')
        }
    }

    @SubhutiRule
    EqualityExpression() {
        enterRule('EqualityExpression')
        try {
            super.EqualityExpression()
        } finally {
            exitRule('EqualityExpression')
        }
    }

    @SubhutiRule
    RelationalExpression() {
        enterRule('RelationalExpression')
        try {
            super.RelationalExpression()
        } finally {
            exitRule('RelationalExpression')
        }
    }

    @SubhutiRule
    ShiftExpression() {
        enterRule('ShiftExpression')
        try {
            super.ShiftExpression()
        } finally {
            exitRule('ShiftExpression')
        }
    }
}

// 诊断函数
function diagnose(code: string) {
    console.log(`\n🔍 诊断代码: ${code}`)
    console.log("=".repeat(80))
    
    // 清空统计
    stats.clear()
    callStack.length = 0
    currentDepth = 0
    
    // 解析
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const totalStart = performance.now()
    const parser = new DiagnosticParser(tokens)
    parser.Program()
    const totalTime = performance.now() - totalStart
    
    // 计算平均时间
    for (const stat of stats.values()) {
        stat.avgTime = stat.totalTime / stat.callCount
    }
    
    // 排序：按总时间降序
    const sorted = Array.from(stats.values()).sort((a, b) => b.totalTime - a.totalTime)
    
    // 输出结果
    console.log(`\n⏱️  总耗时: ${totalTime.toFixed(2)}ms`)
    console.log(`📊 监控规则数: ${stats.size}`)
    console.log(`📞 总调用次数: ${Array.from(stats.values()).reduce((sum, s) => sum + s.callCount, 0)}`)
    
    console.log(`\n🏆 Top 10 性能瓶颈（按总耗时）：\n`)
    console.log("排名 | 规则名                       | 调用次数 | 总耗时(ms) | 自身耗时(ms) | 平均(ms)")
    console.log("-".repeat(100))
    
    sorted.slice(0, 10).forEach((stat, idx) => {
        const percent = (stat.totalTime / totalTime * 100).toFixed(1)
        console.log(
            `${String(idx + 1).padStart(3)} | ` +
            `${stat.name.padEnd(28)} | ` +
            `${String(stat.callCount).padStart(8)} | ` +
            `${stat.totalTime.toFixed(2).padStart(10)} (${percent}%) | ` +
            `${stat.selfTime.toFixed(2).padStart(12)} | ` +
            `${stat.avgTime.toFixed(2).padStart(7)}`
        )
    })
    
    console.log(`\n🔥 调用次数 Top 10：\n`)
    const byCallCount = Array.from(stats.values()).sort((a, b) => b.callCount - a.callCount)
    console.log("排名 | 规则名                       | 调用次数 | 总耗时(ms)")
    console.log("-".repeat(70))
    
    byCallCount.slice(0, 10).forEach((stat, idx) => {
        console.log(
            `${String(idx + 1).padStart(3)} | ` +
            `${stat.name.padEnd(28)} | ` +
            `${String(stat.callCount).padStart(8)} | ` +
            `${stat.totalTime.toFixed(2).padStart(10)}`
        )
    })
    
    console.log("\n" + "=".repeat(80))
    
    return {totalTime, stats: sorted}
}

// 运行诊断
console.log("🚀 ES2020Parser 性能瓶颈诊断工具\n")

console.log("【测试1】单层嵌套（基准）")
diagnose("const [a] = [1]")

console.log("\n\n【测试2】双层嵌套")
diagnose("const [[a]] = [[1]]")

console.log("\n\n【测试3】三层嵌套（问题代码）")
const result = diagnose("const [[[a]]] = [[[1]]]")

console.log("\n\n" + "=".repeat(80))
console.log("💡 分析结论\n")

// 找出最可疑的规则
const top3 = result.stats.slice(0, 3)
console.log("🎯 Top 3 性能瓶颈规则：\n")
top3.forEach((stat, idx) => {
    const percent = (stat.totalTime / result.totalTime * 100).toFixed(1)
    console.log(`${idx + 1}. ${stat.name}`)
    console.log(`   - 总耗时: ${stat.totalTime.toFixed(2)}ms (${percent}%)`)
    console.log(`   - 调用次数: ${stat.callCount}`)
    console.log(`   - 平均耗时: ${stat.avgTime.toFixed(2)}ms`)
    console.log(`   - 自身耗时: ${stat.selfTime.toFixed(2)}ms\n`)
})

console.log("📌 性能瓶颈特征：")
const avgCallRatio = result.stats[0].callCount / result.stats[result.stats.length - 1].callCount
if (avgCallRatio > 10) {
    console.log("   ❌ 调用次数严重不均衡 - 存在指数级递归或回溯")
}
if (result.stats[0].totalTime > result.totalTime * 0.5) {
    console.log(`   ❌ 单个规则占用超过50%时间 - ${result.stats[0].name} 是主要瓶颈`)
}
if (result.stats[0].avgTime > 100) {
    console.log("   ❌ 单次调用平均耗时过高 - 可能存在重复计算")
}

console.log("\n" + "=".repeat(80))

