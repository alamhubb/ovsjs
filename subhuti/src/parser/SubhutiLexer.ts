import {SubhutiCreateToken, SubhutiCreateTokenGroupType} from "../struct/SubhutiCreateToken.ts"
import SubhutiMatchToken, {createMatchToken} from "../struct/SubhutiMatchToken.ts"

export default class SubhutiLexer {
  constructor(tokens: SubhutiCreateToken[]) {
    this.setTokens(tokens)
  }

  tokens: SubhutiCreateToken[]
  private tokenMap: Map<string, SubhutiCreateToken>

  private generateTokenMap() {
    const tokenMap: Map<string, SubhutiCreateToken> = new Map()
    this.tokens.forEach(item => {
      tokenMap.set(item.name, item)
    })
    this.tokenMap = tokenMap
  }

  setTokens(tokens: SubhutiCreateToken[]) {
    this.tokens = tokens
    this.generateTokenMap()
  }

  /**
   * 检查已解析的tokens中是否有未闭合的模板字符串
   * 逻辑：
   * - TemplateHead: 开启一个模板字符串（等待TemplateMiddle或TemplateTail）
   * - TemplateMiddle: 关闭前一个，开启新的（${...}${...}的中间）
   * - TemplateTail: 关闭一个模板字符串
   * - NoSubstitutionTemplateTok: 完整的模板字符串（`hello`），不影响计数
   */
  private hasUnclosedTemplate(tokens: SubhutiMatchToken[]): boolean {
    let unclosedCount = 0
    
    for (const token of tokens) {
      if (token.tokenName === 'TemplateHead') {
        unclosedCount++  // 开启一个模板
      } else if (token.tokenName === 'TemplateMiddle') {
        // TemplateMiddle既关闭前一个，又开启新的，所以不改变计数
        // unclosedCount不变
      } else if (token.tokenName === 'TemplateTail') {
        unclosedCount--  // 关闭一个模板
      }
      // NoSubstitutionTemplateTok不影响计数（自闭合）
    }
    
    return unclosedCount > 0
  }

  tokenize(input: string): SubhutiMatchToken[] {
    const resTokens: SubhutiMatchToken[] = [] // 初始化结果token数组
    let lineNum = 0
    let columnStartNum = 0
    let codeIndex = 0
    let newlinesPatternRes = null
    const newlinesPattern = new RegExp('^\n')
    while (input) { // 当输入字符串不为空时循环
      const matchTokens: SubhutiMatchToken[] = [] // 初始化匹配的token数组
      //如果为新行
      newlinesPatternRes = input.match(newlinesPattern) // 尝试匹配输入字符串
      if (newlinesPatternRes) {
        lineNum++
        columnStartNum = 0
      }
      // 匹配的token数量
      for (const token of this.tokens) {
        // 遍历所有token
        
        // 【上下文感知】检查是否应该匹配模板字符串相关token
        const isTemplateToken = token.name === 'TemplateTail' || token.name === 'TemplateMiddle'
        if (isTemplateToken) {
          // 检查是否有未闭合的模板字符串
          const hasUnclosedTemplate = this.hasUnclosedTemplate(resTokens)
          if (!hasUnclosedTemplate) {
            // 没有未闭合的模板字符串，跳过TemplateTail和TemplateMiddle的匹配
            continue
          }
        }
        
        // 处理正则
        const newPattern = new RegExp('^(?:' + token.pattern.source + ')') // 创建新的正则表达式

        // token正则匹配
        const matchRes = input.match(newPattern) // 尝试匹配输入字符串
        //可以优化，判断不匹配
        // 存在匹配结果，
        if (matchRes) {
          let matchLength = matchRes[0].length
          //新行，多一个换行符
          // if (newlinesPatternRes) {
          //   matchLength = matchLength - 1
          //   console.log(token.name)
          // }

          // 则加入到匹配的token列表中
          matchTokens.push(createMatchToken({
            tokenName: token.name,
            rowNum: lineNum,
            columnStartNum: columnStartNum,
            columnEndNum: columnStartNum + matchLength,
            // length: matchLength,
            tokenValue: matchRes[0],
            index: codeIndex
          })) // 创建匹配token并加入列表
        }
      }
      if (!matchTokens.length) { // 如果没有匹配到任何token
        throw new Error('无法匹配token:' + input) // 抛出错误
      }
      //获取长度最长的
      let maxLength = 0
      const map: Map<number, SubhutiMatchToken[]> = new Map()
      //遍历所有匹配的token
      for (const matchToken of matchTokens) {
        //获取当前匹配token长度
        const matchTokenLength = matchToken.tokenValue.length
        //记录最长的
        maxLength = Math.max(maxLength, matchTokenLength)
        //如果是最长的，加入到结果中
        if (matchTokenLength === maxLength) {
          map.set(maxLength, [...(map.get(maxLength) || []), matchToken])
        }
      }
      //获取最长长度的tokens
      const maxLengthTokens = map.get(maxLength)
      let resToken: SubhutiMatchToken
      //如果有一个以上
      if (maxLengthTokens.length > 1) {
        const resTokens = maxLengthTokens.filter(item => this.tokenMap.get(item.tokenName).isKeyword)
        if (resTokens.length > 1) {
          throw new Error('匹配了多个关键字:' + resTokens.map(item => item.tokenName).join(','))
        }
        // 如果过滤后有关键字，使用关键字；否则使用第一个 token
        resToken = resTokens.length > 0 ? resTokens[0] : maxLengthTokens[0]
      } else {
        resToken = maxLengthTokens[0]
      }
      const tokenLength = resToken.tokenValue.length
      input = input.substring(tokenLength) // 从输入字符串中移除已匹配的部分
      codeIndex += tokenLength
      const createToken = this.tokenMap.get(resToken.tokenName) // 获取创建token的配置信息
      if (newlinesPatternRes) {
        columnStartNum = 0
      } else {
        columnStartNum = resToken.columnEndNum
      }
      if (createToken.group === SubhutiCreateTokenGroupType.skip) { // 如果token属于跳过组
        continue // 跳过此token
      }
      resTokens.push(resToken) // 将token加入结果数组
    }
    return resTokens // 返回结果token数组
  }
}
