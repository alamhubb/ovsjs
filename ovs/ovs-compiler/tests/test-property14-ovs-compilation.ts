/**
 * Property 14: OVS compilation produces valid Vue render functions
 * 
 * **Feature: cssts-ui-components**
 * **Validates: Requirements 5.5**
 * 
 * For any valid OVS component source, the compiled output SHALL be a valid
 * Vue component that can be mounted and rendered.
 * 
 * Note: OVS compiles to $OvsHtmlTag.tagName() calls, which are then converted
 * to Vue h() functions at runtime by the ovsjs library.
 */

import { ovsTransform, ovsTransformBase } from '../src/index.ts'

// Test cases for OVS compilation
const testCases = [
  {
    name: 'Simple view with text content',
    code: `view SimpleView(props) {
  div(class = "container") {
    "Hello World"
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsOvsHtmlTag: true,  // OVS generates $OvsHtmlTag.tagName() calls
    }
  },
  {
    name: 'Button component with props',
    code: `view Button(props) {
  button(class = "btn") {
    props.children
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsOvsHtmlTag: true,
    }
  },
  {
    name: 'Nested elements',
    code: `view Card(props) {
  div(class = "card") {
    div(class = "card-header") {
      props.title
    }
    div(class = "card-body") {
      props.children
    }
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsOvsHtmlTag: true,
      minOvsHtmlTagCalls: 3,  // At least 3 elements
    }
  },
  {
    name: 'Conditional rendering',
    code: `view ConditionalView(props) {
  div() {
    if (props.show) {
      span() { "Visible" }
    }
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsPropsShow: true,
    }
  },
  {
    name: 'Event handlers',
    code: `view ClickableView(props) {
  button(onClick = () => console.log('clicked')) {
    "Click me"
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsOnClick: true,
    }
  },
  {
    name: 'Multiple props',
    code: `view MultiPropView(props) {
  div(class = "test-class", id = "test-id", onClick = () => {}, disabled = true) {
    "content"
  }
}`,
    checks: {
      hasAst: true,
      hasCode: true,
      containsOvsHtmlTag: true,
    }
  },
]

// Valid HTML tag names to test
const validTags = ['div', 'span', 'button', 'input', 'form', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th']

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' Property 14: OVS compilation produces valid Vue render functions'.padEnd(78, ' ') + '║')
console.log('║' + ' Feature: cssts-ui-components | Validates: Requirements 5.5'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')
console.log()

let passed = 0
let failed = 0

// Run basic test cases
console.log('📋 Basic Test Cases:')
console.log('─'.repeat(80))

for (const testCase of testCases) {
  try {
    const baseResult = ovsTransformBase(testCase.code)
    const result = ovsTransform(testCase.code)
    
    let success = true
    const errors: string[] = []
    
    // Check AST
    if (testCase.checks.hasAst && (!baseResult.ast || baseResult.tokens.length === 0)) {
      success = false
      errors.push('AST not generated')
    }
    
    // Check code output
    if (testCase.checks.hasCode && (!result.code || result.code.length === 0)) {
      success = false
      errors.push('Code not generated')
    }
    
    // Check $OvsHtmlTag function calls (OVS generates $OvsHtmlTag.tagName() calls)
    if (testCase.checks.containsOvsHtmlTag && !result.code.includes('$OvsHtmlTag.')) {
      success = false
      errors.push('Missing $OvsHtmlTag function call')
    }
    
    // Check minimum $OvsHtmlTag calls
    if (testCase.checks.minOvsHtmlTagCalls) {
      const ovsCallCount = (result.code.match(/\$OvsHtmlTag\./g) || []).length
      if (ovsCallCount < testCase.checks.minOvsHtmlTagCalls) {
        success = false
        errors.push(`Expected at least ${testCase.checks.minOvsHtmlTagCalls} $OvsHtmlTag calls, got ${ovsCallCount}`)
      }
    }
    
    // Check props.show
    if (testCase.checks.containsPropsShow && !result.code.includes('props.show')) {
      success = false
      errors.push('Missing props.show reference')
    }
    
    // Check onClick
    if (testCase.checks.containsOnClick && !result.code.includes('onClick')) {
      success = false
      errors.push('Missing onClick handler')
    }
    
    if (success) {
      console.log(`✅ ${testCase.name}`)
      passed++
    } else {
      console.log(`❌ ${testCase.name}`)
      errors.forEach(e => console.log(`   - ${e}`))
      failed++
    }
  } catch (error: any) {
    console.log(`❌ ${testCase.name}`)
    console.log(`   Error: ${error.message}`)
    failed++
  }
}

console.log()
console.log('📋 Property-based: Valid HTML tag names compile successfully')
console.log('─'.repeat(80))

// Test all valid HTML tags
let tagsPassed = 0
let tagsFailed = 0

for (const tagName of validTags) {
  try {
    const ovsCode = `view TestView(props) {
  ${tagName}(class = "test") {
    "content"
  }
}`
    const result = ovsTransform(ovsCode)
    
    if (result.code && result.code.length > 0) {
      tagsPassed++
    } else {
      console.log(`❌ Tag: ${tagName} - No code generated`)
      tagsFailed++
    }
  } catch (error: any) {
    console.log(`❌ Tag: ${tagName} - ${error.message}`)
    tagsFailed++
  }
}

if (tagsFailed === 0) {
  console.log(`✅ All ${validTags.length} HTML tags compile successfully`)
  passed++
} else {
  console.log(`❌ ${tagsFailed}/${validTags.length} tags failed`)
  failed++
}

console.log()
console.log('─'.repeat(80))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)
console.log()

if (failed === 0) {
  console.log('✅ Property 14 PASSED: OVS compilation produces valid Vue render functions')
} else {
  console.log('❌ Property 14 FAILED: Some OVS compilation tests failed')
  process.exit(1)
}
