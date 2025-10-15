import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import SubhutiCst from "../struct/SubhutiCst.ts"
import JsonUtil from "../utils/JsonUtil.ts"
import {SubhutiCreateToken} from "../struct/SubhutiCreateToken.ts"
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import QqqqUtil from "../utils/qqqqUtil.ts"
import Es5TokenConsumer from "slime-parser/src/language/es5/Es5TokenConsume.ts";

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

export class SubhutiBackData {
  tokens: SubhutiMatchToken[]
  curCstChildren: SubhutiCst[]
  curCstTokens: SubhutiMatchToken[]
}

export class SubhutiUtil{
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0
      var v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    }).replace(/-/g,'_')
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

  faultTolerance = true
  tokenConsumer: T
  _tokens: SubhutiMatchToken[] = []
  initFlag = true
  curCst: SubhutiCst
  cstStack: SubhutiCst[] = []
  private _continueMatch = true
  thisClassName: string
  uuid: string

  //只针对or，特殊，many有可能没匹配就触发true导致不执行下面的，避免这种情况
  //记录是否匹配成功，用来未匹配成功则pop子节点的记录
  private _orBreakFlag = false

  get orBreakFlag(): boolean {
    return this._orBreakFlag
  }

  setOrBreakFlag(flag: boolean) {
    this._orBreakFlag = flag
  }

  get continueMatch() {
    return this._continueMatch
  }

  printOrBreakFlag() {
    QqqqUtil.log("printOrBreakFlag:" + this.orBreakFlag)
  }

  printStateAndBreak() {
    this.printMatchState()
    this.printOrBreakFlag()
  }

  setContinueMatch(flag: boolean) {
    this._continueMatch = flag
  }

//必须两个一个不够用，
  // 一个是判断是否存在错误，就不继续执行了的，
  // 另一个是判断是否跳出循环的，只有匹配成功才跳出循环 , 只用一个的问题就是 or的时候，
  //
  // 一个就够了，最新
  // 如果你进入之后改为了false，里面的匹配就无法执行了，如果你不改代表着true进入，里面应该有给改为false的呀
  //many呢，many这种出去的时候，他又会给改成true了，进入改为true，while，改为false，执行完毕改为如果为false改为ture，等于没执行，只有true才能进入，出去也是true
  //or，ture进入，执行完是true就跳出，执行完是false就重新执行，改为true，肯定有地方会改为false的呀
  //是否继续匹配
  //是否有错误
  // 最新问题，如果一个or里面只有一个many，


  /*  private _continueExec = true

    setContinueExec(value: boolean) {
        this._continueExec = value;
    }

    get continueExec(): boolean {
        return this._continueExec;
    }
*/
  //一个是标识many这种
  //一个是标识token匹配失败了


//many中，无线循环，什么时候终止呢， 执行时有个flag，  执行前改为false，如果 执行成功变为true了则可以再次进去，再次进入后将他改为false

  printCst() {
    JsonUtil.log(this.getCurCst())
  }

  printMatchState() {
    QqqqUtil.log("continueMatch:" + this.continueMatch)
  }

  printTokens() {
    // this.printStateAndBreak()
    // this.printCst()
    QqqqUtil.log('tokens:' + this.tokens.map(item => item.tokenName).join(','))
  }

  printCstStacks() {
    QqqqUtil.log(this.cstStack.map(item => item.name).join(','))
  }


  setCurCst(curCst: SubhutiCst) {
    this.curCst = curCst
  }

  getCurCst() {
    return this.curCst
  }

  ////校验可执行没问题，因为肯定是可执行
  public get tokens() {
    return this._tokens
  }

  setTokens(tokens?: SubhutiMatchToken[]) {
    this._tokens = tokens
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
    this._allowError = allowError
  }

  get checkMethodCanExec() {
    //如果不能匹配，测判断允许错误，则直接返回，无法继续匹配只能返回，避免递归
    return (this.continueMatch)
  }

  public get tokenIsEmpty() {
    //子类重写了
    return !this._tokens || !this._tokens.length
  }

  //首次执行，则初始化语法栈，执行语法，将语法入栈，执行语法，语法执行完毕，语法出栈，加入父语法子节点
  subhutiRule(targetFun: any, ruleName: string, className: string) {
    //确定是本类的方法
    if (this.hasOwnProperty(ruleName)) {
      if (className !== this.thisClassName) {
        return
      }
    }
    const initFlag = this.initFlag
    if (initFlag) {
      this.initFlag = false
      this.allowErrorStack = []
      this.setContinueMatch(true)
      this.cstStack = []
      this.ruleExecErrorStack = []
    } else {
      if (!this.checkMethodCanExec) {
        return
      }
    }
    let cst = this.processCst(ruleName, targetFun)
    if (initFlag) {
      //执行完毕，改为true
      this.initFlag = true
    } else {
      const parentCst = this.cstStack[this.cstStack.length - 1]
      if (cst) {
        //优化cst展示
        if (!cst.children?.length) {
          cst.children = undefined
        }
        if (!cst.tokens?.length) {
          cst.tokens = undefined
        } else {
          // parentCst.tokens.push(...cst.tokens);
        }
        // parentCst.children.push(cst)
      }
      this.setCurCst(parentCst)
    }
    if (cst) {
      return cst
    }
    return
  }

  //记录失败的匹配
  failMatchList: SubhutiCst[] = []

  //执行语法，将语法入栈，执行语法，语法执行完毕，语法出栈
  processCst(ruleName: string, targetFun: Function): SubhutiCst {

    let cst = new SubhutiCst()
    cst.name = ruleName
    // if (this.curCst) {
    //     cst.pathName = this.curCst.pathName + pathNameSymbol + cst.name
    // } else {
    //     cst.pathName = ruleName
    // }
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
    // console.log(ruleName)
    // 规则解析，如果自定义了返回内容，则有返回，则用自定义返回覆盖默认节点
    let res: SubhutiCst = targetFun.apply(this)
    this.cstStack.pop()
    this.ruleExecErrorStack.pop()
    //如果匹配成功，保留子节点，失败删除
    if (this.continueMatch || (this.faultTolerance && this.tokens.length < oldTokensLength)) {
      if (cst.children[0]) {
        if (!cst.children[0].loc) {
          // console.log(cst.children[0])
          return cst
        }
        cst.loc = {
          type: cst.name,
          // index: cst.children[0].loc.index,
          start: cst.children[0].loc.start,
          end: cst.children[cst.children.length - 1].loc.end,
        }
      }
      return cst
    }
    //代表成功触发了一个
    if (parentCst) {
      parentCst.children.pop()
    }
    return
  }

  //匹配1次或者N次
  AT_LEAST_ONE(fun: Function) {
    if (!this.checkMethodCanExec) {
      return
    }
    let index = 0
    while (this.continueMatch) {
      if (index > 0) {
        this.setAllowErrorNewState()
        let backData = JsonUtil.cloneDeep(this.backData)
        fun()
        //必须放这里，会循环push，所以需要循环pop
        this.setAllowErrorLastStateAndPop()
        //If the match fails, the tokens are reset.
        if (!this.continueMatch) {
          this.setBackData(backData)
          break
        } else if (this.continueMatch) {
          //校验可执行没问题，因为肯定是可执行
          if (!this.tokens.length) {
            //如果token执行完毕，则跳出
            break
          }
        }
      } else {
        fun()
        //肯定是continueExec，tokens才会为空
        //校验可执行没问题，因为肯定是可执行
        //只有没token才可能是continueExec=true，如果有token，有可能匹配了，也可能没匹配
        if (!this.tokens.length) {
          if (this.continueMatch) {
            break
          } else if (!this.continueMatch) {
            throw new Error('不可能的情况')
          }
        }
      }
      index++
    }
    //放循环里面了，逻辑更清晰,不放循环里，还需要判断index > 0
    /*if (index > 0) {
        //只有index>0 了才需要重置回去状态，放循环里多余，没必要
        this.setAllowError(!!this.allowErrorStack.length);
    }*/
    return this.getCurCst()
  }

  //匹配0次或者1次
  Option(fun: Function): SubhutiCst {
    if (!this.checkMethodCanExec) {
      return
    }
    let lastBreakFlag = this.orBreakFlag
    this.setAllowErrorNewState()
    let backData = JsonUtil.cloneDeep(this.backData)
    fun()
    //If the match fails, the tokens are reset.
    let thisBackData: SubhutiBackData
    if (!this.continueMatch) {
      if (this.tokens.length < backData.tokens.length) {
        thisBackData = JsonUtil.cloneDeep(this.backData)
      }
      this.setBackData(backData)
    }
    let curFlag = this.orBreakFlag
    if (this.orBreakFlag || lastBreakFlag) {
      this.setOrBreakFlag(true)
    }
    this.setAllowErrorLastStateAndPop()

    // Option语义："0或1次"，失败应该是"0次"，不应该"部分成功"
    // 
    // 【重要】Option是可选项，失败时应该返回"无匹配"（相当于0次）
    // 不应该保留部分成功的CST，因为：
    // 1. 部分成功破坏了Optional的语义（要么完整匹配，要么不匹配）
    // 2. 保留部分CST会导致父规则的children不完整
    // 
    // 修复前的错误逻辑：
    //   if (this.faultTolerance && thisBackData) {
    //     this.setBackDataNoContinueMatch(thisBackData)  ← 错误：保留部分成功
    //     return this.getCurCst()
    //   }
    // 
    // Bug案例：Initializer = Eq + AssignmentExpression
    //   - Eq成功（消费'='）
    //   - AssignmentExpression失败（因为括号表达式不支持）
    //   - 错误逻辑会保留只有'='的Initializer
    //   - 结果：VariableDeclarator的children只有Identifier和Initializer（只有'='）
    // 
    // （容错应该在更高层处理，Option本身必须保证语义正确性）
    if (!curFlag) {
      return
    }
    return this.getCurCst()
  }


  consume(tokenName: SubhutiCreateToken) {
    if (!this.checkMethodCanExec) {
      return
    }
    return this.consumeToken(tokenName.name)
  }

  //消耗token，将token加入父语法
  consumeToken(tokenName: string) {
    let popToken = this.getMatchToken(tokenName)
    //容错代码
    if (!popToken || popToken.tokenName !== tokenName) {
      //因为CheckMethodCanExec 中组织了空token，所以这里不会触发
      //内部consume,也需要把标识设为false，有可能深层子设为了true，但是后来又改为了false，如果不同步改就会没同步
      this.setContinueMatchAndNoBreak(false)
      // this.setContinueFor(false);
      if (this.faultTolerance || (this.allowError && !this.optionAndOrAllowErrorMatchOnce)) {
        return
      }
      this.printTokens()
      if (popToken) {
        throw new Error('syntax error expect：' + popToken.tokenValue)
      } else {
        throw new Error('syntax error expect：' + tokenName)
      }
    }
    this.setContinueMatchAndNoBreak(true)
    this.optionAndOrAllowErrorMatchOnce = true
    //性能优化先不管
    // this.setAllowError(this.allowErrorStack.length > 1)
    //如果成功匹配了一个，则将允许错误状态，改为上一个
    popToken = this.consumeMatchToken(tokenName)
    return this.generateCstByToken(popToken)
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

  getMatchToken(tokenName: string) {
    let popToken = this.tokens[0]
    return popToken
  }

  consumeMatchToken(tokenName?: string) {
    const token = this.tokens.shift()
    return token
  }

  allowErrorStack = []
  ruleExecErrorStack = []

  setAllowErrorLastStateAndPop() {
    this.allowErrorStack.pop()
    this.onlySetAllowErrorLastState()
  }

  onlySetAllowErrorLastState() {
    this.setAllowError(!!this.allowErrorStack.length)
  }


  optionAndOrAllowErrorMatchOnce = true

  setAllowErrorNewState() {
    this.setAllowError(true)
    this.optionAndOrAllowErrorMatchOnce = false
    this.allowErrorStack.push(this.curCst.name)
  }

  /**
   * Or语法：遍历所有规则分支，任一分支匹配成功则跳出
   * 
   * 核心机制：
   * 1. 依次尝试每个分支（alt函数）
   * 2. 任一分支成功 → 跳出循环
   * 3. 所有分支都失败：
   *    - 非容错模式 → 返回失败
   *    - 容错模式 → 选择"消费token最多"的分支（最接近成功）
   * 
   * 容错处理的关键逻辑：
   * - 如果所有Or分支都失败，说明当前tokens无法匹配任何一个规则分支
   * - thisBackAry记录了每个分支的"部分成功"状态
   * - 策略：选择消费token最多的分支（getTokensLengthMin）
   * - 原理：消费token越多，说明越接近正确的语法，保留这个结果继续
   * 
   * 与FaultToleranceMany的区别：
   * - FaultToleranceMany：循环尝试同一个规则（Many语法）
   * - Or：尝试多个不同规则分支（Or语法）
   */
  Or(subhutiParserOrs: SubhutiParserOr[]): SubhutiCst {
    if (!this.checkMethodCanExec) {
      return
    }
    this.setAllowErrorNewState()
    const funLength = subhutiParserOrs.length
    let index = 0

    let lastBreakFlag = this.orBreakFlag

    const thisBackAry: SubhutiBackData[] = []  // 保存每个分支的部分成功状态

    for (const subhutiParserOr of subhutiParserOrs) {
      index++
      // 如果是最后一个分支，失败时报错
      if (index === funLength) {
        this.setAllowError(false)  // 最后一次尝试，不允许错误
      } else {
        this.setAllowError(true)   // 允许错误，继续尝试下一个分支
      }
      let backData = JsonUtil.cloneDeep(this.backData)  // 保存当前状态

      // 考虑到执行空元素的情况，如果执行了空元素，应该是跳出的
      this.setOrBreakFlag(false)
      subhutiParserOr.alt()  // 尝试执行当前分支
      
      // 如果匹配成功，跳出循环
      if (this.continueForAndNoBreak) {
        // Or语法只要有一个分支成功就必须break，无论还有没有tokens
        // 
        // 【重要】不再在成功分支检查失败分支的"部分成功"
        // 之前的容错逻辑会导致：成功分支被失败分支的"部分匹配"覆盖
        // Bug案例：var x = (1 < 2) || false
        //   - ArrowFunction失败（只消费了'('）
        //   - ConditionalExpression成功（完整匹配）
        //   - 错误逻辑会选择ArrowFunction的部分成功，导致语义错误
        break
      } else if (!this.continueForAndNoBreak) {
        // 当前分支失败
        if (this.tokens.length < backData.tokens.length) {
          // 有部分token被消费（部分匹配成功）
          const thisBackData = JsonUtil.cloneDeep(this.backData)
          thisBackAry.push(thisBackData)  // 记录这个"部分成功"的状态
        }
        
        // 匹配失败的处理
        if (index !== funLength) {
          // 不是最后一个分支：重置状态，尝试下一个分支
          this.setBackData(backData)
        } else {
          // 最后一个分支也失败了：所有分支都失败
          this.setBackDataNoContinueMatch(backData)
        }
      }
    }
    
    let curFlag = this.orBreakFlag
    
    // 必须放这里，不能放在其他位置（会导致重复执行或不执行）
    this.setAllowErrorLastStateAndPop()
    
    if (curFlag) {
      // 有分支成功
      return this.getCurCst()
    }
    
    // 所有分支都失败：完全回溯，不选择部分成功
    // 
    // 【重要】Or语义是"选择一个成功的分支"，所有分支都失败时应该返回失败
    // 不应该选择"部分成功"的分支，因为：
    // 1. 部分成功不是真正的成功，保留它会破坏语法语义
    // 2. 容错应该在更高层（如FaultToleranceMany）处理，而非Or层
    // 3. Or的职责是"语法分支选择"，不是"错误恢复"
    // 
    // 修复前的错误逻辑：
    //   thisBackAry记录所有失败分支的"部分成功"
    //   选择消费token最多的，当作Or的结果 ← 这是错的！
    // 
    // Bug案例：ArrowParameters ( LParen + FormalParameterList + RParen )
    //   - 分支1: BindingIdentifier → 失败
    //   - 分支2: LParen + Option(FormalParameterList) + RParen
    //     * LParen成功，Option失败，RParen失败
    //     * 错误逻辑会保留只有LParen的"部分成功"
    //   - 结果：ArrowParameters只包含'('，破坏了语法语义
    return
  }

  //查找消费最多，剩余最少的
  getTokensLengthMin(thisBackAry: SubhutiBackData[]) {
    const res = thisBackAry.sort((a, b) => {
      return a.tokens.length - b.tokens.length
    })[0]
    return res
  }

  get continueForAndNoBreak() {
    return this.orBreakFlag && this.continueMatch
  }

  setContinueMatchAndNoBreak(value: boolean) {
    //一个控制是否继续匹配
    //一个控制是否跳出循环，while，or
    this.setContinueMatch(value)
    this.setOrBreakFlag(value)
    //为什么需要两个，因为or进入时会把跳出标识设为false，为ture跳出，否则继续下一次
    //如果用一个标识，设为false，之后匹配就不执行了
  }

  // backData: any

  setBackData(backData: SubhutiBackData) {
    this.setContinueMatch(true)
    this.setBackDataNoContinueMatch(backData)
  }

  setBackDataNoContinueMatch(backData: SubhutiBackData) {
    this.setTokensAndParentChildren(backData.tokens, backData.curCstTokens, backData.curCstChildren)
  }

  public get backData() {
    const backData: SubhutiBackData = {
      tokens: this.tokens,
      curCstChildren: this.curCst.children,
      curCstTokens: this.curCst.tokens,
    }
    return backData
  }

  private setTokensAndParentChildren(tokensBackup: SubhutiMatchToken[], parentTokensBackup: SubhutiMatchToken[], parentChildrenBack: SubhutiCst[]) {
    this.setTokens(tokensBackup)
    this.reSetParentChildren(parentTokensBackup, parentChildrenBack)
  }


  /**
   * 容错版的Many循环
   * 
   * 核心机制：
   * 1. 循环尝试执行fun()，直到匹配失败或没有更多tokens
   * 2. 如果匹配失败，根据容错策略处理：
   *    - 有部分成功（thisBackData存在）→ 保留部分结果
   *    - 完全失败 → 跳过当前token，继续尝试剩余tokens
   * 
   * 容错处理的关键逻辑：
   * - 当所有规则分支都匹配失败时，说明当前第一个token无法匹配任何规则
   * - 这证明当前token是"非法语句的开始"或"错误的token"
   * - 策略：跳过这个token（consumeMatchToken），从下一个token重新尝试
   * - 这样可以在遇到局部语法错误时继续解析剩余代码，而不是整体失败
   */
  FaultToleranceMany(fun: Function) {
    if (!this.checkMethodCanExec) {
      return
    }
    // 不需要在循环内部修改allowError，因为如果子节点改了，退出子节点时也会重置回来的
    this.setAllowErrorNewState()

    let lastBreakFlag = this.orBreakFlag

    let backData = JsonUtil.cloneDeep(this.backData)

    let matchCount = 0

    this.setContinueMatchAndNoBreak(true)
    // 循环条件：继续匹配 或 (容错模式 且 还有tokens)
    while (this.continueForAndNoBreak || (this.faultTolerance && this.tokens.length)) {
      const continueState = this.continueForAndNoBreak
      this.setOrBreakFlag(false)
      backData = JsonUtil.cloneDeep(this.backData)  // 保存当前状态
      fun()  // 尝试执行匹配规则
      
      // 如果匹配失败，tokens会被重置
      if (!this.continueForAndNoBreak) {
        let thisBackData
        // 判断：是否有部分token被消费（部分匹配成功）
        if (this.tokens.length < backData.tokens.length) {
          thisBackData = JsonUtil.cloneDeep(this.backData)  // 保存部分成功的状态
        }
        this.setBackData(backData)  // 先回退到尝试前的状态
        
        if (this.faultTolerance) {
          if (thisBackData) {
            // 情况1：有部分匹配成功
            // 说明：某个规则分支匹配了部分token（如 var a = 1 缺分号）
            // 策略：保留部分结果，继续解析剩余tokens
            // 【ASI扩展点】这里可以尝试插入分号后重新解析
            this.setBackDataNoContinueMatch(thisBackData)
          } else if (!continueState) {
            // 情况2：完全失败，且是首次尝试
            // 说明：当前第一个token匹配所有规则分支都失败
            // 原因：这个token是"非法语句的开始"或"错误的token"
            // 策略：跳过当前token，从下一个token重新开始尝试
            // 【ASI扩展点】这里也可以尝试插入分号后重新解析
            this.consumeMatchToken()
          }
          continue  // 继续循环，尝试剩余tokens
        } else {
          // 非容错模式：直接退出
          break
        }
        // 注：如果匹配失败则跳出循环
        // orBreakFlag为false则continueMatch也肯定为false，肯定会触发这里的逻辑
      }
      matchCount++  // 成功匹配计数
    }
    
    if (matchCount || this.orBreakFlag || lastBreakFlag) {
      this.setOrBreakFlag(true)
    }
    // 必须放这里，不能放循环里会重复pop
    // many允许多次执行，如果放循环内，第一次执行后有tokens就会触发，会有问题
    this.setAllowErrorLastStateAndPop()
    if (!matchCount) {
      return
    }
    return this.getCurCst()
  }

  Many(fun: Function) {
    if (!this.checkMethodCanExec) {
      return
    }
    //不需要 再循环内部修改，因为如果子节点改了，退出子节点时也会重置回来的
    this.setAllowErrorNewState()

    let lastBreakFlag = this.orBreakFlag

    let backData = JsonUtil.cloneDeep(this.backData)

    let matchCount = 0

    this.setContinueMatchAndNoBreak(true)
    while (this.continueForAndNoBreak) {
      this.setOrBreakFlag(false)
      backData = JsonUtil.cloneDeep(this.backData)
      fun()
      //If the match fails, the tokens are reset.
      if (!this.continueForAndNoBreak) {
        let thisBackData
        if (this.tokens.length < backData.tokens.length) {
          thisBackData = JsonUtil.cloneDeep(this.backData)
        }
        this.setBackData(backData)
        if (this.faultTolerance) {
          if (thisBackData) {
            this.setBackDataNoContinueMatch(thisBackData)
          }
          continue
        } else {
          break
        }
        //如果匹配失败则跳出
        //如果跳出，则重置
        //orBreakFlag 为false则 continueMatch 也肯定为false，肯定会触发这里
      }
      matchCount++
    }
    if (matchCount || this.orBreakFlag || lastBreakFlag) {
      this.setOrBreakFlag(true)
    }
    //只能放这里，放循环里会重复pop，，many允许多次 if (this.continueExec)，第一次执行后有tokens，就会触发了，会有问题
    this.setAllowErrorLastStateAndPop()
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
