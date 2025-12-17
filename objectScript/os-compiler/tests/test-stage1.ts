/**
 * OVS 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage1.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage1.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage1.ts 10 -s        # 从第10个开始，遇错停止
 */
import { runTests, testStage1 } from 'slime-test'
import ObjectScriptParser from "../src/parser/ObjectScriptParser";
import {ObjectCstToSlimeAst} from "../src/factory/ObjectCstToSlimeAst";

// 运行测试
runTests(testStage1, {
    stageName: 'OVS 阶段1: CST生成测试',
    description: '词法分析 → 语法分析',
    ParserClass: ObjectScriptParser as any,
    CstToAstClass: ObjectCstToSlimeAst,
    startFrom: 1,
    stopOnFail: true,
})

