import SubhutiMatchToken from "./SubhutiMatchToken.ts";

export interface SubhutiSourceLocation {
  // index?: number;
  value?: string;
  newLine?: boolean;
  type?: string;
  start: SubhutiPosition;
  end: SubhutiPosition;
  filename?: string;
  identifierName?: string | undefined | null;
}

export interface SubhutiPosition {
  index: number;
  line: number;
  column: number;
}

export default class SubhutiCst {
  // pathName: string;
  name: string;
  children?: SubhutiCst[]
  loc: SubhutiSourceLocation
  value?: string;

  constructor(cst?: SubhutiCst) {
    if (cst) {
      this.name = cst.name;
      // this.pathName = cst.pathName;
      this.children = cst.children;
      this.value = cst.value;
    }
  }
  
  // ========================================
  // 辅助方法（新增 - 简化 CST 访问）
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
