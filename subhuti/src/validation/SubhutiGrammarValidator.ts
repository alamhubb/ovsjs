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
    SubhutiGrammarValidationError
} from "./index";

export class SubhutiGrammarValidator {
    /**
     * 验证语法：有问题直接抛异常
     * 
     * 流程：
     * 1. 使用 Proxy 收集规则 AST
     * 2. 分析所有可能路径
     * 3. 检测 Or 分支冲突
     * 4. 有错误抛 SubhutiGrammarValidationError
     * 
     * @param parser Parser 实例
     * @throws SubhutiGrammarValidationError 语法有冲突时抛出
     */
    static validate(parser: any): void {
        // 1. 收集规则 AST（通过 Proxy，无需 Parser 配合）
        const ruleASTs = SubhutiRuleCollector.collectRules(parser)
        
        // 2. 创建语法分析器
        const analyzer = new SubhutiGrammarAnalyzer(ruleASTs, {
            maxPaths: 10000
        })
        
        // 3. 检测冲突
        const detector = new SubhutiConflictDetector(analyzer, ruleASTs)
        const errors = detector.detectAllConflicts()
        
        // 4. 有错误直接抛出
        if (errors.length > 0) {
            throw new SubhutiGrammarValidationError(errors)
        }
    }
}

