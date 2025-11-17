/**
 * SubhutiGrammarValidator - 语法验证器
 *
 * 职责：
 * 1. 提供静态验证方法
 * 2. 封装验证流程（收集 → 分析 → 检测 → 报告）
 *
 * 设计：
 * - 纯静态方法，无实例状态
 * - 使用 Proxy 方案收集 AST（零侵入）
 * - 有问题直接抛异常
 *
 * @version 2.0.0 - 静态方法重构
 */

import {
    SubhutiRuleCollector,
    SubhutiGrammarAnalyzer,
    SubhutiConflictDetector,
    SubhutiGrammarValidationError,
    EXPANSION_LIMITS
} from "./index";

export class SubhutiGrammarValidator {
    /**
     * 验证语法：有问题直接抛异常
     *
     * 流程（分层检测）：
     * 1. 使用 Proxy 收集规则 AST
     * 2. 分析所有可能路径和 First 集合
     * 3. Level 0: 左递归检测 (FATAL) - 最先检测，最致命
     * 4. Level 1 & 2: Or 分支冲突检测 (FATAL/ERROR)
     * 5. 有错误抛 SubhutiGrammarValidationError
     *
     * @param parser Parser 实例
     * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
     * @throws SubhutiGrammarValidationError 语法有冲突时抛出
     */
    static validate(parser: any, maxLevel = EXPANSION_LIMITS.MAX_LEVEL): void {
        // 1. 收集规则 AST（通过 Proxy，无需 Parser 配合）
        const ruleASTs = SubhutiRuleCollector.collectRules(parser)

        // 2. 创建语法分析器
        const analyzer = new SubhutiGrammarAnalyzer(ruleASTs)

        // 3. 初始化缓存（计算直接子节点、First 集合、路径展开）
        analyzer.initializeCaches(maxLevel)

        const errors: any[] = []

        // 4. Level 0: 左递归检测 (FATAL)
        // 左递归会导致无限循环，是最致命的错误，必须最先检测
        const leftRecursionErrors = this.detectLeftRecursion(analyzer, ruleASTs)
        errors.push(...leftRecursionErrors)

        // 5. Level 1 & 2: Or 分支冲突检测（空路径 + 前缀冲突）
        const detector = new SubhutiConflictDetector(analyzer, ruleASTs)
        const conflictErrors = detector.detectAllConflicts()
        errors.push(...conflictErrors)

        // 6. 聚合所有错误，一起报告
        if (errors.length > 0) {
            throw new SubhutiGrammarValidationError(errors)
        }
    }

    /**
     * 检测左递归
     *
     * 左递归定义：规则 A 的 First 集合包含 A 本身
     *
     * 示例：
     * - ❌ Expression → Expression "+" Term  (直接左递归)
     * - ❌ A → B, B → A  (间接左递归，如果 B 的第一个符号是 A)
     * - ✅ MemberExpression → PrimaryExpression ("." IdentifierName)*  (右递归，合法)
     *
     * @param analyzer 语法分析器
     * @param ruleASTs 规则 AST
     * @returns 左递归错误列表
     */
    private static detectLeftRecursion(
        analyzer: SubhutiGrammarAnalyzer,
        ruleASTs: Map<string, any>
    ): any[] {
        const errors: any[] = []

        for (const [ruleName, ruleNode] of ruleASTs) {
            const firstSet = analyzer.getFirst(ruleName)

            // 如果 First 集合包含规则名本身，就是左递归
            if (firstSet.has(ruleName)) {
                errors.push({
                    level: 'FATAL',
                    type: 'left-recursion',
                    ruleName,
                    branchIndices: [],
                    conflictPaths: { pathA: '', pathB: '' },
                    message: `规则 "${ruleName}" 存在左递归`,
                    suggestion: this.getLeftRecursionSuggestion(ruleName, ruleNode, firstSet)
                })
            }
        }

        return errors
    }

    /**
     * 生成左递归修复建议
     *
     * @param ruleName 规则名
     * @param node 规则节点
     * @param firstSet First 集合
     * @returns 修复建议
     */
    private static getLeftRecursionSuggestion(
        ruleName: string,
        node: any,
        firstSet: Set<string>
    ): string {
        // 分析规则结构，提供具体建议
        if (node.type === 'or') {
            return `PEG 不支持左递归！请将左递归改为右递归，或使用 Many/AtLeastOne。

示例：
  ❌ 左递归（非法）：
     ${ruleName} → ${ruleName} '+' Term | Term

  ✅ 右递归（合法）：
     ${ruleName} → Term ('+' Term)*

  或使用 Many：
     ${ruleName} → Term
     ${ruleName}Suffix → '+' Term
     完整形式 → ${ruleName} ${ruleName}Suffix*

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(', ')}${firstSet.size > 5 ? ', ...' : ''}}
包含 ${ruleName} 本身，说明存在左递归。`
        }

        return `PEG 不支持左递归！请重构语法以消除左递归。

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(', ')}${firstSet.size > 5 ? ', ...' : ''}}
包含 ${ruleName} 本身，说明存在左递归。`
    }
}

