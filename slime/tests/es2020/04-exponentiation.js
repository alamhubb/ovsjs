// ES2020 Test 04: Exponentiation Operator (**)
// 规范：ES2016 §2.14

// ============================================
// 基础幂运算
// ============================================

const t1 = 2 ** 3                 // 8
const t2 = 10 ** 2                // 100
const t3 = 2 ** 10                // 1024

// 小数
const t4 = 2 ** 0.5               // Math.sqrt(2)
const t5 = 4 ** 0.5               // 2
const t6 = 8 ** (1/3)             // cubic root

// 负数
const t7 = 2 ** -1                // 0.5
const t8 = 10 ** -2               // 0.01

// ============================================
// Right associativity (important)
// ============================================

// Right to left evaluation
const r1 = 2 ** 3 ** 2            // 512 (= 2 ** (3 ** 2) = 2 ** 9)
const r2 = 2 ** 2 ** 3            // 256 (= 2 ** (2 ** 3) = 2 ** 8)

// Compare with left associativity
const r3 = (2 ** 3) ** 2          // 64 (different result)

// ============================================
// 与 UpdateExpression
// ============================================

// Postfix operators + exponentiation
let a = 2
const u1 = a++ ** 2               // 4 (get a=2, then 2**2=4, then a++)
const u2 = a-- ** 2               // 9 (a=3, get a=3, then 3**2=9, then a--)

// ============================================
// 一元运算符 + 幂运算
// ============================================

const n1 = -2 ** 2                // -(2**2) = -4
const n2 = -(2 ** 2)              // -4
const n3 = (-2) ** 2              // 4 (square of negative)

const n4 = +2 ** 2                // +(2**2) = 4
const n5 = !false ** 2            // may not be valid, but Parser accepts
const n6 = ~1 ** 2                // ~(1**2) = -2

// typeof、void、delete
const n7 = typeof 2 ** 2          // typeof(4) = 'number'
const n8 = void 2 ** 2            // undefined
const n9 = delete obj.prop ** 2   // (delete obj.prop) ** 2

// ============================================
// Exponentiation assignment (**=)
// ============================================

let v1 = 2
v1 **= 3                          // v1 = 8

let v2 = 10
v2 **= 2                          // v2 = 100

// 与其他复合赋值
let v3 = 2
v3 *= 3                           // v3 = 6
v3 **= 2                          // v3 = 36

// ============================================
// 实际应用场景
// ============================================

// Math calculations
const area = Math.PI * r ** 2     // circle area
const volume = (4/3) * Math.PI * r ** 3  // sphere volume

// Scientific notation
const avogadro = 6.02214076 * 10 ** 23

// Compound interest
const finalAmount = principal * (1 + rate) ** years

// Binary/Hex calculations
const kilobyte = 2 ** 10          // 1024
const megabyte = 2 ** 20          // 1048576
const gigabyte = 2 ** 30          // 1073741824

console.log('✅ Exponentiation tests passed')

