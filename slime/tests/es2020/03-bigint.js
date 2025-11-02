// ES2020 Test 03: BigInt
// 规范：ES2020 §1.9.3

// ============================================
// BigInt 字面量
// ============================================

// 十进制
const t1 = 0n
const t2 = 123n
const t3 = 9007199254740991n      // Number.MAX_SAFE_INTEGER
const t4 = 9007199254740992n      // 超过 Number 范围

// 二进制
const t5 = 0b1010n
const t6 = 0B11111111n

// 八进制
const t7 = 0o777n
const t8 = 0O123n

// 十六进制
const t9 = 0xFFn
const t10 = 0XDEADBEEFn
const t11 = 0xFFFFFFFFFFFFFFFFn

// ============================================
// BigInt 运算
// ============================================

// 算术运算
const a1 = 1n + 2n                // 3n
const a2 = 10n - 3n               // 7n
const a3 = 2n * 3n                // 6n
const a4 = 10n / 3n               // integer division
const a5 = 10n % 3n               // 1n
const a6 = 2n ** 100n             // power

// 一元运算
const a7 = -5n
const a8 = +bigIntValue           // runtime type error

// 位运算
const b1 = 5n & 3n                // 1n
const b2 = 5n | 3n                // 7n
const b3 = 5n ^ 3n                // 6n
const b4 = ~5n                    // -6n
const b5 = 8n << 2n               // 32n
const b6 = 8n >> 2n               // 2n

// ============================================
// BigInt 比较
// ============================================

const c1 = 1n === 1n              // true
const c2 = 1n !== 2n              // true
const c3 = 1n < 2n                // true
const c4 = 2n > 1n                // true
const c5 = 1n <= 1n               // true
const c6 = 2n >= 1n               // true

// Compare with Number (== allowed, but not ===)
const c7 = 1n == 1                // true
const c8 = 1n === 1               // false (different types)

// ============================================
// BigInt 函数
// ============================================

// BigInt constructor (non-literal creation)
const d1 = BigInt(123)
const d2 = BigInt('9007199254740991')
const d3 = BigInt('0xFF')

// ============================================
// 实际应用场景
// ============================================

// 大整数计算
const factorial = (n) => {
  let result = 1n
  for (let i = 2n; i <= n; i++) {
    result *= i
  }
  return result
}

const fact20 = factorial(20n)     // exact result

// Cryptography
const prime = 2n ** 127n - 1n     // Mersenne prime

// Timestamp in nanoseconds
const timestamp = 1234567890123456789n

// Huge array index (theoretical)
const hugeIndex = 9007199254740992n

console.log('✅ BigInt tests passed')

