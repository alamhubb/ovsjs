/**
 * Subhuti Token Consumer - Token 消费扩展基类
 * 
 * 职责：
 * 1. 提供高级 token 消费方法
 * 2. 依赖接口而非具体 Parser（依赖倒置）
 * 3. 支持用户自定义扩展
 * 
 * 设计模式：
 * - 依赖 ITokenConsumerContext 接口（最小权限）
 * - 可被继承，添加自定义消费方法（如 Semicolon/Comma）
 * 
 * @version 2.0.0
 */

import type {ITokenConsumerContext} from "./ITokenConsumerContext.ts"
import type {SubhutiCreateToken} from "./struct/SubhutiCreateToken.ts"
import type SubhutiCst from "./struct/SubhutiCst.ts"

export default class SubhutiTokenConsumer {
    /**
     * Parser 上下文（只能访问接口定义的方法）
     */
    protected readonly ctx: ITokenConsumerContext

    constructor(ctx: ITokenConsumerContext) {
        this.ctx = ctx
    }

    // ============================================
    // Token 消费功能（修改状态）
    // ============================================
    
    /**
     * 消费一个 token（修改 Parser 状态）
     */
    consume(token: SubhutiCreateToken): SubhutiCst | undefined {
        return this.ctx.consume(token.name)
    }
}

