import type SubhutiParser from "./SubhutiParser.ts"
import type {SubhutiCreateToken} from "./struct/SubhutiCreateToken.ts"

export default class SubhutiTokenConsumer {
    instance: SubhutiParser

    constructor(instance: SubhutiParser) {
        this.instance = instance
    }

    // ============================================
    // Token 消费功能（修改状态）
    // ============================================
    
    /**
     * 消费一个 token（修改 Parser 状态）
     */
    consume(token: SubhutiCreateToken) {
        this.instance.consume(token.name)
    }
}

