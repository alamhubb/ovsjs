const fs = require('fs');
const path = require('path');

/**
 * 提取规则名称从文件名
 * 文件名格式：NNN-RuleName-001.js
 */
function getRuleNameFromFileName(filePath) {
  const fileName = path.basename(filePath, '.js');
  const parts = fileName.split('-');
  
  // 移除开头的编号和结尾的001
  if (parts.length > 2) {
    return parts.slice(1, -1).join('-');
  }
  return fileName;
}

/**
 * 检查注释是否已有完整的规则追溯信息
 * 完整：包含 "规则名 -> ..."
 * 不完整：只有 "✅ 测试N：描述"
 */
function hasCompleteRuleTrace(commentLine) {
  // 如果已有 -> 标记，说明已有规则追溯
  return commentLine.includes('->');
}

/**
 * 为注释添加规则追溯信息
 */
function addRuleTraceToComment(commentLine, ruleName, testNum) {
  if (hasCompleteRuleTrace(commentLine)) {
    // 已有完整规则追溯，保持原样
    return commentLine;
  }
  
  // 格式：// ✅ 测试N：描述    规则名 -> 规则链
  // 提取已有的描述部分
  const match = commentLine.match(/\/\/\s*✅\s*测试(\d+)：(.+?)$/);
  
  if (match) {
    const description = match[2].trim();
    
    // 添加规则追溯（分支号用测试号作为default）
    const enhancedComment = `// ✅ 测试${testNum}：${description}    ${ruleName} -> 规则 Or分支(${testNum})`;
    
    return enhancedComment;
  }
  
  return commentLine;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const ruleName = getRuleNameFromFileName(filePath);
    
    let modified = false;
    const enhanced = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检查是否是测试注释行
      if (line.includes('// ✅ 测试')) {
        const testMatch = line.match(/测试(\d+)/);
        if (testMatch && !hasCompleteRuleTrace(line)) {
          // 这个注释缺少规则追溯，添加
          const testNum = testMatch[1];
          const enhancedLine = addRuleTraceToComment(line, ruleName, testNum);
          
          enhanced.push(enhancedLine);
          modified = true;
        } else {
          // 已有完整规则追溯或格式不符，保持原样
          enhanced.push(line);
        }
      } else {
        enhanced.push(line);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, enhanced.join('\n'));
      return { status: 'added', file: path.basename(filePath) };
    } else {
      return { status: 'complete', file: path.basename(filePath) };
    }
  } catch (error) {
    return { status: 'error', file: path.basename(filePath), error: error.message };
  }
}

/**
 * 主函数
 */
function main() {
  console.log('\n🚀 为测试注释添加规则追溯信息（仅添加缺失的，保留已有的）\n');
  
  const testDir = __dirname;
  const files = fs.readdirSync(testDir)
    .filter(f => f.endsWith('-001.js') && !f.includes('add-rule') && !f.includes('enhance'))
    .sort();
  
  let addedCount = 0;
  let completeCount = 0;
  let errorCount = 0;
  
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(testDir, file);
    const result = processFile(filePath);
    results.push(result);
    
    if (result.status === 'added') {
      addedCount++;
      process.stdout.write('✓');
    } else if (result.status === 'complete') {
      completeCount++;
      process.stdout.write('✔');
    } else {
      errorCount++;
      process.stdout.write('✗');
    }
  }
  
  console.log(`\n\n📊 处理结果：\n`);
  console.log(`✓ 已添加规则追溯: ${addedCount} 个文件`);
  console.log(`✔ 已有完整追溯: ${completeCount} 个文件`);
  console.log(`✗ 错误: ${errorCount} 个文件`);
  console.log(`📁 总计: ${files.length} 个文件\n`);
  
  // 显示示例
  if (addedCount > 0) {
    console.log('📝 示例（添加了规则追溯的文件）：\n');
    const addedFiles = results.filter(r => r.status === 'added').slice(0, 3);
    addedFiles.forEach(r => {
      console.log(`   ✓ ${r.file} - 已添加规则追溯`);
    });
  }
}

// 运行
main();
