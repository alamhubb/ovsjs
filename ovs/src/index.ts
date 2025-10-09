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
import {LogUtil} from "ovs-lsp/src/logutil.ts";
import JsonUtil from "subhuti/src/utils/JsonUtil.ts";

export function traverseClearTokens(currentNode: SubhutiCst) {
  if (!currentNode || !currentNode.children || !currentNode.children.length)
    return currentNode
  // 将当前节点添加到 Map 中
  // 递归遍历子节点
  if (currentNode.children && currentNode.children.length > 0) {
    currentNode.children.forEach(child => traverseClearTokens(child))
  }
  currentNode.tokens = undefined
  return currentNode
}

export function traverseClearLoc(currentNode: SubhutiCst) {
  currentNode.loc = undefined
  if (!currentNode || !currentNode.children || !currentNode.children.length)
    return
  // 将当前节点添加到 Map 中
  // 递归遍历子节点
  if (currentNode.children && currentNode.children.length > 0) {
    currentNode.children.forEach(child => traverseClearLoc(child))
  }
  currentNode.loc = undefined
  return currentNode
}


export interface SourceMapSourceGenerateIndexLength {
  source: number[]
  generate: number[]
  length: number[]
  generateLength: number[]
}

// 同步版本（不格式化，用于 Language Server）
export function vitePluginOvsTransform(code: string): SlimeGeneratorResult {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)

  if (!tokens.length) return {
    code: code,
    mapping: []
  }
  const parser = new OvsParser(tokens)

  let curCst = parser.Program()
  // let outCst = JsonUtil.cloneDeep(curCst)
  // outCst = traverseClearTokens(outCst)
  // traverseClearLoc(outCst)
  // LogUtil.log(outCst)
  const ast = OvsCstToSlimeAstUtil.toProgram(curCst)
  return SlimeGenerator.generator(ast, tokens)
}

// 异步版本（支持格式化，用于 Vite 插件）
export async function vitePluginOvsTransformAsync(code: string, prettify: boolean = false): Promise<SlimeGeneratorResult> {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)

  if (!tokens.length) return {
    code: code,
    mapping: []
  }
  const parser = new OvsParser(tokens)

  let curCst = parser.Program()
  curCst = traverseClearTokens(curCst)
  const ast = OvsCstToSlimeAstUtil.toProgram(curCst)
  const result = SlimeGenerator.generator(ast, tokens)

  // 如果需要格式化
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

export default function vitePluginOvs(): Plugin {
  const filter = createFilter(
    /\.ovs$/,
    null,
  )
  return {
    name: 'vite-plugin-ovs',
    enforce: 'pre',
    async transform(code, id) {
      if (!filter(id)) {
        return
      }
      // 开发模式下启用格式化
      const isDev = process.env.NODE_ENV !== 'production'
      const res = await vitePluginOvsTransformAsync(code, isDev)
      const resCode = `${res.code}`
      return {
        code: resCode,
        map: null
      }
    }
  }
}
