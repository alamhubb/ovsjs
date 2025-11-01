const fs = require('fs');

// 读取Parser文件
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
        definition: '',
        fullCode: ''
      };
    }
  }
  
  if (inRule && currentRule) {
    ruleDef += line + '\n';
    rules[currentRule].fullCode += line + '\n';
    
    // 计算括号
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    // 检查规则是否结束
    if (inRule && braceCount === 0 && line.includes('}')) {
      // 提取核心定义部分（去掉函数体）
      const codeLines = ruleDef.split('\n').slice(1, -1); // 去掉首尾
      const relevantCode = codeLines.filter(l => 
        l.includes('this.Or') || l.includes('this.Option') || l.includes('this.Many') ||
        l.includes('this.tokenConsumer') || l.includes('this.') && !l.includes('//')
      ).slice(0, 3); // 只保留前3行关键代码
      
      rules[currentRule].definition = relevantCode.join(' ');
      inRule = false;
      ruleDef = '';
    }
  }
}

const sortedRules = Object.keys(rules).sort();

console.log('='.repeat(100));
console.log('规则定义提取完成 - 用于补充测试文件注释');
console.log('='.repeat(100));
console.log('');

console.log(`✓ 提取了 ${sortedRules.length} 个规则的定义\n`);

// 输出前10个规则的定义示例
console.log('📋 前10个规则的完整定义：\n');

sortedRules.slice(0, 10).forEach((ruleName, idx) => {
  const rule = rules[ruleName];
  console.log(`${idx + 1}. ${ruleName}`);
  console.log(`   定义行: ${rule.line}`);
  if (rule.definition) {
    const preview = rule.definition.substring(0, 100);
    console.log(`   代码片段: ${preview}...`);
  }
  console.log('');
});

// 生成注释模板
console.log('');
console.log('='.repeat(100));
console.log('📝 为测试文件生成注释模板');
console.log('='.repeat(100));
console.log('');

const templateRules = ['Literal', 'AdditiveExpression', 'IfStatement', 'FunctionDeclaration', 'BlockStatement'];

templateRules.forEach(ruleName => {
  if (rules[ruleName]) {
    const rule = rules[ruleName];
    console.log(`\n规则: ${ruleName}`);
    console.log('完整代码：');
    console.log(rule.fullCode.substring(0, 300));
    console.log('---');
  }
});

console.log('\n' + '='.repeat(100));
