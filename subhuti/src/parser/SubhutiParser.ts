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
     * 1. ruleMatchSuccess - 全局匹配状态标识
     *    - 语义：当前规则是否可以继续执行
     *    - 作用域：全局（影响所有规则）
     *    - 用途：控制整个解析流程是否继续执行
     *    - 检查点：几乎所有规则入口都检查 if (!this.ruleMatchSuccess) return
     *    - 失败时：后续规则不再执行，直接返回
     *
     * 2. loopMatchSuccess - 循环跳出控制标识
     *    - 语义：是否应该跳出Or循环（分支成功信号）
     *    - 作用域：Or/Many/Option规则内部
     *    - 用途：
     *      * Or：判断分支是否成功，决定是break还是继续尝试
     *      * Many：控制循环是否继续（但退出时总是设为true）
     *      * Option：向外传播成功信号（总是设为true）
     *    - 特性：Or规则每次尝试分支前重置为false
     *
     * 为什么需要两个标识？
     *
     * 问题场景：Or规则需要"尝试失败后继续"的能力
     * - Or的第一个分支失败 → 需要回退状态 → 尝试第二个分支
     * - 如果只有一个标识，失败后设为false，第二个分支就无法执行了
     *
     * 解决方案：分离两个职责
     * - ruleMatchSuccess：控制"是否可以执行"（回退时设为true，允许继续）
     * - loopMatchSuccess：控制"是否应该跳出"（每次尝试前重置，分支内部设置）
     *
     * 协同工作示例（Or规则）：
     * 1. 尝试分支A前：
     *    - setLoopMatchSuccess(false)  // 重置跳出标识
     *    - ruleMatchSuccess保持为true  // 允许执行
     * 2. 分支A失败：
     *    - ruleMatchSuccess = false, loopMatchSuccess = false
     *    - 判断 loopBranchAndRuleSuccess = false → 继续循环
     *    - 回退：setBackDataAndRuleMatchSuccess → ruleMatchSuccess = true
     * 3. 尝试分支B前：
     *    - setLoopMatchSuccess(false)  // 重新重置
     *    - ruleMatchSuccess已是true  // 可以执行
     * 4. 分支B成功：
     *    - ruleMatchSuccess = true, loopMatchSuccess = true
     *    - 判断 loopBranchAndRuleSuccess = true → break
     *
     * 关键insight：
     * - 如果只有一个标识，Or的"每次尝试前重置"会破坏"允许继续执行"的状态
     * - 两个标识分离了"能否执行"和"是否成功"两个不同的概念
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

        this.setCurCst(cst)
        this.cstStack.push(cst)
        this.ruleExecErrorStack.push(ruleName)

        // 执行规则函数
        targetFun.apply(this)

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
     * Option规则：匹配0次或1次（总是成功）
     *
     * 语义：Option(A) 表示 A 可以出现0次或1次
     * - 0次匹配（内部规则失败）：Option成功，返回空CST
     * - 1次匹配（内部规则成功）：Option成功，返回带内容的CST
     *
     * 关键点1：为什么无条件设置 loopMatchSuccess = true？
     * - Option的语义是"0次或1次都算成功"
     * - 必须向外层Or传播"成功信号"，让Or知道可以跳出了
     * - 即使内部规则失败（0次匹配），Option本身也是成功的
     *
     * 关键点2：为什么总是返回 getCurCst()？
     * - 保持CST结构完整性（即使0次匹配，也应该有Option节点）
     * - 方便AST转换器统一处理（不需要到处判断undefined）
     *
     * 示例场景：
     * this.Or([
     *   {alt: () => this.Option(() => this.Export())},  // 0次匹配
     *   {alt: () => this.Other()}
     * ])
     * // Option虽然0次匹配，但设置了loopMatchSuccess=true
     * // Or会判断第一个分支成功，直接跳出，不会尝试第二个分支
     */
    Option(fun: Function): SubhutiCst {
        if (!this.ruleMatchSuccess) {
            return
        }

        this.setAllowErrorNewState()
        const backData = this.backData

        fun()  // 执行可选规则

        // 如果匹配失败，回退状态（但Option本身不失败）
        if (!this.ruleMatchSuccess) {
            this.setBackDataAndRuleMatchSuccess(backData)  // 恢复ruleMatchSuccess=true
        }

        // 核心：Option总是成功，无条件向Or传播成功信号
        // 无论内部是否匹配（0次或1次），Option都算成功
        this.setLoopMatchSuccess(true)

        this.allowErrorStackPopAndReset()

        // 总是返回CST（保持结构完整性）
        return this.getCurCst()
    }


    /**
     * Many规则：匹配0次或多次（总是成功）
     *
     * 语义：Many(A) 表示 A 可以出现0次或多次
     * - 0次匹配（第一次就失败）：Many成功，返回空CST
     * - N次匹配（匹配N次后失败）：Many成功，返回带N个子节点的CST
     *
     * 核心机制：
     * 1. 循环执行fun()，直到匹配失败或token用完
     * 2. 每次循环前重置loopMatchSuccess=false（让内部规则重新设置）
     * 3. 匹配失败时回退状态，退出循环
     *
     * 关键点1：为什么无条件设置 loopMatchSuccess = true？
     * - Many的语义是"0次或多次都算成功"
     * - 必须向外层Or传播"成功信号"，让Or知道可以跳出了
     * - 即使0次匹配，Many本身也是成功的
     *
     * 关键点2：为什么总是返回 getCurCst()？
     * - 与Option保持一致，保持CST结构完整性
     * - 即使0次匹配，也返回空CST节点（children为空数组）
     *
     * 关键点3：while条件为什么是 loopBranchAndRuleSuccess？
     * - 第一次进入前：手动设置 loopMatchSuccess = true，让条件为true，可以进入
     * - 每次循环开始：重置 loopMatchSuccess = false，清空状态
     * - 执行fun()：如果成功，内部会设置 loopMatchSuccess = true
     * - 下次循环判断：两个标识都为true，继续循环；任一为false，退出
     *
     * 示例场景：
     * this.Or([
     *   {alt: () => this.Many(() => this.Statement())},  // 0次匹配
     *   {alt: () => this.Other()}
     * ])
     * // Many虽然0次匹配，但设置了loopMatchSuccess=true
     * // Or会判断第一个分支成功，直接跳出
     */
    Many(fun: Function) {
        if (!this.ruleMatchSuccess) {
            return
        }

        this.setAllowErrorNewState()

        let backData = this.backData
        let matchCount = 0

        // 关键：初始化loopMatchSuccess=true，让while条件第一次为true，可以进入循环
        // 否则默认值为false，while条件永远为false，无法进入循环
        this.setLoopMatchSuccess(true)
        while (this.loopBranchAndRuleSuccess) {
            // 每次循环开始前重置loopMatchSuccess=false
            // 让内部规则重新设置（如果成功会设为true）
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

        // 核心：Many总是成功，无条件向Or传播成功信号
        // 无论匹配几次（0次或N次），Many都算成功
        this.setLoopMatchSuccess(true)

        this.allowErrorStackPopAndReset()

        // 总是返回CST（保持结构完整性）
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
        const popToken = this.getMatchToken()

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
        const token = this.consumeMatchToken()
        return this.generateCstByToken(token)
    }

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
    getMatchToken() {
        return this._tokens[this.tokenIndex]
    }

    // 方案B：移动索引而非删除元素（性能提升关键）
    consumeMatchToken() {
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
     * Or规则：尝试多个分支，任一成功则跳出（顺序选择，第一个成功即返回）
     *
     * 语义：Or([A, B, C]) 表示按顺序尝试 A、B、C，第一个成功的立即返回
     * - 不是贪婪匹配（不会尝试所有分支选最长）
     * - 不是并行尝试（按顺序尝试，成功即停止）
     * - 顺序很重要：长规则必须在前，短规则在后
     *
     * 核心机制：
     * 1. 依次尝试每个分支
     * 2. 每次尝试前重置 loopMatchSuccess = false（清除上一个分支的状态）
     * 3. 分支成功 → break → 返回CST
     * 4. 分支失败 → 回退状态 → 尝试下一个
     * 5. 所有分支都失败 → 返回undefined
     *
     * 关键点1：为什么不需要 hasSuccess 变量？
     * - 曾经的代码：let hasSuccess = false; 在break时设为true，最后判断hasSuccess
     * - 现在直接用 loopBranchAndRuleSuccess：break时为true，最后判断时仍为true
     * - 原因：break和最后判断之间，只有allowErrorStackPopAndReset()，不会修改两个标识
     * - 因此 hasSuccess 和 loopBranchAndRuleSuccess 在最后判断时总是一致的
     *
     * 关键点2：两个标识的协同工作
     * - ruleMatchSuccess：当前规则是否可以继续执行（全局状态）
     * - loopMatchSuccess：是否应该跳出Or循环（分支成功信号）
     * - loopBranchAndRuleSuccess = ruleMatchSuccess && loopMatchSuccess
     * - 分支成功的条件：两个标识都为true
     *
     * 关键点3：为什么每次尝试前重置 loopMatchSuccess = false？
     * - 清除上一个分支的状态（无论成功还是失败）
     * - 让当前分支"重新开始"（内部规则可以通过设置loopMatchSuccess=true表示成功）
     * - 防止上一个分支的成功状态影响当前分支的判断
     *
     * 关键点4：回退逻辑的区别
     * - 非最后分支失败：setBackDataAndRuleMatchSuccess(backData)
     *   → 回退数据 + 设置 ruleMatchSuccess = true（允许继续尝试下一个分支）
     * - 最后分支失败：setBackDataNoContinueMatch(backData)
     *   → 只回退数据，不修改 ruleMatchSuccess（保持为false，向外传播失败）
     *
     * 示例场景1：第一个分支成功
     * this.Or([
     *   {alt: () => this.A()},  // ✅ 成功
     *   {alt: () => this.B()}
     * ])
     * // A成功 → loopMatchSuccess=true, ruleMatchSuccess=true
     * // 判断 loopBranchAndRuleSuccess = true → break
     * // 最后判断 loopBranchAndRuleSuccess = true → 返回CST
     *
     * 示例场景2：所有分支失败
     * this.Or([
     *   {alt: () => this.A()},  // ❌ 失败
     *   {alt: () => this.B()}   // ❌ 失败
     * ])
     * // A失败 → 回退 → ruleMatchSuccess=true（继续）
     * // B失败（最后） → 回退 → ruleMatchSuccess=false（不改）
     * // 最后判断 loopBranchAndRuleSuccess = false → 返回undefined
     */
    Or(subhutiParserOrs: SubhutiParserOr[]): SubhutiCst {
        if (!this.ruleMatchSuccess) {
            return
        }

        this.setAllowErrorNewState()

        const funLength = subhutiParserOrs.length
        let index = 0

        for (const subhutiParserOr of subhutiParserOrs) {
            index++

            // 最后一个分支失败时报错，其他分支允许错误
            if (index === funLength) {
                this.setAllowError(false)
            }

            const backData = this.backData

            // 关键：每次尝试新分支前重置loopMatchSuccess=false
            // 这样分支内部才能通过设置loopMatchSuccess=true来表示"我成功了"
            this.setLoopMatchSuccess(false)

            subhutiParserOr.alt()  // 尝试执行当前分支

            // 检查分支是否成功（两个标识都为true）
            if (this.loopBranchAndRuleSuccess) {
                // 成功：跳出循环
                // 注意：此时 loopBranchAndRuleSuccess = true
                // 后续只有 allowErrorStackPopAndReset()，不会修改这两个标识
                // 所以最后判断时 loopBranchAndRuleSuccess 仍为 true
                break
            }

            // 失败：回退状态
            if (index !== funLength) {
                // 不是最后一个分支：回退并继续尝试
                // 设置 ruleMatchSuccess = true，允许继续执行
                this.setBackDataAndRuleMatchSuccess(backData)
            } else {
                // 最后一个分支也失败：只回退数据
                // 不修改 ruleMatchSuccess（保持为false），向外传播失败
                this.setBackDataNoContinueMatch(backData)
            }
        }

        this.allowErrorStackPopAndReset()

        // 直接判断 loopBranchAndRuleSuccess（不需要额外的hasSuccess变量）
        // 如果break了，loopBranchAndRuleSuccess=true
        // 如果循环结束，loopMatchSuccess=false（每次都重置），loopBranchAndRuleSuccess=false
        if (this.loopBranchAndRuleSuccess) {
            return this.getCurCst()
        }

        // 所有分支都失败
        return
    }

    /**
     * 检查当前分支是否成功（两个标识的组合判断）
     *
     * 返回值：ruleMatchSuccess && loopMatchSuccess
     *
     * 语义：同时满足两个条件才算"分支成功"
     * - ruleMatchSuccess = true：规则可以继续执行（没有遇到致命错误）
     * - loopMatchSuccess = true：分支匹配成功（需要跳出Or循环）
     *
     * 使用场景：
     * 1. Or规则：判断分支是否成功，决定是break还是继续尝试
     * 2. Many规则：判断是否继续循环（while条件）
     *
     * 为什么需要两个都为true？
     * - 只有ruleMatchSuccess=true：可以执行，但不一定成功（比如Or回退后）
     * - 只有loopMatchSuccess=true：不可能（ruleMatchSuccess=false时规则不执行）
     * - 两个都true：规则执行了，并且成功了
     *
     * 示例：
     * Or尝试分支A失败后回退：
     * - ruleMatchSuccess = true（回退时设置，允许继续）
     * - loopMatchSuccess = false（失败时设置）
     * - loopBranchAndRuleSuccess = false（继续尝试下一个分支）
     */
    get loopBranchAndRuleSuccess() {
        return this.loopMatchSuccess && this.ruleMatchSuccess
    }

    /**
     * 同时设置两个核心标识
     *
     * 语义：将两个标识设为相同的值（都true或都false）
     *
     * 使用场景：consumeToken 匹配token时
     * - value = true：token匹配成功
     *   → ruleMatchSuccess = true（继续执行后续规则）
     *   → loopMatchSuccess = true（通知Or可以跳出了）
     * - value = false：token匹配失败
     *   → ruleMatchSuccess = false（停止执行）
     *   → loopMatchSuccess = false（通知Or尝试下一个分支）
     *
     * 为什么要同时设置？
     * - consumeToken是"原子操作"：要么成功（两个都true），要么失败（两个都false）
     * - 不存在"token匹配了但不算成功"的中间状态
     * - 简化调用方的逻辑（一次调用搞定两个标识）
     */
    setContinueMatchAndNoBreak(value: boolean) {
        this.setRuleMatchSuccess(value)
        this.setLoopMatchSuccess(value)
    }

    /**
     * 回退到快照状态，并设置 ruleMatchSuccess = true（允许继续执行）
     *
     * 语义：撤销刚才的尝试，恢复到尝试前的状态，并允许继续执行
     *
     * 使用场景：
     * 1. Or规则：非最后分支失败，回退后继续尝试下一个分支
     * 2. Many规则：某次循环失败，回退后退出循环（循环前的状态）
     * 3. Option规则：内部规则失败，回退后继续（Option本身不失败）
     *
     * 为什么设置 ruleMatchSuccess = true？
     * - 分支失败时，ruleMatchSuccess 被设为 false
     * - 但Or需要"继续尝试下一个分支"，不能让false阻止执行
     * - 所以回退时重置为true，表示"这次失败不影响继续尝试"
     *
     * 为什么不恢复 loopMatchSuccess？
     * - loopMatchSuccess 由Or规则控制（每次尝试前重置为false）
     * - 不需要恢复，保持当前值即可
     *
     * 回退内容：
     * - tokenIndex：恢复到尝试前的位置
     * - curCst.children：删除这次尝试添加的子节点
     * - curCst.tokens：删除这次尝试添加的token
     */
    setBackDataAndRuleMatchSuccess(backData: SubhutiBackData) {
        this.setRuleMatchSuccess(true)
        this.setBackDataNoContinueMatch(backData)
    }

    /**
     * 回退到快照状态，不修改 ruleMatchSuccess（保持当前值）
     *
     * 语义：只撤销数据，不改变执行状态
     *
     * 使用场景：Or规则最后一个分支失败
     * - 不需要设置 ruleMatchSuccess = true（没有下一个分支了）
     * - 保持 ruleMatchSuccess = false，向外传播失败信号
     *
     * 为什么不修改 ruleMatchSuccess？
     * - 最后一个分支失败，意味着整个Or失败
     * - 需要保持 ruleMatchSuccess = false，让外层规则知道Or失败了
     * - 如果设为true，外层规则会误以为Or成功了
     *
     * 回退内容：
     * - tokenIndex：恢复到尝试前的位置
     * - curCst.children：删除这次尝试添加的子节点
     * - curCst.tokens：删除这次尝试添加的token
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

