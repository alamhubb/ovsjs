/**
 * Subhuti Token Consumer - Token 消费扩展基类
 *
 * 职责：
 * 1. 提供高级 token 消费方法
 * 2. 封装 consume 调用，避免子类重复代码
 * 3. 支持用户自定义扩展
 *
 * 设计模式：
 * - 直接依赖 SubhutiParser
 * - 可被继承，添加自定义消费方法（如 Semicolon/Comma）
 *
 * @version 3.0.0
 */

import type SubhutiParser from "./SubhutiParser.ts"
import type SubhutiCst from "./struct/SubhutiCst.ts"
import type {LexicalGoal} from "./SubhutiLexer.ts"

export default class SubhutiTokenConsumer {
    /**
     * Parser 实例
     */
    protected readonly parser: SubhutiParser

    constructor(parser: SubhutiParser) {
        this.parser = parser
    }

    // ============================================
    // Token 消费功能（修改状态）
    // ============================================

    /**
     * 消费一个 token（修改 Parser 状态）
     * @param tokenName token 名称（来自 TokenNames）
     * @param goal 可选的词法目标（用于模板尾部等场景）
     */
    protected consume(tokenName: string, goal?: LexicalGoal): SubhutiCst | undefined {
        return this.parser._consumeToken(tokenName, goal)
    }
}

