/**
 * SubhutiLookahead 使用示例
 * 
 * 展示如何在 Es2025Parser 中使用静态前瞻方法
 */

import SubhutiLookahead from '../src/SubhutiLookahead.ts'
import type SubhutiMatchToken from '../src/struct/SubhutiMatchToken.ts'

// ============================================
// 使用方式 1：简单否定前瞻
// ============================================

/**
 * ConciseBody[In] :
 *   [lookahead ≠ {] ExpressionBody[?In, ~Await]
 *   { FunctionBody[~Yield, ~Await] }
 * 
 * 对应规范：Line 1296
 */
class Example1_SimpleLookahead {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ConciseBody(params: any) {
    return this.Or([
      // { statements }
      {
        alt: () => {
          this.tokenConsumer.LBrace()
          this.FunctionBody({ Yield: false, Await: false })
          this.tokenConsumer.RBrace()
        }
      },
      // expression - 需要前瞻约束
      {
        alt: () => {
          // 规范：[lookahead ≠ {]
          // 使用 SubhutiLookahead 静态方法
          if (SubhutiLookahead.isNot(this._tokens, this.tokenIndex, 'LBrace')) {
            this.ExpressionBody({ In: params.In, Await: false })
          }
        }
      }
    ])
  }
}

// ============================================
// 使用方式 2：否定集合前瞻
// ============================================

/**
 * ExpressionStatement[Yield, Await] :
 *   [lookahead ∉ {{, function, class}]
 *   Expression[+In, ?Yield, ?Await] ;
 * 
 * 对应规范：Line 1087（简化版，暂不处理 async function 和 let [）
 */
class Example2_SetLookahead {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ExpressionStatement(params: any) {
    // 规范：[lookahead ∉ {{, function, class}]（简化版）
    // 使用 SubhutiLookahead.isNotIn 静态方法
    if (SubhutiLookahead.isNotIn(
      this._tokens, 
      this.tokenIndex, 
      ['LBrace', 'FunctionTok', 'ClassTok']
    )) {
      this.Expression({ In: true, Yield: params.Yield, Await: params.Await })
      this.tokenConsumer.Semicolon()
      return this.curCst
    }
  }
}

// ============================================
// 使用方式 3：序列前瞻
// ============================================

/**
 * ForStatement[Yield, Await, Return] :
 *   for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; ... ) ...
 * 
 * 对应规范：Line 1115
 */
class Example3_SequenceLookahead {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ForStatement(params: any) {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.LParen()
    
    // 初始化部分
    this.Or([
      // 空
      { alt: () => {} },
      // var ...
      { alt: () => { /* ... */ } },
      // let/const ...
      { alt: () => this.LexicalDeclaration({ In: false }) },
      // Expression（需要前瞻约束）
      {
        alt: () => {
          // 规范：[lookahead ≠ let []
          // 使用 SubhutiLookahead.notMatchSequence 静态方法
          if (SubhutiLookahead.notMatchSequence(
            this._tokens, 
            this.tokenIndex, 
            ['LetTok', 'LBracket']
          )) {
            this.Expression({ In: false, Yield: params.Yield, Await: params.Await })
          }
        }
      }
    ])
    
    this.tokenConsumer.Semicolon()
    // ...
  }
}

// ============================================
// 使用方式 4：高频组合方法
// ============================================

/**
 * ExpressionStatement[Yield, Await] :
 *   [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
 *   Expression[+In, ?Yield, ?Await] ;
 * 
 * 对应规范：Line 1087（完整版）
 */
class Example4_HighFrequency {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ExpressionStatement(params: any) {
    // 规范：[lookahead ∉ {{, function, async [no LT] function, class, let [}]
    
    // 方式 1：组合基础方法 + 高频方法
    const isAsyncFunc = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(
      this._tokens, 
      this.tokenIndex
    )
    const isLetBracket = SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)
    const isOther = SubhutiLookahead.isIn(
      this._tokens, 
      this.tokenIndex, 
      ['LBrace', 'FunctionTok', 'ClassTok']
    )
    
    if (!isAsyncFunc && !isLetBracket && !isOther) {
      this.Expression({ In: true, Yield: params.Yield, Await: params.Await })
      this.tokenConsumer.Semicolon()
      return this.curCst
    }
  }
}

// ============================================
// 使用方式 5：ForInOfStatement 复杂约束
// ============================================

/**
 * ForInOfStatement[Yield, Await, Return] :
 *   for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) ...
 *   for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) ...
 * 
 * 对应规范：Line 1120, 1123
 */
class Example5_ComplexConstraints {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ForInOfStatement(params: any) {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.LParen()
    
    // 左侧（变量声明或左值表达式）
    this.Or([
      // var binding
      { alt: () => { /* ... */ } },
      // let/const binding
      { alt: () => this.ForDeclaration(params) },
      // LeftHandSideExpression（需要前瞻约束）
      {
        alt: () => {
          // 规范有两个约束：
          // 1. for...in: [lookahead ≠ let []
          // 2. for...of: [lookahead ∉ {let, async of}]
          
          // 先检查通用约束（let 和 async of 都不行）
          const isLet = SubhutiLookahead.is(this._tokens, this.tokenIndex, 'LetTok')
          const isAsyncOf = SubhutiLookahead.matchSequence(
            this._tokens, 
            this.tokenIndex, 
            ['AsyncTok', 'OfTok']
          )
          
          if (!isLet && !isAsyncOf) {
            this.LeftHandSideExpression(params)
          }
        }
      }
    ])
    
    // ...
  }
}

// ============================================
// 使用方式 6：export default 约束
// ============================================

/**
 * ExportDeclaration :
 *   export default [lookahead ∉ {function, async [no LT] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
 * 
 * 对应规范：Line 1558
 */
class Example6_ExportDefault {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ExportDeclaration() {
    this.tokenConsumer.ExportTok()
    
    return this.Or([
      // export default ...
      {
        alt: () => {
          this.tokenConsumer.DefaultTok()
          
          this.Or([
            // export default function/generator/async
            { alt: () => this.HoistableDeclaration({ Default: true }) },
            // export default class
            { alt: () => this.ClassDeclaration({ Default: true }) },
            // export default expr（需要前瞻约束）
            {
              alt: () => {
                // 规范：[lookahead ∉ {function, async [no LT] function, class}]
                const isAsyncFunc = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(
                  this._tokens, 
                  this.tokenIndex
                )
                const isOther = SubhutiLookahead.isIn(
                  this._tokens, 
                  this.tokenIndex, 
                  ['FunctionTok', 'ClassTok']
                )
                
                if (!isAsyncFunc && !isOther) {
                  this.AssignmentExpression({ In: true, Yield: false, Await: true })
                  this.tokenConsumer.Semicolon()
                }
              }
            }
          ])
        }
      },
      // 其他 export 形式...
    ])
  }
}

// ============================================
// 代码简洁性对比
// ============================================

/**
 * 如果没有前瞻类，Parser 中需要这样写：
 */
class WithoutLookaheadClass {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ExpressionStatement() {
    // ❌ 代码在 Parser 里（啰嗦、重复）
    const token = this._tokens[this.tokenIndex]
    
    if (token?.tokenName === 'LBrace') return
    if (token?.tokenName === 'FunctionTok') return
    if (token?.tokenName === 'ClassTok') return
    
    // 检查 async function
    if (token?.tokenName === 'AsyncTok') {
      const next = this._tokens[this.tokenIndex + 1]
      if (next?.tokenName === 'FunctionTok' && next.rowNum === token.rowNum) {
        return
      }
    }
    
    // 检查 let [
    if (token?.tokenName === 'LetTok') {
      const next = this._tokens[this.tokenIndex + 1]
      if (next?.tokenName === 'LBracket') {
        return
      }
    }
    
    this.Expression()
  }
}

/**
 * 有前瞻类后：
 */
class WithLookaheadClass {
  private _tokens: SubhutiMatchToken[]
  private tokenIndex: number
  
  ExpressionStatement() {
    // ✅ 代码简洁、清晰
    const isAsyncFunc = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(
      this._tokens, 
      this.tokenIndex
    )
    const isLetBracket = SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)
    const isOther = SubhutiLookahead.isIn(
      this._tokens, 
      this.tokenIndex, 
      ['LBrace', 'FunctionTok', 'ClassTok']
    )
    
    if (!isAsyncFunc && !isLetBracket && !isOther) {
      this.Expression()
      this.tokenConsumer.Semicolon()
    }
  }
}

/**
 * 代码量对比：
 * - 没有前瞻类：25 行（在 Parser 里）
 * - 有前瞻类：Parser 12 行 + 前瞻类 10 行
 * 
 * 复用性对比：
 * - 没有前瞻类：每个规则都要重复写
 * - 有前瞻类：高频逻辑（async function）复用 8 次
 * 
 * 可维护性：
 * - 没有前瞻类：修改逻辑要改多处
 * - 有前瞻类：只改一处（前瞻类）
 */

