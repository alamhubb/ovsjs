// 智能生成基础测试用例

import * as fs from 'fs'
import * as path from 'path'

const parserFile = './packages/slime-parser/src/language/es2015/Es6Parser.ts'
const content = fs.readFileSync(parserFile, 'utf-8')
const lines = content.split('\n')

// 读取规则的实际代码
function getRuleContent(ruleName: string): string[] {
    const ruleLines: string[] = []
    let found = false
    let braceCount = 0
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // 找到规则定义
        if (line.includes(`${ruleName}()`) && !found) {
            found = true
            continue
        }
        
        if (found) {
            ruleLines.push(line)
            braceCount += (line.match(/{/g) || []).length
            braceCount -= (line.match(/}/g) || []).length
            
            if (braceCount === 0 && line.includes('}')) {
                break
            }
        }
    }
    
    return ruleLines
}

// 根据规则内容生成基础测试
function generateBasicTestForRule(ruleName: string): string | null {
    const ruleContent = getRuleContent(ruleName).join('\n')
    
    // 根据规则名称和内容生成测试
    const tests: string[] = []
    
    // VariableDeclaration相关
    if (ruleName === 'VariableDeclaration') {
        return `let x = 1
const y = 2
var z = 3`
    }
    
    if (ruleName === 'VariableDeclarator') {
        return `let a = 1
const {x, y} = obj
const [first, second] = arr`
    }
    
    if (ruleName === 'VariableLetOrConst') {
        return `let x = 1
const y = 2
var z = 3`
    }
    
    if (ruleName === 'Initializer') {
        return `let x = 1
const y = 2 + 3
const z = func()`
    }
    
    // Function相关
    if (ruleName === 'FunctionDeclaration') {
        return `function test() {}
function add(a, b) { return a + b }
async function fetch() { return await api() }`
    }
    
    if (ruleName === 'FunctionBody') {
        return `function test() {
    const x = 1
    return x
}`
    }
    
    // Statement相关
    if (ruleName === 'IfStatement') {
        return `if (true) {}
if (x > 0) { doSomething() }
if (a) { b() } else { c() }`
    }
    
    if (ruleName === 'WhileStatement') {
        return `while (true) { break }
while (x < 10) { x++ }`
    }
    
    if (ruleName === 'ForStatement') {
        return `for (let i = 0; i < 10; i++) {}
for (;;) { break }`
    }
    
    if (ruleName === 'ForInOfStatement') {
        return `for (const key in obj) {}
for (const item of arr) {}
for (let [k, v] of map) {}`
    }
    
    if (ruleName === 'DoWhileStatement') {
        return `do { console.log('once') } while (false)
do { x++ } while (x < 10)`
    }
    
    if (ruleName === 'SwitchStatement') {
        return `switch (x) {
    case 1: break
    case 2: break
    default: break
}`
    }
    
    if (ruleName === 'TryStatement') {
        return `try { risky() } catch (e) { handle(e) }
try { test() } finally { cleanup() }
try { run() } catch (err) { log(err) } finally { done() }`
    }
    
    if (ruleName === 'ThrowStatement') {
        return `function error() {
    throw new Error('test')
}`
    }
    
    if (ruleName === 'ReturnStatement') {
        return `function test() { return 42 }
function none() { return }
function complex() { return {a: 1, b: 2} }`
    }
    
    if (ruleName === 'BreakStatement') {
        return `for (let i = 0; i < 10; i++) { break }
outer: for (;;) { break outer }`
    }
    
    if (ruleName === 'ContinueStatement') {
        return `for (let i = 0; i < 10; i++) { continue }
loop: for (;;) { continue loop }`
    }
    
    if (ruleName === 'DebuggerStatement') {
        return `debugger
function test() { debugger }`
    }
    
    if (ruleName === 'LabelledStatement') {
        return `label1: for (;;) { break label1 }
outer: while (true) { break outer }`
    }
    
    if (ruleName === 'WithStatement') {
        return `with (Math) { const x = PI }`
    }
    
    if (ruleName === 'BlockStatement' || ruleName === 'Block') {
        return `{
    let x = 1
    const y = 2
}`
    }
    
    if (ruleName === 'EmptyStatement') {
        return `;
;;`
    }
    
    // Operators
    if (ruleName === 'MultiplicativeOperator') {
        return `const a = 2 * 3
const b = 10 / 2
const c = 10 % 3`
    }
    
    if (ruleName === 'AssignmentOperator') {
        return `let x = 10
x += 5
x -= 3
x *= 2
x /= 4
x %= 3`
    }
    
    // Others
    if (ruleName === 'Arguments') {
        return `func()
func(1)
func(1, 2, 3)
func(...args)`
    }
    
    if (ruleName === 'ArgumentList') {
        return `func(1, 2, 3)
func(a, b, ...rest)
func(...spread, last)`
    }
    
    if (ruleName === 'SpreadElement') {
        return `const arr = [...original]
const obj = {...source}
func(...args)`
    }
    
    if (ruleName === 'Elision') {
        return `const arr = [1, , 3]
const sparse = [, , , 4]`
    }
    
    if (ruleName === 'ElementList') {
        return `const arr = [1, 2, 3]
const spread = [...arr, 4]
const mixed = [1, ...arr, 2]`
    }
    
    if (ruleName === 'RestParameter') {
        return `function rest(...args) {}
const arrow = (...items) => items
function mixed(a, b, ...rest) {}`
    }
    
    // Template
    if (ruleName === 'TemplateLiteral') {
        return `const simple = \`hello\`
const withExpr = \`value: \${x}\`
const multi = \`line1
line2\``
    }
    
    // Identifiers
    if (ruleName === 'IdentifierReference') {
        return `const a = 1
const b = a
return x`
    }
    
    if (ruleName === 'BindingIdentifier') {
        return `let myVar = 1
const anotherVar = 2
function funcName() {}`
    }
    
    if (ruleName === 'LabelIdentifier') {
        return `myLabel: for (;;) { break myLabel }
outer: while (true) { break outer }`
    }
    
    if (ruleName === 'IdentifierName') {
        return `const obj = {name: 'test', for: 1, if: 2, class: 3}
obj.catch()
obj.then()`
    }
    
    // 其他常见规则
    if (ruleName === 'PropertyName') {
        return `const obj = {
    name: 'test',
    'string-key': 1,
    123: 'number',
    [computed]: 'value'
}`
    }
    
    if (ruleName === 'PropertyDefinition') {
        return `const obj = {
    name,
    key: 'value',
    method() {},
    ...spread
}`
    }
    
    if (ruleName === 'MethodDefinition') {
        return `class Test {
    method() {}
    *generator() {}
    get prop() {}
    set prop(v) {}
    async method() {}
}`
    }
    
    if (ruleName === 'GeneratorDeclaration') {
        return `function* gen() {
    yield 1
    yield 2
}

function* numbers(n) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}`
    }
    
    if (ruleName === 'YieldExpression') {
        return `function* test() {
    yield 1
    yield* other()
    const x = yield
}`
    }
    
    if (ruleName === 'AwaitExpression') {
        return `async function test() {
    const result = await fetch()
    return await process(result)
}`
    }
    
    return null
}

// 更新所有待完善的测试文件
const testsDir = './tests/es6rules'
let updated = 0

function processDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
            processDirectory(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf-8')
            
            // 检查是否是待完善状态
            if (content.includes('// TODO: 添加测试用例')) {
                // 提取规则名
                const match = content.match(/\* 规则测试：(\w+)/)
                if (match) {
                    const ruleName = match[1]
                    const basicTest = generateBasicTestForRule(ruleName)
                    
                    if (basicTest) {
                        // 替换TODO为实际测试
                        const newContent = content.replace(
                            /\/\/ TODO: 添加测试用例[\s\S]*$/,
                            basicTest + '\n'
                        ).replace('⏸️ 待完善', '✅ 已完善（基础测试）')
                        
                        fs.writeFileSync(fullPath, newContent)
                        console.log(`✅ 更新: ${path.relative(testsDir, fullPath)} - ${ruleName}`)
                        updated++
                    }
                }
            }
        }
    }
}

console.log('🤖 自动生成基础测试用例\n')
processDirectory(testsDir)
console.log(`\n🎉 共更新 ${updated} 个测试文件`)


