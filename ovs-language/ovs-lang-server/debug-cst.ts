import { SubhutiLexer } from "../../subhuti/src/lexer/SubhutiLexer"
import { ovs6Tokens } from "../../slime/packages/slime-parser/src/language/ovstoken"
import { OvsParser } from "../../slime/packages/slime-parser/src/language/OvsParser"
import { OvsTokenConsumer } from "../../slime/packages/slime-parser/src/language/OvsTokenConsumer"

const code = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

console.log('阶段1: 词法分析')
const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(code)
console.log('✅ 词法分析成功, tokens数量:', tokens.length)

console.log('\n阶段2: 语法分析')
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()
console.log('✅ 语法分析完成')

// 查找所有空children的PropertyDefinition
function findEmptyPropertyDefinition(node: any, path = ''): void {
  if (!node) return
  
  const currentPath = path ? `${path} > ${node.name}` : node.name
  
  if (node.name === 'PropertyDefinition') {
    if (!node.children || node.children.length === 0) {
      console.log('\n❌ 发现空PropertyDefinition:')
      console.log('路径:', currentPath)
      console.log('tokens:', node.tokens?.map((t: any) => t.type + ':' + t.value).join(', '))
      console.log('完整节点:', JSON.stringify(node, null, 2))
    }
  }
  
  if (node.children) {
    node.children.forEach((child: any) => findEmptyPropertyDefinition(child, currentPath))
  }
}

console.log('\n阶段3: 检查CST结构')
findEmptyPropertyDefinition(cst)

console.log('\n✅ 诊断完成')

