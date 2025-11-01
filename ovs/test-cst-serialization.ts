import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import OvsTokenConsumer from "./src/parser/OvsConsumer.ts";
import {ovs6Tokens} from "./src/parser/OvsConsumer.ts";
import OvsParser from "./src/parser/OvsParser.ts";

console.log('=== 测试: 模拟用户提供的 CST（不完整） ===')
const code = 'x = 1'
console.log('代码:', code)

const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(code)
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()

// 1. 获取 AssignmentExpression
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

const assignmentExpr = findAssignmentExpression(cst)
console.log('\n原始 AssignmentExpression 子节点数:', assignmentExpr?.children?.length || 0)

// 2. 模拟可能的序列化问题：只序列化第一个子节点（错误的方式）
if (assignmentExpr && assignmentExpr.children) {
  const wrongCst = {
    name: assignmentExpr.name,
    children: [assignmentExpr.children[0]] // 只保留第一个子节点（错误）
  }
  console.log('\n❌ 错误序列化后的 AssignmentExpression 子节点数:', wrongCst.children.length)
  console.log('JSON:', JSON.stringify(wrongCst, null, 2))
}

// 3. 检查是否有属性被过滤（如 value 属性）
console.log('\n=== 检查 AssignmentExpression 的所有子节点 ===')
if (assignmentExpr && assignmentExpr.children) {
  assignmentExpr.children.forEach((child: any, i: number) => {
    console.log(`  [${i}] ${child.name}${child.value ? ` (value: "${child.value}")` : ''} - 子节点数: ${child.children?.length || 0}`)
  })
}

// 4. 尝试不同的 JSON 序列化方式
console.log('\n=== 不同序列化方式对比 ===')

// 方式1：标准序列化
const json1 = JSON.stringify(assignmentExpr, null, 2)
console.log('1. 标准 JSON.stringify 长度:', json1.length, '字符')

// 方式2：只序列化 name 和 children（可能过滤掉某些属性）
try {
  const json2 = JSON.stringify(assignmentExpr, (key, value) => {
    if (key === 'name' || key === 'children' || key === 'value') {
      return value
    }
    return undefined // 过滤其他属性（如 loc, tokens）
  }, 2)
  console.log('2. 过滤属性后长度:', json2?.length || 0, '字符')
} catch (e) {
  console.log('2. 过滤属性后失败:', e.message)
}

// 方式3：检查是否有 undefined/null 导致的问题
try {
  const json3 = JSON.stringify(assignmentExpr, (key, value) => {
    if (value === undefined) {
      return null // 将 undefined 转为 null
    }
    return value
  }, 2)
  console.log('3. 转换 undefined 后长度:', json3?.length || 0, '字符')
} catch (e) {
  console.log('3. 转换 undefined 后失败:', e.message)
}

// 5. 模拟用户提供的错误 CST
console.log('\n=== 对比：用户提供的 CST vs 实际 CST ===')
const userProvidedCst = {
  name: "AssignmentExpression",
  children: [
    {
      name: "ConditionalExpression",
      // 只有第一个子节点，缺少 Eq 和右边的 AssignmentExpression
    }
  ]
}
console.log('用户提供的 CST（错误）：', JSON.stringify(userProvidedCst, null, 2))
console.log('\n实际正确的 CST：', json1.substring(0, 500) + '...')

