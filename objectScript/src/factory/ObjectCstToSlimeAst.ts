import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import {
  type SlimeClassDeclaration,
  type SlimeClassBody,
  type SlimeVariableDeclaration,
  type SlimeIdentifier,
  type SlimeStatement,
  type SlimeDeclaration,
  SlimeVariableDeclarationKindValue,
  type SlimeExpression,
  type SlimeProgram,
  type SlimeModuleDeclaration,
  type SlimePropertyDefinition
} from "slime-ast/src/SlimeAstInterface.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import ObjectScriptParser from "../parser/ObjectScriptParser.ts";
import {SubhutiUtil} from "subhuti/src/parser/SubhutiParser.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";

export function checkCstName(cst: SubhutiCst, cstName: string) {
  if (cst.name !== cstName) {
    throw new Error(`Expected CST name '${cstName}', but got '${cst.name}'`)
  }
  return cstName
}

/**
 * ObjectScript CST 到 Slime AST 转换器
 * 
 * 核心功能：将 object 声明转换为临时类 + 实例化
 * 
 * 转换示例：
 * ```
 * // 输入 CST
 * object Person {
 *   name = "Alice"
 *   greet() { return "Hello" }
 * }
 * 
 * // 输出 AST（两个语句）
 * class $$OsClassPerson_a1b2c3d4 {
 *   name = "Alice"
 *   greet() { return "Hello" }
 * }
 * const Person = new $$OsClassPerson_a1b2c3d4()
 * ```
 */
export class ObjectCstToSlimeAst extends SlimeCstToAst {
  /**
   * 重写 toProgram 以支持 ObjectDeclaration
   * 
   * 因为一个 ObjectDeclaration 会生成两个 AST 节点（class + const），
   * 所以需要在这里展平处理
   */
  toProgram(cst: SubhutiCst): SlimeProgram {
    checkCstName(cst, Es2025Parser.prototype.Program.name);
    
    const first = cst.children?.[0]
    if (!first) {
      throw new Error('Program has no children')
    }
    
    let bodyStatements: Array<SlimeStatement | SlimeModuleDeclaration> = []
    
    if (first.name === Es2025Parser.prototype.ModuleItemList.name) {
      bodyStatements = this.createModuleItemListAst(first)
    } else if (first.name === Es2025Parser.prototype.StatementList.name) {
      bodyStatements = this.createStatementListAst(first)
    }
    
    // 展平：将可能的双节点数组展开
    const flatBody: Array<SlimeStatement | SlimeModuleDeclaration> = []
    for (const item of bodyStatements) {
      if (Array.isArray(item)) {
        // 如果是数组（来自 ObjectDeclaration），展平
        flatBody.push(...item)
      } else {
        flatBody.push(item)
      }
    }
    
    const program = SlimeAstUtil.createProgram(flatBody, 'module' as any)
    program.loc = cst.loc
    return program
  }

  /**
   * 重写 createDeclarationAst 以支持 ObjectDeclaration
   * 
   * 注意：这里返回 any 类型，因为 ObjectDeclaration 需要返回数组（两个节点）
   */
  createDeclarationAst(cst: SubhutiCst): any {
    // 首先检查第一个子节点
    const first = cst.children?.[0]
    if (!first) {
      return super.createDeclarationAst(cst)
    }
    
    // 检查是否是 ObjectDeclaration
    if (first.name === ObjectScriptParser.prototype.ObjectDeclaration.name) {
      return this.createObjectDeclarationAst(first)
    }
    
    // 其他声明类型交给父类处理
    return super.createDeclarationAst(cst)
  }

  /**
   * 转换 ObjectDeclaration 为 ClassDeclaration + VariableDeclaration
   * 
   * CST 结构：
   * ObjectDeclaration
   *   ├── ObjectToken (token: "object")
   *   ├── BindingIdentifier (对象名)
   *   ├── ObjectHeritage? (extends ...)
   *   ├── LBrace
   *   ├── ObjectBody? (属性和方法)
   *   └── RBrace
   * 
   * @param cst ObjectDeclaration CST 节点
   * @returns [ClassDeclaration, VariableDeclaration] 两个 AST 节点的数组
   */
  createObjectDeclarationAst(cst: SubhutiCst): [SlimeClassDeclaration, SlimeVariableDeclaration] {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectDeclaration.name)
    
    // 1. 提取对象名（BindingIdentifier）
    // BindingIdentifier 本身是一个规则，其children[0]是Identifier token
    const nameNode = cst.children?.find(child => 
      child.name === 'BindingIdentifier'
    )
    if (!nameNode) {
      throw new Error('ObjectDeclaration: 缺少对象名')
    }
    // BindingIdentifier的第一个子节点是Identifier token
    const identifierToken = nameNode.children?.[0]
    if (!identifierToken) {
      throw new Error('ObjectDeclaration: BindingIdentifier没有Identifier token')
    }
    const objectName = identifierToken.value || identifierToken.name
    
    // 2. 生成临时类名（使用 UUID）
    const uuid = SubhutiUtil.generateUUID()
    const tempClassName = `$$OsClass${objectName}_${uuid}`
    const tempClassId = SlimeAstUtil.createIdentifier(tempClassName, cst.loc)
    
    // 3. 提取继承信息（ObjectHeritage）
    const heritageNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectHeritage.name
    )
    let superClass: SlimeExpression | undefined = undefined
    if (heritageNode) {
      // ObjectHeritage: ExtendsTok + BindingIdentifier
      const superClassNode = heritageNode.children?.find(child => 
        child.name === 'BindingIdentifier'
      )
      if (superClassNode) {
        // BindingIdentifier的第一个子节点是Identifier token
        const superIdToken = superClassNode.children?.[0]
        if (superIdToken) {
          const superClassName = superIdToken.value || superIdToken.name
          superClass = SlimeAstUtil.createIdentifier(superClassName, superIdToken.loc)
        }
      }
    }
    
    // 4. 提取对象体（ObjectBody）
    const bodyNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectBody.name
    )
    const classBody = bodyNode 
      ? this.createObjectBodyAst(bodyNode)
      : this.createEmptyClassBody()
    
    // 5. 创建 ClassDeclaration AST
    const classDecl: SlimeClassDeclaration = {
      type: 'ClassDeclaration' as any,
      id: tempClassId,
      superClass: superClass,
      body: classBody,
      loc: cst.loc
    }
    
    // 6. 创建 VariableDeclaration AST: const objectName = new tempClassName()
    const varDecl = SlimeAstUtil.createVariableDeclaration(
      SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, cst.loc),
      [
        SlimeAstUtil.createVariableDeclarator(
          SlimeAstUtil.createIdentifier(objectName, cst.loc),
          SlimeAstUtil.createEqualOperator(cst.loc),
          // new tempClassName()
          {
            type: 'NewExpression',
            callee: SlimeAstUtil.createIdentifier(tempClassName, cst.loc),
            arguments: [], // 无参数
            loc: cst.loc
          } as any
        )
      ],
      cst.loc
    )
    
    // 7. 返回两个 AST 节点
    return [classDecl, varDecl]
  }

  /**
   * 转换 ObjectBody 为 ClassBody
   * 
   * CST 结构：
   * ObjectBody
   *   └── ObjectElementList
   *       ├── ObjectElement (方法或属性)
   *       ├── ObjectElement
   *       └── ...
   */
  createObjectBodyAst(cst: SubhutiCst): SlimeClassBody {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectBody.name)
    
    // 查找 ObjectElementList
    const elementListNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectElementList.name
    )
    
    if (!elementListNode) {
      return this.createEmptyClassBody()
    }
    
    // 转换所有元素
    const elements = this.createObjectElementListAst(elementListNode)
    
    return {
      type: 'ClassBody' as any,
      body: elements,
      loc: cst.loc
    }
  }

  /**
   * 转换 ObjectElementList 为 ClassBody 元素数组
   */
  createObjectElementListAst(cst: SubhutiCst): Array<any> {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectElementList.name)
    
    const elements: Array<any> = []
    
    // 遍历所有 ObjectElement
    for (const child of cst.children || []) {
      if (child.name === ObjectScriptParser.prototype.ObjectElement.name) {
        const element = this.createObjectElementAst(child)
        if (element) {
          elements.push(element)
        }
      }
    }
    
    return elements
  }

  /**
   * 转换 ObjectElement（单个属性或方法）
   * 
   * ObjectElement 可以是：
   * - MethodDefinition（方法）
   * - ObjectPropertyAssignment（属性赋值）
   * - EmptySemicolon（空分号，忽略）
   */
  createObjectElementAst(cst: SubhutiCst): any {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectElement.name)
    
    const child = cst.children?.[0]
    if (!child) {
      return null
    }
    
    // 方法定义（继承自 ES6）
    if (child.name === 'MethodDefinition') {
      // createMethodDefinitionAst 需要两个参数：(staticCst, cst)
      // 第一个参数是 static 关键字节点（object不支持static，传null）
      // 第二个参数是 MethodDefinition CST 节点
      return this.createMethodDefinitionAst(null, child)
    }
    
    // 属性赋值（ObjectScript 特有）
    if (child.name === ObjectScriptParser.prototype.ObjectPropertyAssignment.name) {
      return this.createObjectPropertyAssignmentAst(child)
    }
    
    // EmptySemicolon（忽略）
    if (child.name === 'EmptySemicolon') {
      return null
    }
    
    throw new Error(`ObjectElement: 不支持的子节点类型 '${child.name}'`)
  }

  /**
   * 转换 ObjectPropertyAssignment 为 PropertyDefinition
   * 
   * CST 结构：
   * ObjectPropertyAssignment
   *   ├── BindingIdentifier (属性名)
   *   ├── Eq (=)
   *   └── AssignmentExpression (值)
   * 
   * 转换为：PropertyDefinition
   *   key: Identifier
   *   value: Expression
   */
  createObjectPropertyAssignmentAst(cst: SubhutiCst): SlimePropertyDefinition {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectPropertyAssignment.name)
    
    // 1. 提取属性名
    const nameNode = cst.children?.find(child => 
      child.name === 'BindingIdentifier'
    )
    if (!nameNode) {
      throw new Error('ObjectPropertyAssignment: 缺少属性名')
    }
    // BindingIdentifier的第一个子节点是Identifier token
    const keyToken = nameNode.children?.[0]
    if (!keyToken) {
      throw new Error('ObjectPropertyAssignment: BindingIdentifier没有Identifier token')
    }
    const keyName = keyToken.value || keyToken.name
    const key = SlimeAstUtil.createIdentifier(keyName, keyToken.loc)
    
    // 2. 提取属性值
    const valueNode = cst.children?.find(child => 
      child.name === 'AssignmentExpression'
    )
    if (!valueNode) {
      throw new Error('ObjectPropertyAssignment: 缺少属性值')
    }
    const value = this.createAssignmentExpressionAst(valueNode)
    
    // 3. 创建 PropertyDefinition
    return SlimeAstUtil.createPropertyDefinition(key, value, false)
  }

  /**
   * 创建空的 ClassBody
   */
  createEmptyClassBody(): SlimeClassBody {
    return {
      type: 'ClassBody' as any,
      body: [],
      loc: undefined
    }
  }
}

// 导出单例实例
const ObjectCstToSlimeAstUtil = new ObjectCstToSlimeAst()
export default ObjectCstToSlimeAstUtil

