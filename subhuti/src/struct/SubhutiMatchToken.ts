export default class SubhutiMatchToken {
    tokenName: string;
    //只能为字符串，为parser解析时输入的字符串
    tokenValue: string;
    rowNum?: number;
    columnStartNum?: number;
    columnEndNum?: number;
    index?: number
    // length?: number
    hasLineBreakBefore?: boolean;  // 此 token 前是否有换行（Babel 风格）

    constructor(osvToken: SubhutiMatchToken) {
        this.tokenName = osvToken.tokenName;
        this.tokenValue = osvToken.tokenValue;
        this.rowNum = osvToken.rowNum;
        this.columnStartNum = osvToken.columnStartNum;
        this.columnEndNum = osvToken.columnEndNum;
        // this.length = osvToken.length;
        this.index = osvToken.index;
        this.hasLineBreakBefore = osvToken.hasLineBreakBefore;
    }
}

export function createMatchToken(osvToken: SubhutiMatchToken) {
    return new SubhutiMatchToken(osvToken);
}
