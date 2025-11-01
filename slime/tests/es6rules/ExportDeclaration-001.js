
/* Es6Parser.ts: export default AssignmentExpression */


// ============================================
// 合并来自: ExportList-001.js
// ============================================


/* Es6Parser.ts: export { ExportSpecifier (Comma ExportSpecifier)* } */


// ============================================
// 合并来自: ExportNamed-001.js
// ============================================


/* Es6Parser.ts: export VariableStatement | export Declaration */

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


/* Es6Parser.ts: Or[ExportDefault, ExportNamed, ExportList] */

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
// 合并来自: ExportDefault-001.js
// ============================================


/* Es6Parser.ts: export default AssignmentExpression */

// ============================================
// 合并来自: ExportNamed-001.js
// ============================================


/* Es6Parser.ts: export VariableStatement | export Declaration */
