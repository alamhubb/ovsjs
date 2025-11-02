/**
 * ES2020 Parser 测试文件
 * 覆盖所有 ES2020 新特性
 * 
 * 测试内容：
 * 1. Optional Chaining (?.)
 * 2. Nullish Coalescing (??)
 * 3. BigInt
 * 4. Dynamic Import
 * 5. import.meta
 * 6. export * as ns
 * 7. for await...of (ES2018)
 * 8. Optional catch binding (ES2019)
 * 9. ** 幂运算符 (ES2016)
 * 10. **= 幂赋值运算符 (ES2016)
 */

import Es2020Parser from "./Es2020Parser.ts"
import {es2020TokensObj} from "./Es2020Tokens.ts"
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer.ts"

// ============================================
// 测试用例
// ============================================

const testCases = [
  {
    name: "01-optional-chaining-property",
    code: `const value = obj?.prop;`,
    description: "可选链 - 属性访问"
  },
  {
    name: "02-optional-chaining-bracket",
    code: `const value = obj?.['key'];`,
    description: "可选链 - 计算属性"
  },
  {
    name: "03-optional-chaining-call",
    code: `const result = obj?.method();`,
    description: "可选链 - 方法调用"
  },
  {
    name: "04-optional-chaining-nested",
    code: `const street = user?.address?.street;`,
    description: "可选链 - 嵌套访问"
  },
  {
    name: "05-optional-chaining-complex",
    code: `const result = obj?.prop?.nested?.method?.();`,
    description: "可选链 - 复杂链式"
  },
  {
    name: "06-nullish-coalescing-basic",
    code: `const value = foo ?? 'default';`,
    description: "空值合并 - 基础用法"
  },
  {
    name: "07-nullish-coalescing-number",
    code: `const num = 0 ?? 100;`,
    description: "空值合并 - 数字 0"
  },
  {
    name: "08-nullish-coalescing-string",
    code: `const str = '' ?? 'default';`,
    description: "空值合并 - 空字符串"
  },
  {
    name: "09-nullish-coalescing-chain",
    code: `const value = a ?? b ?? c;`,
    description: "空值合并 - 链式"
  },
  {
    name: "10-nullish-coalescing-parentheses",
    code: `const value = (a && b) ?? c;`,
    description: "空值合并 - 与 && 混用需加括号"
  },
  {
    name: "11-bigint-decimal",
    code: `const big = 123n;`,
    description: "BigInt - 十进制"
  },
  {
    name: "12-bigint-binary",
    code: `const big = 0b1010n;`,
    description: "BigInt - 二进制"
  },
  {
    name: "13-bigint-octal",
    code: `const big = 0o777n;`,
    description: "BigInt - 八进制"
  },
  {
    name: "14-bigint-hex",
    code: `const big = 0xFFn;`,
    description: "BigInt - 十六进制"
  },
  {
    name: "15-bigint-zero",
    code: `const big = 0n;`,
    description: "BigInt - 零"
  },
  {
    name: "16-bigint-operations",
    code: `const sum = 1n + 2n; const prod = 2n * 3n;`,
    description: "BigInt - 运算"
  },
  {
    name: "17-exponentiation-basic",
    code: `const result = 2 ** 3;`,
    description: "幂运算符 - 基础"
  },
  {
    name: "18-exponentiation-right-assoc",
    code: `const result = 2 ** 3 ** 2;`,
    description: "幂运算符 - 右结合"
  },
  {
    name: "19-exponentiation-assign",
    code: `let x = 2; x **= 3;`,
    description: "幂赋值运算符"
  },
  {
    name: "20-dynamic-import-string",
    code: `const module = await import('./module.js');`,
    description: "动态导入 - 字符串路径"
  },
  {
    name: "21-dynamic-import-expression",
    code: `const path = './module.js'; const module = await import(path);`,
    description: "动态导入 - 表达式路径"
  },
  {
    name: "22-import-meta",
    code: `console.log(import.meta.url);`,
    description: "import.meta"
  },
  {
    name: "23-export-star-as-ns",
    code: `export * as utils from './utils.js';`,
    description: "export * as ns"
  },
  {
    name: "24-for-await-of-basic",
    code: `async function test() { for await (const item of asyncIterable) { console.log(item); } }`,
    description: "for await...of - 基础"
  },
  {
    name: "25-for-await-of-var",
    code: `async function test() { for await (var item of asyncIterable) { } }`,
    description: "for await...of - var"
  },
  {
    name: "26-for-await-of-let",
    code: `async function test() { for await (let item of asyncIterable) { } }`,
    description: "for await...of - let"
  },
  {
    name: "27-for-await-of-const",
    code: `async function test() { for await (const item of asyncIterable) { } }`,
    description: "for await...of - const"
  },
  {
    name: "28-optional-catch-no-param",
    code: `try { throw new Error(); } catch { console.log('error'); }`,
    description: "可选 catch 绑定 - 无参数"
  },
  {
    name: "29-optional-catch-with-param",
    code: `try { throw new Error(); } catch (e) { console.log(e); }`,
    description: "可选 catch 绑定 - 有参数"
  },
  {
    name: "30-comprehensive-es2020",
    code: `
      // Optional Chaining + Nullish Coalescing
      const value = obj?.prop ?? 'default';
      
      // BigInt + Exponentiation
      const big = 2n ** 10n;
      
      // Dynamic Import + import.meta
      const url = import.meta.url;
      const module = await import(url);
      
      // for await...of + Optional catch
      async function process() {
        try {
          for await (const item of asyncIterable) {
            console.log(item);
          }
        } catch {
          console.error('Failed');
        }
      }
    `,
    description: "综合 - ES2020 所有特性"
  }
];

// ============================================
// 测试运行器
// ============================================

function runTests() {
  console.log('🚀 ES2020 Parser 测试开始\n');
  
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];
  
  for (const testCase of testCases) {
    try {
      // 词法分析
      const lexer = new SubhutiLexer(Object.values(es2020TokensObj));
      const tokens = lexer.lexer(testCase.code);
      
      // 语法分析
      const parser = new Es2020Parser(tokens);
      const cst = parser.Program();
      
      // 验证 CST
      if (!cst) {
        throw new Error("CST is null");
      }
      
      if (cst.children.length === 0) {
        throw new Error("CST has no children");
      }
      
      // 成功
      console.log(`✅ ${testCase.name}: ${testCase.description}`);
      passed++;
      
    } catch (error) {
      // 失败
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${testCase.name}: ${testCase.description}`);
      console.log(`   错误: ${errorMsg}\n`);
      failed++;
      failures.push(`${testCase.name}: ${errorMsg}`);
    }
  }
  
  // 测试总结
  console.log('\n' + '='.repeat(60));
  console.log(`📊 测试总结: ${passed + failed} 个测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  
  if (failures.length > 0) {
    console.log('\n🔍 失败详情:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  
  console.log('='.repeat(60));
  
  return { passed, failed, total: passed + failed };
}

// ============================================
// 执行测试
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testCases, runTests };

