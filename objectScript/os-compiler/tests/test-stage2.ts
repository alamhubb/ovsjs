/**
 * OVS 阶段2: AST生成测试
 * 测试范围: CST → AST转换
 * 前提: 阶段1已通过（CST可以正常生成）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage2.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage2.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage2.ts 10 -s        # 从第10个开始，遇错停止
 */
import { runTests, testStage2 } from 'slime-test'
import ObjectScriptParser from "../src/parser/ObjectScriptParser";
import {ObjectCstToSlimeAst} from "../src/factory/ObjectCstToSlimeAst";

// 运行测试
runTests(testStage2, {
    stageName: 'OVS 阶段2: AST生成测试',
    description: 'CST → AST 转换，验证 AST 结构完整性',
    ParserClass: ObjectScriptParser as any,
    CstToAstClass: ObjectCstToSlimeAst,
    startFrom: 1,
    stopOnFail: true,
})

