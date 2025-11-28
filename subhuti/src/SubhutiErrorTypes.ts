/**
 * Subhuti 错误类型定义（改进版）
 * 
 * 改进点：
 * 1. 区分左递归和无限循环
 * 2. 提供详细的诊断信息
 * 3. 包含自动修复建议
 */

/**
 * 错误类型枚举
 */
export type SubhutiErrorType = 
    | 'syntax'           // 语法错误（token 不匹配）
    | 'left-recursion'   // 真正的左递归（规则在同一位置递归调用自己）
    | 'infinite-loop'    // 无限循环（规则成功但不消费 token）
    | 'unexpected-eof'   // 意外的文件结束
    | 'custom'           // 自定义错误

/**
 * 左递归特有信息
 */
export interface LeftRecursionInfo {
    /** 触发左递归的规则名称 */
    ruleName: string
    /** 检测键（格式：ruleName:tokenIndex） */
    detectionKey: string
    /** 规则调用栈 */
    ruleStack: string[]
    /** 循环路径（从根到循环点的规则链） */
    cyclePath: string[]
}

/**
 * 无限循环特有信息
 */
export interface InfiniteLoopInfo {
    /** 触发无限循环的规则名称 */
    ruleName: string
    /** 当前 token 位置 */
    tokenIndex: number
    /** 当前 token 名称 */
    tokenName: string
    /** 当前 token 值 */
    tokenValue?: string
    /** 尝试次数（至少 2 次） */
    attemptCount: number
    /** 规则调用栈 */
    ruleStack: string[]
    /** 可疑的规则（成功但不消费 token） */
    suspiciousRules: string[]
    /** 自动诊断结果 */
    diagnosis: string
    /** 修复建议 */
    suggestions: string[]
}

/**
 * 错误位置信息
 */
export interface ErrorPosition {
    /** Token 索引 */
    tokenIndex: number
    /** 行号（如果可用） */
    line?: number
    /** 列号（如果可用） */
    column?: number
    /** Token 上下文（前后各 2 个 token） */
    context?: Array<{
        tokenName: string
        tokenValue: string
        isCurrent: boolean
    }>
}

/**
 * Subhuti 错误接口（改进版）
 */
export interface SubhutiError {
    /** 错误类型 */
    type: SubhutiErrorType
    
    /** 错误消息 */
    message: string
    
    /** 错误位置 */
    position?: ErrorPosition
    
    /** 左递归特有信息 */
    leftRecursion?: LeftRecursionInfo
    
    /** 无限循环特有信息 */
    infiniteLoop?: InfiniteLoopInfo
    
    /** 原始错误（如果有） */
    originalError?: Error
    
    /** 时间戳 */
    timestamp: number
}

/**
 * 规则执行记录（用于调试和诊断）
 */
export interface RuleExecutionRecord {
    /** 规则名称 */
    ruleName: string
    /** 开始 token 位置 */
    startTokenIndex: number
    /** 结束 token 位置 */
    endTokenIndex: number
    /** 是否成功 */
    success: boolean
    /** 消费的 token 数量 */
    consumed: number
    /** 执行时间（毫秒） */
    duration: number
    /** 时间戳 */
    timestamp: number
}

/**
 * 错误诊断结果
 */
export interface DiagnosisResult {
    /** 可能的原因 */
    possibleCauses: string[]
    /** 可疑的规则 */
    suspiciousRules: string[]
    /** 修复建议 */
    suggestions: string[]
    /** 相关文档链接 */
    documentationLinks?: string[]
}

/**
 * 错误格式化选项
 */
export interface ErrorFormatOptions {
    /** 是否包含调用栈 */
    includeStack?: boolean
    /** 是否包含 token 上下文 */
    includeContext?: boolean
    /** 是否包含诊断信息 */
    includeDiagnosis?: boolean
    /** 是否包含修复建议 */
    includeSuggestions?: boolean
    /** 是否使用颜色（ANSI） */
    useColors?: boolean
}

/**
 * 错误统计信息
 */
export interface ErrorStatistics {
    /** 总错误数 */
    totalErrors: number
    /** 按类型分组的错误数 */
    errorsByType: Record<SubhutiErrorType, number>
    /** 最常见的错误规则 */
    mostCommonRules: Array<{
        ruleName: string
        count: number
    }>
}

