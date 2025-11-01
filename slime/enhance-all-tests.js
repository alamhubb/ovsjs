const fs = require('fs');
const path = require('path');

// 读取Parser规则
const parserFile = fs.readFileSync('packages/slime-parser/src/language/es2015/Es6Parser.ts', 'utf-8');
const parserLines = parserFile.split('\n');

// 提取所有规则及其完整定义
const rules = {};
let currentRule = null;
let ruleStartLine = 0;
let ruleDef = '';
let braceCount = 0;
let inRule = false;

for (let i = 0; i < parserLines.length; i++) {
  const line = parserLines[i];
  
  if (line.includes('@SubhutiRule')) {
    const nextLine = parserLines[i + 1];
    const match = nextLine.match(/^\s*(\w+)\s*\(/);
    if (match) {
      currentRule = match[1];
      ruleStartLine = i + 1;
      inRule = true;
      braceCount = 0;
      ruleDef = '';
      rules[currentRule] = {
        line: ruleStartLine,
        fullCode: ''
      };
    }
  }
  
  if (inRule && currentRule) {
    ruleDef += line + '\n';
    rules[currentRule].fullCode += line + '\n';
    
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    if (inRule && braceCount === 0 && line.includes('}')) {
      inRule = false;
      ruleDef = '';
    }
  }
}

console.log('='.repeat(100));
console.log('📋 开始批量完善152个测试文件');
console.log('='.repeat(100));
console.log('');

const testDir = 'tests/es6rules';
const allTestFiles = fs.readdirSync(testDir)
  .filter(f => f.endsWith('-001.js'))
  .sort();

console.log(`✓ 找到 ${allTestFiles.length} 个测试文件\n`);

// 分析每个测试文件的状态
let emptyCount = 0;
let hasTestCount = 0;
const emptyFiles = [];
const hasTestFiles = [];

allTestFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const ruleName = file.replace(/-001\.js$/, '');
  
  if (content.includes('TODO') || content.includes('describe')) {
    emptyCount++;
    emptyFiles.push(ruleName);
  } else {
    hasTestCount++;
    hasTestFiles.push(ruleName);
  }
});

console.log(`📊 文件状态分析：`);
console.log(`   已有测试的文件: ${hasTestCount} 个`);
console.log(`   需要补充的文件: ${emptyCount} 个`);
console.log(`   总文件数: ${allTestFiles.length}`);
console.log('');

console.log('💡 建议策略：');
console.log(`   1. 第一批：优先完善已有测试的 ${hasTestCount} 个文件（添加规则注释）`);
console.log(`   2. 第二批：为空白的 ${emptyCount} 个文件创建完整测试`);
console.log('');

// 输出前10个需要补充的文件
console.log('📝 需要补充的前10个规则：');
emptyFiles.slice(0, 10).forEach((name, idx) => {
  console.log(`   ${idx + 1}. ${name}`);
});

console.log('');
console.log('='.repeat(100));
