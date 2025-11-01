import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import OvsTokenConsumer from "./src/parser/OvsConsumer.ts";
import {ovs6Tokens} from "./src/parser/OvsConsumer.ts";
import OvsParser from "./src/parser/OvsParser.ts";

console.log('=== 测试: x = 1 的 CST 解析（不同阶段） ===')
const code = 'x = 1'
console.log('代码:', code)

// 1. 词法分析
const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(code)
console.log('\nTokens:')
tokens.forEach((token, i) => {
  console.log(`  [${i}] ${token.name}: "${token.value}"`)
})

// 2. 语法分析
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst1 = parser.Program()

console.log('\n=== 阶段1: 解析后的原始 CST ===')
console.log('AssignmentExpression 子节点数:', findAssignmentExpression(cst1)?.children?.length || 0)

// 3. 检查 transCst 方法的影响
console.log('\n=== 阶段2: 检查 transCst 后的 CST ===')
const cst2 = parser.transCst(JSON.parse(JSON.stringify(cst1))) // 深拷贝后再 transCst
console.log('AssignmentExpression 子节点数:', findAssignmentExpression(cst2)?.children?.length || 0)

// 4. 输出简化后的 CST 结构（只显示关键节点）
console.log('\n=== 简化 CST 结构（关键节点） ===')
printSimplifiedCst(cst1)

// 辅助函数：找到第一个 AssignmentExpression
function findAssignmentExpression(node: any): any {
  if (node.name === 'AssignmentExpression') {
    return node
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findAssignmentExpression(child)
      if (result) return result
    }
  }
  return null
}

// 辅助函数：打印简化的 CST
function printSimplifiedCst(node: any, indent: number = 0): void {
  const spaces = '  '.repeat(indent)
  if (node.name === 'AssignmentExpression') {
    console.log(`${spaces}${node.name} (子节点数: ${node.children?.length || 0})`)
    if (node.children) {
      node.children.forEach((child: any, i: number) => {
        console.log(`${spaces}  [${i}] ${child.name}${child.value ? `: "${child.value}"` : ''}`)
        if (child.children && child.children.length > 0) {
          // 只打印第一层子节点
          child.children.forEach((grandchild: any, j: number) => {
            if (j === 0 || grandchild.name === 'Identifier' || grandchild.name === 'NumericLiteral') {
              console.log(`${spaces}    [${j}] ${grandchild.name}${grandchild.value ? `: "${grandchild.value}"` : ''}`)
            }
          })
        }
      })
    }
    return
  }
  
  if (node.children && indent < 10) { // 限制深度避免无限递归
    node.children.forEach((child: any) => {
      printSimplifiedCst(child, indent + 1)
    })
  }
}

// 5. 检查 JSON 序列化是否会丢失数据
console.log('\n=== 阶段3: 检查 JSON 序列化后的 CST ===')
const cstJson = JSON.stringify(cst1, null, 2)
const cstParsed = JSON.parse(cstJson)
const assignmentExpr = findAssignmentExpression(cstParsed)
console.log('JSON 序列化后 AssignmentExpression 子节点数:', assignmentExpr?.children?.length || 0)

// 6. 检查是否有循环引用导致序列化失败
try {
  const testJson = JSON.stringify(cst1)
  console.log('\n✅ JSON.stringify 成功（无循环引用）')
} catch (e) {
  console.log('\n❌ JSON.stringify 失败:', e)
}

