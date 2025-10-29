/**
 * 测试 simpleFormatWithMapping 函数
 * 渐进式测试，从简单到复杂
 */
import { simpleFormatWithMapping } from './src/index.ts';
import SlimeCodeMapping from 'slime-generator/src/SlimeCodeMapping.ts';

// 辅助函数：创建简单的 mapping
function createMapping(sourceIndex: number, generatedIndex: number, value: string): SlimeCodeMapping {
  const map = new SlimeCodeMapping();
  map.source = {
    type: 'test',
    line: 0,
    value: value,
    column: sourceIndex,
    length: value.length,
    index: sourceIndex
  };
  map.generate = {
    type: 'test',
    line: 0,
    value: value,
    column: generatedIndex,
    length: value.length,
    index: generatedIndex
  };
  return map;
}

// 辅助函数：显示测试结果
function showResult(testName: string, code: string, mapping: SlimeCodeMapping[]) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪', testName);
  console.log('='.repeat(60));
  console.log('代码：');
  console.log(code.replace(/\n/g, '\\n\n'));
  console.log('\nMapping:');
  mapping.forEach((map, i) => {
    if (map.generate) {
      console.log(`  [${i}] "${map.generate.value}" → index: ${map.generate.index}`);
    }
  });
}

// 辅助函数：验证 mapping
function verifyMapping(
  code: string, 
  mapping: SlimeCodeMapping[], 
  expected: Array<{ value: string, index: number }>
): boolean {
  let passed = true;
  
  expected.forEach((exp, i) => {
    const map = mapping[i];
    if (!map || !map.generate) {
      console.log(`❌ mapping[${i}] 不存在`);
      passed = false;
      return;
    }
    
    const actualChar = code.substring(map.generate.index, map.generate.index + exp.value.length);
    
    if (map.generate.index !== exp.index) {
      console.log(`❌ mapping[${i}] "${exp.value}" index 错误: 期望 ${exp.index}, 实际 ${map.generate.index}`);
      passed = false;
    } else if (actualChar !== exp.value) {
      console.log(`❌ mapping[${i}] 位置 ${map.generate.index} 字符错误: 期望 "${exp.value}", 实际 "${actualChar}"`);
      passed = false;
    } else {
      console.log(`✅ mapping[${i}] "${exp.value}" → index: ${map.generate.index} 正确`);
    }
  });
  
  return passed;
}

console.log('\n🚀 开始渐进式测试 simpleFormatWithMapping\n');

// ===== 测试 1A：验证原始代码和 mapping（未格式化） =====
console.log('\n📝 测试 1A：验证原始 mapping（未格式化）');
{
  const code = 'const x=1;const y=2';
  const mapping = [
    createMapping(0, 0, 'const'),
    createMapping(6, 6, 'x'),
    createMapping(10, 10, 'const'),
    createMapping(16, 16, 'y')
  ];
  
  showResult('测试 1A - 原始', code, mapping);
  
  // 验证原始 mapping 是否正确
  console.log('\n🔍 验证原始 mapping:');
  const passed = verifyMapping(code, mapping, [
    { value: 'const', index: 0 },
    { value: 'x', index: 6 },
    { value: 'const', index: 10 },
    { value: 'y', index: 16 }
  ]);
  
  if (!passed) {
    console.log('❌ 原始 mapping 就有问题！停止测试。');
    process.exit(1);
  }
}

// ===== 测试 1B：格式化后的 mapping =====
console.log('\n📝 测试 1B：格式化后的 mapping');
{
  const code = 'const x=1;const y=2';
  const mapping = [
    createMapping(0, 0, 'const'),
    createMapping(6, 6, 'x'),
    createMapping(10, 10, 'const'),
    createMapping(16, 16, 'y')
  ];
  
  const result = simpleFormatWithMapping(code, mapping);
  showResult('测试 1B - 格式化后', result.code, result.mapping);
  
  console.log('\n🔍 验证格式化后的 mapping:');
  console.log('分析：分号在位置 9，插入点在位置 10');
  console.log('  - 位置 0-9: 无插入点，偏移 0');
  console.log('  - 位置 10+: 有1个插入点，偏移 +1');
  
  verifyMapping(result.code, result.mapping, [
    { value: 'const', index: 0 },   // 位置 0，前面0个插入点
    { value: 'x', index: 6 },        // 位置 6，前面0个插入点
    { value: 'const', index: 11 },   // 位置 10 + 1 = 11
    { value: 'y', index: 17 }        // 位置 16 + 1 = 17
  ]);
}

// ===== 测试 2：多个分号 =====
console.log('\n📝 测试 2：多个分号');
{
  const code = 'const a=1;const b=2;const c=3';
  const mapping = [
    createMapping(0, 0, 'const'),
    createMapping(6, 6, 'a'),
    createMapping(10, 10, 'const'),
    createMapping(16, 16, 'b'),
    createMapping(20, 20, 'const'),
    createMapping(26, 26, 'c')
  ];
  
  const result = simpleFormatWithMapping(code, mapping);
  showResult('测试 2', result.code, result.mapping);
  
  // 分号在位置 9、19
  // 插入点在 10、20
  verifyMapping(result.code, result.mapping, [
    { value: 'const', index: 0 },   // 前面0个插入点
    { value: 'a', index: 6 },        // 前面0个插入点
    { value: 'const', index: 11 },   // 前面1个插入点（10）
    { value: 'b', index: 17 },       // 前面1个插入点
    { value: 'const', index: 22 },   // 前面2个插入点（10, 20）
    { value: 'c', index: 28 }        // 前面2个插入点
  ]);
}

// ===== 测试 3：用户报告的实际问题 =====
console.log('\n📝 测试 3：用户报告的问题 - count.value++;console.log()');
{
  const code = "count.value++;console.log('计数器：',count.value)";
  const mapping = [
    createMapping(0, 0, 'count'),
    createMapping(14, 14, 'console'),
    createMapping(22, 22, 'log')
  ];
  
  const result = simpleFormatWithMapping(code, mapping);
  showResult('测试 3', result.code, result.mapping);
  
  // 分号在位置 13，插入点在 14
  verifyMapping(result.code, result.mapping, [
    { value: 'count', index: 0 },     // 前面0个插入点
    { value: 'console', index: 15 },  // 前面1个插入点（14），应该是15不是14！
    { value: 'log', index: 23 }       // 前面1个插入点
  ]);
}

// ===== 测试 4：边界情况 - 已有换行 =====
console.log('\n📝 测试 4：已有换行的情况');
{
  const code = 'const x=1;\nconst y=2';
  const mapping = [
    createMapping(0, 0, 'const'),
    createMapping(11, 11, 'const')
  ];
  
  const result = simpleFormatWithMapping(code, mapping);
  showResult('测试 4', result.code, result.mapping);
  
  // 已有换行，不应该插入，mapping 不变
  verifyMapping(result.code, result.mapping, [
    { value: 'const', index: 0 },
    { value: 'const', index: 11 }
  ]);
}

// ===== 测试 5：复杂情况 - 函数调用链 =====
console.log('\n📝 测试 5：复杂函数调用');
{
  const code = "obj.method1();obj.method2();obj.method3()";
  const mapping = [
    createMapping(0, 0, 'obj'),
    createMapping(4, 4, 'method1'),
    createMapping(14, 14, 'obj'),
    createMapping(18, 18, 'method2'),
    createMapping(28, 28, 'obj'),
    createMapping(32, 32, 'method3')
  ];
  
  const result = simpleFormatWithMapping(code, mapping);
  showResult('测试 5', result.code, result.mapping);
  
  // 分号在位置 13、27
  // 插入点在 14、28
  verifyMapping(result.code, result.mapping, [
    { value: 'obj', index: 0 },       // 前面0个
    { value: 'method1', index: 4 },   // 前面0个
    { value: 'obj', index: 15 },      // 前面1个（14）
    { value: 'method2', index: 19 },  // 前面1个
    { value: 'obj', index: 30 },      // 前面2个（14, 28）
    { value: 'method3', index: 34 }   // 前面2个
  ]);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 所有测试完成！');
console.log('='.repeat(60));

