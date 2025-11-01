const fs = require('fs');
const path = require('path');

// 读取Parser文件
const parserFile = fs.readFileSync('packages/slime-parser/src/language/es2015/Es6Parser.ts', 'utf-8');
const parserLines = parserFile.split('\n');

// 提取所有规则及其定义
const rules = {};
let currentRule = null;
let ruleStartLine = 0;
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
      rules[currentRule] = {
        line: ruleStartLine,
        definition: '',
        hasSor: false,
        hasOption: false,
        hasMany: false,
        branches: []
      };
    }
  }
  
  if (inRule && currentRule) {
    rules[currentRule].definition += line + '\n';
    
    // 计算括号以找到规则的结束
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    // 检查规则中的结构
    if (line.includes('this.Or(')) {
      rules[currentRule].hasSor = true;
      // 提取Or的分支
      const orMatch = line.match(/this\.Or\(\[(.*?)\]\)/s);
      if (orMatch) {
        const branches = orMatch[1].split(',').filter(b => b.trim());
        rules[currentRule].branches = branches.map(b => b.trim());
      }
    }
    if (line.includes('this.Option(')) {
      rules[currentRule].hasOption = true;
    }
    if (line.includes('this.Many(')) {
      rules[currentRule].hasMany = true;
    }
    
    // 检查规则是否结束
    if (inRule && braceCount === 0 && line.includes('}')) {
      inRule = false;
    }
  }
}

const sortedRules = Object.keys(rules).sort();

console.log('='.repeat(100));
console.log('ES6Parser 规则覆盖分析');
console.log('='.repeat(100));
console.log('');

// 统计规则类型
const orRules = sortedRules.filter(r => rules[r].hasSor).length;
const optionRules = sortedRules.filter(r => rules[r].hasOption).length;
const manyRules = sortedRules.filter(r => rules[r].hasMany).length;

console.log(`📊 规则统计：`);
console.log(`   总规则数: ${sortedRules.length}`);
console.log(`   包含Or分支的: ${orRules} 个`);
console.log(`   包含Option的: ${optionRules} 个`);
console.log(`   包含Many的: ${manyRules} 个`);
console.log('');

// 读取测试文件
const testDir = 'tests/es6rules';
const testFiles = fs.readdirSync(testDir)
  .filter(f => f.endsWith('-001.js'))
  .reduce((acc, f) => {
    const ruleName = f.replace(/-001\.js$/, '');
    acc[ruleName] = path.join(testDir, f);
    return acc;
  }, {});

console.log('📋 规则详细分析（按字母顺序）：');
console.log('-'.repeat(100));
console.log('');

let ruleIndex = 1;

sortedRules.forEach(ruleName => {
  const rule = rules[ruleName];
  const testPath = testFiles[ruleName];
  
  console.log(`${String(ruleIndex).padStart(3, ' ')}. [${ruleName}]`);
  
  if (rule.hasSor) {
    console.log(`    ├─ Or分支: ${rule.branches.length > 0 ? rule.branches.length : '?'} 个`);
    if (rule.branches.length > 0 && rule.branches.length < 10) {
      rule.branches.forEach((b, idx) => {
        console.log(`    │  ${idx + 1}. ${b.substring(0, 60)}`);
      });
    }
  }
  
  if (rule.hasOption) {
    console.log(`    ├─ Option: 有（需要测试有/无两种情况）`);
  }
  
  if (rule.hasMany) {
    console.log(`    ├─ Many: 有（需要测试0/1/多个情况）`);
  }
  
  // 检查测试文件
  if (testPath && fs.existsSync(testPath)) {
    const testContent = fs.readFileSync(testPath, 'utf-8');
    const testCount = (testContent.match(/it\(/g) || []).length;
    const describeCount = (testContent.match(/describe\(/g) || []).length;
    
    if (testCount > 0) {
      console.log(`    └─ ✅ 测试文件存在: ${testCount} 个测试用例`);
    } else if (describeCount > 0) {
      console.log(`    └─ ⚠️  测试文件存在但没有测试: ${describeCount} 个describe块`);
    } else {
      console.log(`    └─ ❌ 测试文件为空（待补充）`);
    }
  } else {
    console.log(`    └─ ❌ 没有对应的测试文件！`);
  }
  
  console.log('');
  ruleIndex++;
});

console.log('='.repeat(100));
console.log('');
console.log('📌 建议：');
console.log('1. 对于包含Or分支的规则，需要为每个分支都有测试用例');
console.log('2. 对于包含Option的规则，需要测试"有"和"无"两种情况');
console.log('3. 对于包含Many的规则，需要测试0个、1个、多个三种情况');
console.log('4. 每个测试用例需要在注释中标注对应的规则路径');
console.log('');
