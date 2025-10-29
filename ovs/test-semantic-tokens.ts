#!/usr/bin/env tsx
/**
 * 测试 Semantic Tokens 功能
 * 使用 @volar/kit 创建独立的语言服务，测试 token 生成是否正确
 */

import { createTypeScriptInferredChecker } from '@volar/kit';
import { ovsLanguagePlugin } from '../langServer/src/OvsLanguagePlugin';
import { createTypeScriptServices } from '../langServer/src/typescript';
import * as ts from 'typescript';
import { URI } from 'vscode-uri';
import * as path from 'path';

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset);
}

// Semantic Tokens Legend（必须与服务端一致）
const LEGEND = {
  tokenTypes: [
    'namespace',      // 0
    'class',          // 1
    'enum',           // 2
    'interface',      // 3
    'typeParameter',  // 4
    'type',           // 5
    'parameter',      // 6
    'variable',       // 7
    'property',       // 8
    'enumMember',     // 9
    'function',       // 10
    'method',         // 11
  ],
  tokenModifiers: [
    'declaration',    // 0x01 (bit 0)
    'readonly',       // 0x02 (bit 1)
    'static',         // 0x04 (bit 2)
    'async',          // 0x08 (bit 3)
    'defaultLibrary', // 0x10 (bit 4)
    'local',          // 0x20 (bit 5)
  ],
};

// 解码 modifiers 位掩码
function decodeModifiers(modifierBits: number): string[] {
  const result: string[] = [];
  LEGEND.tokenModifiers.forEach((mod, index) => {
    if (modifierBits & (1 << index)) {
      result.push(mod);
    }
  });
  return result;
}

// 解码压缩的 semantic tokens 数据
function decodeSemanticTokens(data: number[]): Array<{
  line: number;
  char: number;
  length: number;
  type: string;
  modifiers: string[];
}> {
  const tokens: Array<{
    line: number;
    char: number;
    length: number;
    type: string;
    modifiers: string[];
  }> = [];

  let currentLine = 0;
  let currentChar = 0;

  for (let i = 0; i < data.length; i += 5) {
    const deltaLine = data[i];
    const deltaChar = data[i + 1];
    const length = data[i + 2];
    const tokenType = data[i + 3];
    const tokenModifiers = data[i + 4];

    // 计算绝对位置
    if (deltaLine > 0) {
      currentLine += deltaLine;
      currentChar = deltaChar;
    } else {
      currentChar += deltaChar;
    }

    tokens.push({
      line: currentLine,
      char: currentChar,
      length: length,
      type: LEGEND.tokenTypes[tokenType] || `Unknown(${tokenType})`,
      modifiers: decodeModifiers(tokenModifiers),
    });
  }

  return tokens;
}

// 创建测试用例
interface TestCase {
  name: string;
  code: string;
  expected: Array<{
    line: number;
    char: number;
    length: number;
    type: string;
    modifiers: string[];
    text?: string; // 可选：预期的文本内容
  }>;
}

const testCases: TestCase[] = [
  {
    name: '🔥 单个 let 声明',
    code: 'let x = 100',
    expected: [
      {
        line: 0,
        char: 4, // "x" 的位置
        length: 1,
        type: 'variable',
        modifiers: ['declaration', 'local'],
        text: 'x',
      },
    ],
  },
  {
    name: '🔥 const 声明（readonly）',
    code: 'const constantVar = 100',
    expected: [
      {
        line: 0,
        char: 6, // "constantVar" 的位置
        length: 11,
        type: 'variable',
        modifiers: ['declaration', 'readonly', 'local'],
        text: 'constantVar',
      },
    ],
  },
  {
    name: '🔥 多个变量声明',
    code: `const a = 1
let b = 2
var c = 3`,
    expected: [
      {
        line: 0,
        char: 6,
        length: 1,
        type: 'variable',
        modifiers: ['declaration', 'readonly', 'local'],
        text: 'a',
      },
      {
        line: 1,
        char: 4,
        length: 1,
        type: 'variable',
        modifiers: ['declaration', 'local'],
        text: 'b',
      },
      {
        line: 2,
        char: 4,
        length: 1,
        type: 'variable',
        modifiers: ['declaration', 'local'],
        text: 'c',
      },
    ],
  },
  {
    name: '🔥 类声明',
    code: `class MyClass {
  constructor() {}
}`,
    expected: [
      {
        line: 0,
        char: 6,
        length: 7,
        type: 'class',
        modifiers: ['declaration'],
        text: 'MyClass',
      },
    ],
  },
  {
    name: '🔥 函数声明',
    code: 'function myFunction() {}',
    expected: [
      {
        line: 0,
        char: 9,
        length: 10,
        type: 'function',
        modifiers: ['declaration'],
        text: 'myFunction',
      },
    ],
  },
];

// 运行测试
async function runTests() {
  log('cyan', '\n========================================');
  log('cyan', '🧪 Semantic Tokens 单元测试');
  log('cyan', '========================================\n');

  // 创建临时目录和文件
  const testDir = path.resolve(__dirname, '.test-temp');
  const fs = await import('fs');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    log('yellow', `\n📝 测试: ${testCase.name}`);
    log('blue', `代码:\n${testCase.code}\n`);

    // 创建临时文件
    const testFile = path.join(testDir, 'test.ovs');
    fs.writeFileSync(testFile, testCase.code, 'utf-8');

    try {
      // 创建 checker
      const checker = createTypeScriptInferredChecker(
        [ovsLanguagePlugin],
        createTypeScriptServices(ts),
        () => [testFile],
        {
          allowJs: true,
          checkJs: true,
          noEmit: true,
          strict: false,
        }
      );

      // 获取语言服务
      const languageService = checker.languageService;
      const uri = URI.file(testFile);

      // 请求 semantic tokens
      const result = await languageService.getSemanticTokens(
        uri,
        undefined, // range (undefined = full document)
        LEGEND
      );

      if (!result || !result.data || result.data.length === 0) {
        log('red', '❌ 未返回任何 tokens');
        failedTests++;
        continue;
      }

      // 解码 tokens
      const actualTokens = decodeSemanticTokens(result.data);

      log('cyan', '📊 实际返回的 Tokens:');
      actualTokens.forEach((token, index) => {
        const tokenText = testCase.code
          .split('\n')[token.line]
          .substring(token.char, token.char + token.length);
        console.log(
          `  [${index}] Line ${token.line}, Char ${token.char}, Length ${token.length}`
        );
        console.log(`       Type: ${token.type}`);
        console.log(`       Modifiers: [${token.modifiers.join(', ')}]`);
        console.log(`       Text: "${tokenText}"`);
      });

      // 验证结果
      let testPassed = true;
      const errors: string[] = [];

      if (actualTokens.length !== testCase.expected.length) {
        errors.push(
          `Token 数量不匹配：期望 ${testCase.expected.length} 个，实际 ${actualTokens.length} 个`
        );
        testPassed = false;
      }

      testCase.expected.forEach((expected, index) => {
        const actual = actualTokens[index];
        if (!actual) {
          errors.push(`缺少第 ${index} 个 token`);
          testPassed = false;
          return;
        }

        if (actual.line !== expected.line) {
          errors.push(
            `Token ${index} 行号错误：期望 ${expected.line}，实际 ${actual.line}`
          );
          testPassed = false;
        }

        if (actual.char !== expected.char) {
          errors.push(
            `Token ${index} 列号错误：期望 ${expected.char}，实际 ${actual.char}`
          );
          testPassed = false;
        }

        if (actual.length !== expected.length) {
          errors.push(
            `Token ${index} 长度错误：期望 ${expected.length}，实际 ${actual.length} ❌❌❌`
          );
          testPassed = false;
        }

        if (actual.type !== expected.type) {
          errors.push(
            `Token ${index} 类型错误：期望 "${expected.type}"，实际 "${actual.type}"`
          );
          testPassed = false;
        }

        // 验证 modifiers（顺序不重要）
        const expectedMods = expected.modifiers.sort();
        const actualMods = actual.modifiers.sort();
        if (JSON.stringify(expectedMods) !== JSON.stringify(actualMods)) {
          errors.push(
            `Token ${index} 修饰符错误：期望 [${expectedMods.join(', ')}]，实际 [${actualMods.join(', ')}]`
          );
          testPassed = false;
        }

        // 验证文本内容（如果提供）
        if (expected.text) {
          const actualText = testCase.code
            .split('\n')[actual.line]
            .substring(actual.char, actual.char + actual.length);
          if (actualText !== expected.text) {
            errors.push(
              `Token ${index} 文本错误：期望 "${expected.text}"，实际 "${actualText}"`
            );
            testPassed = false;
          }
        }
      });

      // 输出结果
      if (testPassed) {
        log('green', '✅ 测试通过！');
        passedTests++;
      } else {
        log('red', '❌ 测试失败！');
        errors.forEach((err) => log('red', `   - ${err}`));
        failedTests++;
      }
    } catch (error) {
      log('red', `❌ 测试异常: ${error.message}`);
      console.error(error.stack);
      failedTests++;
    }
  }

  // 清理临时文件
  const fs = await import('fs');
  fs.rmSync(testDir, { recursive: true, force: true });

  // 总结
  log('cyan', '\n========================================');
  log('cyan', '📊 测试总结');
  log('cyan', '========================================');
  log('green', `✅ 通过: ${passedTests}`);
  log('red', `❌ 失败: ${failedTests}`);
  log('cyan', `📝 总计: ${passedTests + failedTests}`);
  log('cyan', '========================================\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

// 运行测试
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


