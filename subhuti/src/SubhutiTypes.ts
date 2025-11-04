/**
 * Subhuti Types - 数据结构定义
 * 
 * 包含：
 * - SubhutiCst: CST节点类
 * - SubhutiMatchToken: Token数据类
 * - SubhutiCreateToken: Token定义类及创建工具
 * 
 * @version 2.0.0 - 文件合并重构
 * @date 2025-11-04
 */

// ============================================
// [1] CST 相关类型和类
// ============================================

/**
 * 源码位置信息
 */
export interface SubhutiSourceLocation {
  value?: string;
  newLine?: boolean;
  type?: string;
  start: SubhutiPosition;
  end: SubhutiPosition;
  filename?: string;
  identifierName?: string | undefined | null;
}

/**
 * 位置信息
 */
export interface SubhutiPosition {
  index: number;
  line: number;
  column: number;
}

/**
 * CST节点类
 * 
 * Concrete Syntax Tree - 完整保留源码结构的语法树
 */
export class SubhutiCst {
  name: string;
  children?: SubhutiCst[]
  loc: SubhutiSourceLocation
  value?: string;

  constructor(cst?: SubhutiCst) {
    if (cst) {
      this.name = cst.name;
      this.children = cst.children;
      this.value = cst.value;
    }
  }
  
  // ========================================
  // 辅助方法（简化 CST 访问）
  // ========================================
  
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
  getChild(name: string, index: number = 0): SubhutiCst | undefined {
    if (!this.children) return undefined
    
    const matches = this.children.filter(c => c.name === name)
    return matches[index]
  }
  
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
  getChildren(name: string): SubhutiCst[] {
    if (!this.children) return []
    
    return this.children.filter(c => c.name === name)
  }
  
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
  getToken(tokenName: string): SubhutiCst | undefined {
    if (!this.children) return undefined
    
    return this.children.find(c => c.name === tokenName && c.value !== undefined)
  }
  
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
  hasChild(name: string): boolean {
    if (!this.children) return false
    
    return this.children.some(c => c.name === name)
  }
  
  /**
   * 获取子节点数量
   */
  get childCount(): number {
    return this.children?.length || 0
  }
  
  /**
   * 是否为叶子节点（token 节点）
   */
  get isToken(): boolean {
    return this.value !== undefined
  }
  
  /**
   * 是否为空节点（无子节点）
   */
  get isEmpty(): boolean {
    return !this.children || this.children.length === 0
  }
}

// ============================================
// [2] MatchToken - Token数据类
// ============================================

/**
 * 匹配的Token类
 * 
 * 由Lexer生成，包含token的类型、值、位置等信息
 */
export class SubhutiMatchToken {
  tokenName: string;
  tokenValue: string;
  rowNum?: number;
  columnStartNum?: number;
  columnEndNum?: number;
  index?: number

  constructor(osvToken: SubhutiMatchToken) {
    this.tokenName = osvToken.tokenName;
    this.tokenValue = osvToken.tokenValue;
    this.rowNum = osvToken.rowNum;
    this.columnStartNum = osvToken.columnStartNum;
    this.columnEndNum = osvToken.columnEndNum;
    this.index = osvToken.index;
  }
}

/**
 * 创建MatchToken的工具函数
 */
export function createMatchToken(osvToken: SubhutiMatchToken) {
  return new SubhutiMatchToken(osvToken);
}

// ============================================
// [3] CreateToken - Token定义类及创建工具
// ============================================

/**
 * Token分组类型
 */
export enum SubhutiCreateTokenGroupType {
  skip = 'skip'
}

/**
 * Token定义类
 * 
 * 用于定义词法规则，由Lexer使用
 */
export class SubhutiCreateToken {
  name: string;
  type: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  group?: string;
  value?: string;
  categories?: any;

  constructor(ovsToken: SubhutiCreateToken) {
    this.name = ovsToken.name;
    this.type = ovsToken.name;
    this.pattern = ovsToken.pattern
    if (ovsToken.value) {
      this.value = ovsToken.value
    } else {
      this.value = emptyValue
    }
    this.isKeyword = false;
    this.group = ovsToken.group;
  }
}

/**
 * 空值常量
 */
export const emptyValue = 'Error:CannotUseValue'

/**
 * 创建Token定义
 */
export function createToken(osvToken: SubhutiCreateToken) {
  return new SubhutiCreateToken(osvToken);
}

/**
 * 创建关键字Token
 * 
 * @param name Token名称
 * @param pattern 关键字字符串
 * @returns Token定义
 * 
 * 用法：
 * ```typescript
 * const ifToken = createKeywordToken('IfTok', 'if')
 * ```
 */
export function createKeywordToken(name: string, pattern: string): SubhutiCreateToken {
  const token = new SubhutiCreateToken({name: name, pattern: new RegExp(pattern), value: pattern});
  token.isKeyword = true;
  return token;
}

/**
 * 创建正则表达式Token
 * 
 * @param name Token名称
 * @param pattern 正则表达式
 * @returns Token定义
 * 
 * 用法：
 * ```typescript
 * const identifierToken = createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/)
 * ```
 */
export function createRegToken(name: string, pattern: RegExp) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern, value: pattern.source});
  return token;
}

/**
 * 创建带值的正则Token
 * 
 * @param name Token名称
 * @param pattern 正则表达式
 * @param value Token值
 * @param group Token分组（如'skip'）
 * @returns Token定义
 */
export function createValueRegToken(name: string, pattern: RegExp, value: string, group?: string) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern, value: value, group: group});
  return token;
}

/**
 * 创建空值正则Token
 * 
 * @param name Token名称
 * @param pattern 正则表达式
 * @returns Token定义
 */
export function createEmptyValueRegToken(name: string, pattern: RegExp) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern});
  return token;
}

// ============================================
// Default Export (兼容性)
// ============================================

/**
 * 默认导出SubhutiCst（保持向后兼容）
 * 
 * 使用方式：
 * import SubhutiCst from './SubhutiTypes.ts'  // 获取SubhutiCst类
 * import { SubhutiMatchToken, SubhutiCreateToken } from './SubhutiTypes.ts'  // 获取其他类
 */
export default SubhutiCst

