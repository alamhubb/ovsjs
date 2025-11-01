const fs = require('fs');
const path = require('path');

const testDir = 'tests/es6rules';
const files = fs.readdirSync(testDir)
  .filter(f => f.endsWith('-001.js'))
  .sort();

// 检查每个文件是否有测试
const withTests = [];
files.forEach(file => {
  const content = fs.readFileSync(path.join(testDir, file), 'utf-8');
  const testCount = (content.match(/\/\/ ✅ 测试\d+/g) || []).length;
  
  if (!content.includes('TODO') && testCount > 0) {
    const ruleName = file.replace(/-001\.js$/, '');
    withTests.push({ ruleName, testCount, file });
  }
});

// 排序：先显示测试最多的
withTests.sort((a, b) => b.testCount - a.testCount);

console.log('='.repeat(80));
console.log('已有测试的文件 - 按测试数量排序（前30个）');
console.log('='.repeat(80));
console.log('');

withTests.slice(0, 30).forEach((item, idx) => {
  console.log(`${String(idx + 1).padStart(2, ' ')}. ${item.ruleName.padEnd(40)} - ${item.testCount}个测试`);
});

console.log('');
console.log('='.repeat(80));
console.log(`总计：${withTests.length}个文件已有测试`);
