const fs = require('fs');
const path = require('path');

/**
 * 规则定义映射 - 手工维护的前10个文件的规则
 */
const RULES_CONFIG = {
  'AdditiveExpression': {
    structure: 'this.Many(() => this.Or([Plus, Minus]))',
    line: 679,
  },
  'ArgumentList': {
    structure: 'AssignmentExpression ( , AssignmentExpression )* | SpreadElement ( , AssignmentExpression )*',
    line: 279,
  },
  'Arguments': {
    structure: '( ArgumentList? )',
    line: 274,
  },
  'ArrayBindingPattern': {
    structure: '[ ElementList? ]',
    line: 1210,
  },
  'ArrayLiteral': {
    structure: '[ ElementList? ]',
    line: 155,
  },
  'ArrowFunction': {
    structure: 'ArrowParameters => ConciseBody',
    line: 935,
  },
  'AssignmentExpression': {
    structure: 'ConditionalExpression | LeftHandSideExpression = AssignmentExpression | CompoundAssignment',
    line: 923,
  },
  'AssignmentExpressionEmptySemicolon': {
    structure: 'AssignmentExpression ;',
    line: 1921,
  },
  'AssignmentOperator': {
    structure: '= | *= | /= | %= | += | -= | <<= | >>= | >>>= | &= | ^= | |=',
    line: 968,
  },
  'AsteriskFromClauseEmptySemicolon': {
    structure: '* from ModuleSpecifier ;',
    line: 1867,
  }
};

/**
 * 为注释添加规则追溯
 */
function enhanceComment(commentLine, ruleName) {
  const rule = RULES_CONFIG[ruleName];
  if (!rule) return commentLine;

  const match = commentLine.match(/\/\/\s*✅\s*测试(\d+)：(.+?)$/);
  if (!match) return commentLine;

  const testNum = match[1];
  const description = match[2].trim();

  // 返回增强的注释
  return `// ✅ 测试${testNum}：${description}    ${ruleName} -> ${rule.structure}`;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  const fileName = path.basename(filePath, '.js');
  const parts = fileName.split('-');
  const ruleName = parts.slice(0, -1).join('-');

  if (!RULES_CONFIG[ruleName]) {
    console.log(`⏭️  ${fileName}: 规则未定义，跳过`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const enhanced = [];

    for (const line of lines) {
      if (line.includes('// ✅ 测试')) {
        enhanced.push(enhanceComment(line, ruleName));
      } else {
        enhanced.push(line);
      }
    }

    fs.writeFileSync(filePath, enhanced.join('\n'));
    console.log(`✅ ${fileName}: 已添加规则追溯`);
    return true;
  } catch (error) {
    console.log(`❌ ${fileName}: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  const testDir = __dirname;
  const allFiles = fs.readdirSync(testDir)
    .filter(f => f.endsWith('-001.js'))
    .sort();

  // 取前10个文件
  const firstTen = allFiles.slice(0, 10);

  console.log(`\n🚀 为前10个文件添加规则追溯注释\n`);

  let count = 0;
  for (const file of firstTen) {
    if (processFile(path.join(testDir, file))) {
      count++;
    }
  }

  console.log(`\n✅ 完成: ${count}个文件已处理\n`);
}

main();
