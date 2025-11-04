import SubhutiParser from "./SubhutiParser.ts";
import type {SubhutiCreateToken} from "./struct/SubhutiCreateToken.ts";

export default class SubhutiTokenConsumer {
    instance: SubhutiParser

    constructor(instance: SubhutiParser) {
        this.instance = instance;
    }

    consume(token: SubhutiCreateToken) {
        this.instance.consume(token.name)
    }
}
