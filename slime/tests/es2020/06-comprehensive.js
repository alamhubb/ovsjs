// ES2020 Test 06: Comprehensive Test
// 综合测试：所有 ES2020 特性混合使用

// ============================================
// 1. Optional Chaining + Nullish Coalescing
// ============================================

// 深度访问 + 默认值
const userName = user?.profile?.name ?? 'Anonymous'
const age = user?.profile?.age ?? 0
const avatar = user?.profile?.avatar?.url ?? '/default-avatar.png'

// 方法调用 + 默认值
const result = api?.fetchData?.() ?? []
const items = response?.data?.items ?? []

// 链式调用 + 默认值
const value = obj?.a?.b?.c ?? (obj?.x?.y ?? 'fallback')

// ============================================
// 2. BigInt + Exponentiation
// ============================================

// BigInt 幂运算
const bigPower = 2n ** 100n
const bigCalc = (10n ** 20n) + (5n ** 15n)

// 混合使用
const result1 = 2 ** 10            // Number: 1024
const result2 = 2n ** 10n          // BigInt: 1024n
const result3 = 2n ** 128n         // 超大数

// ============================================
// 3. Dynamic Import + Optional Chaining
// ============================================

// 动态加载 + 安全访问
async function loadModule(name) {
  try {
    const module = await import(`./${name}.js`)
    return module?.default ?? module
  } catch (error) {
    return null
  }
}

// 条件动态加载
const feature = condition 
  ? await import('./feature-a.js')
  : await import('./feature-b.js')

const fn = feature?.default?.initialize ?? (() => {})

// ============================================
// 4. All Operators Together
// ============================================

// 复杂表达式
const complex = (a ?? b) ** 2 + (c?.d ?? 0) * 3

// 链式计算
const chain = obj?.value ?? (fallback ** 2) ?? 0

// 条件 + 可选链 + 空值合并
const final = condition 
  ? obj?.a?.b ?? defaultA 
  : obj?.x?.y ?? defaultB

// ============================================
// 5. for await...of + Dynamic Import
// ============================================

async function processModules(moduleNames) {
  for await (const name of moduleNames) {
    const module = await import(`./${name}.js`)
    await module?.default?.run?.()
  }
}

// ============================================
// 6. import.meta + Dynamic Import
// ============================================

// 相对路径动态导入
async function loadRelative(path) {
  const url = new URL(path, import.meta.url)
  const module = await import(url)
  return module?.default ?? null
}

// ============================================
// 7. Optional Catch + 所有特性
// ============================================

async function safeOperation() {
  try {
    const module = await import('./risky.js')
    const result = module?.calculate?.(data) ?? 0
    return result ** 2
  } catch {
    // ES2019: Optional catch binding
    return null ?? 0
  }
}

// ============================================
// 8. 实际应用：配置系统
// ============================================

class ConfigSystem {
  constructor() {
    this.config = {}
  }
  
  // 安全获取配置
  get(key) {
    return this.config?.[key] ?? this.getDefault(key)
  }
  
  // 深度获取
  getDeep(path) {
    const parts = path.split('.')
    let value = this.config
    for (const part of parts) {
      value = value?.[part]
      if (value === null || value === undefined) break
    }
    return value ?? this.getDefaultDeep(path)
  }
  
  // 动态加载配置
  async loadConfig(env) {
    try {
      const module = await import(`./config-${env}.js`)
      this.config = module?.default ?? {}
      return true
    } catch {
      this.config = {}
      return false
    }
  }
  
  // 计算配置值
  compute(expr) {
    const base = this.get('base') ?? 10
    const multiplier = this.get('multiplier') ?? 2
    return base ** multiplier
  }
}

// ============================================
// 9. 实际应用：数据处理管道
// ============================================

async function dataPipeline(input) {
  // 步骤1：安全访问 + 默认值
  const rawData = input?.data ?? []
  
  // 步骤2：动态加载处理器
  const processor = await import('./processors/default.js')
  const process = processor?.default?.process ?? (x => x)
  
  // 步骤3：数据处理
  const processed = []
  for await (const item of rawData) {
    const result = process?.(item) ?? item
    processed.push(result)
  }
  
  // 步骤4：计算统计
  const count = BigInt(processed.length)
  const total = count ** 2n
  
  // 步骤5：返回结果
  return {
    data: processed,
    stats: {
      count: Number(count),
      total: Number(total),
      average: processed.reduce?.((a, b) => a + b, 0) ?? 0
    }
  }
}

// ============================================
// 10. 极限测试：所有特性一行
// ============================================

// 这一行包含：??, ?., **, await import(), ?.()), BigInt
const extreme = (await import('./mod.js'))?.calc?.(data ?? 0n) ** 2n ?? 100n

console.log('✅ Comprehensive tests passed')
console.log('🎉 All ES2020 features working correctly!')


