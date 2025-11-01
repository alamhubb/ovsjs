/**
 * 规则测试：FieldDefinition
 * 
 * 位置：Es6Parser.ts Line 765
 * 分类：others
 * 编号：933
 * 
 * EBNF规则：
 *   FieldDefinition:
 *     ClassElementName Initializer?
 * 
 * 测试目标：
 * - 测试实例字段声明
 * - 测试静态字段声明
 * - 测试计算属性字段
 * - 验证字段的初始化和非初始化形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单字段初始化
class C1 {
    field = 1
}

// ✅ 测试2：混合初始化和非初始化字段
class C2 {
    x
    y = 2
}

// ✅ 测试3：静态字段
class C3 {
    static s = 1
}

// ✅ 测试4：混合静态和实例字段
class C4 {
    static s1 = 1
    s2 = 2
}

// ✅ 测试5：计算属性字段
class C5 {
    [key] = 1
}

// ✅ 测试6：多个实例字段混合
class C6 {
    a = 1
    b
    c = 3
}

// ✅ 测试7：混合计算和静态字段
class C7 {
    static [k] = 1
    [m] = 2
}

/* Es6Parser.ts: FieldDefinition */

/**
 * 规则测试：FieldDefinition
 * 
 * 位置：Es6Parser.ts Line 765
 * 分类：others
 * 编号：933
 * 
 * EBNF规则：
 *   FieldDefinition:
 *     ClassElementName Initializer?
 * 
 * 测试目标：
 * - 测试实例字段声明
 * - 测试静态字段声明
 * - 测试计算属性字段
 * - 验证字段的初始化和非初始化形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单字段初始化
class C1 {
    field = 1
}

// ✅ 测试2：混合初始化和非初始化字段
class C2 {
    x
    y = 2
}

// ✅ 测试3：静态字段
class C3 {
    static s = 1
}

// ✅ 测试4：混合静态和实例字段
class C4 {
    static s1 = 1
    s2 = 2
}

// ✅ 测试5：计算属性字段
class C5 {
    [key] = 1
}

// ✅ 测试6：多个实例字段混合
class C6 {
    a = 1
    b
    c = 3
}

// ✅ 测试7：混合计算和静态字段
class C7 {
    static [k] = 1
    [m] = 2
}

/* Es6Parser.ts: FieldDefinition */
