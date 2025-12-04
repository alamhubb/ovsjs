/**
 * 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 *
 * 用法:
 *   npx tsx slime/packages/slime-test/src/utils/test-stage1.ts              # 从头开始测试
 *   npx tsx slime/packages/slime-test/src/utils/test-stage1.ts 100          # 从第100个开始
 *   npx tsx slime/packages/slime-test/src/utils/test-stage1.ts 100 -s       # 从第100个开始，遇错停止
 */
import {runTests, testStage1} from './test-framework.ts'

// 运行测试
runTests(testStage1, {
    stageName: '阶段1: CST生成测试',
    description: '词法分析 → 语法分析',
    startFrom: 1,
    stopOnFail: true,
})

