/**
 * SubhutiTokenHelper 使用示例
 * 
 * 展示如何在 Parser 中使用 tokenHelper 的前瞻方法
 */

import SubhutiParser from '../src/SubhutiParser.ts'

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
class Example1_SimpleLookahead extends SubhutiParser {
  ConciseBody(params: any) {
    return this.Or([
      // { statements }
      {
        alt: () => {
          this.tokenConsumer.consume({ name: 'LBrace' } as any)
          this.FunctionBody({ Yield: false, Await: false })
          this.tokenConsumer.consume({ name: 'RBrace' } as any)
        }
      },
      // expression - 需要前瞻约束
      {
        alt: () => {
          // 规范：[lookahead ≠ {]
          // 使用 tokenHelper 实例方法
          if (this.tokenConsumer.isNot('LBrace')) {
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
class Example2_SetLookahead extends SubhutiParser {
  ExpressionStatement(params: any) {
    // 规范：[lookahead ∉ {{, function, class}]（简化版）
    // 使用 tokenHelper.isNotIn 实例方法
    if (this.tokenConsumer.isNotIn(['LBrace', 'FunctionTok', 'ClassTok'])) {
      this.Expression({ In: true, Yield: params.Yield, Await: params.Await })
      this.tokenConsumer.consume({ name: 'Semicolon' } as any)
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
class Example3_SequenceLookahead extends SubhutiParser {
  ForStatement(params: any) {
    this.tokenConsumer.consume({ name: 'ForTok' } as any)
    this.tokenConsumer.consume({ name: 'LParen' } as any)
    
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
          // 使用 tokenHelper.notMatchSequence 实例方法
          if (this.tokenConsumer.notMatchSequence(['LetTok', 'LBracket'])) {
            this.Expression({ In: false, Yield: params.Yield, Await: params.Await })
          }
        }
      }
    ])
    
    this.tokenConsumer.consume({ name: 'Semicolon' } as any)
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
class Example4_HighFrequency extends SubhutiParser {
  ExpressionStatement(params: any) {
    // 规范：[lookahead ∉ {{, function, async [no LT] function, class, let [}]
    
    // 方式 1：组合基础方法 + 高频方法
    const isAsyncFunc = this.tokenConsumer.isAsyncFunctionWithoutLineTerminator()
    const isLetBracket = this.tokenConsumer.isLetBracket()
    const isOther = this.tokenConsumer.isIn(['LBrace', 'FunctionTok', 'ClassTok'])
    
    if (!isAsyncFunc && !isLetBracket && !isOther) {
      this.Expression({ In: true, Yield: params.Yield, Await: params.Await })
      this.tokenConsumer.consume({ name: 'Semicolon' } as any)
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
class Example5_ComplexConstraints extends SubhutiParser {
  ForInOfStatement(params: any) {
    this.tokenConsumer.consume({ name: 'ForTok' } as any)
    this.tokenConsumer.consume({ name: 'LParen' } as any)
    
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
          const isLet = this.tokenConsumer.is('LetTok')
          const isAsyncOf = this.tokenConsumer.matchSequence(['AsyncTok', 'OfTok'])
          
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
class Example6_ExportDefault extends SubhutiParser {
  ExportDeclaration() {
    this.tokenConsumer.consume({ name: 'ExportTok' } as any)
    
    return this.Or([
      // export default ...
      {
        alt: () => {
          this.tokenConsumer.consume({ name: 'DefaultTok' } as any)
          
          this.Or([
            // export default function/generator/async
            { alt: () => this.HoistableDeclaration({ Default: true }) },
            // export default class
            { alt: () => this.ClassDeclaration({ Default: true }) },
            // export default expr（需要前瞻约束）
            {
              alt: () => {
                // 规范：[lookahead ∉ {function, async [no LT] function, class}]
                const isAsyncFunc = this.tokenConsumer.isAsyncFunctionWithoutLineTerminator()
                const isOther = this.tokenConsumer.isIn(['FunctionTok', 'ClassTok'])
                
                if (!isAsyncFunc && !isOther) {
                  this.AssignmentExpression({ In: true, Yield: false, Await: true })
                  this.tokenConsumer.consume({ name: 'Semicolon' } as any)
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
// 使用方式 7：hasLineTerminatorBefore（[no LineTerminator here]）
// ============================================

/**
 * 检查当前 token 前是否有换行符
 * 用于 ECMAScript [no LineTerminator here] 限制
 */
class Example7_LineTerminator extends SubhutiParser {
  PostfixExpression(params: any) {
    const lhs = this.LeftHandSideExpression(params)
    
    // [no LineTerminator here] ++
    // [no LineTerminator here] --
    if (!this.tokenConsumer.hasLineTerminatorBefore()) {
      this.Option(() => {
        this.Or([
          { alt: () => this.consume('PlusPlus') },
          { alt: () => this.consume('MinusMinus') }
        ])
      })
    }
    
    return lhs
  }
}

// ============================================
// 代码简洁性对比
// ============================================

/**
 * ❌ 如果没有 tokenHelper，Parser 中需要这样写：
 */
class WithoutTokenHelper extends SubhutiParser {
  ExpressionStatement() {
    // 代码在 Parser 里（啰嗦、重复）
    const token = this.curToken
    
    if (token?.tokenName === 'LBrace') return
    if (token?.tokenName === 'FunctionTok') return
    if (token?.tokenName === 'ClassTok') return
    
    // 检查 async function
    if (token?.tokenName === 'AsyncTok') {
      const next = this.tokens[this.currentIndex + 1]
      if (next?.tokenName === 'FunctionTok' && next.rowNum === token.rowNum) {
        return
      }
    }
    
    // 检查 let [
    if (token?.tokenName === 'LetTok') {
      const next = this.tokens[this.currentIndex + 1]
      if (next?.tokenName === 'LBracket') {
        return
      }
    }
    
    this.Expression()
  }
}

/**
 * ✅ 有 tokenHelper 后：
 */
class WithTokenHelper extends SubhutiParser {
  ExpressionStatement() {
    // 代码简洁、清晰
    const isAsyncFunc = this.tokenConsumer.isAsyncFunctionWithoutLineTerminator()
    const isLetBracket = this.tokenConsumer.isLetBracket()
    const isOther = this.tokenConsumer.isIn(['LBrace', 'FunctionTok', 'ClassTok'])
    
    if (!isAsyncFunc && !isLetBracket && !isOther) {
      this.Expression()
      this.tokenConsumer.consume({ name: 'Semicolon' } as any)
    }
  }
}

/**
 * 代码量对比：
 * - 没有 tokenHelper：25 行（在 Parser 里）
 * - 有 tokenHelper：Parser 12 行 + TokenHelper 封装（复用）
 * 
 * 复用性对比：
 * - 没有 tokenHelper：每个规则都要重复写
 * - 有 tokenHelper：高频逻辑（async function）复用 8 次
 * 
 * 可维护性：
 * - 没有 tokenHelper：修改逻辑要改多处
 * - 有 tokenHelper：只改一处（tokenHelper）
 * 
 * API 设计优势：
 * - 统一入口：this.tokenHelper.xxx()
 * - 无需传参：自动访问 tokens 和 currentIndex
 * - 语义清晰：方法名直接对应规范术语
 */
