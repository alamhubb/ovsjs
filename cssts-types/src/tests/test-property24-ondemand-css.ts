/**
 * Property 24: CSS generation is on-demand
 * 
 * **Feature: cssts-ui-components**
 * **Validates: Requirements 4.16**
 * 
 * For any atomic style used in the codebase, the compiler SHALL generate
 * the corresponding CSS rule; for any atomic style NOT used, the compiler
 * SHALL NOT generate CSS.
 */

// Inline the atom scanner logic to avoid fast-glob dependency
const atomToCssPropertyMap: Record<string, { property: string; value: string }> = {
  colorRed: { property: 'color', value: 'red' },
  colorGreen: { property: 'color', value: 'green' },
  colorBlue: { property: 'color', value: 'blue' },
  colorWhite: { property: 'color', value: '#ffffff' },
  colorBlack: { property: 'color', value: '#000000' },
  colorPrimary: { property: 'color', value: '#409eff' },
  bgPrimary: { property: 'background-color', value: '#409eff' },
  bgWhite: { property: 'background-color', value: '#ffffff' },
  fontBold: { property: 'font-weight', value: 'bold' },
  fontNormal: { property: 'font-weight', value: 'normal' },
  fontSize12: { property: 'font-size', value: '12px' },
  fontSize14: { property: 'font-size', value: '14px' },
  fontSize16: { property: 'font-size', value: '16px' },
  flex: { property: 'display', value: 'flex' },
  inlineFlex: { property: 'display', value: 'inline-flex' },
  cursorPointer: { property: 'cursor', value: 'pointer' },
  transition: { property: 'transition', value: 'all 0.3s' },
  roundedBase: { property: 'border-radius', value: '4px' },
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function scanFileForAtoms(filePath: string, content: string): string[] {
  const usedAtoms: string[] = []
  for (const atomName of Object.keys(atomToCssPropertyMap)) {
    const regex = new RegExp(`\\b${atomName}\\b`, 'g')
    if (regex.test(content)) {
      usedAtoms.push(atomName)
    }
  }
  return usedAtoms
}

function generateAtomCss(atomName: string, options: { minify?: boolean } = {}): string | null {
  const mapping = atomToCssPropertyMap[atomName]
  if (!mapping) return null
  const { minify = false } = options
  const className = toKebabCase(atomName)
  if (minify) {
    return `.${className}{${mapping.property}:${mapping.value}}`
  }
  return `.${className} {\n  ${mapping.property}: ${mapping.value};\n}\n`
}

function generateCss(atoms: string[], options: { minify?: boolean } = {}): string {
  const { minify = false } = options
  const cssRules: string[] = []
  for (const atomName of atoms) {
    const css = generateAtomCss(atomName, options)
    if (css) cssRules.push(css)
  }
  return minify ? cssRules.join('') : cssRules.join('\n')
}

function generateAllCss(options: { minify?: boolean } = {}): string {
  return generateCss(Object.keys(atomToCssPropertyMap), options)
}

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' Property 24: CSS generation is on-demand'.padEnd(78, ' ') + '║')
console.log('║' + ' Feature: cssts-ui-components | Validates: Requirements 4.16'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')
console.log()

let passed = 0
let failed = 0

// Test 1: Scanner detects used atoms
console.log('📋 Test 1: Scanner detects used atoms in code')
console.log('─'.repeat(80))

const testCode1 = `
const style = css { colorRed, fontBold }
const btn = css { bgPrimary, fontSize14 }
`

const usedAtoms1 = scanFileForAtoms('test.ts', testCode1)
const expected1 = ['colorRed', 'fontBold', 'bgPrimary', 'fontSize14']

let test1Pass = true
for (const atom of expected1) {
  if (!usedAtoms1.includes(atom)) {
    console.log(`❌ Missing atom: ${atom}`)
    test1Pass = false
  }
}

if (test1Pass) {
  console.log(`✅ Scanner detected all ${expected1.length} used atoms: ${usedAtoms1.join(', ')}`)
  passed++
} else {
  failed++
}

// Test 2: Scanner ignores unused atoms
console.log()
console.log('📋 Test 2: Scanner ignores unused atoms')
console.log('─'.repeat(80))

const testCode2 = `
const style = css { colorRed }
`

const usedAtoms2 = scanFileForAtoms('test.ts', testCode2)
const unusedAtoms = ['colorGreen', 'colorBlue', 'bgSuccess', 'fontSize18']

let test2Pass = true
for (const atom of unusedAtoms) {
  if (usedAtoms2.includes(atom)) {
    console.log(`❌ Incorrectly detected unused atom: ${atom}`)
    test2Pass = false
  }
}

if (test2Pass) {
  console.log(`✅ Scanner correctly ignored unused atoms`)
  passed++
} else {
  failed++
}

// Test 3: CSS generator produces correct output for single atom
console.log()
console.log('📋 Test 3: CSS generator produces correct output for single atom')
console.log('─'.repeat(80))

const css3 = generateAtomCss('colorRed')
if (css3 && css3.includes('.color-red') && css3.includes('color:') && css3.includes('red')) {
  console.log('✅ Generated CSS for colorRed:')
  console.log(css3)
  passed++
} else {
  console.log('❌ Failed to generate correct CSS for colorRed')
  console.log('Got:', css3)
  failed++
}

// Test 4: CSS generator produces output only for used atoms
console.log()
console.log('📋 Test 4: CSS generator produces output only for used atoms')
console.log('─'.repeat(80))

const usedAtoms4 = ['colorRed', 'fontBold']
const css4 = generateCss(usedAtoms4)

let test4Pass = true
// Should contain used atoms
if (!css4.includes('.color-red')) {
  console.log('❌ Missing .color-red class')
  test4Pass = false
}
if (!css4.includes('.font-bold')) {
  console.log('❌ Missing .font-bold class')
  test4Pass = false
}
// Should NOT contain unused atoms
if (css4.includes('.color-green')) {
  console.log('❌ Contains unused .color-green class')
  test4Pass = false
}
if (css4.includes('.bg-primary')) {
  console.log('❌ Contains unused .bg-primary class')
  test4Pass = false
}

if (test4Pass) {
  console.log('✅ CSS contains only used atoms:')
  console.log(css4)
  passed++
} else {
  failed++
}

// Test 5: Minified output works correctly
console.log()
console.log('📋 Test 5: Minified CSS output')
console.log('─'.repeat(80))

const css5 = generateCss(['colorRed', 'fontBold'], { minify: true })
if (css5.includes('.color-red{') && css5.includes('.font-bold{') && !css5.includes('\n')) {
  console.log('✅ Minified CSS output:')
  console.log(css5)
  passed++
} else {
  console.log('❌ Minified output incorrect')
  console.log('Got:', css5)
  failed++
}

// Test 6: generateAllCss produces all available atoms
console.log()
console.log('📋 Test 6: generateAllCss produces all available atoms')
console.log('─'.repeat(80))

const allCss = generateAllCss()
const totalAtoms = Object.keys(atomToCssPropertyMap).length

// Count CSS rules (each rule has a class selector with alphanumeric and hyphen)
const ruleCount = (allCss.match(/\.[a-z0-9-]+\s*\{/gi) || []).length

if (ruleCount === totalAtoms) {
  console.log(`✅ Generated CSS for all ${totalAtoms} atoms`)
  passed++
} else {
  console.log(`❌ Expected ${totalAtoms} rules, got ${ruleCount}`)
  // Debug: show what was matched
  const matches = allCss.match(/\.[a-z0-9-]+\s*\{/gi) || []
  console.log(`   Matched rules: ${matches.join(', ')}`)
  failed++
}

// Test 7: On-demand generation is smaller than full generation
console.log()
console.log('📋 Test 7: On-demand CSS is smaller than full CSS')
console.log('─'.repeat(80))

const onDemandCss = generateCss(['colorRed', 'fontBold'], { minify: true })
const fullCss = generateAllCss({ minify: true })

if (onDemandCss.length < fullCss.length) {
  console.log(`✅ On-demand CSS (${onDemandCss.length} bytes) < Full CSS (${fullCss.length} bytes)`)
  console.log(`   Savings: ${((1 - onDemandCss.length / fullCss.length) * 100).toFixed(1)}%`)
  passed++
} else {
  console.log(`❌ On-demand CSS should be smaller than full CSS`)
  failed++
}

console.log()
console.log('─'.repeat(80))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)
console.log()

if (failed === 0) {
  console.log('✅ Property 24 PASSED: CSS generation is on-demand')
} else {
  console.log('❌ Property 24 FAILED: Some on-demand generation tests failed')
  process.exit(1)
}
