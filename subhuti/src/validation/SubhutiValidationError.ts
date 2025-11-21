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
    type: 'empty-path' | 'prefix-conflict' | 'left-recursion' | 'or-conflict'

    /** 规则名称 */
    ruleName: string

    /** 冲突的分支索引 [前, 后] */
    branchIndices: [number, number] | []

    /** 冲突路径 */
    conflictPaths: {
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
 * 语法验证异常
 */
export class SubhutiGrammarValidationError extends Error {
    constructor(public errors: ValidationError[]) {
        super('Grammar validation failed')
        this.name = 'SubhutiGrammarValidationError'
    }

    /**
     * 格式化错误信息
     */
    toString(): string {
        const lines = ['Grammar Validation Errors:', '']

        for (const error of this.errors) {
            lines.push(`[${error.level}] ${error.message}`)
            lines.push(`  Rule: ${error.ruleName}`)
            lines.push(`  Branches: [${error.branchIndices.join(', ')}]`)
            lines.push(`  Path A: ${error.conflictPaths.pathA}`)
            lines.push(`  Path B: ${error.conflictPaths.pathB}`)
            lines.push(`  Suggestion: ${error.suggestion}`)
            lines.push('')
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
    // ruleName?: string
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



