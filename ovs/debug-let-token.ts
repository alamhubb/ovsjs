#!/usr/bin/env tsx
/**
 * 🔥 专门调试 "let" 关键字的 semantic token 问题
 * 
 * 问题：输入 "let" 时，只有 "l" 变成紫色
 * 
 * 这个脚本会：
 * 1. 测试输入 "l"、"le"、"let" 时的 token 结果
 * 2. 显示每次的 token 长度和位置
 * 3. 帮助找到问题根源
 */

import { createTypeScriptInferredChecker } from '@volar/kit';
import { ovsLanguagePlugin } from '../langServer/src/OvsLanguagePlugin';
import { createTypeScriptServices } from '../langServer/src/typescript';
import * as ts from 'typescript';
import { URI } from 'vscode-uri';
import * as path from 'path';
import * as fs from 'fs';

// Semantic Tokens Legend
const LEGEND = {
  tokenTypes: [
    'namespace', 'class', 'enum', 'interface', 'typeParameter', 'type',
    'parameter', 'variable', 'property', 'enumMember', 'function', 'method',
  ],
  tokenModifiers: [
    'declaration', 'readonly', 'static', 'async', 'defaultLibrary', 'local',
  ],
};

function decodeModifiers(bits: number): string[] {
  const result: string[] = [];
  LEGEND.tokenModifiers.forEach((mod, i) => {
    if (bits & (1 << i)) result.push(mod);
  });
  return result;
}

function decodeTokens(data: number[]) {
  const tokens: any[] = [];
  let line = 0, char = 0;

  for (let i = 0; i < data.length; i += 5) {
    if (data[i] > 0) {
      line += data[i];
      char = data[i + 1];
    } else {
      char += data[i + 1];
    }

    tokens.push({
      line,
      char,
      length: data[i + 2],
      type: LEGEND.tokenTypes[data[i + 3]],
      modifiers: decodeModifiers(data[i + 4]),
    });
  }

  return tokens;
}

async function testCode(code: string, label: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 测试: ${label}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📝 代码: "${code}"`);
  console.log(`📏 长度: ${code.length} 字符\n`);

  // 创建临时文件
  const testDir = path.resolve(__dirname, '.test-temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFile = path.join(testDir, 'test.ovs');
  fs.writeFileSync(testFile, code, 'utf-8');

  try {
    const checker = createTypeScriptInferredChecker(
      [ovsLanguagePlugin],
      createTypeScriptServices(ts),
      () => [testFile],
      { allowJs: true, checkJs: true, noEmit: true, strict: false }
    );

    const uri = URI.file(testFile);
    const result = await checker.languageService.getSemanticTokens(
      uri,
      undefined,
      LEGEND
    );

    if (!result || !result.data || result.data.length === 0) {
      console.log('❌ 未返回任何 tokens');
      return;
    }

    console.log(`📊 原始数据 (${result.data.length / 5} 个 tokens):`);
    console.log(`   [${result.data.join(', ')}]\n`);

    const tokens = decodeTokens(result.data);
    console.log('🔍 解码后的 Tokens:');
    tokens.forEach((token, i) => {
      const text = code.substring(token.char, token.char + token.length);
      console.log(`\n   Token ${i}:`);
      console.log(`   ├─ 位置: Line ${token.line}, Char ${token.char}`);
      console.log(`   ├─ 长度: ${token.length} 字符`);
      console.log(`   ├─ 文本: "${text}"`);
      console.log(`   ├─ 类型: ${token.type}`);
      console.log(`   └─ 修饰符: [${token.modifiers.join(', ')}]`);

      // 🔥 检查问题
      if (text.length !== token.length) {
        console.log(`\n   ⚠️  警告: 文本长度 (${text.length}) ≠ Token 长度 (${token.length})`);
      }
    });

    // 分析结果
    console.log(`\n${'─'.repeat(60)}`);
    console.log('📋 分析:');
    if (tokens.length > 0) {
      const firstToken = tokens[0];
      const text = code.substring(firstToken.char, firstToken.char + firstToken.length);
      
      if (code === 'let x = 100' && firstToken.length === 1) {
        console.log('❌ 问题复现！Token 长度只有 1，但应该是变量名的长度');
        console.log(`   期望: "x" (长度 1) ✅`);
        console.log(`   实际: "${text}" (长度 ${firstToken.length})`);
      } else if (code.startsWith('let') && firstToken.length === 1 && firstToken.char === 0) {
        console.log('❌ BUG: Token 指向了 "let" 关键字而不是变量名！');
        console.log(`   期望: 跳过关键字，高亮变量名`);
        console.log(`   实际: 高亮了 "${text}"`);
      } else {
        console.log('✅ Token 长度正确');
      }
    }

  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    console.error(error.stack);
  }

  console.log(`${'='.repeat(60)}\n`);
}

async function main() {
  console.log('\n');
  console.log('🔥🔥🔥 调试 "let" 关键字的 Semantic Token 问题 🔥🔥🔥\n');

  // 测试渐进式输入
  await testCode('l', '步骤 1: 只输入 "l"');
  await testCode('le', '步骤 2: 输入 "le"');
  await testCode('let', '步骤 3: 输入 "let"');
  await testCode('let ', '步骤 4: 输入 "let "（有空格）');
  await testCode('let x', '步骤 5: 输入 "let x"');
  await testCode('let x = 100', '步骤 6: 完整语句 "let x = 100"');

  // 对比其他声明
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 对比测试：const 和 var');
  console.log('═'.repeat(60));
  await testCode('const y = 200', '对比: const 声明');
  await testCode('var z = 300', '对比: var 声明');

  // 清理
  const testDir = path.resolve(__dirname, '.test-temp');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  console.log('\n✅ 调试完成！\n');
}

main().catch(console.error);


