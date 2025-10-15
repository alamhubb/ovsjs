import SubhutiParser, { Subhuti, SubhutiRule } from '../../src/parser/SubhutiParser.ts'
import SubhutiTokenConsumer from '../../src/parser/SubhutiTokenConsumer.ts'
import SubhutiMatchToken from '../../src/struct/SubhutiMatchToken.ts'
import { MinimalTokenName, minimalTokens } from './MinimalTokens.ts'

// 创建token映射
const tokenMap = new Map(minimalTokens.map(t => [t.name, t]))

// 最小化TokenConsumer
export class MinimalTokenConsumer extends SubhutiTokenConsumer {
  Identifier() { return this.consume(tokenMap.get(MinimalTokenName.Identifier)!) }
  NumericLiteral() { return this.consume(tokenMap.get(MinimalTokenName.NumericLiteral)!) }
  Arrow() { return this.consume(tokenMap.get(MinimalTokenName.Arrow)!) }
  LessThan() { return this.consume(tokenMap.get(MinimalTokenName.LessThan)!) }
  LogicalOr() { return this.consume(tokenMap.get(MinimalTokenName.LogicalOr)!) }
  LParen() { return this.consume(tokenMap.get(MinimalTokenName.LParen)!) }
  RParen() { return this.consume(tokenMap.get(MinimalTokenName.RParen)!) }
  Semicolon() { return this.consume(tokenMap.get(MinimalTokenName.Semicolon)!) }
}

// 最小化Parser - 专门测试Or回退
@Subhuti
export default class MinimalParser extends SubhutiParser<MinimalTokenConsumer> {
  
  constructor(tokens?: SubhutiMatchToken[]) {
    super(tokens, MinimalTokenConsumer as any)
  }
  
  @SubhutiRule
  Program() {
    this.Expression()
    this.tokenConsumer.Semicolon()
  }
  
  // 核心：Expression使用Or，包含会部分匹配失败的分支
  @SubhutiRule
  Expression() {
    this.Or([
      {alt: () => this.ArrowFunction()},      // 可能部分匹配失败
      {alt: () => this.LogicalOrExpression()} // 正确的分支
    ])
  }
  
  // 箭头函数：(参数) => 表达式
  @SubhutiRule
  ArrowFunction() {
    this.ArrowParameters()  // 能匹配 (1<2) 或 (x)
    this.tokenConsumer.Arrow()       // 这里会失败，如果实际是||
    this.tokenConsumer.Identifier()
  }
  
  // 箭头函数参数：(任意内容) - 增加嵌套Or
  @SubhutiRule
  ArrowParameters() {
    this.tokenConsumer.LParen()
    this.ParameterContent()  // 嵌套规则
    this.tokenConsumer.RParen()
  }
  
  // 参数内容：嵌套Or
  @SubhutiRule
  ParameterContent() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},      // x
      {alt: () => this.ComparisonExpression()}           // 1<2
    ])
  }
  
  // 比较表达式：数字 < 数字
  @SubhutiRule
  ComparisonExpression() {
    this.tokenConsumer.NumericLiteral()
    this.tokenConsumer.LessThan()
    this.tokenConsumer.NumericLiteral()
  }
  
  // 逻辑Or表达式：(表达式) || 表达式
  @SubhutiRule
  LogicalOrExpression() {
    this.ParenExpression()
    this.tokenConsumer.LogicalOr()
    this.tokenConsumer.Identifier()
  }
  
  // 括号表达式：(数字 < 数字)
  @SubhutiRule
  ParenExpression() {
    this.tokenConsumer.LParen()
    this.tokenConsumer.NumericLiteral()
    this.tokenConsumer.LessThan()
    this.tokenConsumer.NumericLiteral()
    this.tokenConsumer.RParen()
  }
}

