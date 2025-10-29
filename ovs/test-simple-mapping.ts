/**
 * 最简单的 mapping 测试
 * 测试 OVS 原始代码到编译代码的 mapping
 */
import { vitePluginOvsTransform } from './src/index.ts';

// 最简单的测试：两个语句
const code1 = 'let a = 1';
console.log('\n测试 1：单语句');
console.log('原始代码:', code1);

const result1 = vitePluginOvsTransform(code1);
console.log('编译后:', result1.code.replace(/\n/g, '\\n'));
console.log('\nMapping:');
result1.mapping.forEach((m, i) => {
  if (m.source?.value && m.generate) {
    const actual = result1.code.substring(m.generate.index, m.generate.index + m.source.value.length);
    console.log(`  [${i}] "${m.source.value}" source[${m.source.index}] → gen[${m.generate.index}] = "${actual}" ${actual === m.source.value ? '✅' : '❌'}`);
  }
});

// 测试 2：两个语句（用户报告的情况）
const code2 = 'let a = 1;let b = 2';
console.log('\n\n测试 2：两个语句（有分号）');
console.log('原始代码:', code2);
console.log('位置标记: 0123456789012345678');
console.log('           let a = 1;let b = 2');
console.log('                     ↑');
console.log('                  分号位置9');

const result2 = vitePluginOvsTransform(code2);
console.log('\n编译后:', result2.code.replace(/\n/g, '\\n'));
console.log('\nMapping:');
result2.mapping.forEach((m, i) => {
  if (m.source?.value && m.generate) {
    const actual = result2.code.substring(m.generate.index, m.generate.index + m.source.value.length);
    const match = actual === m.source.value ? '✅' : '❌';
    console.log(`  [${i}] "${m.source.value}" source[${m.source.index}] → gen[${m.generate.index}] = "${actual}" ${match}`);
    
    if (!match) {
      // 显示错误位置附近的代码
      const start = Math.max(0, m.generate.index - 5);
      const end = Math.min(result2.code.length, m.generate.index + 15);
      console.log(`       错误！附近代码: "${result2.code.substring(start, end).replace(/\n/g, '\\n')}"`);
    }
  }
});

// 检查第二个 let 的映射
const letMapping = result2.mapping.filter(m => m.source?.value === 'let');
if (letMapping.length >= 2) {
  console.log(`\n🔍 重点检查第二个 'let':`);
  const m = letMapping[1];
  console.log(`  原始代码中位置: ${m.source.index} (应该是10)`);
  console.log(`  编译后位置: ${m.generate.index}`);
  const actual = result2.code.substring(m.generate.index, m.generate.index + 3);
  console.log(`  实际字符: "${actual}" ${actual === 'let' ? '✅' : '❌'}`);
}

