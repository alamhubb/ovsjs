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
    ValidationStats,
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
    static validate(parser: any): void {
        // 1. 收集规则 AST（通过 Proxy，无需 Parser 配合）
        const t1 = Date.now()
        const ruleASTs = SubhutiRuleCollector.collectRules(parser)
        const t2 = Date.now()
        console.log(`  ⏱️ [3.1] 收集规则AST耗时: ${t2 - t1}ms (${ruleASTs.cstMap.size} 个规则)`)

        // 2. 创建语法分析器
        const t3 = Date.now()
        const analyzer = new SubhutiGrammarAnalyzer(ruleASTs.cstMap, ruleASTs.tokenMap)
        const t4 = Date.now()
        console.log(`  ⏱️ [3.2] 创建分析器耗时: ${t4 - t3}ms`)

        // 3. 初始化缓存（计算直接子节点、First 集合、路径展开）
        // 同时进行左递归检测和 Or 分支冲突检测
        const t5 = Date.now()
        const result = analyzer.initCacheAndCheckLeftRecursion()
        const t6 = Date.now()
        console.log(`  ⏱️ [3.3] 初始化缓存和检测耗时: ${t6 - t5}ms`)
        console.log(`  ⏱️ [3.4] 检测完成 (发现 ${result.errors.length} 个错误)`)

        // 4. 聚合所有错误，一起报告（统计信息会在异常的 toString() 中输出）
        if (result.errors.length > 0) {
            throw new SubhutiGrammarValidationError(result.errors, result.stats)
        }
    }

}

