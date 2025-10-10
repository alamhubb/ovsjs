// Vite 插件
import {createFilter, type Plugin} from "vite"
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens.ts";
import OvsParser from "./parser/OvsParser.ts";
import OvsCstToSlimeAstUtil from "./factory/OvsCstToSlimeAstUtil.ts";
import type {SlimeGeneratorResult} from "slime-generator/src/SlimeCodeMapping.ts";
import prettier from 'prettier';
import {
  type SlimeProgram,
  type SlimeStatement,
  type SlimeExpressionStatement,
  type SlimeExpression,
  type SlimeImportDeclaration,
  type SlimeImportDefaultSpecifier,
  SlimeProgramSourceType,
  SlimeVariableDeclarationKindValue
} from "slime-ast/src/SlimeAstInterface.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";

/**
 * 递归清除 CST 节点的 tokens 属性（用于调试）
 * @param currentNode CST 节点
 * @returns 清除后的节点
 */
export function traverseClearTokens(currentNode: SubhutiCst) {
  if (!currentNode || !currentNode.children || !currentNode.children.length)
    return currentNode
  
  // 递归遍历子节点
  if (currentNode.children && currentNode.children.length > 0) {
    currentNode.children.forEach(child => traverseClearTokens(child))
  }
  
  // 清除 tokens 属性
  currentNode.tokens = undefined
  return currentNode
}

/**
 * 递归清除 CST 节点的 loc 属性（用于调试）
 * @param currentNode CST 节点
 * @returns 清除后的节点
 */
export function traverseClearLoc(currentNode: SubhutiCst) {
  if (!currentNode || !currentNode.children || !currentNode.children.length)
    return currentNode
  
  // 递归遍历子节点
  if (currentNode.children && currentNode.children.length > 0) {
    currentNode.children.forEach(child => traverseClearLoc(child))
  }
  
  // 清除 loc 属性
  currentNode.loc = undefined as any
  return currentNode
}


export interface SourceMapSourceGenerateIndexLength {
  source: number[]
  generate: number[]
  length: number[]
  generateLength: number[]
}

/**
 * 判断 statement 是否是声明语句
 * @param node AST 节点
 * @returns 是否是声明
 */
function isDeclaration(node: any): boolean {
  return [
    SlimeAstType.VariableDeclaration,    // const/let/var
    SlimeAstType.VariableStatement,      // 也支持 VariableStatement
    SlimeAstType.FunctionDeclaration,
    SlimeAstType.ClassDeclaration,
    SlimeAstType.ImportDeclaration,
    SlimeAstType.ExportNamedDeclaration,
    SlimeAstType.ExportDefaultDeclaration,
  ].includes(node.type)
}

/**
 * 判断 statement 是否是 OVS 视图的 IIFE
 * @param statement 语句节点
 * @returns 是否是 OVS 视图 IIFE
 */
function isOvsRenderDomViewIIFE(statement: SlimeStatement): boolean {
  if (statement.type !== SlimeAstType.ExpressionStatement) return false
  const expr = (statement as SlimeExpressionStatement).expression
  if (expr.type !== SlimeAstType.CallExpression) return false
  if (expr.callee.type !== SlimeAstType.FunctionExpression) return false
  return true
}

/**
 * 包裹顶层表达式
 * 
 * 规则：
 * 1. Declaration 始终保持顶层
 * 2. 有 export default - 只处理 default，其他不管
 * 3. 没有 export default - 用 IIFE 包裹所有表达式
 * 
 * @param ast Program AST
 * @returns 包裹后的 Program AST
 */
function wrapTopLevelExpressions(ast: SlimeProgram): SlimeProgram {
  const declarations: any[] = []
  const expressions: SlimeStatement[] = []
  let hasExportDefault = false
  
  // 1. 分类
  for (const statement of ast.body) {
    if (statement.type === SlimeAstType.ExportDefaultDeclaration) {
      hasExportDefault = true
      declarations.push(statement)
    } else if (isDeclaration(statement)) {
      declarations.push(statement)
    } else if (statement.type === SlimeAstType.ExpressionStatement) {
      expressions.push(statement as SlimeStatement)
    } else {
      // 其他类型的语句（如 if、for 等）也归类为表达式
      expressions.push(statement as SlimeStatement)
    }
  }
  
  // 2. 如果有 export default，不做包裹
  if (hasExportDefault) {
    return ast
  }
  
  // 3. 如果没有表达式，保持原样
  if (expressions.length === 0) {
    return ast
  }
  
  // 4. 包裹所有表达式
  const iifeBody: SlimeStatement[] = [
    // const children = []
    SlimeAstUtil.createVariableDeclaration(
      SlimeAstUtil.createVariableDeclarationKind(
        SlimeVariableDeclarationKindValue.const,
        undefined
      ),
      [
        SlimeAstUtil.createVariableDeclarator(
          SlimeAstUtil.createIdentifier('children'),
          SlimeAstUtil.createEqualOperator(),
          SlimeAstUtil.createArrayExpression([])
        )
      ]
    )
  ]
  
  // 处理所有表达式
  for (const expr of expressions) {
    if (isOvsRenderDomViewIIFE(expr)) {
      // OVS 视图 → children.push(vnode)
      const vnodeExpr = (expr as SlimeExpressionStatement).expression
      const pushCall = SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createMemberExpression(
          SlimeAstUtil.createIdentifier('children'),
          SlimeAstUtil.createDotOperator(),
          SlimeAstUtil.createIdentifier('push')
        ),
        [vnodeExpr]
      )
      iifeBody.push({
        type: SlimeAstType.ExpressionStatement,
        expression: pushCall
      } as SlimeExpressionStatement)
    } else {
      // 其他表达式保持原样
      iifeBody.push(expr)
    }
  }
  
  // return children
  const returnStatement = SlimeAstUtil.createReturnStatement(
    SlimeAstUtil.createIdentifier('children')
  )
  iifeBody.push(returnStatement)
  
  // 创建 IIFE
  const functionBody = SlimeAstUtil.createBlockStatement(
    SlimeAstUtil.creatLBrace(),
    SlimeAstUtil.createRBrace(),
    iifeBody
  )
  
  const functionParams = SlimeAstUtil.createFunctionParams(
    SlimeAstUtil.createLParen(),
    SlimeAstUtil.createRParen()
  )
  
  const functionExpression = SlimeAstUtil.createFunctionExpression(
    functionBody,
    null,  // 匿名函数
    functionParams
  )
  
  const iife = SlimeAstUtil.createCallExpression(functionExpression, [])
  
  const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(iife)
  
  // 返回新的 Program
  return SlimeAstUtil.createProgram(
    [...declarations, exportDefault] as any,
    SlimeProgramSourceType.module
  )
}

/**
 * 自动添加 OvsAPI 的 import 语句（如果不存在）
 * @param ast Program AST
 * @returns 添加了 import 的 Program AST
 */
function ensureOvsAPIImport(ast: SlimeProgram): SlimeProgram {
  // 检查是否已经导入了 OvsAPI
  let hasImportOvsAPI = false
  
  for (const statement of ast.body) {
    if (statement.type === SlimeAstType.ImportDeclaration) {
      const importDecl = statement as SlimeImportDeclaration
      const defaultSpecifiers = importDecl.specifiers.filter(
        spec => spec.type === SlimeAstType.ImportDefaultSpecifier
      ) as SlimeImportDefaultSpecifier[]
      
      hasImportOvsAPI = defaultSpecifiers.some(spec => spec.local.name === 'OvsAPI')
      if (hasImportOvsAPI) break
    }
  }
  
  // 如果没有导入，添加 import OvsAPI
  if (!hasImportOvsAPI) {
    const ovsImport = SlimeAstUtil.createImportDeclaration(
      [SlimeAstUtil.createImportDefaultSpecifier(SlimeAstUtil.createIdentifier('OvsAPI'))],
      SlimeAstUtil.createFromKeyword(),
      SlimeAstUtil.createStringLiteral('ovsjs/src/OvsAPI')
    )
    
    // 设置换行标记
    if (ovsImport.loc) {
      ovsImport.loc.newLine = true
    }
    
    // 添加到 body 最前面
    ast.body.unshift(ovsImport)
  }
  
  return ast
}

/**
 * OVS 代码转换主函数
 * @param code OVS 源代码
 * @param filename 文件名（用于生成组件名称）
 * @param prettify 是否使用 Prettier 格式化
 * @returns 转换结果（包含代码和 source map）
 * 
 * 转换流程：
 * 1. 词法分析：code → tokens
 * 2. 语法分析：tokens → CST
 * 3. 语法转换：CST → AST（OVS 语法 → JavaScript AST）
 * 4. 添加 import：自动添加 OvsAPI import
 * 5. 组件包装：AST → Vue 组件 AST
 * 6. 代码生成：AST → code
 * 7. 代码格式化：使用 Prettier（可选）
 */
export async function vitePluginOvsTransform(
  code: string, 
  filename?: string,
  prettify: boolean = true
): Promise<SlimeGeneratorResult> {
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)

  // 空代码直接返回
  if (!tokens.length) {
    return {
      code: code,
      mapping: []
    }
  }

  // 2. 语法分析：tokens → CST
  const parser = new OvsParser(tokens)
  let curCst = parser.Program()

  // 3. 语法转换：CST → AST（OVS 语法 → JavaScript AST）
  let ast = OvsCstToSlimeAstUtil.toProgram(curCst)

  // 4. 添加 import：自动添加 OvsAPI import（如果不存在）
  ast = ensureOvsAPIImport(ast)

  // 5. 包裹顶层表达式：根据是否有 export default 决定是否包裹
  ast = wrapTopLevelExpressions(ast)

  // 6. 代码生成：AST → code
  const result = SlimeGenerator.generator(ast, tokens)

  // 7. 代码格式化（可选）
  if (prettify) {
    try {
      result.code = await prettier.format(result.code, {
        parser: 'babel',
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        printWidth: 80
      })
    } catch (e) {
      console.warn('OVS code formatting failed:', e)
    }
  }

  return result
}

/**
 * Vite 插件：处理 .ovs 文件
 * @returns Vite 插件配置
 * 
 * 功能：
 * - 拦截 .ovs 文件
 * - 转换为 Vue 函数组件
 * - 开发模式下启用 Prettier 格式化
 */
export default function vitePluginOvs(): Plugin {
  // 创建文件过滤器：只处理 .ovs 文件
  const filter = createFilter(/\.ovs$/, null)
  
  return {
    name: 'vite-plugin-ovs',
    enforce: 'pre',  // 在其他插件之前执行
    
    async transform(code, id) {
      // 只处理 .ovs 文件
      if (!filter(id)) {
        return
      }
      
      // 开发模式下启用格式化（提升开发体验）
      const isDev = process.env.NODE_ENV !== 'production'
      
      // 转换 OVS 代码，传递文件名用于生成组件名称
      const res = await vitePluginOvsTransform(code, id, isDev)
      
      return {
        code: res.code,
        map: null  // TODO: 支持 source map
      }
    }
  }
}
