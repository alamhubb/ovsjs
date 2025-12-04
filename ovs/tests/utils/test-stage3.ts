/**
 * OVS 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 验证方式: 比较输入代码和输出代码的 token 序列是否一致
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage3.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage3.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage3.ts 10 -s        # 从第10个开始，遇错停止
 */
import {runTests, testStage3} from 'slime-test/src/utils/test-framework.ts'
import OvsParser from '../../src/parser/OvsParser'
import {OvsCstToSlimeAst} from '../../src/factory/OvsCstToSlimeAstUtil'

// 运行测试
runTests(testStage3, {
  stageName: 'OVS 阶段3: 代码生成测试',
  description: 'AST → JavaScript代码，比较输入/输出的 token 序列',
  ParserClass: OvsParser as any,
  CstToAstClass: OvsCstToSlimeAst,
  startFrom: 1,
  stopOnFail: true,
})
