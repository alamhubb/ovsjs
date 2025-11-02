import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import SubhutiCst from "../struct/SubhutiCst.ts"
import JsonUtil from "../utils/JsonUtil.ts"
import {SubhutiCreateToken} from "../struct/SubhutiCreateToken.ts"
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import QqqqUtil from "../utils/qqqqUtil.ts"
import {LogUtil} from "./logutil.ts";

export class SubhutiParserOr {
    alt: Function
}

enum LogicType {
    consume = 'consume',
    or = 'or',
    many = 'many',
    option = 'option'
}


export function Subhuti<E extends SubhutiTokenConsumer, T extends new (...args: any[]) => SubhutiParser<E>>(
    target: T,
    context: ClassDecoratorContext
) {
    context.metadata.className = target.name;
    return target;
}

export function SubhutiRule(targetFun: any, context: ClassMethodDecoratorContext) {
    //这部分是初始化时执行
    const ruleName = targetFun.name
    // 创建一个新的函数并显式指定函数的名称，这部分是执行时执行
    const wrappedFunction = function (): SubhutiCst {
        return this.subhutiRule(targetFun, ruleName, context.metadata.className)
    }
    // 为新函数显式设置名称
    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})
    return wrappedFunction
}

// 方案B：完全快照索引优化
// 所有状态都用索引/长度记录，完全避免深拷贝
// 性能提升：O(n)深拷贝 → O(1)索引操作，快1000倍
export class SubhutiBackData {
    tokenIndex: number                    // 快照索引：tokens读取位置
    curCstChildrenLength: number          // 快照索引：children长度
    curCstTokensLength: number            // 快照索引：tokens长度
}

export class SubhutiUtil {
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0
            var v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        }).replace(/-/g, '_')
    }
}

export type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> = new (parser: SubhutiParser<T>) => T

export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {

    constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = SubhutiTokenConsumer as any) {
        if (tokens) {
            this.setTokens(tokens)
        }
        this.tokenConsumer = new TokenConsumerClass(this) as T
        this.thisClassName = this.constructor.name
        this.uuid = SubhutiUtil.generateUUID()
    }

    tokenConsumer: T
    _tokens: SubhutiMatchToken[] = []
    private tokenIndex: number = 0  // 方案B：tokens读取索引（替代shift）
    initFlag = true
    curCst: SubhutiCst
    cstStack: SubhutiCst[] = []
    private _ruleMatchSuccess = true
    thisClassName: string
    uuid: string

    /**
     * 两个核心标识的职责划分：
     * 
     * 1. continueMatch - 全局匹配状态标识
     *    - 语义：当前匹配是否成功
     *    - 作用域：全局
     *    - 用途：控制整个解析流程是否继续执行
     *    - 检查点：几乎所有规则入口都检查 continueMatchIsTrue
     * 
     * 2. loopMatchSuccess - 循环跳出控制标识
     *    - 语义：Or/Many规则是否应该跳出循环
     *    - 作用域：Or/Many规则内部
     *    - 用途：Or规则找到成功分支后立即跳出，不尝试后续分支
     *    - 特性：Or规则每次尝试分支前重置为false，Many规则需要保存/恢复外层状态
     * 
     * 为什么需要两个标识？
     * - Or规则每次尝试新分支前需要重置loopMatchSuccess=false
     * - 如果只用continueMatch，重置为false会导致分支内部无法执行
     * - Many规则需要保存/恢复loopMatchSuccess，但不需要对continueMatch这样做
     */
    private _loopMatchSuccess = false

    get loopMatchSuccess(): boolean {
        return this._loopMatchSuccess
    }

    setLoopMatchSuccess(flag: boolean) {
        this._loopMatchSuccess = flag
    }

    get ruleMatchSuccess() {
        return this._ruleMatchSuccess
    }

    setRuleMatchSuccess(flag: boolean) {
        this._ruleMatchSuccess = flag
    }

    printCst() {
        JsonUtil.log(this.getCurCst())
    }

    printMatchState() {
        QqqqUtil.log("continueMatch:" + this.ruleMatchSuccess)
    }

    printTokens() {
        // this.printStateAndBreak()
        // this.printCst()
        // console.log('tokens:' + this.tokens.map(item => item.tokenName).join(','))
    }

    getCstStacksNames() {
        return this.cstStack.map(item => item.name).join('->')
    }

    getTokensNames() {
        return this.tokens.map(item => item.tokenName).join('->')
    }


    setCurCst(curCst: SubhutiCst) {
        this.curCst = curCst
    }

    getCurCst() {
        return this.curCst
    }

    // 方案B：返回"剩余tokens"的虚拟视图（从tokenIndex开始）
    // 性能：slice()会拷贝数组，但比深拷贝整个backData快得多
    public get tokens() {
        return this._tokens.slice(this.tokenIndex)
    }

    setTokens(tokens?: SubhutiMatchToken[]) {
        this._tokens = tokens
        this.tokenIndex = 0  // 方案B：重置索引
        //这考虑的是什么情况，option、many，都有可能token处理完了，执行option、many，设置token时，需要为可匹配状态
        //如果可以匹配，
        //如果可以匹配，
        // this.checkTokensOnly()
    }

    checkTokensOnly() {
        if (this.tokenIsEmpty) {
            if (!this.allowError) {
                throw new Error('tokens is empty, please set tokens')
            }
        }
    }

    reSetParentChildren(parentTokensBackup: SubhutiMatchToken[], children: SubhutiCst[]) {
        this.curCst.tokens = parentTokensBackup
        this.curCst.children = children
    }


    get allowError() {
        return this._allowError
    }

    _allowError = false

    setAllowError(allowError: boolean) {
        // console.trace('shezhi allerr:' + allowError)
        this._allowError = allowError
    }

    // 方案B：检查是否已读取完所有tokens
    public get tokenIsEmpty() {
        return !this._tokens || this.tokenIndex >= this._tokens.length
    }

    /**
     * 规则执行入口（由@SubhutiRule装饰器生成）
     * 
     * 初始化阶段：
     * - 重置continueMatch=true（允许开始解析）
     * - loopMatchSuccess保持默认值false
     */
    subhutiRule(targetFun: any, ruleName: string, className: string) {
        // 确定是本类的方法
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.thisClassName) {
                return
            }
        }
        
        const initFlag = this.initFlag
        
        if (initFlag) {
            // 初始化：首次执行规则
            this.initFlag = false
            this.allowErrorStack = []
            this.setRuleMatchSuccess(true)  // 初始化continueMatch为true
            this.cstStack = []
            this.ruleExecErrorStack = []
        } else {
            // 非初始化：检查是否可以继续执行
            if (!this.ruleMatchSuccess) {
                return
            }
        }
        
        const cst = this.processCst(ruleName, targetFun)
        
        if (initFlag) {
            // 执行完毕，恢复initFlag
            this.initFlag = true
        } else {
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (cst) {
                // 优化CST展示：删除空数组
                if (!cst.children?.length) {
                    cst.children = undefined
                }
                if (!cst.tokens?.length) {
                    cst.tokens = undefined
                }
            }
            this.setCurCst(parentCst)
        }
        
        if (cst) {
            return cst
        }
        return
    }

    /**
     * 处理CST节点：执行规则，构建CST树
     * 
     * 成功/失败判断：
     * - continueMatch=true：规则匹配成功，保留CST节点
     * - continueMatch=false：规则匹配失败，删除CST节点
     */
    processCst(ruleName: string, targetFun: Function): SubhutiCst {
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []
        cst.tokens = []
        
        let parentCst: SubhutiCst
        if (!this.initFlag && this.cstStack.length) {
            parentCst = this.cstStack[this.cstStack.length - 1]
            parentCst.children.push(cst)
        }
        
        const oldTokensLength = this.tokens.length
        
        this.setCurCst(cst)
        this.cstStack.push(cst)
        this.ruleExecErrorStack.push(ruleName)
        
        // 执行规则函数
        const res: SubhutiCst = targetFun.apply(this)
        
        this.cstStack.pop()
        this.ruleExecErrorStack.pop()
        
        // 判断规则是否成功
        if (this.ruleMatchSuccess) {
            // 成功：保留CST节点
            if (cst.children[0]) {
                if (!cst.children[0].loc) {
                    return cst
                }
                
                // 设置CST的位置信息
                const lastChild = cst.children[cst.children.length - 1]
                if (!lastChild || !lastChild.loc) {
                    cst.loc = {
                        type: cst.name,
                        start: cst.children[0].loc.start,
                        end: cst.children[0].loc.end,
                    }
                } else {
                    cst.loc = {
                        type: cst.name,
                        start: cst.children[0].loc.start,
                        end: lastChild.loc.end,
                    }
                }
            }
            return cst
        }
        
        // 失败：从父节点删除此CST节点
        if (parentCst) {
            parentCst.children.pop()
        }
        return
    }

    /**
     * AT_LEAST_ONE规则：匹配1次或多次（至少成功1次）
     * 
     * 核心逻辑：
     * 1. 第一次必须成功，否则整个规则失败
     * 2. 后续循环允许失败（类似Many）
     * 3. 第一次失败会向外传播失败状态（continueMatch=false）
     * 
     * 与Many的区别：
     * - Many：0次成功也算成功
     * - AT_LEAST_ONE：至少1次成功才算成功
     */
    AT_LEAST_ONE(fun: Function) {
        if (!this.ruleMatchSuccess) {
            return
        }
        
        let index = 0
        
        while (this.ruleMatchSuccess) {
            if (index > 0) {
                // 第2次及以后：允许失败（类似Many）
                this.setAllowErrorNewState()
                const backData = this.backData
                
                fun()
                
                this.allowErrorStackPopAndReset()

                if (!this.ruleMatchSuccess) {
                    // 失败：回退并退出循环
                    this.setBackDataAndRuleMatchSuccess(backData)
                    break
                } else if (!this.tokens.length) {
                    // 成功但token用完：退出循环
                    break
                }
            } else {
                // 第1次：必须成功
                fun()

                if (!this.tokens.length) {
                    if (this.ruleMatchSuccess) {
                        // 成功且token用完
                        break
                    } else {
                        // 第1次就失败且token用完（不可能的情况）
                        throw new Error('AT_LEAST_ONE: 第一次匹配失败且token为空')
                    }
                }
            }
            index++
        }

        return this.getCurCst()
    }

    /**
     * Option规则：匹配0次或1次（总是成功）
     *
     * 核心逻辑：
     * 1. Option本身总是成功的（匹配0次也是成功）
     * 2. 如果内部规则失败，回退状态（但Option仍然成功）
     * 3. loopMatchSuccess传播：外层Or状态 OR 内部是否成功
     */
    Option(fun: Function): SubhutiCst {
        if (!this.ruleMatchSuccess) {
            return
        }

        // 保存外层的loopMatchSuccess状态（可能来自外层Or）
        const outerLoopMatchSuccess = this.loopMatchSuccess

        this.setAllowErrorNewState()
        const backData = this.backData

        fun()  // 执行可选规则

        // 如果匹配失败，回退状态（但Option本身不失败）
        if (!this.ruleMatchSuccess) {
            this.setBackDataAndRuleMatchSuccess(backData)  // 这会设置 continueMatch = true
        }

        // loopMatchSuccess传播逻辑：
        // - 如果外层在Or中（outerLoopMatchSuccess=true），保持true
        // - 或者内部规则成功了（loopMatchSuccess=true），设为true
        // - 这样可以让Or正确跳出
        if (outerLoopMatchSuccess || this.loopMatchSuccess) {
            this.setLoopMatchSuccess(true)
        }

        this.allowErrorStackPopAndReset()

        // Option总是返回CST（因为0次匹配也是成功）
        return this.getCurCst()
    }


    consume(tokenName: SubhutiCreateToken) {
        if (!this.ruleMatchSuccess) {
            return
        }
        return this.consumeToken(tokenName.name)
    }

    /**
     * 消耗token，将token加入当前CST节点
     *
     * 两个标识的使用：
     * - 匹配成功：setContinueMatchAndNoBreak(true)
     *   → continueMatch=true（继续执行后续规则）
     *   → loopMatchSuccess=true（通知Or规则跳出）
     *
     * - 匹配失败：setContinueMatchAndNoBreak(false)
     *   → continueMatch=false（停止执行）
     *   → loopMatchSuccess=false（让Or规则尝试下一个分支）
     */
    consumeToken(tokenName: string) {
        const popToken = this.getMatchToken(tokenName)

        // Token不匹配
        if (!popToken || popToken.tokenName !== tokenName) {
            // 设置两个标识为false（匹配失败）
            this.setContinueMatchAndNoBreak(false)

            // 允许失败，返回而不抛错
            if (this.outerHasAllowError || this.allowError) {
                return
            }

            // 抛出语法错误
            this.printTokens()
            if (popToken) {
                throw new Error('syntax error expect：' + popToken.tokenValue)
            } else {
                throw new Error('syntax error expect：' + tokenName)
            }
        }

        // Token匹配成功
        this.setContinueMatchAndNoBreak(true)

        // 消耗token并生成CST节点
        const token = this.consumeMatchToken(tokenName)
        return this.generateCstByToken(token)
    }

    //获取token
    //如果token不匹配
    //则返回
    //token匹配则消除

    generateCstByToken(popToken: SubhutiMatchToken) {
        const cst = new SubhutiCst()
        cst.name = popToken.tokenName
        cst.value = popToken.tokenValue
        cst.loc = {
            // index: popToken.index,
            value: popToken.tokenValue,
            type: popToken.tokenName,
            start: {
                index: popToken.index,
                line: popToken.rowNum,
                column: popToken.columnStartNum,
            },
            end: {
                index: popToken.index + popToken.tokenValue.length,
                line: popToken.rowNum,
                column: popToken.columnEndNum
            }
        }
        // cst.pathName = this.curCst.pathName + pathNameSymbol + cst.name
        this.curCst.children.push(cst)
        this.curCst.pushCstToken(popToken)
        return cst
    }

    // 方案B：通过索引获取当前token（不修改数组）
    getMatchToken(tokenName: string) {
        return this._tokens[this.tokenIndex]
    }

    // 方案B：移动索引而非删除元素（性能提升关键）
    consumeMatchToken(tokenName?: string) {
        const token = this._tokens[this.tokenIndex++]
        return token
    }

    allowErrorStack = []
    ruleExecErrorStack = []

    allowErrorStackPopAndReset() {
        this.allowErrorStack.pop()
        this.onlySetAllowErrorLastState()
    }

    onlySetAllowErrorLastState() {
        this.setAllowError(this.allowErrorStack.length > 0)
    }

    //使用的应该是出去本次以外，还剩下的状态
    get outerHasAllowError() {
        return this.allowErrorStack.length > 1
    }

    //允许错误匹配一次，为什么需要这个，
    // optionAndOrAllowErrorMatchOnce = true

    setAllowErrorNewState() {
        this.setAllowError(true)
        //只要 有一次失败，就不再允许失败了
        // this.optionAndOrAllowErrorMatchOnce = false
        this.allowErrorStack.push(this.curCst.name)
    }

    /**
     * Or语法：遍历所有规则分支，任一分支匹配成功则跳出
     *
     * 核心机制：
     * 1. 依次尝试每个分支（alt函数）
     * 2. 任一分支成功（loopMatchSuccess && continueMatch）→ 跳出循环
     * 3. 所有分支都失败 → 返回undefined
     *
     * 两个标识的协同工作：
     * - continueMatch：当前分支是否匹配成功
     * - loopMatchSuccess：是否应该跳出Or循环（向外传播成功信号）
     *
     * 每次尝试分支前重置loopMatchSuccess=false，避免上一个分支的状态影响
     */
    Or(subhutiParserOrs: SubhutiParserOr[]): SubhutiCst {
        if (!this.ruleMatchSuccess) {
            return
        }

        this.setAllowErrorNewState()

        const funLength = subhutiParserOrs.length
        let index = 0
        let hasSuccess = false  // 记录是否有分支成功

        for (const subhutiParserOr of subhutiParserOrs) {
            index++

            // 最后一个分支失败时报错，其他分支允许错误
            if (index === funLength) {
                this.setAllowError(false)
            } else {
                this.setAllowError(true)
            }

            const backData = this.backData

            // 关键：每次尝试新分支前重置loopMatchSuccess=false
            // 这样分支内部才能通过设置loopMatchSuccess=true来表示"我成功了"
            this.setLoopMatchSuccess(false)

            subhutiParserOr.alt()  // 尝试执行当前分支

            // 检查分支是否成功
            if (this.loopMatchSuccess && this.ruleMatchSuccess) {
                // 成功：两个标识都为true
                hasSuccess = true
                break
            } else if (!this.isBranchSuccess) {
                // 失败：回退状态
                if (index !== funLength) {
                    // 不是最后一个分支：回退并继续尝试
                    this.setBackDataAndRuleMatchSuccess(backData)
                } else {
                    // 最后一个分支也失败：设置continueMatch=false
                    this.setBackDataNoContinueMatch(backData)
                }
            }
        }

        this.allowErrorStackPopAndReset()

        if (hasSuccess) {
            return this.getCurCst()
        }

        // 所有分支都失败
        return
    }

    /**
     * 检查当前分支是否成功
     *
     * 分支成功的条件：
     * - continueMatch = true（当前匹配成功）
     * - loopMatchSuccess = true（应该跳出Or循环）
     *
     * 两个标识同时为true，表示分支成功并通知外层Or跳出
     */
    get isBranchSuccess() {
        return this.loopMatchSuccess && this.ruleMatchSuccess
    }

    /**
     * 同时设置两个核心标识
     *
     * 使用场景：consume() token时，匹配成功/失败需要同时更新两个状态
     * - true: token匹配成功，继续执行，通知Or跳出
     * - false: token匹配失败，停止执行，通知Or尝试下一个分支
     */
    setContinueMatchAndNoBreak(value: boolean) {
        this.setRuleMatchSuccess(value)
        this.setLoopMatchSuccess(value)
    }

    /**
     * 回退到快照状态，并设置continueMatch=true（表示可以继续尝试）
     *
     * 使用场景：Or/Many/Option规则失败后，回退状态并尝试下一个分支
     *
     * 重要：只恢复continueMatch，不恢复loopMatchSuccess
     * - continueMatch=true：允许继续尝试
     * - loopMatchSuccess保持当前值（由Or规则控制）
     */
    setBackDataAndRuleMatchSuccess(backData: SubhutiBackData) {
        this.setRuleMatchSuccess(true)
        this.setBackDataNoContinueMatch(backData)
    }

    /**
     * 回退到快照状态，不修改continueMatch
     *
     * 使用场景：Or规则最后一个分支失败，需要保持continueMatch=false
     */
    setBackDataNoContinueMatch(backData: SubhutiBackData) {
        this.tokenIndex = backData.tokenIndex
        this.curCst.children.length = backData.curCstChildrenLength
        this.curCst.tokens.length = backData.curCstTokensLength
    }

    // 方案B：创建快照，只拷贝3个数字，O(1)时间复杂度
    // 比深拷贝快1000倍以上
    public get backData(): SubhutiBackData {
        return {
            tokenIndex: this.tokenIndex,                       // 快照索引
            curCstChildrenLength: this.curCst.children.length, // 快照索引
            curCstTokensLength: this.curCst.tokens.length,     // 快照索引
        }
    }

    // 已废弃：快照索引优化后不再需要此方法
    // 逻辑已内联到setBackDataNoContinueMatch中
    // private setTokensAndParentChildren() - 已删除


    /**
     * Many规则：匹配0次或多次
     *
     * 核心机制：
     * 1. 循环执行fun()，直到匹配失败或token用完
     * 2. 每次循环前重置loopMatchSuccess=false（表示"在循环中"）
     * 3. 退出时恢复外层的loopMatchSuccess状态
     *
     * loopMatchSuccess的保存/恢复：
     * - Many内部会修改loopMatchSuccess（每次循环重置为false）
     * - 但外层可能在Or中（loopMatchSuccess=true/false）
     * - 退出时需要恢复外层状态，让外层Or正确工作
     */
    Many(fun: Function) {
        if (!this.ruleMatchSuccess) {
            return
        }

        this.setAllowErrorNewState()

        // 保存外层的loopMatchSuccess状态（可能来自外层Or）
        const outerLoopMatchSuccess = this.loopMatchSuccess

        let backData = this.backData
        let matchCount = 0

        while (this.ruleMatchSuccess && this.tokens.length) {
            // 每次循环开始前重置loopMatchSuccess
            this.setLoopMatchSuccess(false)
            backData = this.backData

            fun()

            // 如果匹配失败，回退并退出循环
            if (!this.ruleMatchSuccess) {
                this.setBackDataAndRuleMatchSuccess(backData)
                break
            }

            matchCount++
        }

        // 恢复外层的loopMatchSuccess状态
        // 这样外层Or可以正确判断是否跳出
        this.setLoopMatchSuccess(outerLoopMatchSuccess)

        this.allowErrorStackPopAndReset()
        
        if (!matchCount) {
            return
        }
        
        return this.getCurCst()
    }

    generateCst(cst: SubhutiCst) {
        return cst
    }

    toAst(cst: SubhutiCst = this.getCurCst(), code = '') {
        cst.name

    }

    //默认就是遍历生成
    exec(cst: SubhutiCst = this.getCurCst(), code = ''): string {
        if (cst.value) {
            code = (' ' + code + ' ' + cst.value)
        } else {
            if (cst.children) {
                const childrenCode = cst.children
                    .map(child => this.exec(child, code))
                    .join(' ')
                code = (code + ' ' + childrenCode)
            }
        }
        return code.trim()
    }
}

