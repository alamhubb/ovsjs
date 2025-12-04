/**
 * 规则测试：ElementList
 * 
 * 位置：Es2025Parser.ts Line 180
 * 分类：others
 * 编号：901
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 * ✓ 包含Option（2处）
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   ElementList:
 *     Elision? (SpreadElement | AssignmentExpression) ( , Elision? (SpreadElement | AssignmentExpression))*
 * 
 * 测试目标：
 * - 覆盖Or的两个分支（Spread vs Assignment）
 * - 测试Option有无（Elision）
 * - 测试Many=0/1/多
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支2 - AssignmentExpression only    ElementList -> Many=0 (单元素)
const arr1 = [1, 2, 3]

// ✅ 测试2：Or分支1 - SpreadElement    ElementList -> SpreadElement
const arr2 = [...original]

// ✅ 测试3：混合Spread和Assignment    ElementList -> Or分支混合 + Many
const arr3 = [...arr1, 4, 5]
const mixed = [1, ...arr2, 2, 3]

// ✅ 测试4：Option有 - 前导省略（Elision）    ElementList -> Elision + Element
const sparse1 = [, , 1, 2]

// ✅ 测试5：Option有 - 中间省略    ElementList -> Element + Elision + Element
const sparse2 = [1, , , 3]

// ✅ 测试6：Many=0 - 单个元素    ElementList -> 单个(单一)
const single = [1]
const single2 = [...arr]

// ✅ 测试7：Many=1 - 两个元素    ElementList -> Many (2个元素)
const two = [1, 2]
const two2 = [...arr, 3]

// ✅ 测试8：Many=多 - 复杂组合
const complex = [, 1, , ...arr1, 2, , ...arr2, , 3]
const long = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const arr = [1, 2, 3]
const spread = [...arr, 4]
const mixed = [1, ...arr, 2]

/* Es2025Parser.ts: ElementList */


// ============================================
// 合并来自: BindingElementList-001.js
// ============================================

/**
 * 规则测试：BindingElementList
 * 
 * 位置：Es2025Parser.ts Line 1058
 * 分类：identifiers
 * 编号：110
 * 
 * EBNF规则：
 *   BindingElementList:
 *     BindingElisionElement (Comma BindingElisionElement)*
 * 
 * 规则特征：
 * ✓ 包含Many规则（1处）
 * ✓ 必须至少有1个BindingElisionElement
 * ✓ Many表示可以有多个(Comma + BindingElisionElement)对
 * 
 * 测试目标：
 * - 覆盖Many=1：只有1个BindingElisionElement
 * - 覆盖Many≥2：多个BindingElisionElement（包括Elision）（2个、3个、多个）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖Many=1和Many≥2 + 扩展测试）
 */

// ✅ 测试1：Many=1 - 单个元素
const [a] = arr

// ✅ 测试2：Many≥2（2个） - 两个元素
const [a, b] = pair
const [x, y] = pair

// ✅ 测试3：Many≥2（3个） - 三个元素
const [x, y, z] = arr

// ✅ 测试4：Many≥2 - 包含Elision的列表（跳过元素）
const [, b, , d] = array

// ✅ 测试5：Many≥2 - 多个元素的混合
const [first, , third, , fifth] = values

/* Es2025Parser.ts: BindingElisionElement (Comma BindingElisionElement)* */


// ============================================
// 合并来自: ClassElementList-001.js
// ============================================

/**
 * 规则测试：ClassElementList
 * 编号：609
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class One {
    m() {}
}

// ✅ 测试2
class Two {
    m1() {}
    m2() {}
}

// ✅ 测试3
class Three {
    m1() {}
    m2() {}
    m3() {}
}

// ✅ 测试4
class Mixed {
    constructor() {}
    method() {}
    static s() {}
}

// ✅ 测试5
class Complex {
    a() {}
    b() {}
    c() {}
    d() {}
}

// ✅ 测试6
class WithGS {
    get x() {}
    set x(v) {}
    method() {}
}

// ✅ 测试7
class WithGen {
    *g1() {}
    *g2() {}
}

// ✅ 测试8
class Full {
    constructor() {}
    static s1() {}
    static s2() {}
    get x() {}
    set x(v) {}
    *gen() {}
    m1() {}
    m2() {}
}

/* Es2025Parser.ts: ClassElementList */

/**
 * 规则测试：ElementList
 * 
 * 位置：Es2025Parser.ts Line 180
 * 分类：others
 * 编号：901
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 * ✓ 包含Option（2处）
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   ElementList:
 *     Elision? (SpreadElement | AssignmentExpression) ( , Elision? (SpreadElement | AssignmentExpression))*
 * 
 * 测试目标：
 * - 覆盖Or的两个分支（Spread vs Assignment）
 * - 测试Option有无（Elision）
 * - 测试Many=0/1/多
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支2 - AssignmentExpression only
const arr1 = [1, 2, 3]

// ✅ 测试2：Or分支1 - SpreadElement
const arr2 = [...original]

// ✅ 测试3：混合Spread和Assignment
const arr3 = [...arr1, 4, 5]
const mixed = [1, ...arr2, 2, 3]

// ✅ 测试4：Option有 - 前导省略（Elision）
const sparse1 = [, , 1, 2]

// ✅ 测试5：Option有 - 中间省略
const sparse2 = [1, , , 3]

// ✅ 测试6：Many=0 - 单个元素
const single = [1]
const single2 = [...arr]

// ✅ 测试7：Many=1 - 两个元素
const two = [1, 2]
const two2 = [...arr, 3]

// ✅ 测试8：Many=多 - 复杂组合
const complex = [, 1, , ...arr1, 2, , ...arr2, , 3]
const long = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const arr = [1, 2, 3]
const spread = [...arr, 4]
const mixed = [1, ...arr, 2]

/* Es2025Parser.ts: ElementList */
