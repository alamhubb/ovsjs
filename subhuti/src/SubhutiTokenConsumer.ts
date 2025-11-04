import SubhutiParser, {type SubhutiParserOr} from "./SubhutiParser.ts";
import type {SubhutiCreateToken} from "./struct/SubhutiCreateToken.ts";

export default class SubhutiTokenConsumer {
    instance: SubhutiParser

    constructor(instance: SubhutiParser) {
        this.instance = instance;
    }

    consume(token: SubhutiCreateToken) {
        this.instance.consume(token.name)
    }

    //因为存在缓存问题，这里需要特殊处理，简化，直接不再使用
    or(subhutiParserOrs: SubhutiParserOr[]) {
        // 为tokenConsumer的or调用添加特殊标记到调用栈
        // 避免与Parser规则的Or缓存冲突
        const stackMarker = 'TokenConsumer_or'
        ;(this.instance as any).ruleExecErrorStack.push(stackMarker)
        try {
            this.instance.Or(subhutiParserOrs)
        } finally {
            ;(this.instance as any).ruleExecErrorStack.pop()
        }
    }
}
