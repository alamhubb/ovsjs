/**
 * Token Consumer Context 接口
 * 
 * 定义 SubhutiTokenConsumer 需要的最小权限集合
 * 实现依赖倒置原则：Consumer 依赖接口而非具体 Parser
 * 
 * @version 1.0.0
 */

import type SubhutiCst from "./struct/SubhutiCst.ts";
import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";

export interface ITokenConsumerContext {
    /**
     * 消费一个 token（修改 Parser 状态）
     */
    consume(tokenName: string): SubhutiCst | undefined
    
    /**
     * 前瞻：获取未来的 token（不消费）
     */
    peek(offset: number): SubhutiMatchToken | undefined
    
    /**
     * 获取当前 token
     */
    readonly curToken: SubhutiMatchToken | undefined
    
    /**
     * 检查是否到达结尾
     */
    readonly isAtEnd: boolean
}

