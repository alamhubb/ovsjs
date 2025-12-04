/**
 * 规则测试：LabelledItem
 * 
 * 位置：Es2025Parser.ts Line 850
 * 分类：others
 * 编号：927
 * 
 * EBNF规则：
 *   LabelledItem:
 *     Statement | FunctionDeclaration
 * 
 * 测试目标：
 * - 测试标签化的循环语句
 * - 测试标签化的块语句
 * - 测试标签化的其他语句
 * - 验证标签在break中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：标签化for循环
outer: for (;;) {}

// ✅ 测试2：标签化while循环
inner: while (true) {}

// ✅ 测试3：标签化do-while循环
loop1: do {} while (false)

// ✅ 测试4：标签化块语句
loop2: {let x=1}

// ✅ 测试5：标签化if语句
label1: if (true) {}

// ✅ 测试6：标签化空语句
label2: ;

// ✅ 测试7：标签化函数声明
label3: function f() {}

// ✅ 测试8：嵌套标签与break
label4: {label5: break label4}

/* Es2025Parser.ts: LabelledItem */

/**
 * 规则测试：LabelledItem
 * 
 * 位置：Es2025Parser.ts Line 850
 * 分类：others
 * 编号：927
 * 
 * EBNF规则：
 *   LabelledItem:
 *     Statement | FunctionDeclaration
 * 
 * 测试目标：
 * - 测试标签化的循环语句
 * - 测试标签化的块语句
 * - 测试标签化的其他语句
 * - 验证标签在break中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：标签化for循环
outer: for (;;) {}

// ✅ 测试2：标签化while循环
inner: while (true) {}

// ✅ 测试3：标签化do-while循环
loop1: do {} while (false)

// ✅ 测试4：标签化块语句
loop2: {let x=1}

// ✅ 测试5：标签化if语句
label1: if (true) {}

// ✅ 测试6：标签化空语句
label2: ;

// ✅ 测试7：标签化函数声明
label3: function f() {}

// ✅ 测试8：嵌套标签与break
label4: {label5: break label4}

/* Es2025Parser.ts: LabelledItem */
