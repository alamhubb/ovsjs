/**
 * OVS 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage1.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage1.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage1.ts 10 -s        # 从第10个开始，遇错停止
 */
import { TestContext, TestResult, parseToCst, runTests } from 'slime/tests/utils/test-framework'
import OvsParser from '../../src/parser/OvsParser'
import { OvsCstToSlimeAst } from '../../src/factory/OvsCstToSlimeAstUtil'

// 阶段1测试逻辑：解析代码生成 CST
function testStage1(ctx: TestContext): TestResult {
    // 使用 ctx 中的 ParserClass（OvsParser）
    const cst = parseToCst(ctx.code, ctx.parseMode, ctx.ParserClass)

    if (!cst) {
        return { success: false, message: 'CST 生成返回 undefined' }
    }

    const childCount = cst.children?.length || 0
    return {
        success: true,
        message: `CST生成成功 (${childCount} 个子节点)`
    }
}

// 运行测试
runTests(testStage1, {
    stageName: 'OVS 阶段1: CST生成测试',
    description: '词法分析 → 语法分析',
    ParserClass: OvsParser as any,
    CstToAstClass: OvsCstToSlimeAst,
    startFrom: 1,
    stopOnFail: true,
})

