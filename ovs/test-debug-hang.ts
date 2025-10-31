import { vitePluginOvsTransform } from './src/index.ts'

const tests = [
  {
    name: 'Test 1: Simple IIFE',
    code: 'export default (function(){\n  const children = [];\n  return children\n})()'
  },
  {
    name: 'Test 2: IIFE with variables',
    code: 'export default (function(){\n  const children = [];\n  const appName = "Simple Test";\n  const version = "1.0";\n  return children\n})()'
  },
  {
    name: 'Test 3: with console.log',
    code: 'export default (function(){\n  const children = [];\n  const appName = "Simple Test";\n  const version = "1.0";\n  children.push(console.log("test"));\n  return children\n})()'
  },
  {
    name: 'Test 4: with createComponentVNode simple',
    code: 'export default (function(){\n  const children = [];\n  const appName = "Simple Test";\n  children.push(createComponentVNode(div,{},[appName]));\n  return children\n})()'
  },
  {
    name: 'Test 5: with nested createComponentVNode',
    code: 'export default (function(){\n  const children = [];\n  const appName = "Simple Test";\n  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName])]));\n  return children\n})()'
  },
  {
    name: 'Test 6: ORIGINAL PROBLEMATIC CODE',
    code: 'export default (function(){\n  const children = [];\n  const appName = "Simple Test";\n  const version = "1.0";\n  children.push(console.log("Starting simple test..."));\n  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));\n  children.push(console.log("Simple test complete!"));\n  return children\n})()'
  }
]

for (const test of tests) {
  console.log(`\n>>> Starting ${test.name}`)
  try {
    const startTime = Date.now()
    console.log('=== BEGIN COMPILE ===')
    const result = vitePluginOvsTransform(test.code)
    const elapsed = Date.now() - startTime
    console.log(`✓ ${test.name} - SUCCESS (${elapsed}ms)`)
  } catch (e) {
    console.log(`✗ ${test.name} - ERROR: ${(e as any).message}`)
  }
}

console.log('\nDone')
