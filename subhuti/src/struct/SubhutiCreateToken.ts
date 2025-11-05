export enum SubhutiCreateTokenGroupType {
    skip = 'skip'
}

/**
 * 词法前瞻配置
 */
export interface SubhutiTokenLookahead {
    is?: RegExp | string       // 后面必须是
    not?: RegExp | string      // 后面不能是
    in?: (RegExp | string)[]   // 后面必须在集合中
    notIn?: (RegExp | string)[] // 后面不能在集合中
}

export class SubhutiCreateToken {
    name: string;
    type: string;  // 添加 type 属性
    pattern?: RegExp;
    isKeyword?: boolean;
    group?: string;
    value?: string;
    categories?: any;
    lookahead?: SubhutiTokenLookahead;  // 新增：前瞻配置

    constructor(ovsToken: SubhutiCreateToken) {
        this.name = ovsToken.name;
        this.type = ovsToken.name;  // type 默认等于 name
        this.pattern = ovsToken.pattern
        if (ovsToken.value) {
            this.value = ovsToken.value
        } else {
            this.value = emptyValue
        }
        this.isKeyword = false;
        this.group = ovsToken.group;
        this.lookahead = ovsToken.lookahead;  // 复制前瞻配置
    }
}

export const emptyValue = 'Error:CannotUseValue'

export function createToken(osvToken: SubhutiCreateToken) {
    return new SubhutiCreateToken(osvToken);
}

export function createKeywordToken(name: string, pattern: string): SubhutiCreateToken {
    const token = new SubhutiCreateToken({name: name, pattern: new RegExp(pattern), value: pattern});
    token.isKeyword = true;
    return token;
}

export function createRegToken(name: string, pattern: RegExp) {
    const token = new SubhutiCreateToken({name: name, pattern: pattern, value: pattern.source});
    return token;
}

export function createValueRegToken(
    name: string, 
    pattern: RegExp, 
    value: string, 
    group?: string,
    lookahead?: SubhutiTokenLookahead
) {
    const token = new SubhutiCreateToken({
        name: name, 
        pattern: pattern, 
        value: value, 
        group: group,
        lookahead: lookahead
    });
    return token;
}

export function createEmptyValueRegToken(name: string, pattern: RegExp) {
    const token = new SubhutiCreateToken({name: name, pattern: pattern});
    return token;
}
