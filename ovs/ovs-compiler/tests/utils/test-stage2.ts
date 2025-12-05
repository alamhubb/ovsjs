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
import {runTests, testStage2} from 'slime-test/src/utils/test-framework.ts'
import OvsParser from "../../src/parser/OvsParser.ts";
import {OvsCstToSlimeAst} from "../../src/factory/OvsCstToSlimeAstUtil.ts";

// 运行测试
runTests(testStage2, {
  stageName: 'OVS 阶段2: AST生成测试',
  description: 'CST → AST 转换，验证 AST 结构完整性',
  ParserClass: OvsParser as any,
  CstToAstClass: OvsCstToSlimeAst,
  startFrom: 1,
  stopOnFail: true,
})

