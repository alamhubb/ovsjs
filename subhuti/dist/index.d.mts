import { Position, SourceLocation } from "estree";

//#region src/struct/SubhutiMatchToken.d.ts
declare class SubhutiMatchToken {
  tokenName: string;
  tokenValue: string;
  rowNum?: number;
  columnStartNum?: number;
  columnEndNum?: number;
  index?: number;
  hasLineBreakBefore?: boolean;
  constructor(osvToken: SubhutiMatchToken);
}
declare function createMatchToken(osvToken: SubhutiMatchToken): SubhutiMatchToken;
//#endregion
//#region src/SubhutiTokenLookahead.d.ts

declare class SubhutiTokenLookahead {
  /**
   * 核心状态：当前规则是否成功
   * - true: 成功，继续执行
   * - false: 失败，停止并返回 undefined
   */
  protected _parseSuccess: boolean;
  get parserFail(): boolean;
  /**
   * 标记解析失败（用于手动失败）
   *
   * 用于自定义验证逻辑中标记解析失败
   *
   * @returns never (实际返回 undefined，但类型声明为 never 以便链式调用)
   */
  protected setParseFail(): never;
  /**
   * 获取当前 token（由子类实现）
   */
  get curToken(): SubhutiMatchToken | undefined;
  /**
   * 前瞻：获取未来的 token（不消费）
   * 由子类 SubhutiParser 覆盖实现
   *
   * @param offset 偏移量（1 = 当前 token，2 = 下一个...）
   * @returns token 或 undefined（EOF）
   */
  protected peek(offset?: number): SubhutiMatchToken | undefined;
  /**
   * LA (LookAhead) - 前瞻获取 token（不消费）
   *
   * 这是 parser 领域的标准术语：
   * - LA(1) = 当前 token
   * - LA(2) = 下一个 token
   * - LA(n) = 第 n 个 token
   *
   * @param offset 偏移量（1 = 当前 token，2 = 下一个...）
   * @returns token 或 undefined（EOF）
   */
  protected LA(offset?: number): SubhutiMatchToken | undefined;
  /**
   * 前瞻：获取连续的 N 个 token
   *
   * @param count 要获取的 token 数量
   * @returns token 数组（长度可能小于 count，如果遇到 EOF）
   */
  private peekSequence;
  /**
   * [lookahead = token]
   * 规范：正向前瞻，检查下一个 token 是否匹配
   */
  private lookahead;
  /**
   * [lookahead ≠ token]
   * 规范：否定前瞻，检查下一个 token 是否不匹配
   */
  private lookaheadNot;
  /**
   * [lookahead ∈ {t1, t2, ...}]
   * 规范：正向集合前瞻，检查下一个 token 是否在集合中
   */
  private lookaheadIn;
  /**
   * [lookahead ∉ {t1, t2, ...}]
   * 规范：否定集合前瞻，检查下一个 token 是否不在集合中
   */
  private lookaheadNotIn;
  /**
   * [lookahead = t1 t2 ...]
   * 规范：序列前瞻，检查连续的 token 序列是否匹配
   */
  private lookaheadSequence;
  /**
   * [lookahead ≠ t1 t2 ...]
   * 规范：否定序列前瞻，检查连续的 token 序列是否不匹配
   */
  private lookaheadNotSequence;
  /**
   * 检查：token 序列匹配且中间无换行符
   *
   * @param tokenNames token 名称序列
   * @returns true = 序列匹配且中间都在同一行
   *
   * @example
   * // async [no LineTerminator here] function
   * if (this.lookaheadSequenceNoLT(['AsyncTok', 'FunctionTok'])) { ... }
   */
  protected lookaheadSequenceNoLT(tokenNames: string[]): boolean;
  /**
   * [no LineTerminator here]
   * 检查当前 token 前是否有换行符
   */
  private lookaheadHasLineBreak;
  /**
   * 断言：当前 token 必须是指定类型
   * 如果不是，则标记失败
   *
   * @param tokenName - 必须的 token 类型
   * @param offset - 偏移量（默认 1）
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead = =]
   * this.assertLookahead('Assign')
   */
  protected assertLookahead(tokenName: string, offset?: number): boolean;
  /**
   * 断言：当前 token 不能是指定类型
   * 如果是，则标记失败
   *
   * @param tokenName - 不允许的 token 类型
   * @param offset - 偏移量（默认 1）
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead ≠ else]
   * this.assertLookaheadNot('ElseTok')
   */
  protected assertLookaheadNot(tokenName: string, offset?: number): boolean;
  /**
   * 断言：当前 token 必须在指定集合中
   * 如果不在，则标记失败
   *
   * @param tokenNames - 允许的 token 类型列表
   * @param offset - 偏移量（默认 1）
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead ∈ {8, 9}]
   * this.assertLookaheadIn(['DecimalDigit8', 'DecimalDigit9'])
   */
  protected assertLookaheadIn(tokenNames: string[], offset?: number): boolean;
  /**
   * 断言：当前 token 不能在指定集合中
   * 如果在，则标记失败
   *
   * @param tokenNames - 不允许的 token 类型列表
   * @param offset - 偏移量（默认 1）
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead ∉ {{, function, class}]
   * this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
   */
  protected assertLookaheadNotIn(tokenNames: string[], offset?: number): boolean;
  /**
   * 断言：必须是指定的 token 序列
   * 如果不匹配，则标记失败
   *
   * @param tokenNames - token 序列
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead = async function]
   * this.assertLookaheadSequence(['AsyncTok', 'FunctionTok'])
   */
  protected assertLookaheadSequence(tokenNames: string[]): boolean;
  /**
   * 断言：不能是指定的 token 序列
   * 如果匹配，则标记失败
   *
   * @param tokenNames - token 序列
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead ≠ let []
   * this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
   */
  protected assertLookaheadNotSequence(tokenNames: string[]): boolean;
  /**
   * 断言：不能是指定的 token 序列（考虑换行符约束）
   * 如果序列匹配且中间没有换行符，则标记失败
   *
   * @param tokenNames - token 序列
   * @returns 断言是否成功
   *
   * @example
   * // [lookahead ≠ async [no LineTerminator here] function]
   * this.assertLookaheadNotSequenceNoLT(['AsyncTok', 'FunctionTok'])
   */
  protected assertLookaheadNotSequenceNoLT(tokenNames: string[]): boolean;
  /**
   * 断言：当前 token 前不能有换行符
   * 如果有，则标记失败
   *
   * @returns 断言是否成功
   *
   * @example
   * // [no LineTerminator here]
   * this.assertNoLineBreak()
   */
  protected assertNoLineBreak(): boolean;
  /**
   * 断言：条件必须为真
   * 如果条件为假，则标记失败
   *
   * @param condition - 要检查的条件
   * @returns 断言是否成功（即条件本身）
   *
   * @example
   * // 断言：标识符不能是保留字
   * const cst = this.tokenConsumer.Identifier()
   * this.assertCondition(!(cst && ReservedWords.has(cst.value!)))
   */
  protected assertCondition(condition: boolean): boolean;
  /**
   * 检查当前 token 是否匹配指定类型
   * 对应 Babel 的 match 方法
   * @param tokenName token 类型名称
   */
  protected match(tokenName: string): boolean;
}
//#endregion
//#region src/struct/SubhutiCst.d.ts
interface SubhutiSourceLocation extends SourceLocation {
  value?: string;
  newLine?: boolean;
  type?: string;
  start: SubhutiPosition;
  end: SubhutiPosition;
  filename?: string;
  identifierName?: string | undefined | null;
}
interface SubhutiPosition extends Position {
  index: number;
}
declare class SubhutiCst {
  name: string;
  children?: SubhutiCst[];
  loc: SubhutiSourceLocation;
  value?: string;
  constructor(cst?: SubhutiCst);
  /**
   * 获取指定名称的第 N 个子节点
   *
   * @param name 子节点名称
   * @param index 索引（默认 0，即第一个）
   * @returns 匹配的子节点，如果不存在返回 undefined
   *
   * 用法：
   * ```typescript
   * const leftOperand = cst.getChild('Expression', 0)
   * const rightOperand = cst.getChild('Expression', 1)
   * ```
   */
  getChild(name: string, index?: number): SubhutiCst | undefined;
  /**
   * 获取所有指定名称的子节点
   *
   * @param name 子节点名称
   * @returns 匹配的子节点数组
   *
   * 用法：
   * ```typescript
   * const allStatements = cst.getChildren('Statement')
   * ```
   */
  getChildren(name: string): SubhutiCst[];
  /**
   * 获取指定名称的 token 节点
   *
   * @param tokenName Token 名称
   * @returns 匹配的 token 节点，如果不存在返回 undefined
   *
   * 用法：
   * ```typescript
   * const identifier = cst.getToken('Identifier')
   * console.log(identifier?.value)
   * ```
   */
  getToken(tokenName: string): SubhutiCst | undefined;
  /**
   * 检查是否有指定名称的子节点
   *
   * @param name 子节点名称
   * @returns 如果存在返回 true，否则返回 false
   *
   * 用法：
   * ```typescript
   * if (cst.hasChild('ElseClause')) {
   *   // 处理 else 分支
   * }
   * ```
   */
  hasChild(name: string): boolean;
  /**
   * 获取子节点数量
   */
  get childCount(): number;
  /**
   * 是否为叶子节点（token 节点）
   */
  get isToken(): boolean;
  /**
   * 是否为空节点（无子节点）
   */
  get isEmpty(): boolean;
}
//#endregion
//#region src/struct/SubhutiCreateToken.d.ts
/**
 * 词法前瞻配置
 */
interface SubhutiTokenLookahead$1 {
  is?: RegExp | string;
  not?: RegExp | string;
  in?: (RegExp | string)[];
  notIn?: (RegExp | string)[];
}
/**
 * 上下文约束配置
 * 用于处理词法歧义（如正则表达式 vs 除法）
 */
interface SubhutiTokenContextConstraint {
  onlyAfter?: Set<string>;
  notAfter?: Set<string>;
  onlyAtStart?: boolean;
  onlyAtLineStart?: boolean;
}
/**
 * SubhutiCreateToken 构造函数参数类型
 */
interface SubhutiCreateTokenOptions {
  name: string;
  type?: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  skip?: boolean;
  value?: string;
  categories?: any;
  lookaheadAfter?: SubhutiTokenLookahead$1;
  contextConstraint?: SubhutiTokenContextConstraint;
}
declare class SubhutiCreateToken {
  name: string;
  type: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  skip?: boolean;
  value?: string;
  categories?: any;
  lookaheadAfter?: SubhutiTokenLookahead$1;
  contextConstraint?: SubhutiTokenContextConstraint;
  constructor(ovsToken: SubhutiCreateTokenOptions);
}
declare const emptyValue = "Error:CannotUseValue";
//#endregion
//#region src/SubhutiLexer.d.ts
/**
 * 正则表达式字面量的 pattern（用于 Parser 层的 rescan）
 * 根据 ECMAScript 规范，RegularExpressionFirstChar 不能是 * (避免与 /* 注释冲突)
 */
declare const REGEXP_LITERAL_PATTERN: RegExp;
/**
 * 尝试匹配正则表达式字面量
 * 用于 Parser 层在需要时重新扫描 Slash 为 RegularExpressionLiteral
 *
 * @param text 要匹配的文本（应以 / 开头）
 * @returns 匹配的正则表达式字面量字符串，或 null
 */
declare function matchRegExpLiteral(text: string): string | null;
/**
 * 词法目标（对应 ECMAScript 规范的 InputElement）
 */
declare enum LexicalGoal {
  /** InputElementDiv - 期望除法运算符 */
  InputElementDiv = "InputElementDiv",
  /** InputElementRegExp - 期望正则表达式 */
  InputElementRegExp = "InputElementRegExp",
  /** InputElementTemplateTail - 期望模板尾部（} 开头的模板部分） */
  InputElementTemplateTail = "InputElementTemplateTail",
}
/**
 * Token 缓存条目
 * 存储解析出的 token 及其后续位置信息
 */
interface TokenCacheEntry {
  /** 解析出的 token */
  token: SubhutiMatchToken;
  /** token 结束后的下一个位置（跳过空白后） */
  nextCodeIndex: number;
  /** 下一个位置的行号 */
  nextLine: number;
  /** 下一个位置的列号 */
  nextColumn: number;
  /** 上一个 token 的名称（用于上下文约束检查） */
  lastTokenName: string | null;
}
declare const SubhutiLexerTokenNames: {
  TemplateHead: string;
  TemplateMiddle: string;
  TemplateTail: string;
};
/**
 * Subhuti Lexer - 词法分析器
 *
 * 核心特性：
 * - 预编译正则（构造时一次性处理）
 * - 词法层 lookahead（OptionalChaining 等）
 * - 模板字符串状态管理（InputElement 切换）
 *
 * @version 1.0.0
 */
declare class SubhutiLexer {
  private readonly _allTokens;
  private readonly _tokensOutsideTemplate;
  private _templateDepth;
  private _lastRowNum;
  constructor(tokens: SubhutiCreateToken[]);
  /**
   * 词法分析主入口
   * @param code 源代码
   * @returns Token 流
   */
  tokenize(code: string): SubhutiMatchToken[];
  private _matchToken;
  private _createMatchToken;
  /**
   * 根据模板深度返回活跃的 tokens
   * 实现 ECMAScript 规范的 InputElement 切换机制
   *
   * 使用预编译策略：构造时过滤一次，运行时只选择数组（性能优化）
   */
  private _getActiveTokens;
  /**
   * 更新模板字符串嵌套深度
   *
   * 实现 ECMAScript 规范的 InputElement 切换机制：
   * - TemplateHead (`${`) 进入模板上下文（深度 +1）
   * - TemplateTail (}`) 退出模板上下文（深度 -1）
   * - TemplateMiddle: 保持深度不变
   *
   * 参考实现：Babel、Acorn、TypeScript Scanner
   * 行业标准做法：直接硬编码 token 名称，无需配置
   */
  private _updateTemplateDepth;
  /**
   * 尝试匹配模板 token (TemplateMiddle 或 TemplateTail)
   * 仅在 InputElementTemplateTail 模式下使用
   */
  private _matchTemplateToken;
  /**
   * 创建初始词法状态
   */
  createInitialState(): LexerState;
  /**
   * 按需读取下一个 token
   *
   * @param code 源代码
   * @param state 当前词法状态（会被修改）
   * @param lexicalGoal 词法目标（InputElementDiv 或 InputElementRegExp）
   * @returns token 或 null（EOF）
   */
  readNextToken(code: string, state: LexerState, lexicalGoal?: LexicalGoal): SubhutiMatchToken | null;
  /**
   * 检查是否到达文件末尾
   */
  isEOF(code: string, state: LexerState): boolean;
  /**
   * 带词法目标的 token 匹配
   */
  private _matchTokenWithGoal;
  /**
   * 在指定位置用指定模式读取单个 token
   *
   * @param code 源代码
   * @param codeIndex 起始位置
   * @param line 起始行号
   * @param column 起始列号
   * @param goal 词法目标
   * @param lastTokenName 上一个 token 的名称（用于上下文约束）
   * @param templateDepth 模板字符串深度
   * @returns TokenCacheEntry 或 null（EOF）
   */
  readTokenAt(code: string, codeIndex: number, line: number, column: number, goal: LexicalGoal, lastTokenName?: string | null, templateDepth?: number): TokenCacheEntry | null;
  /**
   * 创建 token（带 lastRowNum 参数）
   */
  private _createMatchTokenWithLastRow;
}
//#endregion
//#region src/SubhutiTokenConsumer.d.ts
declare class SubhutiTokenConsumer {
  /**
   * Parser 实例
   */
  protected readonly parser: SubhutiParser;
  constructor(parser: SubhutiParser);
  /**
   * 消费一个 token（修改 Parser 状态）
   * @param tokenName token 名称（来自 TokenNames）
   * @param goal 可选的词法目标（用于模板尾部等场景）
   */
  protected consume(tokenName: string, goal?: LexicalGoal): SubhutiCst | undefined;
}
//#endregion
//#region src/SubhutiParser.d.ts
type RuleFunction = () => SubhutiCst | undefined;
interface SubhutiParserOr {
  alt: RuleFunction;
}
interface SubhutiBackData {
  /** 源码位置 */
  codeIndex: number;
  /** 行号 */
  codeLine: number;
  /** 列号 */
  codeColumn: number;
  /** 上一个 token 名称 */
  lastTokenName: string | null;
  /** CST children 长度 */
  curCstChildrenLength: number;
  /** 已解析 token 数量（用于恢复 parsedTokens） */
  parsedTokensLength: number;
}
/**
 * 部分匹配记录（用于容错模式）
 * 在回溯时记录已消费 token 的 CST 结构
 */
interface PartialMatchRecord {
  children: SubhutiCst[];
  parentCst: SubhutiCst;
  endTokenIndex: number;
  startTokenIndex: number;
}
/**
 * 解析记录树节点（用于容错模式）
 * 只增不删，记录所有解析尝试路径
 */
interface ParseRecordNode {
  name: string;
  children: ParseRecordNode[];
  startTokenIndex: number;
  endTokenIndex: number;
  token?: SubhutiMatchToken;
  value?: string;
}
type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> = new (parser: SubhutiParser) => T;
/**
 * Parser 构造选项
 */
interface SubhutiParserOptions<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {
  /** TokenConsumer 类（可选） */
  tokenConsumer?: SubhutiTokenConsumerConstructor<T>;
  /** Token 定义（用于按需词法分析模式） */
  tokenDefinitions?: SubhutiCreateToken[];
}
declare class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> extends SubhutiTokenLookahead {
  readonly tokenConsumer: T;
  private readonly cstStack;
  private readonly className;
  /** 词法分析器 */
  protected _lexer: SubhutiLexer | null;
  /** 源代码 */
  protected _sourceCode: string;
  /** 当前源码位置 */
  protected _codeIndex: number;
  /** 当前行号 */
  protected _codeLine: number;
  /** 当前列号 */
  protected _codeColumn: number;
  /** 上一个 token 名称（用于上下文约束） */
  protected _lastTokenName: string | null;
  /** 模板字符串深度 */
  protected _templateDepth: number;
  /** 默认词法目标 */
  protected _defaultGoal: LexicalGoal;
  /** Token 缓存：位置 → 模式 → 缓存条目 */
  protected _tokenCache: Map<number, Map<LexicalGoal, TokenCacheEntry>>;
  /** 已解析的 token 列表（用于输出给使用者） */
  protected _parsedTokens: SubhutiMatchToken[];
  /**
   * 分析模式标志
   * - true: 分析模式（用于语法验证，不抛异常）
   * - false: 正常模式（用于解析，抛异常）
   */
  private _analysisMode;
  /**
   * 容错模式标志
   * - true: 启用容错（解析失败时跳过 token 继续解析）
   * - false: 不启用容错（解析失败时停止）
   */
  private _errorRecoveryMode;
  /**
   * 同步点 Token 名称集合
   * 这些 token 通常是语句的开始，用于容错模式下的恢复点
   */
  protected _syncTokens: Set<string>;
  /**
   * 设置同步点 Token
   */
  setSyncTokens(tokens: string[]): this;
  /**
   * 添加同步点 Token
   */
  addSyncTokens(tokens: string[]): this;
  /**
   * 启用容错模式
   */
  enableErrorRecovery(): this;
  /**
   * 获取容错模式状态
   */
  get errorRecoveryMode(): boolean;
  getRuleStack(): string[];
  private _debugger?;
  private readonly _errorHandler;
  /**
   * 循环检测集合：O(1) 检测 (rule, position) 是否重复
   * 格式: "ruleName:position"
   */
  private readonly loopDetectionSet;
  enableMemoization: boolean;
  private readonly _cache;
  /**
   * 部分匹配候选列表（容错模式专用）
   * 记录在回溯时被删除但消费了 token 的 CST 片段
   */
  private _partialMatchCandidates;
  /**
   * 未被解析的 tokens 列表（容错模式专用）
   * 用于最终判断解析是否完全成功
   */
  private _unparsedTokens;
  /** 解析记录树根节点 */
  private _parseRecordRoot;
  /** 解析记录树节点栈（跟踪当前路径） */
  private _parseRecordStack;
  /**
   * 获取未被解析的 tokens 列表
   */
  get unparsedTokens(): SubhutiMatchToken[];
  /**
   * 是否有未被解析的 tokens
   */
  get hasUnparsedTokens(): boolean;
  /**
   * 构造函数 - 按需词法分析模式
   *
   * @param sourceCode 源代码
   * @param options 配置选项
   */
  constructor(sourceCode?: string, options?: SubhutiParserOptions<T>);
  /**
   * 获取已解析的 token 列表
   */
  get parsedTokens(): SubhutiMatchToken[];
  /**
   * 获取最后解析的 token 索引
   * @returns token 索引，如果没有已解析的 token 则返回 -1
   */
  get lastTokenIndex(): number;
  /**
   * 获取当前正在处理的 token 索引（下一个将被 consume 的 token）
   * @returns 当前 token 索引
   */
  get currentTokenIndex(): number;
  /**
   * 获取或解析指定位置和模式的 token
   *
   * @param codeIndex 源码位置
   * @param line 行号
   * @param column 列号
   * @param goal 词法目标
   * @returns TokenCacheEntry 或 null（EOF）
   */
  protected _getOrParseToken(codeIndex: number, line: number, column: number, goal: LexicalGoal): TokenCacheEntry | null;
  /**
   * LA (LookAhead) - 前瞻获取 token（支持模式数组）
   *
   * @param offset 偏移量（1 = 当前 token，2 = 下一个...）
   * @param goals 每个位置的词法目标（可选，不传用默认值）
   * @returns token 或 undefined（EOF）
   */
  protected LA(offset?: number, goals?: LexicalGoal[]): SubhutiMatchToken | undefined;
  /**
   * peek - 前瞻获取 token（支持模式数组）
   */
  protected peek(offset?: number, goals?: LexicalGoal[]): SubhutiMatchToken | undefined;
  /**
   * 获取当前 token（使用默认词法目标）
   */
  get curToken(): SubhutiMatchToken | undefined;
  /**
   * 供 TokenConsumer 使用的 consume 方法
   * @param tokenName token 名称
   * @param goal 可选的词法目标（用于模板尾部等场景）
   */
  _consumeToken(tokenName: string, goal?: LexicalGoal): SubhutiCst | undefined;
  /**
   * 供 TokenConsumer 使用的标记解析失败方法
   * 用于软关键字检查失败时标记解析失败
   */
  _markParseFail(): void;
  get curCst(): SubhutiCst | undefined;
  cache(enable?: boolean): this;
  /**
   * 启用调试模式
   * @param showRulePath - 是否显示规则执行路径（默认 true）
   *                       传入 false 时只显示性能统计和 CST 验证报告
   */
  debug(showRulePath?: boolean): this;
  errorHandler(enable?: boolean): this;
  /**
   * 启用分析模式（用于语法验证，不抛异常）
   *
   * 在分析模式下：
   * - 不抛出左递归异常
   * - 不抛出无限循环异常
   * - 不抛出 Token 消费失败异常
   * - 不抛出 EOF 检测异常
   *
   * @internal 仅供 SubhutiRuleCollector 使用
   */
  enableAnalysisMode(): void;
  /**
   * 禁用分析模式（恢复正常模式）
   *
   * @internal 仅供 SubhutiRuleCollector 使用
   */
  disableAnalysisMode(): void;
  /**
   * 启用语法验证（链式调用），验证语法（检测 Or 规则冲突）
   *
   * 用法：
   * ```typescript
   * const parser = new Es2025Parser(tokens).validate()
   * const cst = parser.Script()
   * ```
   *
   * @returns this - 支持链式调用
   * @throws SubhutiGrammarValidationError - 语法有冲突时抛出
   */
  validate(): this;
  /**
   * 检测是否是直接或间接左递归
   *
   * ✅ 这个方法可以准确判断左递归
   * ❌ 不能判断是否是 Or 分支遮蔽（返回 false 只表示不是左递归）
   *
   * @param ruleName 当前规则名称
   * @param ruleStack 规则调用栈
   * @returns true: 确定是左递归, false: 不是左递归（但不能确定是什么问题）
   */
  private isDirectLeftRecursion;
  /**
   * 抛出循环错误信息
   *
   * @param ruleName 当前规则名称
   */
  private throwLoopError;
  /**
   * 规则执行入口（由 @SubhutiRule 装饰器调用）
   * 职责：前置检查 → 循环检测 → Packrat 缓存 → 核心执行 → 后置处理
   */
  private executeRuleWrapper;
  private initTopLevelData;
  private checkRuleIsThisClass;
  private onRuleExitDebugHandler;
  /**
   * 执行规则函数核心逻辑
   * 职责：创建 CST → 执行规则 → 成功则添加到父节点
   */
  private executeRuleCore;
  private setLocation;
  /**
   * Or 规则 - 顺序选择（PEG 风格）
   *
   * 核心逻辑：
   * - 依次尝试每个分支，第一个成功的分支生效
   * - 所有分支都失败则整体失败
   *
   * 优化：只有消费了 token 才需要回溯（没消费 = 状态没变）
   */
  Or(alternatives: SubhutiParserOr[]): void;
  /**
   * Many 规则 - 0次或多次（EBNF { ... }）
   *
   * 循环执行直到失败或没消费 token
   */
  Many(fn: RuleFunction): void;
  /**
   * 带容错的 Many 规则（使用解析记录树）
   * - 当全局 errorRecoveryMode 开启时，解析失败会尝试恢复并继续
   * - 使用解析记录树记录所有解析尝试，只增不删
   * - 失败时从解析记录树提取最优路径恢复 CST
   * @param fn 要执行的规则函数
   */
  ManyWithRecovery(fn: RuleFunction): void;
  /**
   * 从解析记录树恢复 CST
   * 找到 endTokenIndex <= maxIndex 的最深路径，转换为 CST
   */
  private recoverFromParseRecord;
  /**
   * 将解析记录树子节点转换为 CST 子节点
   *
   * 选择策略：
   * 1. 按 startTokenIndex 分组（同一位置开始的是 Or 的不同分支）
   * 2. 对于每组，选择 endTokenIndex <= maxIndex 且最大的
   * 3. 如果有多个相同深度的，选择最后一个
   */
  private parseRecordChildrenToCST;
  /**
   * 将单个解析记录节点转换为 CST 节点
   */
  private parseRecordNodeToCST;
  /**
   * 获取解析记录树中 <= maxIndex 的最大 endTokenIndex
   */
  private getParseRecordMaxEndIndex;
  /**
   * 找到下一个同步点（语句开始 token）
   * @param fromIndex 从哪个源码位置开始查找
   * @returns 同步点的源码位置，如果没找到返回源码末尾
   */
  protected findNextSyncPoint(fromIndex: number): number;
  /**
   * 创建 ErrorNode，包含指定范围内的 token
   * @param startIndex 起始源码位置（包含）
   * @param endIndex 结束源码位置（不包含）
   * @returns ErrorNode CST 节点
   */
  protected createErrorNode(startIndex: number, endIndex: number): SubhutiCst;
  /**
   * Option 规则 - 0次或1次（EBNF [ ... ]）
   *
   * 尝试执行一次，失败则回溯，不影响整体解析状态
   */
  Option(fn: RuleFunction): void;
  /**
   * AtLeastOne 规则 - 1次或多次
   *
   * 第一次必须成功，后续循环执行直到失败
   */
  AtLeastOne(fn: RuleFunction): void;
  /**
   * 顶层规则失败时的错误处理
   *
   * @param ruleName 规则名
   * @param startIndex 规则开始时的源码位置
   */
  private handleTopLevelError;
  get parserFailOrIsEof(): boolean;
  /**
   * 消费 token（智能错误管理）
   * - 失败时返回 undefined，不抛异常
   * - 支持传入词法目标（可选）
   */
  consume(tokenName: string, goal?: LexicalGoal): SubhutiCst | undefined;
  private generateCstByToken;
  private saveState;
  private restoreState;
  /**
   * 【容错模式】记录部分匹配并回溯
   * - 解析记录树方案中，部分匹配由 _parseRecordRoot 记录
   * - 这里只需要回溯 CST（解析记录树是只增不删的）
   *
   * @param savedState 保存的状态
   * @param startCodeIndex 起始源码位置
   */
  private recordPartialMatchAndRestore;
  /**
   * 检查是否已到达源码末尾
   */
  get isEof(): boolean;
  /**
   * 尝试执行函数，失败时自动回溯并重置状态
   *
   * @param fn 要执行的函数
   * @returns true: 成功且消费了 token，false: 失败或没消费 token
   */
  private tryAndRestore;
  /**
   * 应用缓存结果（恢复状态）
   */
  private applyCachedResult;
  /**
   * 获取 token 上下文（从 parsedTokens 获取最近的 N 个 token）
   *
   * @param contextSize - 上下文大小（默认 2）
   * @returns token 上下文数组
   */
  private getTokenContext;
  /**
   * 生成当前规则路径的字符串（用于错误信息）
   *
   * @returns 格式化后的规则路径字符串数组
   */
  private formatCurrentRulePath;
  /**
   * 简单格式化规则路径（当没有调试器时）
   */
  private formatSimpleRulePath;
  /**
   * 创建无限循环错误
   *
   * @param ruleName - 规则名称
   * @param hint - 修复提示
   * @returns ParsingError 实例（分析模式下返回 null）
   */
  private createInfiniteLoopError;
}
//#endregion
//#region src/SubhutiError.d.ts
/**
 * 错误详情（平铺结构）
 */
interface ErrorDetails {
  expected: string;
  found?: SubhutiMatchToken;
  position: {
    tokenIndex: number;
    codeIndex: number;
    line: number;
    column: number;
  };
  ruleStack: string[];
  type?: 'parsing' | 'left-recursion' | 'infinite-loop' | 'or-branch-shadowing';
  loopRuleName?: string;
  loopDetectionSet?: string[];
  loopCstDepth?: number;
  loopCacheStats?: {
    hits: number;
    misses: number;
    hitRate: string;
    currentSize: number;
  };
  loopTokenContext?: SubhutiMatchToken[];
  hint?: string;
  rulePath?: string;
  suggestions?: string[];
}
/**
 * 解析错误类
 *
 * 设计理念：
 * - 清晰的视觉层次
 * - 关键信息突出显示
 * - 智能修复建议（只保留最常见的场景）
 *
 * 参考：Rust compiler error messages
 */
declare class ParsingError extends Error {
  readonly expected: string;
  readonly found?: SubhutiMatchToken;
  readonly position: {
    readonly tokenIndex: number;
    readonly codeIndex: number;
    readonly line: number;
    readonly column: number;
  };
  readonly ruleStack: readonly string[];
  readonly type: 'parsing' | 'left-recursion' | 'infinite-loop' | 'or-branch-shadowing';
  readonly loopRuleName?: string;
  readonly loopDetectionSet?: readonly string[];
  readonly loopCstDepth?: number;
  readonly loopCacheStats?: Readonly<{
    hits: number;
    misses: number;
    hitRate: string;
    currentSize: number;
  }>;
  readonly loopTokenContext?: readonly SubhutiMatchToken[];
  readonly hint?: string;
  readonly rulePath?: string;
  /**
   * ⭐ 智能修复建议（仅 parsing 错误）
   */
  readonly suggestions: readonly string[];
  /**
   * 是否启用详细错误信息（仅 parsing 错误使用）
   */
  private readonly useDetailed;
  constructor(message: string, details: ErrorDetails, useDetailed?: boolean);
  /**
   * 智能修复建议生成器（简化版）⭐
   *
   * 只保留最常见的 8 种错误场景：
   * 1. 闭合符号缺失（{} () []）
   * 2. 分号问题
   * 3. 关键字拼写错误
   * 4. 标识符错误
   * 5. EOF 问题
   */
  private generateSuggestions;
  /**
   * 格式化错误信息（根据类型和模式选择）⭐
   */
  toString(): string;
  /**
   * 详细格式（Rust 风格 + 智能建议）
   */
  private toDetailedString;
  /**
   * 简单格式（基本信息）
   */
  private toSimpleString;
  /**
   * 简洁格式（用于日志）
   */
  toShortString(): string;
  /**
   * 格式化左递归路径（更清晰的显示）
   */
  private formatLeftRecursionPath;
  /**
   * 循环错误详细格式⭐
   *
   * 展示信息：
   * - 循环规则名和位置
   * - 当前 token 信息
   * - 完整规则调用栈
   * - 循环检测集合内容
   * - CST 栈深度
   * - 缓存统计（可选）
   * - Token 上下文（可选）
   * - 修复建议
   */
  private toLoopDetailedString;
  /**
   * Or 分支遮蔽错误格式化（详细版）
   */
  private toOrBranchShadowingString;
}
/**
 * Subhuti 错误处理器
 *
 * 管理错误创建和格式化
 */
declare class SubhutiErrorHandler {
  private enableDetailedErrors;
  /**
   * 设置是否启用详细错误
   *
   * @param enable - true: 详细错误（Rust风格+建议），false: 简单错误
   */
  setDetailed(enable: boolean): void;
  /**
   * 创建解析错误
   *
   * @param details - 错误详情
   * @returns ParsingError 实例
   */
  createError(details: ErrorDetails): ParsingError;
}
//#endregion
//#region src/SubhutiErrorTypes.d.ts
/**
 * Subhuti 错误类型定义（改进版）
 *
 * 改进点：
 * 1. 区分左递归和无限循环
 * 2. 提供详细的诊断信息
 * 3. 包含自动修复建议
 */
/**
 * 错误类型枚举
 */
type SubhutiErrorType = 'syntax' | 'left-recursion' | 'infinite-loop' | 'unexpected-eof' | 'custom';
/**
 * 左递归特有信息
 */
interface LeftRecursionInfo {
  /** 触发左递归的规则名称 */
  ruleName: string;
  /** 检测键（格式：ruleName:tokenIndex） */
  detectionKey: string;
  /** 规则调用栈 */
  ruleStack: string[];
  /** 循环路径（从根到循环点的规则链） */
  cyclePath: string[];
}
/**
 * 无限循环特有信息
 */
interface InfiniteLoopInfo {
  /** 触发无限循环的规则名称 */
  ruleName: string;
  /** 当前 token 位置 */
  tokenIndex: number;
  /** 当前 token 名称 */
  tokenName: string;
  /** 当前 token 值 */
  tokenValue?: string;
  /** 尝试次数（至少 2 次） */
  attemptCount: number;
  /** 规则调用栈 */
  ruleStack: string[];
  /** 可疑的规则（成功但不消费 token） */
  suspiciousRules: string[];
  /** 自动诊断结果 */
  diagnosis: string;
  /** 修复建议 */
  suggestions: string[];
}
/**
 * 错误位置信息
 */
interface ErrorPosition {
  /** Token 索引 */
  tokenIndex: number;
  /** 行号（如果可用） */
  line?: number;
  /** 列号（如果可用） */
  column?: number;
  /** Token 上下文（前后各 2 个 token） */
  context?: Array<{
    tokenName: string;
    tokenValue: string;
    isCurrent: boolean;
  }>;
}
/**
 * Subhuti 错误接口（改进版）
 */
interface SubhutiError {
  /** 错误类型 */
  type: SubhutiErrorType;
  /** 错误消息 */
  message: string;
  /** 错误位置 */
  position?: ErrorPosition;
  /** 左递归特有信息 */
  leftRecursion?: LeftRecursionInfo;
  /** 无限循环特有信息 */
  infiniteLoop?: InfiniteLoopInfo;
  /** 原始错误（如果有） */
  originalError?: Error;
  /** 时间戳 */
  timestamp: number;
}
//#endregion
//#region src/SubhutiDebugRuleTracePrint.d.ts
/**
 * SubhutiDebugRuleTracePrint - 规则路径输出工具类
 *
 * 职责：
 * - 负责规则执行路径的格式化输出
 * - 处理规则链的折叠显示
 * - 计算缩进和显示深度
 * - 生成 Or 分支标记
 *
 * 设计：
 * - 纯静态方法，无实例状态
 * - 直接基于 RuleStackItem[] 进行输出
 * - 可以修改传入的状态对象（副作用）
 * - 直接输出到控制台
 *
 * 配置：
 * - showRulePath: 控制是否输出规则执行路径（默认 true）
 */
/**
 * 设置是否显示规则执行路径
 * @param show - true 显示，false 不显示
 */
declare function setShowRulePath(show: boolean): void;
/**
 * 获取当前是否显示规则执行路径
 */
declare function getShowRulePath(): boolean;
/**
 * 树形输出格式化辅助类
 *
 * 提供统一的格式化工具方法供调试工具使用
 *
 * 核心功能：
 * 1. formatLine - 统一的行输出格式化（自动处理缩进、拼接、过滤空值）
 * 2. formatTokenValue - Token 值转义和截断
 * 3. formatLocation - 位置信息格式化
 * 4. formatRuleChain - 规则链拼接
 */
declare class TreeFormatHelper {
  /**
   * 格式化一行输出
   *
   * @param parts - 内容数组（null/undefined/'' 会被自动过滤）
   * @param options - 配置选项
   */
  static formatLine(content: string, options: {
    depth?: number;
    prefix?: string;
  }): string;
  static contentJoin(parts: string[]): string[];
  /**
   * 格式化 Token 值（处理特殊字符和长度限制）
   *
   * @param value - 原始值
   * @param maxLength - 最大长度（超过则截断）
   */
  static formatTokenValue(value: string, maxLength?: number): string;
  /**
   * 格式化位置信息
   *
   * @param loc - 位置对象 {start: {line, column}, end: {line, column}}
   */
  static formatLocation(loc: any): string;
  /**
   * 格式化规则链（用于折叠显示）
   *
   * @param rules - 规则名数组
   * @param separator - 分隔符（默认 " > "）
   */
  static formatRuleChain(rules: string[], separator?: string): string;
}
/**
 * 规则栈项
 */
interface RuleStackItem {
  ruleName?: string;
  tokenValue?: string;
  tokenSuccess?: boolean;
  tokenExpectName?: string;
  tokenName?: string;
  startTime: number;
  outputted: boolean;
  tokenIndex: number;
  isManuallyAdded?: boolean;
  shouldBreakLine?: boolean;
  displayDepth?: number;
  childs?: string[];
  orBranchInfo?: {
    orIndex?: number;
    branchIndex?: number;
    isOrEntry: boolean;
    isOrBranch: boolean;
    totalBranches?: number;
  };
}
/**
 * Or 分支信息
 */
interface OrBranchInfo {
  totalBranches: number;
  currentBranch: number;
  targetDepth: number;
  savedPendingLength: number;
  parentRuleName: string;
}
declare class SubhutiDebugRuleTracePrint {
  /**
   * 统一的 Or 标记格式化方法
   * 所有字符串拼接都在这里处理
   *
   * @param item - 规则栈项
   * @returns 显示后缀（如 "" / " [Or]" / " [Or #1/3]"）
   */
  static formatOrSuffix(item: RuleStackItem): string;
  /**
   * 判断是否是 Or 相关节点
   */
  static isOrEntry(item: RuleStackItem): boolean;
  static getPrintToken(tokenItem: RuleStackItem, location?: string): string;
  /**
   * 格式化一行（返回字符串）
   */
  static formatLine(str: string, depth: number, symbol?: string): string;
  static consoleLog(...strs: any[]): void;
  /**
   * 非缓存场景：格式化待处理的规则日志（返回字符串数组）
   * 特点：只有一次断链，只有一个折叠段
   *
   * 【设计思路】
   * 1. 不需要提前标记 shouldBreakLine
   * 2. 遍历时直接判断是否到达断点
   * 3. 到达断点前：积累到折叠链
   * 4. 到达断点后：逐个输出并赋值 shouldBreakLine = true
   */
  static formatPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[]): string[];
  /**
   * 非缓存场景：输出待处理的规则日志（直接输出到控制台）
   */
  static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[]): number;
  static flushPendingOutputs_Cache_Impl(ruleStack: RuleStackItem[]): void;
  /**
   * 格式化折叠链（返回字符串数组）
   * @param rules
   * @param depth 兼容非缓存和缓存，
   */
  static formatChainRule(rules: RuleStackItem[], depth?: number): string[];
  /**
   * 打印折叠链（直接输出到控制台）
   * @param rules
   * @param depth 兼容非缓存和缓存，
   */
  static printChainRule(rules: RuleStackItem[], depth?: number): void;
  /**
   * 格式化单独规则（返回字符串数组）
   * 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
   *
   * @param rules
   * @param depth 兼容非缓存和缓存，
   */
  static formatMultipleSingleRule(rules: RuleStackItem[], depth?: number): {
    lines: string[];
    depth: number;
  };
  /**
   * 打印单独规则（直接输出到控制台）
   * 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
   *
   * @param rules
   * @param depth 兼容非缓存和缓存，
   */
  static printMultipleSingleRule(rules: RuleStackItem[], depth?: number): number;
  private static getRuleItemLogContent;
}
//#endregion
//#region src/SubhutiDebug.d.ts
/**
 * Subhuti Debug - 统一调试和性能分析系统（v4.0）
 *
 * 设计理念：
 * - YAGNI：只实现实际需要的功能
 * - 简单优于复杂：统一入口，清晰的输出
 * - 职责分离：追踪器（有状态）+ 工具集（无状态）
 *
 * 架构：
 * - SubhutiDebugUtils - 无状态工具集（CST分析、Token验证、高级调试）
 *
 * 功能：
 * - ✅ 规则执行追踪（进入/退出）
 * - ✅ Token 消费显示（成功/失败）
 * - ✅ 缓存命中标识（⚡CACHED）
 * - ✅ 耗时信息
 * - ✅ 嵌套层级（缩进）
 * - ✅ Or 分支选择
 * - ✅ 回溯标识
 * - ✅ 性能统计（totalCalls, avgTime, cacheHits）
 * - ✅ Top N 慢规则（简化输出）
 * - ✅ 二分增量调试（bisectDebug）
 * - ✅ CST 结构验证
 * - ✅ Token 完整性检查
 *
 * @version 4.0.0 - 职责分离 + 通用调试工具
 * @date 2025-11-06
 */
/**
 * 规则性能统计
 */
interface RuleStats {
  ruleName: string;
  totalCalls: number;
  actualExecutions: number;
  cacheHits: number;
  totalTime: number;
  executionTime: number;
  avgTime: number;
}
/**
 * Subhuti 调试工具集
 *
 * 职责：
 * - 提供独立的调试工具（无状态）
 * - CST 分析、Token 验证、高级调试方法
 *
 * 使用场景：
 * - 测试脚本直接调用
 * - 外部工具集成
 * - 自定义验证逻辑
 *
 * @version 4.0.0 - 职责分离
 * @date 2025-11-06
 */
declare class SubhutiDebugUtils {
  /**
   * 收集 CST 中的所有 token 值
   *
   * @param node - CST 节点
   * @returns token 值数组
   *
   * @example
   * ```typescript
   * const cst = parser.Script()
   * const tokens = SubhutiDebugUtils.collectTokens(cst)
   * console.log(tokens)  // ['const', 'obj', '=', '{', 'sum', ':', '5', '+', '6', '}']
   * ```
   */
  static collectTokens(node: SubhutiCst): string[];
  /**
   * 验证 CST 的 token 完整性
   *
   * @param cst - CST 节点
   * @param inputTokens - 输入 token 数组或 token 值数组
   * @returns 验证结果
   *
   * @example
   * ```typescript
   * const result = SubhutiDebugUtils.validateTokenCompleteness(cst, tokens)
   * if (result.complete) {
   *     console.log('✅ Token 完整')
   * } else {
   *     console.log('❌ 缺失:', result.missing)
   * }
   * ```
   */
  static validateTokenCompleteness(cst: any, inputTokens: string[] | any[]): {
    complete: boolean;
    inputCount: number;
    cstCount: number;
    inputTokens: string[];
    cstTokens: string[];
    missing: string[];
  };
  /**
   * 验证 CST 结构完整性
   *
   * @param node - CST 节点
   * @param path - 节点路径（用于错误报告）
   * @returns 错误列表
   */
  static validateStructure(node: any, path?: string): Array<{
    path: string;
    issue: string;
    node?: any;
  }>;
  /**
   * 获取 CST 统计信息
   *
   * @param node - CST 节点
   * @returns 统计信息
   */
  static getCSTStatistics(node: any): {
    totalNodes: number;
    leafNodes: number;
    maxDepth: number;
    nodeTypes: Map<string, number>;
  };
  /**
   * 格式化 CST 为树形结构字符串
   *
   * @param cst - CST 节点
   * @param prefix - 前缀（递归使用）
   * @param isLast - 是否为最后一个子节点（递归使用）
   * @returns 树形结构字符串
   */
  static formatCst(cst: SubhutiCst, prefix?: string, isLast?: boolean): string;
  /**
   * 格式化单个节点（使用 TreeFormatHelper）
   */
  private static formatNode;
  /**
   * 二分增量调试 - 从最底层规则逐层测试到顶层
   *
   * 这是一个强大的调试工具，用于快速定位问题层级。
   * 它会从最底层规则开始逐层测试，直到找到第一个失败的层级。
   *
   * @param tokens - 输入 token 流
   * @param ParserClass - Parser 类（构造函数）
   * @param levels - 测试层级配置（从底层到顶层）
   * @param options - 可选配置
   * @param options.enableDebugOnLastLevel - 是否在最后一层启用 debug（默认 true）
   * @param options.stopOnFirstError - 遇到第一个错误时停止（默认 true）
   * @param options.showStackTrace - 显示堆栈跟踪（默认 true）
   * @param options.stackTraceLines - 堆栈跟踪显示行数（默认 10）
   *
   * @example
   * ```typescript
   * import { SubhutiDebugUtils } from 'subhuti/src/SubhutiDebug'
   * import Es2025Parser from './Es2025Parser'
   *
   * const tokens = lexer.tokenize("let count = 1")
   *
   * SubhutiDebugUtils.bisectDebug(tokens, Es2025Parser, [
   *     { name: 'LexicalDeclaration', call: (p) => p.LexicalDeclaration({In: true}) },
   *     { name: 'Declaration', call: (p) => p.Declaration() },
   *     { name: 'StatementListItem', call: (p) => p.StatementListItem() },
   *     { name: 'Script', call: (p) => p.Script() }
   * ], { enableDebugOnLastLevel: false })
   * ```
   */
  static bisectDebug(tokens: any[], ParserClass: new (tokens: any[]) => any, levels: Array<{
    name: string;
    call: (parser: any) => any;
  }>, options?: {
    enableDebugOnLastLevel?: boolean;
    stopOnFirstError?: boolean;
    showStackTrace?: boolean;
    stackTraceLines?: number;
  }): void;
}
declare class SubhutiTraceDebugger {
  ruleStack: RuleStackItem[];
  private stats;
  private rulePathCache;
  private inputTokens;
  private topLevelCst;
  /**
   * 构造函数
   *
   * @param tokens - 输入 token 流（用于完整性检查和位置信息）
   */
  constructor(tokens?: any[]);
  /**
   * 重置调试器状态，为新一轮解析做准备
   *
   * 职责：
   * - 清空旧的规则路径缓存
   * - 清空旧的性能统计
   * - 刷新 token 快照
   *
   * 调用时机：每次顶层规则开始前（由 SubhutiParser 调用）
   */
  resetForNewParse(tokens?: any[]): void;
  /**
   * 从 token 流中提取有效 token（排除注释、空格等）
   *
   * @returns 完整的 token 对象数组（包含 tokenValue, tokenName, loc 等）
   */
  private extractValidTokens;
  /**
   * 深拷贝 RuleStackItem（手动拷贝每个字段）
   */
  private deepCloneRuleStackItem;
  /**
   * 生成缓存键（包含 Or 节点信息）
   */
  private generateCacheKey;
  private createTokenItem;
  /**
   * 从缓存恢复规则路径（递归恢复整个链条）
   *
   * @param cacheKey - 缓存键
   * @param isRoot - 是否是根节点
   * @param OrBranchNeedNewLine - 是否需要单独行，or相关专用
   * @param displayDepth - 父节点的 displayDepth（用于计算当前节点的深度）
   */
  private restoreFromCacheAndPushAndPrint;
  openDebugLogCache: boolean;
  /**
   * 规则进入事件处理器 - 立即建立父子关系版本
   *
   * 流程：
   * 1. 检查缓存命中（缓存命中直接回放）
   * 2. 从栈顶获取父节点（上一行）
   * 3. 立即建立父→子关系
   * 4. 记录当前规则到缓存
   * 5. 推入栈
   *
   * @param ruleName - 规则名称
   * @param tokenIndex - 规则进入时的 token 索引
   */
  onRuleEnter(ruleName: string, tokenIndex: number): number;
  onRuleExit(ruleName: string, cacheHit: boolean, startTime?: number): void;
  cacheSet(key: string, value: RuleStackItem): void;
  cacheGet(key: string): RuleStackItem;
  onTokenConsume(tokenIndex: number, tokenValue: string, tokenName: string, expectName: string, success: boolean): void;
  onOrEnter(parentRuleName: string, tokenIndex: number): void;
  onOrExit(parentRuleName: string): void;
  onOrBranch(branchIndex: number, totalBranches: number, parentRuleName: string): void;
  onOrBranchExit(parentRuleName: string, branchIndex: number): void;
  onBacktrack(fromTokenIndex: number, toTokenIndex: number): void;
  /**
   * 收集所有 token 值（内部调用 SubhutiDebugUtils）
   */
  private collectTokenValues;
  /**
   * 检查 Token 完整性（内部调用 SubhutiDebugUtils）
   */
  private checkTokenCompleteness;
  /**
   * 验证 CST 结构完整性（内部调用 SubhutiDebugUtils）
   */
  private validateStructure;
  /**
   * 获取 CST 统计信息（内部调用 SubhutiDebugUtils）
   */
  private getCSTStatistics;
  /**
   * @deprecated 请使用 SubhutiDebugUtils.collectTokens()
   */
  static collectTokens: typeof SubhutiDebugUtils.collectTokens;
  /**
   * @deprecated 请使用 SubhutiDebugUtils.validateTokenCompleteness()
   */
  static validateTokenCompleteness: typeof SubhutiDebugUtils.validateTokenCompleteness;
  /**
   * 获取性能摘要
   */
  private getSummary;
  /**
   * 设置要展示的 CST（由 Parser 在解析完成后调用）
   */
  setCst(cst: SubhutiCst | undefined): void;
  parentPushChild(parent: RuleStackItem, child: string): void;
  /**
   * 自动输出完整调试报告
   */
  autoOutput(): void;
}
//#endregion
//#region src/SubhutiPackratCache.d.ts
/**
 * SubhutiPackratCache Parsing 缓存结果（完整状态）
 *
 * 关键字段：
 * - endTokenIndex: 解析结束时的 token 索引
 * - cst: CST 节点（成功时有值）
 * - parseSuccess: 解析是否成功
 * - recordNode: 解析记录节点（容错模式下使用）
 * - parsedTokens: 消费的 token 列表
 */
interface SubhutiPackratCacheResult {
  endTokenIndex: number;
  cst: SubhutiCst;
  parseSuccess: boolean;
  recordNode?: ParseRecordNode | null;
  parsedTokens?: any[];
}
/**
 * SubhutiPackratCache 基础统计字段
 *
 * 用于 SubhutiPackratCacheStatsReport 接口的字段定义
 */
interface SubhutiPackratCacheStats {
  hits: number;
  misses: number;
  stores: number;
}
/**
 * SubhutiPackratCache 缓存统计报告（唯一对外接口）⭐
 *
 * 通过 getStatsReport() 获取，包含完整的缓存分析数据：
 *
 * 基础统计（继承自 SubhutiPackratCacheStats）：
 * - hits: 缓存命中次数
 * - misses: 缓存未命中次数
 * - stores: 缓存存储次数
 *
 * 计算字段：
 * - total: 总查询次数（hits + misses）
 * - hitRate: 命中率（如："68.5%"）
 *
 * 缓存信息：
 * - maxCacheSize: 最大容量
 * - currentSize: 当前大小
 * - usageRate: 使用率（如："45.2%" 或 "unlimited"）
 *
 * 性能建议：
 * - suggestions: 根据统计数据自动生成的优化建议
 */
interface SubhutiPackratCacheStatsReport extends SubhutiPackratCacheStats {
  total: number;
  hitRate: string;
  maxCacheSize: number;
  currentSize: number;
  usageRate: string;
  suggestions: string[];
}
/**
 * Subhuti SubhutiPackratCache Cache - 集成 LRU 缓存 + 统计的 SubhutiPackratCache Parsing 管理器 ⭐⭐⭐
 *
 * 职责：
 * - LRU 缓存实现（使用成熟的 lru-cache 库）
 * - 统计缓存命中率
 * - 应用和存储缓存结果
 * - 提供性能分析建议
 *
 * 设计理念：
 * - 使用开源库：基于 lru-cache（10k+ stars，每周 4000万+ 下载）
 * - 默认最优：LRU(10000) 生产级配置
 * - 零配置：开箱即用
 * - 高性能：lru-cache 高度优化，所有操作 O(1)
 * - 集成统计：hits/misses/stores 与缓存操作原子化
 *
 * 使用示例：
 * ```typescript
 * // 默认配置（推荐 99%）- LRU(10000)
 * const cache = new SubhutiPackratCache()
 *
 * // 自定义缓存大小（大文件）- LRU(50000)
 * const cache = new SubhutiPackratCache(50000)
 *
 * // 无限缓存（小文件 + 内存充足）
 * const cache = new SubhutiPackratCache(0)
 * ```
 *
 * 性能：
 * - get: O(1) 常数时间
 * - set: O(1) 常数时间
 * - 统计集成：零额外开销
 */
declare class SubhutiPackratCache {
  /**
   * 缓存主存储（使用 lru-cache 库）
   *
   * 优势：
   * - 成熟稳定：10+ 年维护，每周 4000万+ 下载
   * - 高度优化：O(1) 所有操作
   * - 功能丰富：支持 TTL、dispose 回调等
   * - TypeScript 原生支持
   *
   * 复合键格式：`${ruleName}:${tokenIndex}`
   * 示例："Expression:5" → 规则Expression在第5个token位置的缓存结果
   */
  private cache;
  /**
   * 最大容量（0 表示无限缓存）
   */
  private readonly maxSize;
  /**
   * 缓存统计信息（内部存储）
   *
   * 简单对象存储三个计数器，无需额外封装
   */
  private stats;
  /**
   * 构造 SubhutiPackratCache Cache
   *
   * 使用示例：
   * ```typescript
   * // 默认配置（推荐 99%）
   * new SubhutiPackratCache()          → LRU(10000)
   *
   * // 大文件
   * new SubhutiPackratCache(50000)     → LRU(50000)
   *
   * // 超大文件
   * new SubhutiPackratCache(100000)    → LRU(100000)
   *
   * // 无限缓存（小文件 + 内存充足）
   * new SubhutiPackratCache(0)         → Unlimited
   * ```
   *
   * @param maxSize 最大缓存条目数
   *                - 0：无限缓存，永不淘汰
   *                - >0：启用 LRU，达到上限自动淘汰最旧条目
   *                - 默认：10000（适用 99% 场景）
   */
  constructor(maxSize?: number);
  /**
   * 查询缓存 - O(1) ⭐⭐⭐
   *
   * 集成功能：
   * - LRU 查找（由 lru-cache 库自动处理）
   * - 统计记录（hits / misses）
   * - 自动更新访问顺序（由 lru-cache 库自动处理）
   *
   * @param ruleName 规则名称
   * @param tokenIndex token 索引
   * @returns 缓存结果，未命中返回 undefined
   */
  get(ruleName: string, tokenIndex: number): SubhutiPackratCacheResult | undefined;
  /**
   * 存储缓存 - O(1) ⭐⭐⭐
   *
   * 集成功能：
   * - LRU 存储（由 lru-cache 库自动处理）
   * - 统计记录（stores）
   * - 自动淘汰旧条目（由 lru-cache 库自动处理）
   *
   * @param ruleName 规则名称
   * @param tokenIndex token 索引
   * @param result 缓存结果
   */
  set(ruleName: string, tokenIndex: number, result: SubhutiPackratCacheResult): void;
  /**
   * 清空所有缓存
   *
   * 使用场景：
   * - 解析新文件前
   * - 手动清理内存
   * - 测试重置
   */
  clear(): void;
  /**
   * 获取缓存的总条目数
   */
  get size(): number;
  /**
   * 获取缓存统计报告（唯一对外API）⭐
   *
   * 这是获取统计信息的唯一方法，包含完整的分析数据：
   * - 基础统计：hits、misses、stores、total、命中率
   * - 缓存信息：最大容量、当前大小、使用率
   * - 性能建议：根据数据自动生成
   *
   * 使用示例：
   * ```typescript
   * const report = cache.getStatsReport()
   * console.log(`命中率: ${report.hitRate}`)
   * console.log(`建议: ${report.suggestions.join(', ')}`)
   * ```
   */
  getStatsReport(): SubhutiPackratCacheStatsReport;
}
//#endregion
//#region src/validation/SubhutiValidationError.d.ts
/**
 * Subhuti Grammar Validation - 类型定义
 *
 * 功能：定义语法验证相关的类型、接口和异常类
 *
 * @version 1.0.0
 */
/**
 * 验证错误接口
 */
interface ValidationError {
  /** 错误级别 */
  level: 'ERROR' | 'FATAL';
  /** 错误类型 */
  type: 'empty-path' | 'prefix-conflict' | 'left-recursion' | 'or-conflict' | 'or-identical-branches';
  /** 规则名称 */
  ruleName: string;
  /** 冲突的分支索引 [前, 后] */
  branchIndices: [number, number] | [];
  /** 冲突路径（可选，部分错误类型不需要） */
  conflictPaths?: {
    pathA: string;
    pathB: string;
  };
  /** 错误消息 */
  message: string;
  /** 修复建议 */
  suggestion: string;
}
/**
 * 统计信息接口
 */
interface ValidationStats {
  /** First(K) 缓存生成用时 */
  dfsFirstKTime: number;
  /** MaxLevel 缓存生成用时 */
  bfsMaxLevelTime: number;
  /** Or 冲突检测用时 */
  orDetectionTime: number;
  /** 左递归错误数量 */
  leftRecursionCount: number;
  /** Or 分支冲突数量 */
  orConflictCount: number;
  /** 总用时 */
  totalTime: number;
  /** dfsFirstKCache 大小 */
  dfsFirstKCacheSize: number;
  /** bfsAllCache 大小 */
  bfsAllCacheSize: number;
  /** First(K) 的 K 值 */
  firstK: number;
  /** 缓存使用率统计 */
  cacheUsage?: {
    dfsFirstK: {
      hit: number;
      miss: number;
      total: number;
      hitRate: number;
      getCount: number;
    };
    bfsAllCache: {
      getCount: number;
      size: number;
    };
    bfsLevelCache: {
      hit: number;
      miss: number;
      total: number;
      hitRate: number;
      size: number;
      getCount: number;
    };
    getDirectChildren: {
      hit: number;
      miss: number;
      total: number;
      hitRate: number;
    };
  };
}
/**
 * 语法验证异常
 */
declare class SubhutiGrammarValidationError extends Error {
  errors: ValidationError[];
  stats?: ValidationStats;
  constructor(errors: ValidationError[], stats?: ValidationStats);
  /**
   * 格式化错误信息（包含统计信息）
   */
  toString(): string;
}
/**
 * 规则节点类型（联合类型）
 */
type RuleNode = ConsumeNode | SequenceNode | OrNode | OptionNode | ManyNode | AtLeastOneNode | SubruleNode;
/**
 * Consume 节点
 */
interface ConsumeNode {
  type: 'consume';
  tokenName: string;
}
/**
 * Sequence 节点（顺序执行）
 */
interface SequenceNode {
  type: 'sequence';
  ruleName?: string;
  nodes: RuleNode[];
}
/**
 * Or 节点（顺序选择）
 */
interface OrNode {
  type: 'or';
  alternatives: SequenceNode[];
}
/**
 * Option 节点（0次或1次）
 */
interface OptionNode {
  type: 'option';
  node: SequenceNode;
}
/**
 * Many 节点（0次或多次）
 */
interface ManyNode {
  type: 'many';
  node: SequenceNode;
}
/**
 * AtLeastOne 节点（1次或多次）
 */
interface AtLeastOneNode {
  type: 'atLeastOne';
  node: SequenceNode;
}
/**
 * Subrule 节点（调用其他规则）
 */
interface SubruleNode {
  type: 'subrule';
  ruleName: string;
}
/**
 * 路径类型：扁平化字符串
 *
 * 格式：'Token1,Token2,Token3,'
 *
 * 示例：
 * - 'Identifier,'
 * - 'Identifier,Dot,Identifier,'
 * - '' (空路径，表示 Option 跳过)
 */
type Path = string;
//#endregion
//#region src/validation/SubhutiRuleCollector.d.ts
/**
 * 规则收集器
 *
 * 职责：
 * 1. 启用 Parser 的分析模式（不抛异常）
 * 2. 创建 Parser 的 Proxy 代理
 * 3. 拦截 Or/Many/Option/AtLeastOne/consume 方法调用
 * 4. 记录调用序列形成 AST
 *
 * 优势：
 * - Parser 代码完全干净，无需任何验证相关代码
 * - 验证逻辑完全独立，易于维护
 * - 生产环境零性能开销
 * - 不使用异常控制流程，性能更好
 */
declare class SubhutiRuleCollector {
  /** 收集到的规则 AST */
  private ruleASTs;
  private tokenAstCache;
  /** 当前正在记录的规则栈 */
  private currentRuleStack;
  /** 当前规则名称 */
  private currentRuleName;
  /** 是否正在执行顶层规则调用 */
  private isExecutingTopLevelRule;
  /** 正在执行的规则栈（用于检测递归） */
  private executingRuleStack;
  /**
   * 收集所有规则 - 静态方法
   *
   * @param parser Parser 实例
   * @returns 规则名称 → AST 的映射
   */
  static collectRules(parser: SubhutiParser): {
    cstMap: Map<string, SequenceNode>;
    tokenMap: Map<string, ConsumeNode>;
  };
  /**
   * 收集所有规则（私有实现）
   */
  private collect;
  /**
   * 创建分析代理（拦截 Parser 方法调用）
   */
  private createAnalyzeProxy;
  /**
   * 创建 TokenConsumer 代理（拦截 token 消费调用）
   */
  private createTokenConsumerProxy;
  /**
   * 收集单个规则
   *
   * 异常处理说明：
   * - ✅ Parser 在分析模式下不会抛出解析相关的异常（左递归、无限循环、Token 消费失败等）
   * - ✅ 但仍需 try-catch 捕获业务逻辑错误（如废弃方法主动抛出的 Error）
   * - ✅ 即使抛出错误，Proxy 也已经收集到了部分 AST，仍然保存
   *
   * 这与之前的设计不同：
   * - 之前：依赖异常来控制流程（不好的设计）
   * - 现在：只捕获真正的业务错误（正常的异常处理）
   */
  private collectRule;
  /**
   * 获取所有规则名称（遍历整个原型链，只收集被 @SubhutiRule 装饰的方法）
   *
   * 通过检查 __isSubhutiRule__ 元数据标记来区分规则方法和普通方法
   */
  private getAllRuleNames;
  /**
   * 处理 Or 规则
   */
  private handleOr;
  /**
   * 处理 Many 规则
   */
  private handleMany;
  /**
   * 处理 Option 规则
   */
  private handleOption;
  /**
   * 处理 AtLeastOne 规则
   */
  private handleAtLeastOne;
  /**
   * 处理 consume
   */
  private handleConsume;
  /**
   * 处理子规则调用
   */
  private handleSubrule;
  /**
   * 记录节点到当前序列
   */
  private recordNode;
}
//#endregion
//#region src/validation/SubhutiGrammarAnalyzer.d.ts
/**
 * 全局统一限制配置
 *
 * 设计理念：
 * - MAX_LEVEL：控制展开深度，防止无限递归
 * - MAX_BRANCHES：仅用于冲突检测时的路径比较优化
 */
declare const EXPANSION_LIMITS: {
  readonly FIRST_K: 3;
  readonly FIRST_Max: 100;
  readonly LEVEL_1: 1;
  readonly LEVEL_K: 1;
  readonly INFINITY: number;
  readonly RuleJoinSymbol: "\u001F";
  /**
   * 冲突检测路径比较限制
   *
   * ⚠️ 注意：此限制仅用于冲突检测阶段的路径比较优化
   * - 不影响规则展开阶段（展开阶段不做任何截断）
   * - 仅在 SubhutiConflictDetector.detectOrConflicts 中使用
   * - 用于限制每个分支的路径数量，防止路径比较爆炸
   *
   * 性能考虑：
   * - 路径比较复杂度：O(n²)
   * - 1000条路径 × 1000条路径 = 100万次比较（可接受）
   * - 超过1000条路径会导致性能问题（如 28260条 = 8亿次比较）
   *
   * 当前设置：已取消限制（Infinity），可能导致性能问题
   */
  readonly MAX_BRANCHES: number;
};
/**
 * 语法分析器配置
 */
interface GrammarAnalyzerOptions {
  /**
   * 最大展开层级
   * 默认: 3
   *
   * 说明：
   * - 控制规则展开的深度
   * - Level 0: 直接子节点
   * - Level 1: 展开一层
   * - Level N: 展开N层
   */
  maxLevel?: number;
}
/**
 * 语法分析器
 *
 * 职责：
 * 1. 接收规则 AST
 * 2. 按层级展开规则（不再完全展开到token）
 * 3. 分层存储展开结果
 * 4. 只缓存直接子节点，使用时按需展开
 *
 * 性能：
 * - 默认限制：3层展开，10000条路径
 * - 缓存机制：只缓存直接子节点
 * - 按需计算：使用时才递归展开
 */
declare class SubhutiGrammarAnalyzer {
  private ruleASTs;
  private tokenCache;
  /** 正在计算的规则（用于检测循环依赖） */
  private recursiveDetectionSet;
  /** 当前规则名（用于日志记录） */
  private currentRuleName;
  /** 当前规则的日志文件描述符（使用同步写入） */
  private currentLogFd;
  /** 当前规则的日志文件路径 */
  private currentLogFilePath;
  /** 当前调用深度（用于缩进） */
  private currentDepth;
  /**
   * 写入日志（使用当前深度控制缩进，自动添加文件名前缀）
   * 使用同步写入确保日志立即刷新到磁盘
   */
  private writeLog;
  /**
   * 开始记录规则日志
   */
  private startRuleLogging;
  /**
   * 结束记录规则日志
   */
  private endRuleLogging;
  /** DFS 主缓存：key="ruleName"，First(K) + 无限层级 */
  private dfsFirstKCache;
  /** BFS 缓存：key="ruleName"（完整展开，不截取，所有层级聚合） */
  private bfsAllCache;
  /** BFS 缓存：key="ruleName:level"（完整展开，不截取） */
  private bfsLevelCache;
  /** 性能分析器（包含所有缓存统计） */
  private perfAnalyzer;
  /** 收集检测过程中发现的左递归错误（使用 Map 提高查重性能） */
  private detectedLeftRecursionErrors;
  /**
   * 封装的缓存 get 方法（统一管理所有缓存统计）
   *
   * ✅ 设计原则：
   * - 每次 get 调用都会增加 total 计数
   * - 如果缓存存在则 hit++，否则 miss++
   * - total 始终等于 hit + miss
   *
   * @param cacheType - 缓存类型
   * @param key - 缓存键
   * @returns 缓存的值，如果不存在返回 undefined
   */
  private getCacheValue;
  /** 配置选项 */
  private options;
  /**
   * 构造函数
   *
   * @param ruleASTs 规则名称 → AST 的映射
   * @param tokenCache
   * @param options 配置选项
   */
  constructor(ruleASTs: Map<string, SequenceNode>, tokenCache: Map<string, ConsumeNode>, options?: GrammarAnalyzerOptions);
  getRuleNodeByAst(ruleName: string): SequenceNode;
  /**
   * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
   *
   * 实现方式：
   * - 遍历所有规则的 AST
   * - 递归查找所有 Or 节点
   * - 先计算每个分支的 First(1) 集合
   * - 如果有冲突，再深入检测 First(5)
   *
   * @returns Or 冲突错误列表
   */
  /**
   * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
   *
   * 实现方式：
   * - 遍历所有规则的 AST
   * - 递归查找所有 Or 节点
   * - 先计算每个分支的 First(1) 集合
   * - 如果有冲突，再深入检测 First(5)
   *
   * @returns Or 冲突错误列表
   */
  checkAllOrConflicts(): ValidationError[];
  /**
   * 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
   *
   * @param ruleName 规则名
   * @param node 当前节点
   * @param ruleStats 规则统计信息
   */
  private checkOrConflictsInNodeSmart;
  /**
   * 获取 Or 节点所有分支的完整路径（深度展开）
   *
   * 核心逻辑：
   * 1. 展开每个分支到第一层（得到规则名序列）
   * 2. 从 cache 获取每个规则的所有路径
   * 3. 笛卡尔积组合，得到分支的所有可能路径
   * 4. 返回每个分支的路径集合
   *
   * @param orNode - Or 节点
   * @param firstK - First(K) 的 K 值
   * @param cacheType - 缓存类型
   * @returns 每个分支的路径集合数组
   */
  getOrNodeAllBranchRules(ruleName: string, orNode: OrNode, firstK: number, cacheType: 'dfsFirstKCache' | 'bfsAllCache'): string[][][];
  private removeDuplicatePaths;
  /**
   * 使用前缀树检测两个路径集合中是否存在完全相同的路径
   *
   * @param pathsFront - 前面分支的路径数组
   * @param pathsBehind - 后面分支的路径数组
   * @returns 如果找到完全相同的路径返回该路径，否则返回 null
   */
  private findEqualPath;
  /**
   * 使用前缀树检测两个路径集合中的前缀关系
   *
   * @param pathsFront - 前面分支的路径数组
   * @param pathsBehind - 后面分支的路径数组
   * @returns 如果找到前缀关系返回 { prefix, full }，否则返回 null
   */
  private trieTreeFindPrefixMatch;
  /**
   * 生成前缀冲突的修复建议
   *
   * @param ruleName - 规则名
   * @param branchA - 分支A索引
   * @param branchB - 分支B索引
   * @param conflict - 冲突信息
   * @returns 修复建议
   */
  private getPrefixConflictSuggestion;
  /**
   * 线路1：使用 First(K) 检测 Or 分支冲突（智能检测）
   *
   * 检测逻辑：对每个路径对，根据长度选择检测方法
   * - 路径长度都等于 firstK：检测是否完全相同（findEqualPath）
   * - 前面路径长度 < firstK：检测是否是前缀（findPrefixRelation）
   *
   * 数据源：dfsFirstKCache（First(K) 的展开结果）
   *
   * @param ruleName 输出错误日志使用
   * @param orNode - Or 节点
   * @param ruleStats
   */
  detectOrBranchEqualWithFirstK(ruleName: string, orNode: OrNode, ruleStats?: any): {
    level: string;
    type: string;
    ruleName: string;
    branchIndices: number[];
    conflictPaths: {
      pathA: string;
      pathB: string;
    };
    message: string;
    suggestion: string;
  };
  /**
   * 线路2：使用 MaxLevel 检测 Or 分支的前缀遮蔽关系
   *
   * 检测目标：前面的分支是否是后面分支的前缀
   * 数据源：bfsAllCache（深度展开的完整路径）
   * 检测方法：findPrefixRelation()
   * 性能：O(n²) - 深度检测
   *
   * 适用场景：
   * - 检测前缀遮蔽问题
   * - 需要深度展开才能发现的冲突
   *
   * @param ruleName - 规则名
   * @param orNode - Or 节点
   */
  detectOrBranchPrefixWithMaxLevel(ruleName: string, orNode: OrNode, ruleStats?: any): {
    level: "ERROR";
    type: "prefix-conflict";
    ruleName: string;
    branchIndices: [number, number];
    conflictPaths: {
      pathA: string;
      pathB: string;
    };
    message: string;
    suggestion: string;
  };
  /**
   * 生成相同分支的修复建议
   */
  private getEqualBranchSuggestion;
  /**
   * 完整的 Or 分支深度检测（使用缓存）- 带防御性校验
   *
   * 检测流程：
   * 1. 线路1：使用 First(K) 快速检测
   * 2. 如果发现"遮蔽"错误：使用 MaxLevel 深度检测进行验证（防御性编程）
   * 3. 如果发现"相同"错误：直接返回（不需要验证）
   *
   * 防御性编程：
   * - 如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
   * - 否则说明两个检测逻辑不一致，抛出错误
   *
   * @param ruleName - 规则名
   * @param orNode - Or 节点
   * @returns 检测到的错误，如果没有错误返回 undefined
   */
  /**
   * 完整的 Or 分支检测（First(K) 预检 + MaxLevel 深度检测）
   *
   * 业务逻辑：
   * 1. First(K) 预检：快速检测相同/遮蔽错误
   * 2. 有任何错误 → 执行 MaxLevel 深度检测
   * 3. 防御性检查：如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
   * 4. 返回结果：优先返回 MaxLevel 结果，如果没有则返回 First(K) 结果
   *
   * @param ruleName - 规则名
   * @param orNode - Or 节点
   * @returns 检测到的错误，如果没有错误返回 undefined
   */
  private compareStats;
  detectOrBranchConflictsWithCache(ruleName: string, orNode: OrNode, ruleStats?: any): {
    level: "ERROR";
    type: "prefix-conflict";
    ruleName: string;
    branchIndices: [number, number];
    conflictPaths: {
      pathA: string;
      pathB: string;
    };
    message: string;
    suggestion: string;
  };
  depthMap: Map<any, any>;
  private findRuleDepth;
  manyAndOptionDepth(node: ManyNode | OptionNode): number;
  atLeastOneDepth(node: AtLeastOneNode): number;
  seqDepth(seq: SequenceNode): number;
  orDepth(or: OrNode): number;
  findNodeDepth(node: RuleNode): number;
  deepDepth(node: RuleNode, depth: number): number;
  depmap: Map<string, number>;
  private graph;
  collectDependencies(node: RuleNode, fromRule: string): void;
  graphToMermaid(g: Graph): string;
  grachScc(): void;
  computeRuleDepth(): void;
  computeRulePossibility(): void;
  /**
   * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
   *
   * 应该在收集 AST 之后立即调用
   *
   * @returns { errors: 验证错误列表, stats: 统计信息 }
   */
  initCacheAndCheckLeftRecursion(): {
    errors: ValidationError[];
    stats: any;
  };
  private cartesianProductInner1;
  /**
   * 计算笛卡尔积（优化版：先截取再拼接 + seq级别去重 + 提前移入最终结果集）
   * [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
   *
   * ⚠️ 重要：空分支处理
   * - 空分支 [] 参与笛卡尔积时，会被正常拼接
   * - [...seq, ...[]] = [...seq]，相当于只保留 seq
   * - 例如：[[a]] × [[], [b]] → [[a], [a,b]]
   * - 这正是 option/many 需要的行为：可以跳过或执行
   *
   * 🔧 优化策略：
   * 1. 先计算可拼接长度，避免拼接超长数据
   * 2. seq 级别去重，提前跳过重复分支
   * 3. 修复循环逻辑，逐个数组处理
   * 4. 长度达到 firstK 的序列立即移入最终结果集，不再参与后续计算
   * 5. 所有序列都达到 firstK 时提前结束，跳过剩余数组
   */
  private cartesianProduct;
  private cartesianProductInner2;
  /**
   * 深度优先展开（DFS - Depth-First Search）
   *
   * 🚀 算法：递归深入，自然展开到token
   *
   * 适用场景：
   * - maxLevel = INFINITY（无限层级）
   * - 需要完全展开到token
   * - 适合 First(K) + 完全展开
   *
   * 优势：
   * - 递归处理AST，代码简洁
   * - 自然深入到叶子节点
   * - 配合 firstK 截取，可提前终止部分分支
   *
   * @param node - AST 节点（可选）
   * @param ruleName - 规则名（可选）
   * @param firstK - 取前 K 个符号
   * @param curLevel - 当前层级（默认 0）
   * @param maxLevel - 最大展开层级（通常为 Infinity）
   * @param isFirstPosition - 是否在第一个位置（用于左递归检测）
   * @returns 展开后的路径数组 string[][]
   *
   * 调用方式：
   * - expandPathsByDFS(node, null, firstK, curLevel, maxLevel) - 传入节点
   * - expandPathsByDFS(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
   *
   * 核心逻辑：递归处理 AST 节点
   * - consume: 返回 [[tokenName]]
   * - subrule: 递归展开
   * - sequence: 笛卡尔积组合子节点
   * - or: 合并所有分支
   * - option/many: 添加空分支
   */
  private expandNode;
  /**
   * 展开 Sequence 节点
   *
   * 核心逻辑：
   * - First(1)：只展开第1个子节点
   * - First(K)：笛卡尔积展开所有子节点，然后截取
   *
   * ⚠️ 重要：空分支在 sequence 中的处理
   * - 如果子节点包含空分支 []（来自 option/many）
   * - 笛卡尔积会正常处理：[[a]] × [[], [b]] → [[a], [a,b]]
   * - 空分支不会被过滤，会正常参与笛卡尔积
   *
   * @param node
   * @param firstK
   * @param curLevel
   * @param maxLevel
   * @param isFirstPosition 是否在第一个位置（用于左递归检测）
   */
  private operationStartTime;
  private currentProcessingRule;
  private timeoutSeconds;
  private checkTimeout;
  private expandSequenceNode;
  /**
   * 广度优先展开（BFS - Breadth-First Search）
   *
   * 🚀 算法：逐层循环，精确控制层数
   * 🔥 优化：增量复用 - 从最近的缓存层级开始，而非每次从 level 1 开始
   *
   * 适用场景：
   * - maxLevel = 具体值（如 3, 5）
   * - 需要展开到指定层级
   * - 适合 First(∞) + 限制层数
   *
   * 设计理念：
   * - BFS 只负责按层级完整展开（firstK=∞）
   * - 不负责截取操作
   * - 截取由外层调用者统一处理
   *
   * 优化策略：
   * - 增量复用：level3 = level2 + 展开1层
   * - 缓存查找：从 maxLevel-1 → maxLevel-2 → ... → level 1
   * - 跳过中间计算：避免重复展开低层级
   *
   * @param ruleName 顶层规则名
   * @param maxLevel 目标层级
   * @returns 展开到目标层级的完整路径（不截取）
   *
   * 核心逻辑（增量展开）：
   * 1. 查找最近的缓存层级（maxLevel-1, maxLevel-2, ..., 1）
   * 2. 从最近的缓存开始展开（而非总是从 level 1）
   * 3. 每次展开1层：调用 expandSinglePath
   * 4. 分离已完成（全token）和未完成（含规则名）的路径
   * 5. 继续展开未完成的路径
   * 6. 达到目标层级后停止
   *
   * 示例：
   * 展开 level 4：
   *   - 查找 level 3 缓存 → 找到 ✅
   *   - level 3 + 展开1层 = level 4
   *   - 节省：level 1→2→3 的计算
   */
  /**
   * BFS 展开（纯递归实现，智能缓存复用）
   *
   * 核心思想：
   * 1. 查找最大可用缓存块（如 level 3）
   * 2. 对缓存的每个路径中的规则名，递归调用自己
   * 3. 缓存并返回结果
   *
   * 示例：查找 A:10，缓存有 A:3
   * - 找到 A:3 = [a1, B, c1]
   * - 对 B 递归调用 expandPathsByBFSCache(B, 7, [B])
   *   - 找到 B:3 = [b1, C, c1]
   *   - 对 C 递归调用 expandPathsByBFSCache(C, 4, [C])
   *     - 找到 C:3 = [c1, D, c3]
   *     - 对 D 递归调用 expandPathsByBFSCache(D, 1, [D])
   *       - 返回 getDirectChildren(D)
   *     - 缓存 C:4 ✅
   *   - 缓存 B:7 ✅
   * - 缓存 A:10 ✅
   *
   * BFS 展开（纯净版，单方法递归实现）
   *
   * 核心逻辑：
   * 1. 查找 ruleName 的最近缓存
   * 2. 对缓存的每个路径中的规则名，递归调用自己
   * 3. 自动缓存中间结果
   *
   * 示例：查找 A:10，缓存有 A:3
   * - 查找 A:10 → 找到 A:3 = [[a1, B, c1]]
   * - 对 B 递归：expandPathsByBFSCacheClean(B, 7)
   *   - 查找 B:7 → 找到 B:3 = [[b1, C, d1]]
   *   - 对 C 递归：expandPathsByBFSCacheClean(C, 4)
   *     - 查找 C:4 → 找到 C:3 = [[c1, D, e1]]
   *     - 对 D 递归：expandPathsByBFSCacheClean(D, 1)
   *       → 返回 getDirectChildren(D)
   *     - 缓存 C:4 ✅
   *   - 缓存 B:7 ✅
   * - 缓存 A:10 ✅
   *
   * @param ruleName 规则名
   * @param targetLevel 目标层级
   * @returns 展开结果
   */
  private expandPathsByBFSCache;
  /**
   * 获取规则的直接子节点（展开1层）
   *
   * @param ruleName 规则名
   * @returns 直接子节点的所有路径（展开1层）
   *
   * 优先级：
   * 1. 从 bfsLevelCache 获取 "ruleName:1"（如果已初始化）
   * 2. 动态计算并缓存
   *
   * 示例：
   * - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
   * - IfStatement → [[If, LParen, Expression, RParen, Statement]]
   */
  private getDirectChildren;
  /**
   * 处理 DFS 模式（深度优先展开，无限层级）
   *
   * @param ruleName 规则名
   * @param firstK 截取数量
   * @param curLevel 当前层级
   * @param maxLevel
   * @param isFirstPosition 是否在第一个位置（用于左递归检测）
   * @returns 展开结果
   */
  private expandPathsByDFSCache;
  /**
   * 判断展开结果是否是规则名本身（未展开）
   *
   * 规则名本身的情况：[[ruleName]] - 只有一个路径，且这个路径只有一个元素，就是这个规则名
   *
   * @param result 展开结果
   * @param ruleName 规则名
   * @returns 如果是规则名本身返回 true，否则返回 false
   */
  private isRuleNameOnly;
  /**
   * 去重：移除重复的分支
   *
   * 例如：[[a,b], [c,d], [a,b]] → [[a,b], [c,d]]
   *
   * ⚠️ 重要：空分支处理
   * - 空分支 [] 会被序列化为空字符串 ""
   * - 空分支不会被过滤，会正常参与去重
   * - 例如：[[], [a], []] → [[], [a]]
   */
  private deduplicate;
  /**
   * 截取并去重：先截取到 firstK，再去重
   *
   * 使用场景：笛卡尔积后路径变长，需要截取
   *
   * 例如：[[a,b,c], [d,e,f]], firstK=2 → [[a,b], [d,e]]
   *
   * ⚠️ 重要：空分支处理
   * - 空分支 [] slice(0, firstK) 还是 []
   * - 空分支不会被过滤，会正常参与去重
   * - 例如：[[], [a,b,c]], firstK=2 → [[], [a,b]]
   *
   * 🔧 优化：如果 firstK=INFINITY，不需要截取，只去重
   */
  private truncateAndDeduplicate;
  /**
   * 展开 Or 节点
   *
   * 核心逻辑：合并所有分支的展开结果
   *
   * 例如：or(abc / de) firstK=2
   *   → abc 展开为 [[a,b]]
   *   → de 展开为 [[d,e]]
   *   → 合并为 [[a,b], [d,e]]
   *
   * ⚠️ 重要：空分支在 or 中的处理
   * - 如果某个分支是 option/many，可能包含空分支 []
   * - 例如：or(option(a) / b)
   *   → option(a) 展开为 [[], [a]]
   *   → b 展开为 [[b]]
   *   → 合并为 [[], [a], [b]]
   * - 空分支会被正常保留，不会被过滤
   *
   * 注意：不需要截取，因为子节点已保证长度≤firstK
   *
   * 🔴 关键：Or 分支中的每个替代也是"第一个位置"
   * - 在 PEG 的选择中，每个分支都是独立的起点
   * - Or 分支内的第一个规则需要检测左递归
   * - 例如：A → A '+' B | C
   *   - 第一个分支 A '+' B 中，A 在第一个位置，需要检测
   *   - 第二个分支 C 中，C 也在第一个位置
   */
  private expandOr;
  /**
   * 展开 Option/Many 节点
   *
   * option(X) = ε | X（0次或1次）
   * many(X) = ε | X | XX | XXX...（0次或多次）
   *
   * First 集合：
   * First(option(X)) = {ε} ∪ First(X)
   * First(many(X)) = {ε} ∪ First(X)
   *
   * 例如：option(abc) firstK=2
   *   → abc 展开为 [[a,b]]
   *   → 结果为 [[], [a,b]]（空分支 + 内部分支）
   *
   * ⚠️⚠️⚠️ 关键：空分支 [] 的重要性 ⚠️⚠️⚠️
   * - 空分支 [] 表示 option/many 可以跳过（0次）
   * - 空分支在后续处理中不会被过滤：
   *   1. deduplicate：[] join(',') = ""，正常去重
   *   2. cartesianProduct：[...seq, ...[]] = [...seq]，正常拼接
   *   3. truncateAndDeduplicate：[] slice(0,k) = []，正常截取
   * - 空分支必须保留，否则 option/many 的语义就错了！
   *
   * 注意：不需要截取，因为子节点已保证长度≤firstK
   *
   * 🔴 关键：Option 内的规则也需要检测左递归
   * - 虽然 option(X) 可以跳过，但当内部有递归时也是左递归
   * - 例如：A → option(A) B
   *   - option(A) 中的 A 在第一个位置，需要检测左递归
   */
  private expandOption;
  /**
   * 展开 AtLeastOne 节点
   *
   * atLeastOne(X) = X | XX | XXX...（至少1次）
   *
   * First 集合：
   * First(atLeastOne(X)) = First(X) ∪ First(XX)
   *
   * 例如：atLeastOne(ab) firstK=3
   *   → ab 展开为 [[a,b]]
   *   → 1次：[[a,b]]
   *   → 2次：[[a,b,a,b]] 截取到3 → [[a,b,a]]
   *   → 结果为 [[a,b], [a,b,a]]
   *
   * ⚠️ 重要：空分支说明
   * - atLeastOne 至少执行1次，不会产生空分支 []
   * - 与 option/many 不同，atLeastOne 的结果不包含 []
   * - 但如果内部节点包含空分支（来自嵌套的 option/many）：
   *   例如：atLeastOne(option(a))
   *   → option(a) 展开为 [[], [a]]
   *   → 1次：[[], [a]]
   *   → 2次：[[], [a]] × 2 → [[], [a]]（空分支拼接还是空分支）
   *   → 结果为 [[], [a]]
   * - 空分支会被正常保留，不会被过滤
   *
   * 注意：doubleBranches 需要内部截取，因为拼接后会超过 firstK
   *
   * 🔴 关键：AtLeastOne 内的规则也需要检测左递归
   */
  private expandAtLeastOne;
  /**
   * 生成左递归修复建议
   *
   * @param ruleName 规则名
   * @param node 规则节点
   * @param firstSet First 集合
   * @returns 修复建议
   */
  private getLeftRecursionSuggestion;
}
//#endregion
//#region src/validation/SubhutiConflictDetector.d.ts
/**
 * SubhutiConflictDetector - 冲突检测器
 * TODO: 待实现
 */
declare class SubhutiConflictDetector {}
//#endregion
//#region src/validation/SubhutiGrammarValidator.d.ts
/**
 * SubhutiGrammarValidator - 语法验证器
 *
 * 职责：
 * 1. 提供静态验证方法
 * 2. 封装验证流程（收集 → 分析 → 检测 → 报告）
 *
 * 设计：
 * - 纯静态方法，无实例状态
 * - 使用 Proxy 方案收集 AST（零侵入）
 * - 有问题直接抛异常
 *
 * @version 2.0.0 - 静态方法重构
 */
declare class SubhutiGrammarValidator {
  /**
   * 验证语法：有问题直接抛异常
   *
   * 流程（分层检测）：
   * 1. 使用 Proxy 收集规则 AST
   * 2. 分析所有可能路径和 First 集合
   * 3. Level 0: 左递归检测 (FATAL) - 最先检测，最致命
   * 4. Level 1 & 2: Or 分支冲突检测 (FATAL/ERROR)
   * 5. 有错误抛 SubhutiGrammarValidationError
   *
   * @param parser Parser 实例
   * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
   * @throws SubhutiGrammarValidationError 语法有冲突时抛出
   */
  static validate(parser: any): void;
}
//#endregion
//#region src/validation/SubhutiValidationDebugger.d.ts
/**
 * 调试事件类型
 */
interface DebugEvent {
  type: 'rule-collect' | 'path-compute' | 'conflict-detect' | 'error-found';
  timestamp: number;
  data: any;
}
/**
 * 规则统计信息
 */
interface RuleDebugInfo {
  ruleName: string;
  /** AST 节点数量 */
  astNodeCount: number;
  /** 生成的路径数量 */
  pathCount: number;
  /** 最长路径长度 */
  maxPathLength: number;
  /** 路径计算耗时（ms） */
  pathComputeTime: number;
  /** 是否有冲突 */
  hasConflict: boolean;
}
/**
 * 冲突详细信息
 */
interface ConflictDebugInfo {
  error: ValidationError;
  /** 冲突的具体位置（第几个token） */
  conflictPosition: number;
  /** 分支A的完整路径列表 */
  branchAPaths: Path[];
  /** 分支B的完整路径列表 */
  branchBPaths: Path[];
  /** 路径差异分析 */
  pathDiff: {
    common: string[];
    onlyA: string[];
    onlyB: string[];
  };
}
declare class SubhutiValidationDebugger {
  private events;
  private ruleInfos;
  private conflictInfos;
  private stats;
  private options;
  /**
   * 配置调试选项
   */
  configure(options: Partial<typeof this.options>): this;
  /**
   * 钩子方法：验证完成后调用（轻量侵入模式）
   *
   * Parser 会在 validateGrammar() 完成后调用此方法
   *
   * @param ruleASTs 收集到的规则 AST
   * @param errors 检测到的错误
   */
  onValidationComplete(ruleASTs: Map<string, RuleNode>, errors: ValidationError[]): void;
  /**
   * 调试完整的验证流程（独立调用，完全无侵入）
   *
   * @param parser Parser 实例
   * @param validateOptions 验证选项
   * @returns 验证结果
   */
  debug(parser: any, validateOptions?: ValidateOptions): {
    success: boolean;
    errors: ValidationError[];
  };
  /**
   * 注入规则收集器（追踪收集过程）
   */
  private instrumentCollector;
  /**
   * 注入语法分析器（追踪路径计算）
   */
  private instrumentAnalyzer;
  /**
   * 注入冲突检测器（追踪检测过程）
   */
  private instrumentDetector;
  /**
   * 输出完整调试报告
   */
  private outputReport;
  /**
   * 计算 AST 节点数量
   */
  private countASTNodes;
  /**
   * 计算路径中的 token 数量
   */
  private countTokens;
  /**
   * 格式化路径（用于显示）
   */
  private formatPath;
  /**
   * 分析冲突原因
   */
  private analyzeConflict;
  /**
   * 获取统计信息（供外部使用）
   */
  getStats(): {
    totalRules: number;
    collectedRules: number;
    totalPaths: number;
    totalConflicts: number;
    fatalErrors: number;
    warnings: number;
    collectTime: number;
    analyzeTime: number;
    detectTime: number;
    totalTime: number;
  };
  /**
   * 获取规则信息（供外部使用）
   */
  getRuleInfos(): Map<string, RuleDebugInfo>;
  /**
   * 清除所有数据
   */
  clear(): void;
}
//#endregion
//#region src/validation/SubhutiValidationLogger.d.ts
/**
 * Subhuti Validation Logger - 统一的日志工具
 *
 * 功能：
 * 1. 提供统一的日志接口
 * 2. 支持日志级别控制
 * 3. 支持按规则名过滤日志
 * 4. 性能优化：日志关闭时零开销
 *
 * @version 1.0.0
 */
/**
 * 日志级别
 */
declare enum LogLevel {
  NONE = 0,
  // 不输出任何日志
  ERROR = 1,
  // 只输出错误
  WARN = 2,
  // 输出警告和错误
  INFO = 3,
  // 输出信息、警告和错误
  DEBUG = 4,
}
/**
 * 日志配置
 */
interface LoggerConfig {
  /** 日志级别 */
  level: LogLevel;
  /** 启用日志的规则名列表（为空表示所有规则） */
  enabledRules?: string[];
  /** 是否输出到文件 */
  outputToFile?: boolean;
  /** 文件路径 */
  filePath?: string;
}
/**
 * 验证日志工具
 */
declare class SubhutiValidationLogger {
  private static config;
  /**
   * 配置日志
   *
   * @param config 日志配置
   */
  static configure(config: Partial<LoggerConfig>): void;
  /**
   * 检查是否应该输出日志
   *
   * @param level 日志级别
   * @param ruleName 规则名（可选）
   * @returns 是否应该输出
   */
  private static shouldLog;
  /**
   * 输出调试日志
   *
   * @param message 消息
   * @param ruleName 规则名（可选）
   */
  static debug(message: string, ruleName?: string): void;
  /**
   * 输出信息日志
   *
   * @param message 消息
   * @param ruleName 规则名（可选）
   */
  static info(message: string, ruleName?: string): void;
  /**
   * 输出警告日志
   *
   * @param message 消息
   * @param ruleName 规则名（可选）
   */
  static warn(message: string, ruleName?: string): void;
  /**
   * 输出错误日志
   *
   * @param message 消息
   * @param ruleName 规则名（可选）
   */
  static error(message: string, ruleName?: string): void;
  /**
   * 获取当前配置
   */
  static getConfig(): LoggerConfig;
  /**
   * 重置配置为默认值
   */
  static reset(): void;
}
//#endregion
//#region src/logutil.d.ts
declare class LogUtil {
  private static logFilePath;
  private static ensureLogFile;
  static log(data?: any, msg?: any): void;
  static clear(): void;
}
//#endregion
export { AtLeastOneNode, ConflictDebugInfo, ConsumeNode, DebugEvent, EXPANSION_LIMITS, type ErrorDetails, type ErrorPosition, GrammarAnalyzerOptions, type InfiniteLoopInfo, type LeftRecursionInfo, LexicalGoal, LogLevel, LogUtil, LoggerConfig, ManyNode, OptionNode, type OrBranchInfo, OrNode, type ParseRecordNode, ParsingError, type PartialMatchRecord, Path, REGEXP_LITERAL_PATTERN, RuleDebugInfo, type RuleFunction, RuleNode, type RuleStackItem, type RuleStats, SequenceNode, type SubhutiBackData, SubhutiConflictDetector, SubhutiCreateToken, SubhutiCst, SubhutiDebugRuleTracePrint, SubhutiDebugUtils, type SubhutiError, SubhutiErrorHandler, type SubhutiErrorType, SubhutiGrammarAnalyzer, SubhutiGrammarValidationError, SubhutiGrammarValidator, SubhutiLexer, SubhutiLexerTokenNames, SubhutiMatchToken, SubhutiPackratCache, type SubhutiPackratCacheResult, type SubhutiPackratCacheStatsReport, SubhutiParser, type SubhutiParserOr, type SubhutiPosition, SubhutiRuleCollector, type SubhutiSourceLocation, SubhutiTokenConsumer, type SubhutiTokenContextConstraint, SubhutiTokenLookahead, type SubhutiTokenLookahead$1 as SubhutiTokenLookaheadConfig, SubhutiTraceDebugger, SubhutiValidationDebugger, SubhutiValidationLogger, SubruleNode, type TokenCacheEntry, TreeFormatHelper, ValidationError, ValidationStats, createMatchToken, emptyValue, getShowRulePath, matchRegExpLiteral, setShowRulePath };
//# sourceMappingURL=index.d.mts.map