/**
 * OVS 阶段3: 代码生成测试 (使用 toFileAst)
 * 测试范围: AST → JavaScript代码
 * 验证方式: 比较输入代码和输出代码的 token 序列是否一致
 * 
 * 与 test-stage3.ts 的区别：使用 toFileAst 而不是 toProgram
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage3-fileAst.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage3-fileAst.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage3-fileAst.ts 10 -s        # 从第10个开始，遇错停止
 */
import { runTests, testStage3 } from 'slime-test'
import OvsParser from '../../src/parser/OvsParser'
import {OvsCstToSlimeAst} from '../../src/factory/OvsCstToSlimeAstUtils'

/**
 * 包装类：让 toProgram 内部调用 toFileAst
 * 这样可以复用测试框架的 testStage3
 * 
 * 注意：toFileAst 内部会调用 toProgram，所以需要保存原始方法避免无限递归
 */
class OvsCstToSlimeAstFileAstWrapper extends OvsCstToSlimeAst {
  private _originalToProgram = OvsCstToSlimeAst.prototype.toProgram
  
  toProgram(cst: any) {
    // 先调用原始的 toProgram 做纯 AST 转换
    const program = this._originalToProgram.call(this, cst)
    
    // 复制 body 进行后处理（与 toFileAst 逻辑一致）
    let body = [...program.body]
    
    // 1. CSSTS 后处理：添加 cssts 和 csstsAtom 导入
    body = (this as any).processCsstsPostTransform(body)
    
    // 2. OVS 后处理：处理顶层表达式和自动导入
    body = (this as any).processTopLevelAndImports(body)
    
    // 更新 program.body
    program.body = body
    
    return program
  }
}

// 运行测试
runTests(testStage3, {
  stageName: 'OVS 阶段3: 代码生成测试 (toFileAst)',
  description: 'AST → JavaScript代码，比较输入/输出的 token 序列（使用 toFileAst）',
  ParserClass: OvsParser as any,
  CstToAstClass: OvsCstToSlimeAstFileAstWrapper,
  startFrom: 1,
  stopOnFail: true,
})
