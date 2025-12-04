/**
 * 词法前瞻配置
 */
export interface SubhutiTokenLookahead {
    is?: RegExp | string       // 后面必须是
    not?: RegExp | string      // 后面不能是
    in?: (RegExp | string)[]   // 后面必须在集合中
    notIn?: (RegExp | string)[] // 后面不能在集合中
}

/**
 * 上下文约束配置
 * 用于处理词法歧义（如正则表达式 vs 除法）
 */
export interface SubhutiTokenContextConstraint {
    onlyAfter?: Set<string>    // 只有前一个 token 在此集合中才匹配
    notAfter?: Set<string>     // 前一个 token 不能在此集合中
    onlyAtStart?: boolean      // 只能在文件开头（index === 0）匹配（如 Hashbang）
    onlyAtLineStart?: boolean  // 只能在行首匹配（前一个非 skip token 在上一行，如 HTMLCloseComment -->）
}

/**
 * SubhutiCreateToken 构造函数参数类型
 */
export interface SubhutiCreateTokenOptions {
    name: string;
    type?: string;
    pattern?: RegExp;
    isKeyword?: boolean;
    skip?: boolean;
    value?: string;
    categories?: any;
    lookaheadAfter?: SubhutiTokenLookahead;
    contextConstraint?: SubhutiTokenContextConstraint;
}

export class SubhutiCreateToken {
    name: string;
    type: string;
    pattern?: RegExp;
    isKeyword?: boolean;
    skip?: boolean;  // 是否跳过此 token（不加入结果）
    value?: string;
    categories?: any;
    lookaheadAfter?: SubhutiTokenLookahead;  // 前瞻配置
    contextConstraint?: SubhutiTokenContextConstraint;  // 上下文约束配置

    constructor(ovsToken: SubhutiCreateTokenOptions) {
        this.name = ovsToken.name;
        this.type = ovsToken.type || ovsToken.name;  // type 默认等于 name
        this.pattern = ovsToken.pattern
        if (ovsToken.value) {
            this.value = ovsToken.value
        } else {
            this.value = emptyValue
        }
        this.isKeyword = ovsToken.isKeyword ?? false;
        this.skip = ovsToken.skip;
        this.lookaheadAfter = ovsToken.lookaheadAfter;  // 复制前瞻配置
        this.contextConstraint = ovsToken.contextConstraint;  // 复制上下文约束
    }
}

export const emptyValue = 'Error:CannotUseValue'

export function createToken(osvToken: SubhutiCreateToken) {
    return new SubhutiCreateToken(osvToken);
}

export function createKeywordToken(name: string, pattern: string): SubhutiCreateToken {
    // 添加负向前瞻，确保关键字后不是标识符字符（防止 do 匹配 double）
    const keywordPattern = new RegExp(pattern + '(?![a-zA-Z0-9_$])')
    const token = new SubhutiCreateToken({name: name, pattern: keywordPattern, value: pattern});
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
    skip?: boolean,
    lookahead?: SubhutiTokenLookahead,
    contextConstraint?: SubhutiTokenContextConstraint
) {
    const token = new SubhutiCreateToken({
        name: name,
        pattern: pattern,
        value: value,
        skip: skip,
        lookaheadAfter: lookahead,
        contextConstraint: contextConstraint
    });
    return token;
}

export function createEmptyValueRegToken(
    name: string,
    pattern: RegExp,
    contextConstraint?: SubhutiTokenContextConstraint
) {
    const token = new SubhutiCreateToken({
        name: name,
        pattern: pattern,
        contextConstraint: contextConstraint
    });
    return token;
}
