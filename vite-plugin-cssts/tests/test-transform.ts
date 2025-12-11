// 测试 Vue template :class 转换

// 模拟转换函数
function hasTopLevelComma(expr: string): boolean {
  let depth = 0
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]
    const prevChar = i > 0 ? expr[i - 1] : ''
    
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }
    
    if (inString) continue
    
    if (char === '(' || char === '[' || char === '{') {
      depth++
    } else if (char === ')' || char === ']' || char === '}') {
      depth--
    } else if (char === ',' && depth === 0) {
      return true
    }
  }
  
  return false
}

function transformClassBinding(expr: string): string {
  if (expr.includes('cssts.$cls')) {
    return expr
  }
  
  const trimmedExpr = expr.trim()
  if (trimmedExpr.startsWith('{') || trimmedExpr.startsWith('[')) {
    return expr
  }
  
  if (hasTopLevelComma(expr)) {
    return `cssts.$cls(${expr})`
  }
  
  return expr
}

// 测试用例
const testCases = [
  // 应该转换的情况
  {
    input: 'CssCls.card, CssCls.textCenter',
    expected: 'cssts.$cls(CssCls.card, CssCls.textCenter)',
    shouldTransform: true
  },
  {
    input: 'CssCls.base, isActive && CssCls.active',
    expected: 'cssts.$cls(CssCls.base, isActive && CssCls.active)',
    shouldTransform: true
  },
  {
    input: "'static', CssCls.card",
    expected: "cssts.$cls('static', CssCls.card)",
    shouldTransform: true
  },
  
  // 不应该转换的情况
  {
    input: 'CssCls.primaryButton',
    expected: 'CssCls.primaryButton',
    shouldTransform: false
  },
  {
    input: '{ active: isActive }',
    expected: '{ active: isActive }',
    shouldTransform: false
  },
  {
    input: "['class1', 'class2']",
    expected: "['class1', 'class2']",
    shouldTransform: false
  },
  {
    input: 'cssts.$cls(CssCls.a, CssCls.b)',
    expected: 'cssts.$cls(CssCls.a, CssCls.b)',
    shouldTransform: false
  },
  
  // 复杂情况：括号内的逗号不应该触发转换
  {
    input: 'fn(a, b)',
    expected: 'fn(a, b)',
    shouldTransform: false
  },
  {
    input: '{ a: 1, b: 2 }',
    expected: '{ a: 1, b: 2 }',
    shouldTransform: false
  },
]

console.log('=== 测试 :class 转换 ===\n')

let passed = 0
let failed = 0

for (const tc of testCases) {
  const result = transformClassBinding(tc.input)
  const isCorrect = result === tc.expected
  
  if (isCorrect) {
    console.log(`✅ "${tc.input}"`)
    console.log(`   → "${result}"`)
    passed++
  } else {
    console.log(`❌ "${tc.input}"`)
    console.log(`   期望: "${tc.expected}"`)
    console.log(`   实际: "${result}"`)
    failed++
  }
  console.log('')
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败`)
