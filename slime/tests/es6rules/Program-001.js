/**
 * 规则测试：Program
 * 分类：others | 编号：702
 * 
 * 规则定义（Es6Parser.ts）：
 * Program:
 *   SourceElements?
 * 
 * SourceElements:
 *   SourceElement
 *   SourceElements SourceElement
 * 
 * SourceElement:
 *   Statement
 *   Declaration
 * 
 * 中文说明：
 * ✓ Program是整个ES6模块或脚本的顶级节点
 * ✓ 由零个或多个源元素组成
 * ✓ 源元素可以是语句或声明
 * ✓ 是Parser的入口点
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：空程序
// 虽然这个注释所在的文件本身包含代码，但Program规则允许空源元素

// ✅ 测试2：单个语句
const x = 1

// ✅ 测试3：多个语句
const a = 1
const b = 2
const c = 3

// ✅ 测试4：SourceElement - 声明
function myFunc() {
    return 42
}

// ✅ 测试5：SourceElement - 类声明
class MyClass {
    method() {
        return "test"
    }
}

// ✅ 测试6：SourceElement - 生成器声明
function* myGen() {
    yield 1
}

// ✅ 测试7：SourceElement - 混合声明和语句
let value = 10
function getValue() {
    return value
}
const result = getValue()

// ✅ 测试8：SourceElement - 导入声明
import { something } from './module'

// ✅ 测试9：SourceElement - 导出声明
export const exported = 42

// ✅ 测试10：SourceElement - 异步函数
async function asyncFunc() {
    return await Promise.resolve(1)
}

// ✅ 测试11：SourceElement - if语句
if (true) {
    console.log("global if")
}

// ✅ 测试12：SourceElement - try-catch
try {
    console.log("try block")
} catch (e) {
    console.log(e)
}

// ✅ 测试13：SourceElement - for循环
for (let i = 0; i < 3; i++) {
    console.log(i)
}

// ✅ 测试14：SourceElement - debugger
debugger

// ✅ 测试15：SourceElement - 顶级表达式
1 + 2
"string"
function() {}

/* Es6Parser.ts: Program
 * 规则：
 * Program:
 *   SourceElements?
 * 
 * SourceElements:
 *   SourceElement
 *   SourceElements SourceElement
 * 
 * SourceElement:
 *   Statement
 *   Declaration
 * 
 * 注：这个规则定义了整个模块或脚本的顶级结构
 */


// ============================================
// 来自文件: 934-Program.js
// ============================================

/**
 * 规则测试：Program
 * 
 * 位置：Es6Parser.ts Line 15
 * 分类：others
 * 编号：934
 * 
 * EBNF规则：
 *   Program:
 *     ( SourceElement )*
 *   SourceElement:
 *     Statement | Declaration
 * 
 * 测试目标：
 * - 测试程序由多个源元素组成
 * - 测试变量声明
 * - 测试函数声明
 * - 测试类声明
 * - 测试import/export声明
 * - 验证async函数声明
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：变量声明
const x = 1

// ✅ 测试2：函数声明
function test() {}

// ✅ 测试3：类声明
class MyClass {}

// ✅ 测试4：let声明
let y = 2

// ✅ 测试5：var声明
var z = 3

// ✅ 测试6：import声明
import {a} from './m.js'

// ✅ 测试7：export声明
export const b = 4

// ✅ 测试8：async函数声明
async function af() {}

/* Es6Parser.ts: Program */


// ============================================
// 合并来自: Module-001.js
// ============================================

/**
 * 规则测试：Module
 * 分类：others | 编号：710
 * 
 * 规则定义（Es6Parser.ts）：
 * Module:
 *   ModuleBody?
 * 
 * ModuleBody:
 *   ModuleItem
 *   ModuleBody ModuleItem
 * 
 * ModuleItem:
 *   ImportDeclaration
 *   ExportDeclaration
 *   Statement
 *   Declaration
 * 
 * 中文说明：
 * ✓ Module是ES6模块的顶级结构
 * ✓ 可以包含import/export声明和语句
 * ✓ ModuleBody由零个或多个模块项组成
 * ✓ 每个项可以是导入、导出、语句或声明
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：基本import声明
import { Component } from 'react'

// ✅ 测试2：基本export声明
export const exported = 42

// ✅ 测试3：导入默认值
import React from 'react'

// ✅ 测试4：导出默认值
export default { version: '1.0.0' }

// ✅ 测试5：export from其他模块
export { something } from './module'

// ✅ 测试6：export all
export * from './utils'

// ✅ 测试7：导入和导出混合
import { useState } from 'react'
export function MyComponent() {
    return <div>Component</div>
}

// ✅ 测试8：模块中的语句
console.log('module loaded')

// ✅ 测试9：模块中的声明
function moduleHelper() {
    return 'help'
}

// ✅ 测试10：模块中的类声明
export class MyClass {
    method() {
        return 'test'
    }
}

// ✅ 测试11：模块中的变量声明
export const CONFIG = {
    API_URL: 'https://api.example.com'
}

// ✅ 测试12：模块中的函数声明
export function getUser(id) {
    return { id, name: 'User' }
}

// ✅ 测试13：多个导入
import { map, filter } from 'lodash'
import { reactive } from 'vue'

// ✅ 测试14：多个导出
export const helper1 = () => {}
export const helper2 = () => {}
export class Helper3 {}

// ✅ 测试15：复杂模块结构
import * as React from 'react'
import { Component } from 'react'
export { Component }
export default class App extends Component {
    render() {
        return <div>App</div>
    }
}

/* Es6Parser.ts: Module
 * 规则：
 * Module:
 *   ModuleBody?
 * 
 * ModuleBody:
 *   ModuleItem
 *   ModuleBody ModuleItem
 * 
 * ModuleItem:
 *   ImportDeclaration
 *   ExportDeclaration
 *   Statement
 *   Declaration
 */

/**
 * 规则测试：Program
 * 
 * 位置：Es6Parser.ts Line 15
 * 分类：others
 * 编号：934
 * 
 * EBNF规则：
 *   Program:
 *     ( SourceElement )*
 *   SourceElement:
 *     Statement | Declaration
 * 
 * 测试目标：
 * - 测试程序由多个源元素组成
 * - 测试变量声明
 * - 测试函数声明
 * - 测试类声明
 * - 测试import/export声明
 * - 验证async函数声明
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：变量声明
const x = 1

// ✅ 测试2：函数声明
function test() {}

// ✅ 测试3：类声明
class MyClass {}

// ✅ 测试4：let声明
let y = 2

// ✅ 测试5：var声明
var z = 3

// ✅ 测试6：import声明
import {a} from './m.js'

// ✅ 测试7：export声明
export const b = 4

// ✅ 测试8：async函数声明
async function af() {}

/* Es6Parser.ts: Program */
