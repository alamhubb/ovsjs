import SubhutiCst from "subhuti/src/struct/SubhutiCst";
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";
import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import SlimeCstToAstUtil from "slime-parser/src/language/SlimeCstToAstUtil";

export function traverseClearTokens(currentNode: SubhutiCst) {
  if (!currentNode || !currentNode.children || !currentNode.children.length)
    return
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

export function vitePluginOvsTransform(code) {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  if (!tokens.length) return code
  const parser = new Es6Parser(tokens)

  let code1 = null
  let curCst = parser.Program()
  curCst = traverseClearTokens(curCst)
  // curCst = traverseClearLoc(curCst)
  // JsonUtil.log(7777)
  // curCst = traverseClearTokens(curCst)
  JsonUtil.log(curCst)
  const ast = SlimeCstToAstUtil.toProgram(curCst)
  JsonUtil.log(ast)
  const code11 = SlimeGenerator.generator(ast, tokens)
  console.log(code11.code)
  console.log(code11.mapping)
}

const code = `let abd=1`


const res = vitePluginOvsTransform(code)
