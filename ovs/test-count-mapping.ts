/**
 * 测试用户报告的具体问题：count.value++;console.log()
 */
import { vitePluginOvsTransform } from './src/index.ts';

const code = 'count.value++;console.log()';
console.log('\n原始代码:', code);
console.log('位置标记: 0123456789012345678901234567');
console.log('           count.value++;console.log()');
console.log('                       ↑');
console.log('                    console位置14');

const result = vitePluginOvsTransform(code);
console.log('\n编译后:', result.code.replace(/\n/g, '\\n'));

console.log('\n所有 Mapping:');
result.mapping.forEach((m, i) => {
  if (m.source?.value && m.generate) {
    const actual = result.code.substring(m.generate.index, m.generate.index + m.source.value.length);
    const match = actual === m.source.value ? '✅' : '❌';
    console.log(`  [${i}] "${m.source.value}" source[${m.source.index}] → gen[${m.generate.index}] = "${actual}" ${match}`);
  }
});

// 重点检查 console
const consoleMap = result.mapping.find(m => m.source?.value === 'console');
if (consoleMap) {
  console.log(`\n🔍 重点检查 'console':`);
  console.log(`  原始位置: ${consoleMap.source.index} (应该是14)`);
  console.log(`  映射位置: ${consoleMap.generate.index}`);
  
  const start = Math.max(0, consoleMap.generate.index - 10);
  const end = Math.min(result.code.length, consoleMap.generate.index + 20);
  console.log(`  附近代码: "${result.code.substring(start, end).replace(/\n/g, '\\n')}"`);
  console.log(`             ${''.padStart(10, ' ')}↑ 这里应该是 'console'`);
  
  // 找到实际的 console 位置
  const actualConsolePos = result.code.indexOf('console');
  console.log(`\n  实际 'console' 在位置: ${actualConsolePos}`);
  console.log(`  mapping 指向位置: ${consoleMap.generate.index}`);
  console.log(`  差值: ${consoleMap.generate.index - actualConsolePos}`);
}

