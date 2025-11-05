/**
 * 测试规则: HoistableDeclaration
 * 来源: 从 Declaration 拆分
 */

/**
 * 规则测试：HoistableDeclaration
 * 
 * 位置：Es2025Parser.ts Line 882
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

/* Es2025Parser.ts: HoistableDeclaration */

// ============================================
// 合并来自: GeneratorFunction-001.js
// ============================================


/* Es2025Parser.ts: function* Identifier? (FormalParameters) { GeneratorBody } */

// ============================================
// 合并来自: AsyncGeneratorFunction-001.js
// ============================================


/* Es2025Parser.ts: async function* Identifier? (FormalParameters) { FunctionBody } */
