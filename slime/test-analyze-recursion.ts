/**
 * 分析 Es2025Parser.ts 的递归调用关系
 * 检查 ShortCircuitExpression 相关的调用链
 */

const rules = {
  // 表达式优先级链（从上到下）
  'ConditionalExpression': ['ShortCircuitExpression'],
  'ShortCircuitExpression': ['LogicalORExpression', 'CoalesceExpression'],
  'LogicalORExpression': ['LogicalANDExpression'],
  'LogicalANDExpression': ['BitwiseORExpression'],
  'BitwiseORExpression': ['BitwiseXORExpression'],
  'BitwiseXORExpression': ['BitwiseANDExpression'],
  'BitwiseANDExpression': ['EqualityExpression'],
  'EqualityExpression': ['RelationalExpression'],
  'RelationalExpression': ['ShiftExpression'],
  'ShiftExpression': ['AdditiveExpression'],
  'AdditiveExpression': ['MultiplicativeExpression'],
  'MultiplicativeExpression': ['ExponentiationExpression'],
  'ExponentiationExpression': ['UnaryExpression', 'UpdateExpression'],
  'UnaryExpression': ['UpdateExpression', 'AwaitExpression'],
  'UpdateExpression': ['LeftHandSideExpression'],
  'LeftHandSideExpression': ['NewExpression', 'CallExpression', 'OptionalExpression'],
  'NewExpression': ['MemberExpression'],
  'MemberExpression': ['PrimaryExpression', 'SuperProperty', 'MetaProperty'],
  'CallExpression': ['MemberExpression', 'SuperCall', 'ImportCall'],
  'OptionalExpression': ['MemberExpression', 'CallExpression'],
  'PrimaryExpression': ['IdentifierReference', 'Literal', 'ArrayLiteral', 'ObjectLiteral', 'FunctionExpression', 'ClassExpression', 'TemplateLiteral', 'CoverParenthesizedExpressionAndArrowParameterList'],
  
  // 特殊：CoalesceExpression
  'CoalesceExpression': ['BitwiseORExpression'],
}

// 检查循环
function findCycles(start: string, path: string[] = []): string[] | null {
  if (path.includes(start)) {
    return [...path, start]
  }
  
  const calls = rules[start]
  if (!calls) return null
  
  for (const call of calls) {
    const cycle = findCycles(call, [...path, start])
    if (cycle) return cycle
  }
  
  return null
}

console.log('🔍 检查 ShortCircuitExpression 是否有循环调用\n')

const cycle = findCycles('ShortCircuitExpression')
if (cycle) {
  console.log('❌ 发现循环调用：')
  console.log(cycle.join(' → '))
} else {
  console.log('✅ 没有循环调用')
}

// 检查调用链深度
function getCallChainDepth(rule: string, depth: number = 0): number {
  const calls = rules[rule]
  if (!calls || calls.length === 0) return depth
  
  return Math.max(...calls.map(c => getCallChainDepth(c, depth + 1)))
}

console.log('\n📊 调用链深度：')
console.log('ShortCircuitExpression →', getCallChainDepth('ShortCircuitExpression'), '层')
console.log('LogicalORExpression →', getCallChainDepth('LogicalORExpression'), '层')
console.log('CoalesceExpression →', getCallChainDepth('CoalesceExpression'), '层')






