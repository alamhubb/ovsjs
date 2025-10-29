/**
 * 渐进式测试 OVS 转换方法
 * 
 * 测试三个方法：
 * 1. vitePluginOvsTransform - 同步，无格式化
 * 2. vitePluginOvsTransformWithBeautify - 同步，带格式化（保持 mapping）
 * 3. vitePluginOvsTransformAsync - 异步，Prettier 格式化
 */
import { 
  vitePluginOvsTransform, 
  vitePluginOvsTransformWithBeautify 
} from './src/index.ts';

console.log('\n' + '='.repeat(80));
console.log('🚀 渐进式测试 OVS 转换方法');
console.log('='.repeat(80));

// ===== 测试 1：用户报告的问题 =====
console.log('\n📝 测试：count.value++;console.log() 的 mapping');
console.log('='.repeat(80));

const testCode = `count.value++;console.log('计数器：',count.value);`;

console.log('\n原始代码：');
console.log(testCode);
console.log('\n分析位置：');
console.log('c o u n t . v a l u e + + ; c o n s o l e . l o g ( ...');
console.log('0 1 2 3 4 5 6 7 8 9 101112131415161718192021222324...');
console.log('                        ↑  ↑');
console.log('                    分号13  console14');

// 步骤 1：测试无格式化版本
console.log('\n' + '-'.repeat(80));
console.log('步骤 1：vitePluginOvsTransform（无格式化）');
console.log('-'.repeat(80));

const result1 = vitePluginOvsTransform(testCode);

console.log('\n生成的代码：');
console.log(result1.code.replace(/\n/g, '\\n'));

console.log('\nMapping 详情：');
result1.mapping.forEach((map, i) => {
  if (map.source && map.generate && map.source.value) {
    const sourceVal = map.source.value;
    const genIndex = map.generate.index;
    const actualChar = result1.code.substring(genIndex, genIndex + sourceVal.length);
    const match = actualChar === sourceVal ? '✅' : '❌';
    console.log(`  [${i}] source:"${sourceVal}" → gen[${genIndex}]:"${actualChar}" ${match}`);
  }
});

// 检查 console 的映射
const consoleMapping = result1.mapping.find(m => m.source?.value === 'console');
if (consoleMapping) {
  const idx = consoleMapping.generate.index;
  const actual = result1.code.substring(idx, idx + 7);
  console.log(`\n🔍 console 映射检查:`);
  console.log(`  期望: index=${testCode.indexOf('console')}, 实际: index=${idx}`);
  console.log(`  实际字符: "${actual}" ${actual === 'console' ? '✅' : '❌'}`);
  
  if (actual !== 'console') {
    console.log(`  ❌ 错误！映射到了："${actual}"`);
    console.log(`  调试信息：位置 ${idx} 附近的代码：`);
    console.log(`  "${result1.code.substring(Math.max(0, idx-5), idx+15)}"`);
  }
}

// 步骤 2：测试带格式化版本
console.log('\n' + '-'.repeat(80));
console.log('步骤 2：vitePluginOvsTransformWithBeautify（带格式化，保持 mapping）');
console.log('-'.repeat(80));

const result2 = vitePluginOvsTransformWithBeautify(testCode);

console.log('\n生成的代码（格式化后）：');
const lines = result2.code.split('\n');
lines.forEach((line, i) => {
  console.log(`  ${i}: ${line}`);
});

console.log('\nMapping 详情（格式化后）：');
result2.mapping.forEach((map, i) => {
  if (map.source && map.generate && map.source.value) {
    const sourceVal = map.source.value;
    const genIndex = map.generate.index;
    const actualChar = result2.code.substring(genIndex, genIndex + sourceVal.length);
    const match = actualChar === sourceVal ? '✅' : '❌';
    console.log(`  [${i}] source:"${sourceVal}" → gen[${genIndex}]:"${actualChar}" ${match}`);
  }
});

// 检查 console 的映射（格式化后）
const consoleMapping2 = result2.mapping.find(m => m.source?.value === 'console');
if (consoleMapping2) {
  const idx = consoleMapping2.generate.index;
  const actual = result2.code.substring(idx, idx + 7);
  console.log(`\n🔍 console 映射检查（格式化后）:`);
  console.log(`  预期: 分号在位置13，插入\\n后，console应该在位置15`);
  console.log(`  实际: index=${idx}, 字符="${actual}" ${actual === 'console' ? '✅' : '❌'}`);
  
  if (actual !== 'console') {
    console.log(`  ❌ 错误！映射到了："${actual}"`);
    console.log(`  调试信息：位置 ${idx} 附近的代码：`);
    console.log(`  "${result2.code.substring(Math.max(0, idx-5), idx+15).replace(/\n/g, '\\n')}"`);
    
    // 显示所有位置的字符
    console.log(`\n  位置详情：`);
    for (let i = Math.max(0, idx-5); i < Math.min(result2.code.length, idx+15); i++) {
      const char = result2.code[i] === '\n' ? '\\n' : result2.code[i];
      console.log(`    [${i}]: "${char}"`);
    }
  }
}

// 总结
console.log('\n' + '='.repeat(80));
console.log('📊 测试总结');
console.log('='.repeat(80));

const test1Pass = result1.mapping.every(m => {
  if (!m.source || !m.generate || !m.source.value) return true;
  const actual = result1.code.substring(m.generate.index, m.generate.index + m.source.value.length);
  return actual === m.source.value;
});

const test2Pass = result2.mapping.every(m => {
  if (!m.source || !m.generate || !m.source.value) return true;
  const actual = result2.code.substring(m.generate.index, m.generate.index + m.source.value.length);
  return actual === m.source.value;
});

console.log(`\n1. vitePluginOvsTransform（无格式化）: ${test1Pass ? '✅ 通过' : '❌ 失败'}`);
console.log(`2. vitePluginOvsTransformWithBeautify（带格式化）: ${test2Pass ? '✅ 通过' : '❌ 失败'}`);

if (test1Pass && test2Pass) {
  console.log('\n🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('\n❌ 测试失败！');
  process.exit(1);
}

