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
