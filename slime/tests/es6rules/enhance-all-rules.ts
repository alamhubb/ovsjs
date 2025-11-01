import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RuleInfo {
  name: string;
  lineNum: number;
  structure: string;
  orBranches: string[];
}

interface CommentInfo {
  testNum: number;
  description: string;
  currentRule: string;
}

/**
 * 从Es6Parser.ts中提取所有规则定义
 */
function extractRulesFromParser(): Map<string, RuleInfo> {
  const parserPath = path.join(__dirname, '../../packages/slime-parser/src/language/es2015/Es6Parser.ts');
  const content = fs.readFileSync(parserPath, 'utf-8');
  const lines = content.split('\n');
  
  const rules = new Map<string, RuleInfo>();
  
  // 查找所有 @SubhutiRule 注解下面的方法定义
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('@SubhutiRule')) {
      // 查找方法定义
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith(')')) {
        const match = lines[j].match(/^\s*(\w+)\s*\(\s*\)\s*{/);
        if (match) {
          const ruleName = match[1];
          const lineNum = j + 1;
          
          // 提取规则结构信息
          const structure = extractRuleStructure(lines, j);
          const orBranches = extractOrBranches(lines, j);
          
          rules.set(ruleName, {
            name: ruleName,
            lineNum,
            structure,
            orBranches
          });
          break;
        }
        j++;
      }
    }
  }
  
  return rules;
}

/**
 * 从规则代码中提取Or分支信息
 */
function extractOrBranches(lines: string[], startLine: number): string[] {
  const branches: string[] = [];
  let braceCount = 0;
  let inOrBlock = false;
  let bracketCount = 0;
  
  for (let i = startLine; i < Math.min(startLine + 50, lines.length); i++) {
    const line = lines[i];
    
    // 检查是否是Or块
    if (line.includes('this.Or([')) {
      inOrBlock = true;
      bracketCount = (line.match(/\[/g) || []).length - (line.match(/\]/g) || []).length;
    }
    
    if (inOrBlock) {
      // 查找alt: 后面的内容
      const altMatch = line.match(/alt:\s*\(\)\s*=>\s*this\.(\w+)\(\)/);
      if (altMatch) {
        branches.push(altMatch[1]);
      }
      
      // 检查Or块是否结束
      if (line.includes(']')) {
        bracketCount--;
        if (bracketCount === 0) {
          break;
        }
      }
    }
  }
  
  return branches;
}

/**
 * 提取规则的完整结构（作为文档字符串）
 */
function extractRuleStructure(lines: string[], startLine: number): string {
  const structureLines: string[] = [];
  let braceCount = 0;
  let foundStart = false;
  
  for (let i = startLine; i < Math.min(startLine + 30, lines.length); i++) {
    const line = lines[i];
    
    if (!foundStart && line.includes('{')) {
      foundStart = true;
    }
    
    if (foundStart) {
      structureLines.push(line);
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (braceCount === 0 && foundStart) {
        break;
      }
    }
  }
  
  return structureLines.join('\n').trim();
}

/**
 * 解析测试文件中的注释，识别当前测试的规则
 */
function parseTestComment(commentLine: string): CommentInfo | null {
  // 匹配格式: // ✅ 测试N：描述    规则名 -> ...
  const match = commentLine.match(/\/\/\s*✅\s*测试(\d+)：(.+?)\s{2,}(\w+)\s*(?:->|$)/);
  if (match) {
    return {
      testNum: parseInt(match[1]),
      description: match[2].trim(),
      currentRule: match[3]
    };
  }
  
  // 简化匹配：只有"规则 -> ..."格式
  const simpleMatch = commentLine.match(/\/\/\s*✅\s*测试(\d+)：(.+)/);
  if (simpleMatch) {
    return {
      testNum: parseInt(simpleMatch[1]),
      description: simpleMatch[2].trim(),
      currentRule: ''
    };
  }
  
  return null;
}

/**
 * 为测试文件添加详细的规则追溯注释
 */
function enhanceTestFile(filePath: string, rules: Map<string, RuleInfo>): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const enhanced: string[] = [];
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检查是否是测试注释行
      if (line.includes('// ✅ 测试')) {
        const commentInfo = parseTestComment(line);
        
        if (commentInfo && !line.includes('->')) {
          // 需要从文件名或上下文推断规则名
          // 从文件名提取规则名（格式: NNN-RuleName-001.js）
          const fileName = path.basename(filePath, '.js');
          const parts = fileName.split('-');
          const ruleName = parts.slice(1, -1).join('-');
          
          // 检查规则是否存在
          if (rules.has(ruleName)) {
            const rule = rules.get(ruleName)!;
            
            // 生成增强的注释
            const branchNum = commentInfo.testNum;
            const newComment = `// ✅ 测试${commentInfo.testNum}：${commentInfo.description}    ${ruleName} -> ${rule.structure.split('\n')[0].trim()} (分支${branchNum})`;
            
            enhanced.push(newComment);
            modified = true;
          } else {
            enhanced.push(line);
          }
        } else {
          enhanced.push(line);
        }
      } else {
        enhanced.push(line);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, enhanced.join('\n'));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`处理文件失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 主函数：批量增强所有测试文件
 */
async function main(): Promise<void> {
  console.log('\n🔍 第一步：从Es6Parser.ts中提取规则定义...\n');
  
  const rules = extractRulesFromParser();
  console.log(`✅ 成功提取 ${rules.size} 个规则\n`);
  
  // 显示前10个规则
  console.log('📋 规则列表（前10个）：');
  let count = 0;
  for (const [name, info] of rules) {
    if (count >= 10) break;
    console.log(`   ${count + 1}. ${name} (Line ${info.lineNum}, ${info.orBranches.length} 个Or分支)`);
    count++;
  }
  console.log(`   ... 及其他 ${Math.max(0, rules.size - 10)} 个规则\n`);
  
  console.log('🚀 第二步：增强所有测试文件...\n');
  
  const testDir = __dirname;
  const files = fs.readdirSync(testDir).filter(f => f.endsWith('-001.js'));
  
  let successCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(testDir, files[i]);
    const result = enhanceTestFile(filePath, rules);
    
    if (result) {
      successCount++;
      process.stdout.write('✓');
    } else {
      skipCount++;
      process.stdout.write('.');
    }
    
    // 每50个文件换行
    if ((i + 1) % 50 === 0) {
      console.log(` [${i + 1}/${files.length}]`);
    }
  }
  
  console.log(`\n\n📊 处理完成：\n`);
  console.log(`✅ 已增强: ${successCount} 个文件`);
  console.log(`⏭️  未修改: ${skipCount} 个文件`);
  console.log(`📁 总计: ${files.length} 个文件\n`);
}

// 运行
main().catch(console.error);
