/**
 * OVS 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage1.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage1.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage1.ts 10 -s        # 从第10个开始，遇错停止
 */
import {runTests, testStage1} from 'slime-test/src/utils/test-framework.ts'
import OvsParser from "../../src/parser/OvsParser.ts";
import {OvsCstToSlimeAst} from "../../src/factory/OvsCstToSlimeAstUtil.ts";

// 运行测试
runTests(testStage1, {
    stageName: 'OVS 阶段1: CST生成测试',
    description: '词法分析 → 语法分析',
    ParserClass: OvsParser as any,
    CstToAstClass: OvsCstToSlimeAst,
    startFrom: 1,
    stopOnFail: true,
})

