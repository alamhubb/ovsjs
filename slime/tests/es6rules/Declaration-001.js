/**
 * 规则测试：Declaration
 * 分类：others | 编号：701
 * 
 * 规则定义（Es6Parser.ts）：
 * Declaration:
 *   FunctionDeclaration
 *   GeneratorDeclaration
 *   AsyncFunctionDeclaration
 *   ClassDeclaration
 *   LexicalDeclaration
 * 
 * LexicalDeclaration:
 *   let BindingList ;
 *   const BindingList ;
 * 
 * 中文说明：
 * ✓ 声明包括函数、生成器、异步函数、类声明
 * ✓ 还包括let和const的词法声明
 * ✓ 每个分支代表不同的声明类型
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：FunctionDeclaration
function func1() {
    return 1
}

// ✅ 测试2：GeneratorDeclaration
function* gen1() {
    yield 1
}

// ✅ 测试3：AsyncFunctionDeclaration
async function asyncFunc1() {
    return await Promise.resolve(1)
}

// ✅ 测试4：ClassDeclaration
class Class1 {
    method() {}
}

// ✅ 测试5：LexicalDeclaration - let单个
let a = 1

// ✅ 测试6：LexicalDeclaration - let多个
let b = 2, c = 3

// ✅ 测试7：LexicalDeclaration - const单个
const d = 4

// ✅ 测试8：LexicalDeclaration - const多个
const e = 5, f = 6

// ✅ 测试9：嵌套FunctionDeclaration
function outer() {
    function inner() {
        return 10
    }
    return inner()
}

// ✅ 测试10：嵌套ClassDeclaration
function getClass() {
    class Inner {
        prop = 5
    }
    return new Inner()
}

// ✅ 测试11：异步函数中的let
async function asyncFunc2() {
    let localVar = 1
    return localVar
}

// ✅ 测试12：生成器中的const
function* gen2() {
    const value = 42
    yield value
}

// ✅ 测试13：类中的方法声明
class Class2 {
    method1() { return 1 }
    method2() { return 2 }
}

// ✅ 测试14：声明组合
function func2() {
    const x = 1
    class Inner {}
    let y = 2
}

// ✅ 测试15：声明的作用域
{
    let scoped1 = 1
    const scoped2 = 2
    function localFunc() {}
    class LocalClass {}
}

/* Es6Parser.ts: Declaration
 * 规则：
 * Declaration:
 *   FunctionDeclaration
 *   GeneratorDeclaration
 *   AsyncFunctionDeclaration
 *   ClassDeclaration
 *   LexicalDeclaration
 * 
 * LexicalDeclaration:
 *   let BindingList ;
 *   const BindingList ;
 */


// ============================================
// 来自文件: 915-Declaration.js
// ============================================

/**
 * 规则测试：Declaration
 * 编号：915
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
function f() {}

// ✅ 测试2
class C {}

// ✅ 测试3
async function af() {}

// ✅ 测试4
function* gf() {}

// ✅ 测试5
let x = 1

// ✅ 测试6
const y = 2

// ✅ 测试7
var z = 3

// ✅ 测试8
export default function() {}

/* Es6Parser.ts: Declaration */


// ============================================
// 合并来自: ClassDeclaration-001.js
// ============================================


/* Es6Parser.ts: class Identifier (extends Expression)? { ClassBody } */


// ============================================
// 来自文件: 605-ClassDeclaration.js
// ============================================

/**
 * 规则测试：ClassDeclaration
 * 
 * 位置：Es6Parser.ts Line 247
 * 分类：classes
 * 编号：605
 * 
 * 规则语法：
 *   ClassDeclaration:
 *     class Identifier ClassHeritage? { ClassBody }
 * 
 * 测试目标：
 * - 验证基本类声明
 * - 验证继承关系（extends）
 * - 覆盖构造函数、方法、属性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本类声明
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

// ✅ 测试2：带方法的类
class Rectangle {
    constructor(width, height) {
        this.width = width
        this.height = height
    }
    
    area() {
        return this.width * this.height
    }
}

// ✅ 测试3：静态方法
class Math2D {
    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }
}

// ✅ 测试4：Getter和Setter
class Circle {
    constructor(radius) {
        this._radius = radius
    }
    
    get radius() {
        return this._radius
    }
    
    set radius(value) {
        this._radius = value
    }
}

// ✅ 测试5：基本继承
class Animal {
    speak() {
        return 'sound'
    }
}

class Dog extends Animal {
    speak() {
        return 'bark'
    }
}

// ✅ 测试6：继承中的super调用
class Vehicle {
    constructor(name) {
        this.name = name
    }
}

class Car extends Vehicle {
    constructor(name, wheels) {
        super(name)
        this.wheels = wheels
    }
}

// ✅ 测试7：计算属性名
class Dynamic {
    ['method_' + 'one']() {
        return 'one'
    }
}

// ✅ 测试8：多个方法
class Utils {
    add(a, b) {
        return a + b
    }
    
    multiply(a, b) {
        return a * b
    }
    
    divide(a, b) {
        return a / b
    }
}

// ✅ 测试9：混合静态和实例方法
class Counter {
    static total = 0
    
    constructor() {
        this.count = 0
        Counter.total++
    }
    
    increment() {
        this.count++
    }
    
    static reset() {
        Counter.total = 0
    }
}

// ✅ 测试10：多层继承
class Shape {
    area() {
        return 0
    }
}

class Polygon extends Shape {
    sides() {
        return 0
    }
}

class Triangle extends Polygon {
    sides() {
        return 3
    }
}

// ✅ 测试11：类中的try-catch
class Processor {
    process(data) {
        try {
            return JSON.parse(data)
        } catch (e) {
            return null
        }
    }
}

// ✅ 测试12：类中的for循环
class Collection {
    constructor(items) {
        this.items = items
    }
    
    double() {
        let result = []
        for (let item of this.items) {
            result.push(item * 2)
        }
        return result
    }
}

// ✅ 测试13：继承中的super属性访问
class Base {
    getValue() {
        return 42
    }
}

class Derived extends Base {
    getValue() {
        return super.getValue() + 1
    }
}

// ✅ 测试14：包含多个成员的复杂类
class User {
    #password
    
    constructor(name, password) {
        this.name = name
        this.#password = password
    }
    
    static create(data) {
        return new User(data.name, data.pass)
    }
    
    getName() {
        return this.name
    }
    
    verify(pwd) {
        return this.#password === pwd
    }
    
    get type() {
        return 'user'
    }
}

// ✅ 测试15：类的实际使用场景
class Employee {
    constructor(id, name, salary) {
        this.id = id
        this.name = name
        this.salary = salary
    }
    
    giveRaise(amount) {
        this.salary += amount
        return this.salary
    }
    
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}

class Manager extends Employee {
    constructor(id, name, salary, department) {
        super(id, name, salary)
        this.department = department
    }
    
    getInfo() {
        return super.getInfo() + ` - Department: ${this.department}`
    }
}

/* Es6Parser.ts: ClassDeclaration: class Identifier ClassHeritage? { ClassBody } */



// ============================================
// 合并来自: ExportDeclaration-001.js
// ============================================

/**
 * 规则测试：ExportDeclaration
 * 
 * 位置：Es6Parser.ts（export语句）
 * 分类：modules
 * 编号：402
 * 
 * 规则语法：
 *   ExportDeclaration:
 *     export NamedExports FromClause
 *     export default AssignmentExpression
 *     export default FunctionDeclaration
 *     export default ClassDeclaration
 *     export VariableStatement
 *     export Declaration
 * 
 * 测试目标：
 * ✅ 覆盖所有export形式
 * ✅ named导出、default导出
 * ✅ 从其他模块导出、导出声明
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：export named变量
export const name = 'test'

// ✅ 测试2：export多个named变量
export const a = 1, b = 2, c = 3

// ✅ 测试3：export函数
export function greet() {
    return 'hello'
}

// ✅ 测试4：export类
export class MyClass {
    method() {}
}

// ✅ 测试5：export default值
export default 42

// ✅ 测试6：export default函数
export default function() {
    return 'default'
}

// ✅ 测试7：export default命名函数
export default function defaultFunc() {
    return 'named default'
}

// ✅ 测试8：export default类
export default class {
    method() {}
}

// ✅ 测试9：export default对象
export default {
    prop: 'value'
}

// ✅ 测试10：export from其他模块
export { name } from './module'

// ✅ 测试11：export多个from其他模块
export { a, b, c } from './module'

// ✅ 测试12：export with重命名
export { oldName as newName } from './module'

// ✅ 测试13：export default from
export { default } from './module'

// ✅ 测试14：export all
export * from './module'

// ✅ 测试15：export as namespace
export * as ns from './module'

// ✅ 测试16：export interface（TypeScript）
export interface User {
    name: string
}

// ✅ 测试17：export type（TypeScript）
export type ID = string | number

// ✅ 测试18：export enum（TypeScript）
export enum Status {
    Active = 'active',
    Inactive = 'inactive'
}

// ✅ 测试19：导出多行
export const utils = {
    getConfig: () => ({}),
    setConfig: (c) => c,
    resetConfig: () => null
}

// ✅ 测试20：复杂导出组合
export default {
    version: '1.0.0',
    config: {}
}

/* Es6Parser.ts: ExportDeclaration: export NamedExports FromClause | export default ... | export Declaration */


// ============================================
// 来自文件: 509-ExportDeclaration.js
// ============================================


/* Es6Parser.ts: Or[ExportDefault, ExportNamed, ExportList] */


// ============================================
// 来自文件: 711-ExportDeclaration.js
// ============================================

/**
 * 规则测试：ExportDeclaration
 * 
 * 位置：Es6Parser.ts Line 1929
 * 分类：modules
 * 编号：711
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   ExportDeclaration:
 *     export * FromClause ;
 *     export ExportClause FromClause ;
 *     export ExportClause ;
 *     export Declaration
 *     export default (HoistableDeclaration | ClassDeclaration | AssignmentExpression) ;
 * 
 * 测试目标：
 * - 覆盖所有5种export形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：export * from
export * from './module.js'

// ✅ 测试2：export {named} from
export {name, age} from './user.js'
export {default as Person} from './person.js'

// ✅ 测试3：export {named}
const privateValue = 100
function privateFunc() {}
export {privateValue, privateFunc}
export {privateValue as publicValue}

// ✅ 测试4：export Declaration - const
export const PI = 3.14
export const E = 2.718

// ✅ 测试5：export Declaration - let
export let counter = 0

// ✅ 测试6：export Declaration - function
export function greet(name) {
    return `Hello ${name}`
}

// ✅ 测试7：export Declaration - class
export class MyClass {
    constructor() {}
}

// ✅ 测试8：export default - function
export default function() {
    return 42
}

// ✅ 测试9：export default - class
export default class {
    method() {}
}

// ✅ 测试10：export default - expression
export default {name: 'config', value: 100}

/* Es6Parser.ts: ExportDeclaration */


// ============================================
// 合并来自: ForDeclaration-001.js
// ============================================

/**
 * 规则测试：ForDeclaration
 * 
 * 位置：Es6Parser.ts Line 1247
 * 分类：statements
 * 编号：411
 * 
 * 规则特征：
 * 简单规则
 * 
 * 测试目标：
 * - 验证规则的基本功能



 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

for (let x of arr) {}
for (const {a, b} in obj) {}

/* Es6Parser.ts: ForDeclaration */


// ============================================
// 合并来自: FunctionDeclaration-001.js
// ============================================


/* Es6Parser.ts: function Identifier (FormalParameters) { FunctionBody } */


// ============================================
// 来自文件: 501-FunctionDeclaration.js
// ============================================

/**
 * 规则测试：FunctionDeclaration
 * 
 * 位置：Es6Parser.ts Line 210
 * 分类：functions
 * 编号：501
 * 
 * 规则特征：
 * - 函数声明：function Identifier ( FormalParameters ) { FunctionBody }
 * - 必须有函数名
 * 
 * 规则语法：
 *   FunctionDeclaration:
 *     function Identifier ( FormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 验证基本函数声明
 * - 验证各种参数形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本函数声明
function greet() {
    console.log('hello')
}

// ✅ 测试2：带参数的函数
function add(a, b) {
    return a + b
}

// ✅ 测试3：多个参数
function multiply(x, y, z) {
    return x * y * z
}

// ✅ 测试4：默认参数
function withDefault(x = 10, y = 20) {
    return x + y
}

// ✅ 测试5：Rest参数
function variadic(...args) {
    return args.length
}

// ✅ 测试6：解构参数
function destructured({ x, y }) {
    return x + y
}

// ✅ 测试7：混合参数形式
function mixed(a, b = 2, ...rest) {
    return a + b + rest.length
}

// ✅ 测试8：无返回值函数
function printOnly(msg) {
    console.log(msg)
}

// ✅ 测试9：有返回值函数
function getValue() {
    return 42
}

// ✅ 测试10：递归函数
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1)
}

// ✅ 测试11：嵌套函数声明
function outer() {
    function inner() {
        return 'inner'
    }
    return inner()
}

// ✅ 测试12：函数体中的块语句
function withBlock() {
    {
        const x = 1
        console.log(x)
    }
    {
        const y = 2
        console.log(y)
    }
}

// ✅ 测试13：函数体中的if-else
function conditional(x) {
    if (x > 0) {
        return 'positive'
    } else if (x < 0) {
        return 'negative'
    } else {
        return 'zero'
    }
}

// ✅ 测试14：函数体中的for循环
function sumTo(n) {
    let sum = 0
    for (let i = 1; i <= n; i++) {
        sum += i
    }
    return sum
}

// ✅ 测试15：复杂函数场景
function processArray(items, filter = true) {
    let result = []
    
    for (let item of items) {
        if (filter && item > 0) {
            result.push(item * 2)
        } else if (!filter) {
            result.push(item)
        }
    }
    
    return result.length > 0 ? result : null
}

/* Es6Parser.ts: FunctionDeclaration: function Identifier ( FormalParameters ) { FunctionBody } */


// ============================================
// 合并来自: AsyncFunctionDeclaration-001.js
// ============================================


/* Es6Parser.ts: async function Identifier (FormalParameters) { FunctionBody } */


// ============================================
// 来自文件: 507-AsyncFunctionDeclaration.js
// ============================================

/**
 * 规则测试：AsyncFunctionDeclaration
 * 
 * 位置：Es6Parser.ts（async关键字处理）
 * 分类：functions
 * 编号：507
 * 
 * 规则语法：
 *   AsyncFunctionDeclaration:
 *     async function Identifier ( FormalParameters ) { AsyncFunctionBody }
 * 
 * 测试目标：
 * ✅ 覆盖async函数各种形式
 * ✅ 参数和返回值类型
 * ✅ 实际async应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本async函数
async function basic() {
    return 42
}

// ✅ 测试2：async函数无参数
async function noParams() {
    await Promise.resolve()
}

// ✅ 测试3：async函数单参数
async function single(x) {
    return await Promise.resolve(x)
}

// ✅ 测试4：async函数多参数
async function multiple(a, b, c) {
    return a + b + c
}

// ✅ 测试5：async函数默认参数
async function withDefault(x = 10) {
    return await Promise.resolve(x)
}

// ✅ 测试6：async函数Rest参数
async function withRest(...args) {
    return args.length
}

// ✅ 测试7：async函数解构参数
async function withDestructured({ x, y }) {
    return x + y
}

// ✅ 测试8：async函数包含await
async function withAwait() {
    const result = await Promise.resolve(42)
    return result
}

// ✅ 测试9：async函数多个await
async function multipleAwaits() {
    const a = await Promise.resolve(1)
    const b = await Promise.resolve(2)
    return a + b
}

// ✅ 测试10：async函数try-catch
async function withTryCatch() {
    try {
        return await Promise.resolve(42)
    } catch (e) {
        return null
    }
}

// ✅ 测试11：async函数for循环
async function withLoop() {
    for (let i = 0; i < 3; i++) {
        await Promise.resolve(i)
    }
}

// ✅ 测试12：async函数if条件
async function withCondition(flag) {
    if (flag) {
        return await Promise.resolve('yes')
    } else {
        return await Promise.resolve('no')
    }
}

// ✅ 测试13：async函数返回Promise
async function returnsPromise() {
    return Promise.resolve(42)
}

// ✅ 测试14：async函数调用其他async
async function callsOtherAsync() {
    return await basic()
}

// ✅ 测试15：嵌套async函数
async function outerAsync() {
    async function innerAsync() {
        return 42
    }
    return await innerAsync()
}

// ✅ 测试16：async函数混合参数
async function mixedParams(a, b = 2, ...rest) {
    return a + b + rest.length
}

// ✅ 测试17：async函数返回值类型多样
async function diverseReturn(type) {
    if (type === 'obj') return { x: 1 }
    if (type === 'arr') return [1, 2, 3]
    if (type === 'fn') return () => 42
    return null
}

// ✅ 测试18：async函数没有await
async function noAwait() {
    return 42
}

// ✅ 测试19：async函数复杂逻辑
async function complex(data) {
    try {
        const result = await Promise.resolve(data)
        for (let item of result) {
            await Promise.resolve(item)
        }
        return result
    } catch (e) {
        return null
    }
}

// ✅ 测试20：async函数可选链操作
async function withOptional() {
    const obj = { method: async () => 42 }
    return await obj?.method?.()
}

/* Es6Parser.ts: AsyncFunctionDeclaration: async function Identifier ( FormalParameters ) { AsyncFunctionBody } */


// ============================================
// 合并来自: HoistableDeclaration-001.js
// ============================================

/**
 * 规则测试：HoistableDeclaration
 * 
 * 位置：Es6Parser.ts Line 882
 * 分类：others
 * 编号：921
 * 
 * EBNF规则：
 *   HoistableDeclaration:
 *     FunctionDeclaration | GeneratorDeclaration | AsyncFunctionDeclaration | AsyncGeneratorDeclaration
 * 
 * 测试目标：
 * - 测试函数声明
 * - 测试generator声明
 * - 测试async函数声明
 * - 测试async generator声明
 * - 验证各种可提升声明的形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：普通函数
function f() {}

// ✅ 测试2：generator函数
function* g() {}

// ✅ 测试3：async函数
async function af() {}

// ✅ 测试4：async generator函数
async function* ag() {}

// ✅ 测试5：带参数的函数
function f2(x) { return x }

// ✅ 测试6：带参数的generator
function* g2(x) { yield x }

// ✅ 测试7：带参数的async函数
async function af2(x) { return await x }

// ✅ 测试8：带参数的async generator
async function* ag2(x) { yield await x }

/* Es6Parser.ts: HoistableDeclaration */


// ============================================
// 合并来自: ImportDeclaration-001.js
// ============================================

/**
 * 规则测试：ImportDeclaration
 * 
 * 位置：Es6Parser.ts（import语句）
 * 分类：modules
 * 编号：401
 * 
 * 规则语法：
 *   ImportDeclaration:
 *     import ImportClause FromClause
 *     import ModuleSpecifier
 * 
 * 测试目标：
 * ✅ 覆盖所有import形式
 * ✅ default导入、named导入、namespace导入
 * ✅ 混合导入方式
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本import default
import React from 'react'

// ✅ 测试2：import named
import { Component } from 'react'

// ✅ 测试3：import multiple named
import { Component, Fragment, useState } from 'react'

// ✅ 测试4：import namespace
import * as React2 from 'react'

// ✅ 测试5：import default + named
import React3, { Component as C } from 'react'

// ✅ 测试6：import default + namespace
import React4, * as ReactAll from 'react'

// ✅ 测试7：import side-effect
import 'some-polyfill'

// ✅ 测试8：import相对路径
import { utils } from './utils'

// ✅ 测试9：import上层目录
import { helper } from '../helpers'

// ✅ 测试10：import deep路径
import { deep } from '../../config/settings'

// ✅ 测试11：import with重命名
import { oldName as newName } from './module'

// ✅ 测试12：import多个with重命名
import { a as A, b as B, c as C2 } from './renamed'

// ✅ 测试13：import default with重命名
import DefaultExport as MyDefault from './module'

// ✅ 测试14：import 文件without扩展名
import { getConfig } from './config'

// ✅ 测试15：import 文件with扩展名
import { getData } from './data.js'

// ✅ 测试16：import JSON
import config from './config.json'

// ✅ 测试17：import 复杂组合
import DefaultThing, { named1, named2 as n2, ...namespace } from './complex'

// ✅ 测试18：import 多行
import {
    Component,
    Fragment,
    useState,
    useEffect,
    useContext
} from 'react'

// ✅ 测试19：import 包名
import lodash from 'lodash'

// ✅ 测试20：import scoped包
import { something } from '@scope/package'

/* Es6Parser.ts: ImportDeclaration: import ImportClause FromClause | import ModuleSpecifier */


// ============================================
// 来自文件: 501-ImportDeclaration.js
// ============================================


/* Es6Parser.ts: import ImportClause FromClause */


// ============================================
// 来自文件: 702-ImportDeclaration.js
// ============================================

/**
 * 规则测试：ImportDeclaration
 * 
 * 位置：Es6Parser.ts Line 1752
 * 分类：modules
 * 编号：702
 * 
 * EBNF规则：
 *   ImportDeclaration:
 *     import ImportClause FromClause ;
 *     import ModuleSpecifier ;
 * 
 * 测试目标：
 * - 测试default导入
 * - 测试named导入
 * - 测试命名空间导入
 * - 测试混合导入（default + named）
 * - 测试导入重命名
 * - 测试多个named导入
 * - 测试side-effect导入
 * - 测试导入路径的各种形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：default导入
import def from './module.js'

// ✅ 测试2：named导入
import {named} from './module.js'

// ✅ 测试3：命名空间导入
import * as ns from './module.js'

// ✅ 测试4：混合导入（default + named）
import defaultExport, {namedExport} from './combined.js'

// ✅ 测试5：混合导入（default + namespace）
import defaultExport, * as ns from './combined.js'

// ✅ 测试6：导入重命名
import {originalName as renamed, another as renamedAgain} from './utils.js'

// ✅ 测试7：多个named导入
import {a, b, c, d, e} from './constants.js'

// ✅ 测试8：side-effect导入（无import子句）
import './styles.css'

/* Es6Parser.ts: ImportDeclaration */
