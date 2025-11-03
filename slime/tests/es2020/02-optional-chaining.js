// ES2020 Test 02: Optional Chaining Operator (?.)
// 规范：ES2020 §2.10

// ============================================
// 属性访问
// ============================================

// 基础属性
const t1 = obj?.prop
const t2 = obj?.nested?.deep?.value

// null/undefined 短路
const t3 = null?.prop              // undefined (不报错)
const t4 = undefined?.nested?.deep // undefined (不报错)

// ============================================
// 计算属性访问
// ============================================

const t5 = obj?.['prop-name']
const t6 = obj?.[expr]
const t7 = obj?.[0]
const t8 = arr?.[index]?.nested

// ============================================
// 方法调用
// ============================================

const t9 = obj?.method()
const t10 = obj?.method?.()         // 方法本身也可能不存在
const t11 = obj?.nested?.method()

// 链式调用
const t12 = api?.fetchUser?.()?.then?.(data => data)

// ============================================
// 数组访问
// ============================================

const t13 = arr?.[0]
const t14 = arr?.[0]?.prop
const t15 = matrix?.[i]?.[j]
const t16 = list?.[0]?.items?.[0]

// ============================================
// 混合使用
// ============================================

// 与普通访问混合
const t17 = obj?.a.b?.c.d
const t18 = obj?.method().result?.value

// 与解构
const { name, age } = user?.profile ?? {}
const [first, second] = arr?.[0] ?? []

// ============================================
// 实际应用场景
// ============================================

// API 响应处理
const userName = response?.data?.user?.name ?? 'Anonymous'
const items = response?.data?.items ?? []

// DOM 操作
const textContent = element?.querySelector?.('.title')?.textContent
const styles = window?.getComputedStyle?.(element)

// 事件处理
const handleClick = (e) => {
  const target = e?.target?.closest?.('.button')
  target?.classList?.toggle?.('active')
}

// 深度嵌套访问
const value = a?.b?.c?.d?.e?.f?.g?.h?.i?.j

console.log('✅ Optional Chaining tests passed')









