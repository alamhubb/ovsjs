import OvsParser from './ovs/ovs-compiler/src/parser/OvsParser.ts';

// 测试 OVS 属性语法
const tests = [
  // 基础
  `export class Test { render() { return button { "hello" } } }`,
  // 空属性
  `export class Test { render() { return button() { "hello" } } }`,
  // 带 class 属性 - 使用 = 语法
  `export class Test { render() { return button(class = "test") { "hello" } } }`,
  // 带 class 属性 - 使用 : 语法（标准对象）
  `export class Test { render() { return button({ class: "test" }) { "hello" } } }`,
];

for (let i = 0; i < tests.length; i++) {
  const code = tests[i];
  console.log(`\nTest ${i + 1}:`);
  console.log(code);
  try {
    const parser = new OvsParser(code);
    const result = parser.Program();
    console.log('✅ Parse success');
  } catch (e: any) {
    console.log('❌ Parse error:', e.message.substring(0, 150));
  }
}
