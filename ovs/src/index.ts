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
  SlimeProgramSourceType
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
 * 从文件名提取组件名称（PascalCase）
 * @param filename 文件路径，如 'src/components/hello-world.ovs'
 * @returns 组件名称，如 'HelloWorld'
 * 
 * 转换规则：
 * - hello.ovs → Hello
 * - my-component.ovs → MyComponent
 * - hello_world.ovs → HelloWorld
 */
function getComponentName(filename?: string): string {
  if (!filename) return 'Component'
  
  // 提取文件名（去掉路径和扩展名）
  const basename = filename
    .split('/').pop()           // 处理 Unix 路径
    ?.split('\\').pop()         // 处理 Windows 路径
    ?.replace(/\.ovs$/, '')     // 去掉 .ovs 扩展名
    || 'Component'
  
  // 转换为 PascalCase
  // 按 - 或 _ 分割，每个单词首字母大写
  return basename
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * 判断语句是否是 OvsRenderDomViewDeclaration 生成的 IIFE
 * @param statement AST 语句节点
 * @returns 是否是渲染元素的 IIFE
 * 
 * 识别模式：
 * ExpressionStatement {
 *   expression: CallExpression {
 *     callee: FunctionExpression { ... }
 *   }
 * }
 */
function isOvsRenderDomViewIIFE(statement: SlimeStatement): boolean {
  // 必须是 ExpressionStatement
  if (statement.type !== SlimeAstType.ExpressionStatement) {
    return false
  }
  
  const expr = (statement as SlimeExpressionStatement).expression
  
  // 必须是 CallExpression
  if (expr.type !== SlimeAstType.CallExpression) {
    return false
  }
  
  // callee 必须是 FunctionExpression（IIFE 的特征）
  if (expr.callee.type !== SlimeAstType.FunctionExpression) {
    return false
  }
  
  return true
}

/**
 * 将 AST 包装为 Vue 函数组件
 * @param ast 原始的 Program AST
 * @param filename 文件名，用于生成组件名称
 * @returns 包装后的 Program AST
 * 
 * 转换逻辑：
 * 1. 分类 body 中的语句：
 *    - ImportDeclaration → 保留在顶层
 *    - OvsRenderDomViewDeclaration (IIFE) → 提取为渲染元素
 *    - 其他语句 → 放入组件函数内
 * 2. 创建函数组件：
 *    export default function ComponentName() {
 *      ...topLevelCode
 *      return renderElements
 *    }
 */
function wrapAsVueComponent(ast: SlimeProgram, filename?: string): SlimeProgram {
  const componentName = getComponentName(filename)
  
  // 分类 body 中的语句
  const imports: any[] = []                      // import 语句
  const topLevelCode: SlimeStatement[] = []      // 顶层代码（const、function 等）
  const renderElements: SlimeExpression[] = []   // 渲染元素（IIFE）
  
  for (const statement of ast.body) {
    if (statement.type === SlimeAstType.ImportDeclaration) {
      // import 语句保留在顶层
      imports.push(statement)
    } else if (isOvsRenderDomViewIIFE(statement as SlimeStatement)) {
      // OvsRenderDomViewDeclaration 生成的 IIFE，提取表达式
      const expr = (statement as SlimeExpressionStatement).expression
      renderElements.push(expr)
    } else {
      // 其他语句放入组件函数内
      topLevelCode.push(statement as SlimeStatement)
    }
  }
  
  // 创建 return 语句
  const returnStatement = SlimeAstUtil.createReturnStatement(
    renderElements.length === 1
      ? renderElements[0]  // 单个元素直接返回
      : SlimeAstUtil.createArrayExpression(renderElements)  // 多个元素返回数组
  )
  
  // 创建函数体：{ ...topLevelCode, return ... }
  const functionBody = SlimeAstUtil.createBlockStatement(
    SlimeAstUtil.creatLBrace(),
    SlimeAstUtil.createRBrace(),
    [
      ...topLevelCode,  // 顶层代码
      returnStatement   // return 语句
    ]
  )
  
  // 创建函数参数（空参数）
  const functionParams = SlimeAstUtil.createFunctionParams(
    SlimeAstUtil.createLParen(),
    SlimeAstUtil.createRParen()
  )
  
  // 创建函数表达式：function() { ... }
  const functionExpression = SlimeAstUtil.createFunctionExpression(
    functionBody,
    SlimeAstUtil.createIdentifier(componentName),  // 函数名
    functionParams
  )
  
  // 创建 export default
  const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(functionExpression)
  
  // 返回新的 Program
  return SlimeAstUtil.createProgram(
    [...imports, exportDefault] as any,
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

  // 5. 组件包装：将顶层代码包装为 Vue 函数组件
  ast = wrapAsVueComponent(ast, filename)

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
