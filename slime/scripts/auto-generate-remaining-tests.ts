// 为剩余97个规则生成基础测试

import * as fs from 'fs'
import * as path from 'path'

const testsDir = './tests/es6rules'

// 完整的测试生成映射
const testGenerators: Record<string, string> = {
    // Literals
    'LiteralPropertyName': `const obj = {
    identifier: 1,
    'string': 2,
    123: 3,
    class: 4,
    function: 5
}`,
    
    'TemplateSpans': `const x = 1, y = 2
const t1 = \`value: \${x}\`
const t2 = \`x=\${x}, y=\${y}\`
const t3 = \`\${a}\${b}\${c}\``,
    
    'TemplateMiddleList': `const multi = \`start \${x} middle \${y} end\`
const three = \`a \${1} b \${2} c \${3} d\``,
    
    // Identifiers
    'DotIdentifier': `obj.property
arr.length
func.call`,
    
    'BindingProperty': `const {name} = obj
const {name: userName} = obj
const {x, y} = point`,
    
    'BindingElement': `const {x} = obj
const {x = 0} = obj
const {x: y} = obj`,
    
    'SingleNameBinding': `const {name} = obj
const {value = 0} = obj`,
    
    'BindingRestElement': `const [first, ...rest] = arr
const {...others} = obj`,
    
    'BindingPropertyList': `const {a, b, c} = obj
const {x, y} = point`,
    
    'BindingElementList': `const [a, b, c] = arr
const [x, y] = pair`,
    
    'BindingElisionElement': `const [a, , b] = arr
const [, x] = arr`,
    
    'ForBinding': `for (const item of arr) {}
for (let {x, y} of points) {}
for (const [a, b] of pairs) {}`,
    
    'ImportedDefaultBindingCommaNameSpaceImport': `import def, * as ns from './module.js'`,
    
    'ImportedDefaultBindingCommaNamedImports': `import def, {named} from './module.js'
import React, {useState} from 'react'`,
    
    'ImportedDefaultBinding': `import defaultExport from './module.js'`,
    
    'ImportedBinding': `import {name} from './module.js'
import * as ns from './module.js'`,
    
    // Expressions
    'ParenthesizedExpression': `const x = (1 + 2)
const y = (a || b)
const z = ((a))`,
    
    'NewMemberExpressionArguments': `const obj = new MyClass(arg1, arg2)
const date = new Date()`,
    
    'MemberExpression': `obj.property
arr[0]
func.call
obj.a.b.c`,
    
    'DotMemberExpression': `obj.property
promise.then()
arr.map()`,
    
    'BracketExpression': `arr[0]
obj['key']
matrix[i][j]`,
    
    'NewExpression': `const obj = new MyClass()
const date = new Date()
const arr = new Array(10)`,
    
    'CallExpression': `func()
func(1, 2)
obj.method()
func().then()`,
    
    'LeftHandSideExpression': `obj.prop
arr[0]
func()
new Cls()`,
    
    'PostfixExpression': `i++
j--
arr[0]++`,
    
    'UnaryExpression': `+x
-y
!bool
typeof x
void 0
delete obj.prop
++i
--j`,
    
    'MultiplicativeExpression': `a * b
c / d
e % f
a * b / c`,
    
    'AdditiveExpression': `a + b
c - d
a + b + c`,
    
    'ShiftExpression': `a << 1
b >> 2
c >>> 1`,
    
    'RelationalExpression': `a < b
c > d
e <= f
g >= h
x instanceof Array
key in obj`,
    
    'EqualityExpression': `a == b
c != d
e === f
g !== h`,
    
    'BitwiseANDExpression': `a & b
x & y & z`,
    
    'BitwiseXORExpression': `a ^ b
x ^ y ^ z`,
    
    'BitwiseORExpression': `a | b
x | y | z`,
    
    'LogicalANDExpression': `a && b
x && y && z`,
    
    'LogicalORExpression': `a || b
x || y || z`,
    
    'ConditionalExpression': `a ? b : c
x > 0 ? 'pos' : 'neg'
a ? b : c ? d : e`,
    
    'ExpressionStatement': `1 + 2
console.log('test')
obj.method()`,
    
    'FunctionExpression': `const f = function() {}
const named = function myFunc() {}
const async = function async() {}`,
    
    'GeneratorExpression': `const g = function*() { yield 1 }
const named = function* gen() { yield 2 }`,
    
    'ClassExpression': `const C = class {}
const Named = class MyClass {}
const WithMethod = class { method() {} }`,
    
    'DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression': `export default function() {}
export default class {}
export default {value: 42}`,
    
    'AssignmentExpressionEmptySemicolon': `export default expr`,
    
    // Statements
    'BreakableStatement': `for (;;) { break }
while (true) { break }
switch (x) { case 1: break }`,
    
    'IterationStatement': `for (let i = 0; i < 10; i++) {}
while (true) { break }
do {} while (false)
for (const x of arr) {}`,
    
    'ForDeclaration': `for (let x of arr) {}
for (const {a, b} in obj) {}`,
    
    'FunctionFormalParameters': `function test() {}
function params(a, b, c) {}
function rest(...args) {}`,
    
    'FunctionFormalParametersBodyDefine': `function test(a, b) { return a + b }`,
    
    'StatementList': `const x = 1
const y = 2
console.log(x + y)`,
    
    'StatementListItem': `const x = 1
function test() {}
class MyClass {}`,
    
    'ImportSpecifier': `import {name} from './module.js'
import {name as alias} from './module.js'`,
    
    'ModuleSpecifier': `import x from './module.js'
import y from '../parent.js'`,
    
    'ExportSpecifier': `export {name}
export {name as alias}`,
    
    // Functions
    'FunctionBodyDefine': `function test() {
    return 42
}`,
    
    'GeneratorMethod': `class Test {
    *generator() {
        yield 1
    }
}`,
    
    // Classes
    'PropertyNameMethodDefinition': `class Test {
    method() {}
    async method2() {}
}`,
    
    'GetMethodDefinition': `class Test {
    get value() { return this._value }
}`,
    
    'SetMethodDefinition': `class Test {
    set value(v) { this._value = v }
}`,
    
    'ClassTail': `class Test {}
class WithMethod {
    method() {}
}
class Extends extends Base {}`,
    
    'ClassHeritage': `class Child extends Parent {}
class Sub extends Base.Nested {}`,
    
    'ClassBody': `class Test {
    method() {}
    static prop = 1
}`,
    
    'ClassElementList': `class Test {
    method1() {}
    method2() {}
    static method3() {}
}`,
    
    'ClassElement': `class Test {
    method() {}
    static staticMethod() {}
    field = 1
    static staticField = 2
}`,
    
    // Modules
    'ModuleItemList': `import x from './a.js'
export const y = 2
const z = 3`,
    
    'ImportDeclaration': `import def from './module.js'
import {named} from './module.js'
import * as ns from './module.js'`,
    
    'NameSpaceImport': `import * as everything from './module.js'
import * as _ from 'lodash'`,
    
    'NamedImports': `import {name} from './module.js'
import {a, b, c} from './module.js'`,
    
    'FromClause': `import x from './module.js'
export {y} from './other.js'`,
    
    'ImportsList': `import {a, b, c} from './module.js'`,
    
    'AsteriskFromClauseEmptySemicolon': `export * from './module.js'`,
    
    'ExportClauseFromClauseEmptySemicolon': `export {name} from './module.js'
export {a, b} from './other.js'`,
    
    'ExportClauseEmptySemicolon': `export {name}
export {a, b, c}`,
    
    'ExportClause': `export {}
export {name}
export {a, b, c}`,
    
    'ExportsList': `export {a, b, c}
export {x as y, z}`,
    
    // Others
    'PropertyDefinitionList': `const obj = {a: 1, b: 2, c: 3}`,
    
    'ComputedPropertyName': `const key = 'dynamic'
const obj = {
    [key]: 'value',
    [key + '2']: 'value2'
}`,
    
    'CoverInitializedName': `const {x = 1} = obj`,
    
    'SuperProperty': `class Child extends Parent {
    method() {
        super.parentMethod()
        super['key']
    }
}`,
    
    'MetaProperty': `function test() {
    console.log(new.target)
}`,
    
    'NewTarget': `function Func() {
    console.log(new.target)
}`,
    
    'SuperCall': `class Child extends Parent {
    constructor() {
        super()
        super(arg1, arg2)
    }
}`,
    
    'Declaration': `const x = 1
function test() {}
class MyClass {}`,
    
    'HoistableDeclaration': `function test() {}
function* gen() {}`,
    
    'VariableDeclarationList': `let a = 1, b = 2, c = 3
const x = 10, y = 20`,
    
    'CaseBlock': `switch (x) {
    case 1: break
    case 2: break
    default: break
}`,
    
    'CaseClauses': `switch (x) {
    case 1:
        doA()
    case 2:
        doB()
}`,
    
    'CaseClause': `switch (x) {
    case 1:
        console.log('one')
        break
}`,
    
    'DefaultClause': `switch (x) {
    default:
        console.log('default')
}`,
    
    'LabelledItem': `label: for (;;) { break label }
label: function test() {}`,
    
    'Catch': `try {} catch (e) { console.log(e) }
try {} catch ({message}) {}`,
    
    'Finally': `try {} finally { cleanup() }`,
    
    'CatchParameter': `try {} catch (e) {}
try {} catch ({message}) {}
try {} catch ([first]) {}`,
    
    'ConciseBody': `const arrow1 = () => 42
const arrow2 = () => { return 42 }`,
    
    'FieldDefinition': `class Test {
    field = 1
    method() {}
}`,
    
    'Program': `const x = 1
function test() {}
class MyClass {}`,
}

// 更新测试文件
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
                const match = content.match(/\* 规则测试：(\w+)/)
                if (match) {
                    const ruleName = match[1]
                    const testCode = testGenerators[ruleName]
                    
                    if (testCode) {
                        const newContent = content.replace(
                            /\/\/ TODO: 添加测试用例[\s\S]*$/,
                            testCode + '\n'
                        ).replace('⏸️ 待完善', '✅ 已完善（基础测试）')
                        
                        fs.writeFileSync(fullPath, newContent)
                        console.log(`✅ ${ruleName}`)
                        updated++
                    }
                }
            }
        }
    }
}

console.log('🤖 批量生成剩余规则的基础测试\n')
processDirectory(testsDir)
console.log(`\n🎉 共更新 ${updated} 个测试文件`)






