// 直接测试 OvsParser 的 Declaration 方法
import OvsParser from './ovs/ovs-compiler/src/parser/OvsParser.ts';

const code = `view Test() { div { 'hello' } }`;
console.log('Testing code:', code);

const parser = new OvsParser(code);

// 检查 Declaration 方法
console.log('\nOvsParser.prototype.Declaration:', OvsParser.prototype.Declaration);
console.log('Declaration name:', OvsParser.prototype.Declaration?.name);

// 尝试解析
try {
  const cst = parser.Program();
  console.log('\nParsing succeeded!');
  console.log('CST root:', cst?.name);
  console.log('First child:', cst?.children?.[0]?.name);
} catch (e) {
  console.error('\nParsing failed:', e.message);
}
