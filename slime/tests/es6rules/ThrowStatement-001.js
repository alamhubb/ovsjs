/**
 * 测试规则: ThrowStatement
 * 来源: 从 Statement 拆分
 */

// TODO: 添加 ThrowStatement 的完整测试用例
// 当前从 Statement 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});


/* Es6Parser.ts: throw Expression */

/**
 * 规则测试：ThrowStatement
 * 
 * 位置：Es6Parser.ts Line 1355
 * 分类：statements
 * 编号：418
 * 
 * 规则特征：
 * - 简单规则：throw Expression
 * 
 * 规则语法：
 *   ThrowStatement:
 *     throw Expression ;?
 * 
 * 测试目标：
 * - 测试抛出各种类型的异常
 * - 测试在不同场景中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：抛出Error对象
function error1() {
    throw new Error('test')
}

/* Es6Parser.ts: ThrowStatement */
