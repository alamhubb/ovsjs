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
import { TestContext, TestResult, parseToAst, runTests } from 'slime/src/test-framework.ts'
import OvsParser from '../../src/parser/OvsParser'
import { OvsCstToSlimeAst } from '../../src/factory/OvsCstToSlimeAstUtil'

// ============================================
// AST 验证工具
// ============================================

interface ValidationError {
  path: string
  issue: string
}

function validateAST(node: any, path: string = 'root'): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (node === null || node === undefined) {
    errors.push({ path, issue: `Node is ${node}` })
    return errors
  }
  
  if (!node.type) {
    errors.push({ path, issue: 'Node has no type property' })
  }
  
  // 递归检查常见的子节点数组
  const arrayProps = ['body', 'declarations', 'params', 'elements', 'properties', 'specifiers']
  for (const prop of arrayProps) {
    if (node[prop] && Array.isArray(node[prop])) {
      node[prop].forEach((child: any, i: number) => {
        if (child && typeof child === 'object') {
          // 处理包装结构 { element/param/property/specifier: ..., commaToken: ... }
          const actualNode = child.element !== undefined ? child.element :
                            child.specifier !== undefined ? child.specifier :
                            child.param !== undefined ? child.param :
                            child.property !== undefined ? child.property : child
          if (actualNode !== null) {
            errors.push(...validateAST(actualNode, `${path}.${prop}[${i}]`))
          }
        }
      })
    }
  }
  
  return errors
}

function countNodes(node: any): number {
  if (!node || typeof node !== 'object') return 0
  let count = node.type ? 1 : 0
  for (const key of Object.keys(node)) {
    const val = node[key]
    if (Array.isArray(val)) {
      val.forEach(child => { count += countNodes(child) })
    } else if (val && typeof val === 'object' && key !== 'loc') {
      count += countNodes(val)
    }
  }
  return count
}

// ============================================
// 阶段2测试逻辑
// ============================================

function testStage2(ctx: TestContext): TestResult {
  // 使用 ctx 中的 ParserClass 和 CstToAstClass
  const { cst, ast } = parseToAst(ctx.code, ctx.parseMode, ctx.ParserClass, ctx.CstToAstClass)

  if (!cst) {
    return { success: false, message: 'CST 生成返回 undefined' }
  }

  if (!ast) {
    return { success: false, message: 'AST 转换返回 null/undefined' }
  }
  
  // 验证 AST 结构
  const errors = validateAST(ast)
  if (errors.length > 0) {
    const details = errors.slice(0, 3).map(e => `  ${e.path}: ${e.issue}`).join('\n')
    return { 
      success: false, 
      message: `AST结构错误 (${errors.length}个)`,
      details: details + (errors.length > 3 ? `\n  ... 还有 ${errors.length - 3} 个` : '')
    }
  }
  
  const nodeCount = countNodes(ast)
  return { 
    success: true, 
    message: `AST转换成功 (${nodeCount} 个节点)` 
  }
}

// 运行测试
runTests(testStage2, {
  stageName: 'OVS 阶段2: AST生成测试',
  description: 'CST → AST 转换，验证 AST 结构完整性',
  ParserClass: OvsParser as any,
  CstToAstClass: OvsCstToSlimeAst,
  startFrom: 1,
  stopOnFail: true,
})

