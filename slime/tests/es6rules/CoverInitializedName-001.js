/**
 * 规则测试：CoverInitializedName
 * 
 * 位置：Es2025Parser.ts Line 251
 * 分类：others
 * 编号：908
 * 
 * EBNF规则：
 *   CoverInitializedName:
 *     IdentifierReference Initializer
 * 
 * 测试目标：
 * - 测试对象解构中带默认值的属性
 * - 测试各种初始化表达式
 * - 验证在对象字面量中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单默认值    CoverInitializedName -> IdentifierReference = NumericLiteral
const {x = 1} = {}

// ✅ 测试2：多个默认值    CoverInitializedName -> Multiple (y和z都有默认值)
const {y = 2, z = 3} = {}

// ✅ 测试3：字符串默认值    CoverInitializedName -> IdentifierReference = StringLiteral
const {m = 'str'} = {}

// ✅ 测试4：布尔值默认值    CoverInitializedName -> IdentifierReference = BooleanLiteral
const {n = true} = {}

// ✅ 测试5：数组默认值    CoverInitializedName -> IdentifierReference = ArrayLiteral
const {p = []} = {}

// ✅ 测试6：对象默认值    CoverInitializedName -> IdentifierReference = ObjectLiteral
const {q = {}} = {}

// ✅ 测试7：函数默认值    CoverInitializedName -> IdentifierReference = FunctionExpression
const {r = () => {}} = {}

// ✅ 测试8：null默认值    CoverInitializedName -> IdentifierReference = NullLiteral
const {s = null} = {}
/* Es2025Parser.ts: CoverInitializedName */

/**
 * 规则测试：CoverInitializedName
 * 
 * 位置：Es2025Parser.ts Line 251
 * 分类：others
 * 编号：908
 * 
 * EBNF规则：
 *   CoverInitializedName:
 *     IdentifierReference Initializer
 * 
 * 测试目标：
 * - 测试对象解构中带默认值的属性
 * - 测试各种初始化表达式
 * - 验证在对象字面量中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单默认值
const {x = 1} = {}

// ✅ 测试2：多个默认值
const {y = 2, z = 3} = {}

// ✅ 测试3：字符串默认值
const {m = 'str'} = {}

// ✅ 测试4：布尔值默认值
const {n = true} = {}

// ✅ 测试5：数组默认值
const {p = []} = {}

// ✅ 测试6：对象默认值
const {q = {}} = {}

// ✅ 测试7：函数默认值
const {r = () => {}} = {}

// ✅ 测试8：null默认值
const {s = null} = {}
/* Es2025Parser.ts: CoverInitializedName */
