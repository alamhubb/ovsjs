/**
 * 阶段2: AST生成测试
 * 测试范围: CST → AST转换
 * 前提: 阶段1已通过（CST可以正常生成）
 *
 * 用法:
 *   npx tsx slime/packages/slime-test/src/utils/test-stage2.ts              # 从头开始测试
 *   npx tsx slime/packages/slime-test/src/utils/test-stage2.ts 100          # 从第100个开始
 *   npx tsx slime/packages/slime-test/src/utils/test-stage2.ts 100 -s       # 从第100个开始，遇错停止
 */
import {runTests, testStage2} from "./test-framework.ts";

// 运行测试
runTests(testStage2, {
  stageName: '阶段2: AST生成测试',
  description: 'CST → AST 转换，验证 AST 结构完整性',
  startFrom: 1,
  stopOnFail: true,
})
