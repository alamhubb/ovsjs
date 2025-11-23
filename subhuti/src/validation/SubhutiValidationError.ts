/**
 * Subhuti Grammar Validation - 类型定义
 *
 * 功能：定义语法验证相关的类型、接口和异常类
 *
 * @version 1.0.0
 */

// ============================================
// 验证错误类型
// ============================================

/**
 * 验证错误接口
 */
export interface ValidationError {
    /** 错误级别 */
    level: 'ERROR' | 'FATAL'

    /** 错误类型 */
    type: 'empty-path' | 'prefix-conflict' | 'left-recursion' | 'or-conflict' | 'or-identical-branches'

    /** 规则名称 */
    ruleName: string

    /** 冲突的分支索引 [前, 后] */
    branchIndices: [number, number] | []

    /** 冲突路径（可选，部分错误类型不需要） */
    conflictPaths?: {
        pathA: string  // 前缀路径（短）或分支 A 的 First 集合
        pathB: string  // 被遮蔽路径（长）或分支 B 的 First 集合
    }

    /** 错误消息 */
    message: string

    /** 修复建议 */
    suggestion: string
}

/**
 * 验证结果接口（内部使用）
 */
export interface ValidationResult {
    /** 是否通过验证 */
    success: boolean

    /** 错误列表 */
    errors: ValidationError[]
}

// ============================================
// 异常类
// ============================================

/**
 * 统计信息接口
 */
export interface ValidationStats {
    /** First(K) 缓存生成用时 */
    dfsFirstKTime: number
    /** MaxLevel 缓存生成用时 */
    bfsMaxLevelTime: number
    /** Or 冲突检测用时 */
    orDetectionTime: number
    /** 左递归错误数量 */
    leftRecursionCount: number
    /** Or 分支冲突数量 */
    orConflictCount: number
    /** 总用时 */
    totalTime: number
    /** dfsFirstKCache 大小 */
    dfsFirstKCacheSize: number
    /** bfsAllCache 大小 */
    bfsAllCacheSize: number
    /** First(K) 的 K 值 */
    firstK: number
    /** 缓存使用率统计 */
    cacheUsage?: {
        dfsFirstK: { hit: number, miss: number, total: number, hitRate: number, getCount: number }
        bfsAllCache: { getCount: number, size: number }
        bfsLevelCache: { hit: number, miss: number, total: number, hitRate: number, size: number, getCount: number }
        getDirectChildren: { hit: number, miss: number, total: number, hitRate: number }
    }
}

/**
 * 语法验证异常
 */
export class SubhutiGrammarValidationError extends Error {
    constructor(
        public errors: ValidationError[],
        public stats?: ValidationStats
    ) {
        super('Grammar validation failed')
        this.name = 'SubhutiGrammarValidationError'
    }

    /**
     * 格式化错误信息（包含统计信息）
     */
    toString(): string {
        const lines: string[] = []
        
        // 输出错误详情
        for (const error of this.errors) {
            // 格式化标题
            let title = ''
            if (error.type === 'prefix-conflict' && error.branchIndices.length === 2) {
                // 前缀冲突：分支 j 被分支 i 遮蔽
                const [i, j] = error.branchIndices
                title = `[${error.level}] 分支 ${j} 被分支 ${i} 遮蔽`
            } else if (error.type === 'or-identical-branches' && error.branchIndices.length === 2) {
                // 相同分支：分支 i 和分支 j 完全相同
                const [i, j] = error.branchIndices
                title = `[${error.level}] 分支 ${i} 和分支 ${j} 完全相同`
            } else {
                // 其他类型：使用原始 message
                title = `[${error.level}] ${error.message}`
            }
            
            lines.push(title)
            lines.push(`  Rule: ${error.ruleName}`)
            lines.push(`  Branches: [${error.branchIndices.join(', ')}]`)
            
            // conflictPaths 是可选的
            if (error.conflictPaths) {
                lines.push(`  Path A: ${error.conflictPaths.pathA}`)
                lines.push(`  Path B: ${error.conflictPaths.pathB}`)
            }
            
            // 格式化 Suggestion（简化）
            if (error.type === 'prefix-conflict' && error.branchIndices.length === 2) {
                const [i, j] = error.branchIndices
                lines.push(`  Suggestion: 将分支 ${j} 移到分支 ${i} 前面（长规则在前，短规则在后）`)
            } else {
                lines.push(`  Suggestion: ${error.suggestion}`)
            }
            
            lines.push('')
        }

        // 输出统计信息（在最后）
        if (this.stats) {
            const s = this.stats
            lines.push('')
            lines.push('='.repeat(60))
            lines.push('📊 ========== 统计信息 ==========')
            lines.push('='.repeat(60))
            lines.push('')
            lines.push('⏱️  时间统计：')
            lines.push(`   总耗时: ${s.totalTime}ms`)
            lines.push(`   ├─ First(K) 缓存生成: ${s.dfsFirstKTime}ms (${(s.dfsFirstKTime / s.totalTime * 100).toFixed(1)}%)`)
            lines.push(`   ├─ MaxLevel 缓存生成: ${s.bfsMaxLevelTime}ms (${(s.bfsMaxLevelTime / s.totalTime * 100).toFixed(1)}%)`)
            lines.push(`   └─ Or 冲突检测: ${s.orDetectionTime}ms (${(s.orDetectionTime / s.totalTime * 100).toFixed(1)}%)`)
            lines.push('')
            lines.push('🔍 检测结果：')
            lines.push(`   ├─ 左递归错误: ${s.leftRecursionCount} 个`)
            lines.push(`   └─ Or 分支遮蔽: ${s.orConflictCount} 个`)
            lines.push(`   总计: ${this.errors.length} 个错误`)
            lines.push('')
            lines.push('📦 缓存信息：')
            lines.push(`   ├─ dfsFirstKCache: ${s.dfsFirstKCacheSize} 条 (First(${s.firstK}))`)
            lines.push(`   └─ bfsAllCache: ${s.bfsAllCacheSize} 条 (MaxLevel)`)
            
            // 输出缓存使用率（统一格式）
            if (s.cacheUsage) {
                lines.push('')
                lines.push('💾 缓存使用率：')
                
                // dfsFirstKCache
                const dfs = s.cacheUsage.dfsFirstK
                lines.push(`   dfsFirstKCache:`)
                lines.push(`      查询次数: ${dfs.getCount}`)
                lines.push(`      命中次数: ${dfs.hit}`)
                lines.push(`      未命中次数: ${dfs.miss}`)
                lines.push(`      命中率: ${dfs.hitRate.toFixed(1)}%`)
                lines.push(`      缓存总条数: ${s.dfsFirstKCacheSize}`)
                
                // bfsAllCache
                const bfsAll = s.cacheUsage.bfsAllCache
                lines.push(`   bfsAllCache:`)
                lines.push(`      查询次数: ${bfsAll.getCount}`)
                lines.push(`      命中次数: ${bfsAll.hit}`)
                lines.push(`      未命中次数: ${bfsAll.miss}`)
                lines.push(`      命中率: ${bfsAll.total > 0 ? bfsAll.hitRate.toFixed(1) : '0.0'}%`)
                lines.push(`      缓存总条数: ${bfsAll.size}`)
                
                // bfsLevelCache
                const bfsLevel = s.cacheUsage.bfsLevelCache
                lines.push(`   bfsLevelCache:`)
                lines.push(`      查询次数: ${bfsLevel.getCount}`)
                lines.push(`      命中次数: ${bfsLevel.hit}`)
                lines.push(`      未命中次数: ${bfsLevel.miss}`)
                lines.push(`      命中率: ${bfsLevel.total > 0 ? bfsLevel.hitRate.toFixed(1) : 'N/A'}%`)
                lines.push(`      缓存总条数: ${bfsLevel.size}`)
                
                // getDirectChildren
                const gdc = s.cacheUsage.getDirectChildren
                if (gdc.total > 0) {
                    lines.push(`   getDirectChildren (懒加载):`)
                    lines.push(`      查询次数: ${gdc.total}`)
                    lines.push(`      命中次数: ${gdc.hit}`)
                    lines.push(`      未命中次数: ${gdc.miss}`)
                    lines.push(`      命中率: ${gdc.hitRate.toFixed(1)}%`)
                    lines.push(`      缓存总条数: 与 bfsLevelCache 共用`)
                }
            }
            
            lines.push('')
            lines.push('='.repeat(60))
        }

        return lines.join('\n')
    }
}

// ============================================
// 规则 AST 定义
// ============================================

/**
 * 规则节点类型（联合类型）
 */
export type RuleNode =
    | ConsumeNode
    | SequenceNode
    | OrNode
    | OptionNode
    | ManyNode
    | AtLeastOneNode
    | SubruleNode

/**
 * Consume 节点
 */
export interface ConsumeNode {
    type: 'consume'
    tokenName: string
}

/**
 * Sequence 节点（顺序执行）
 */
export interface SequenceNode {
    type: 'sequence'
    ruleName?: string
    nodes: RuleNode[]
}

/**
 * Or 节点（顺序选择）
 */
export interface OrNode {
    type: 'or'
    alternatives: SequenceNode[]
}

/**
 * Option 节点（0次或1次）
 */
export interface OptionNode {
    type: 'option'
    node: SequenceNode
}

/**
 * Many 节点（0次或多次）
 */
export interface ManyNode {
    type: 'many'
    node: SequenceNode
}

/**
 * AtLeastOne 节点（1次或多次）
 */
export interface AtLeastOneNode {
    type: 'atLeastOne'
    node: SequenceNode
}

/**
 * Subrule 节点（调用其他规则）
 */
export interface SubruleNode {
    type: 'subrule'
    ruleName: string
}

// ============================================
// 路径类型（字符串）
// ============================================

/**
 * 路径类型：扁平化字符串
 *
 * 格式：'Token1,Token2,Token3,'
 *
 * 示例：
 * - 'Identifier,'
 * - 'Identifier,Dot,Identifier,'
 * - '' (空路径，表示 Option 跳过)
 */
export type Path = string



