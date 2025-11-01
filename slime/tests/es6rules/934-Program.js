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
