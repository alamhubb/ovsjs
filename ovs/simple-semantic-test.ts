#!/usr/bin/env tsx
/**
 * 简化版 Semantic Tokens 测试
 * 直接使用 @volar/language-service API
 */

import { createLanguage, createLanguageService, createUriMap } from '@volar/language-service';
import { createServiceEnvironment } from '@volar/kit/lib/createServiceEnvironment';
import { ovsLanguagePlugin } from '../langServer/src/OvsLanguagePlugin';
import { createTypeScriptServices } from '../langServer/src/typescript';
import * as ts from 'typescript';
import { URI } from 'vscode-uri';

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
  console.log(`🧪 ${label}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📝 代码: "${code}"`);

  try {
    // 创建语言和语言服务
    const language = createLanguage(
      [ovsLanguagePlugin],
      createUriMap(false),
      () => {}
    );

    const env = createServiceEnvironment(() => ({}));
    const languageService = createLanguageService(
      language,
      createTypeScriptServices(ts),
      env,
      {}
    );

    // 创建虚拟文件
    const testUri = URI.parse('file:///test.ovs');
    const snapshot = ts.ScriptSnapshot.fromString(code);
    language.scripts.set(testUri, snapshot, 'ovs');

    // 获取 semantic tokens
    const result = await languageService.getSemanticTokens(
      testUri,
      undefined,
      LEGEND
    );

    if (!result || !result.data || result.data.length === 0) {
      console.log('❌ 未返回任何 tokens\n');
      return;
    }

    console.log(`\n📊 原始数据 (${result.data.length / 5} 个 tokens):`);
    console.log(`   [${result.data.join(', ')}]`);

    const tokens = decodeTokens(result.data);
    console.log('\n🔍 解码后的 Tokens:');
    tokens.forEach((token, i) => {
      const text = code
        .split('\n')[token.line]
        ?.substring(token.char, token.char + token.length) || '';
      console.log(`\n   Token ${i}:`);
      console.log(`   ├─ 位置: Line ${token.line}, Char ${token.char}`);
      console.log(`   ├─ 长度: ${token.length} 字符`);
      console.log(`   ├─ 文本: "${text}"`);
      console.log(`   ├─ 类型: ${token.type}`);
      console.log(`   └─ 修饰符: [${token.modifiers.join(', ')}]`);

      // 检查问题
      if (text.length !== token.length && text.length > 0) {
        console.log(`\n   ⚠️  警告: 文本长度 (${text.length}) ≠ Token 长度 (${token.length})`);
      }
    });

    console.log(`\n${'='.repeat(60)}\n`);
  } catch (error: any) {
    console.log(`❌ 错误: ${error.message}`);
    console.error(error.stack);
  }
}

async function main() {
  console.log('\n🔥🔥🔥 Semantic Tokens 测试 🔥🔥🔥\n');

  await testCode('l', '步骤 1: 只输入 "l"');
  await testCode('le', '步骤 2: 输入 "le"');
  await testCode('let', '步骤 3: 输入 "let"');
  await testCode('let ', '步骤 4: 输入 "let "');
  await testCode('let x', '步骤 5: 输入 "let x"');
  await testCode('let x = 100', '步骤 6: 完整语句');
  await testCode('const y = 200', '步骤 7: const 声明');

  console.log('\n✅ 测试完成！\n');
}

main().catch(console.error);





