// ES2020 Test 01: Nullish Coalescing Operator (??)
// 规范：ES2020 §2.22

// ============================================
// 基础用法
// ============================================

// null/undefined 使用默认值
const t1 = null ?? 'default'
const t2 = undefined ?? 'default'

// 其他 falsy 值保留原值（与 || 的区别）
const t3 = 0 ?? 'default'        // 0 (不是 'default')
const t4 = '' ?? 'default'       // '' (不是 'default')
const t5 = false ?? 'default'    // false (不是 'default')
const t6 = NaN ?? 'default'      // NaN (不是 'default')

// ============================================
// 左结合性
// ============================================

// 多个 ?? 从左到右结合
const b1 = a ?? b ?? c
const b2 = null ?? undefined ?? 'fallback'
const b3 = x ?? y ?? z ?? 'last'

// ============================================
// 与其他运算符
// ============================================

// 必须用括号与 && 或 || 混用
const c1 = (a && b) ?? c
const c2 = a && (b ?? c)
const c3 = (a || b) ?? c
const c4 = a || (b ?? c)

// 与条件运算符
const c5 = condition ? (a ?? b) : c
const c6 = (a ?? b) ? x : y

// ============================================
// 实际应用场景
// ============================================

// 配置默认值
const config = {
  port: userConfig.port ?? 3000,
  host: userConfig.host ?? 'localhost',
  timeout: userConfig.timeout ?? 5000
}

// 可选链结合
const d1 = obj?.prop ?? 'default'
const d2 = obj?.nested?.value ?? fallback
const d3 = obj?.method?.() ?? defaultFn()

// 数组/对象
const d4 = arr?.[0] ?? firstItem
const d5 = map.get(key) ?? createDefault()

console.log('✅ Nullish Coalescing tests passed')









