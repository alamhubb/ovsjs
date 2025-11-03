// ES2020 P1-1 验证：UpdateExpression 和幂运算

// 测试1：后缀运算符 + 幂运算（应该合法）
const t1 = a++ ** 2    // (a++) ** 2
const t2 = a-- ** 2    // (a--) ** 2
const t3 = b[0]++ ** 3 // (b[0]++) ** 3

// 测试2：基础幂运算
const t4 = a ** 2
const t5 = 2 ** 3
const t6 = 2 ** 3 ** 2  // 右结合

// 测试3：前缀运算符 + 幂运算
// 注意：++a ** 2 按照规范应该是语法错误（Early Error）
// 但在 Parser 层面可能会被解析为 ++(a ** 2)
// 我们测试一下实际行为
const t7 = ++a ** 2     // 期望：Parser 解析成功（但语义错误）
const t8 = --b ** 2     // 期望：Parser 解析成功（但语义错误）

// 测试4：其他一元运算符 + 幂运算（应该合法）
const t9 = -a ** 2      // -(a ** 2)
const t10 = +a ** 2     // +(a ** 2)
const t11 = !a ** 2     // !(a ** 2)
const t12 = ~a ** 2     // ~(a ** 2)
const t13 = typeof a ** 2   // typeof(a ** 2)
const t14 = void a ** 2     // void(a ** 2)
const t15 = delete a.b ** 2 // delete(a.b ** 2)

console.log('✅ UpdateExpression 测试完成')











