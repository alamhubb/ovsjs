import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from 'rollup-plugin-swc3';
import json from '@rollup/plugin-json';
import { dts } from 'rollup-plugin-dts';

// 共享的 SWC 配置
const swcConfig = {
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
    },
    transform: {
      decoratorVersion: '2022-03',
    },
    target: 'es2020',
  },
  module: {
    type: 'es6',
  },
  sourceMaps: true,
};

// Server 的 external 依赖
// TypeScript 由 VSCode 提供，不需要打包
const serverExternal = ['typescript'];

export default [
  // Client (VSCode Extension) - CommonJS
  {
    input: 'ovs-vscode-client/src/extension.ts',
    output: {
      file: 'dist/extension.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['vscode'],
    plugins: [
      nodeResolve({ extensions: ['.ts', '.js', '.json', '.mjs'], preferBuiltins: true }),
      commonjs(),
      json(),
      swc(swcConfig),
    ],
  },
  // Server (Language Server) - CommonJS
  {
    input: 'ovs-language-server/src/index.ts',
    output: {
      file: 'dist/language-server.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    external: serverExternal,
    plugins: [
      nodeResolve({ extensions: ['.ts', '.js', '.json', '.mjs'], preferBuiltins: true }),
      commonjs(),
      json(),
      swc(swcConfig),
    ],
  },
  // Server 类型声明
  {
    input: 'ovs-language-server/src/index.ts',
    output: {
      file: 'dist/language-server.d.cts',
      format: 'cjs',
    },
    external: serverExternal,
    plugins: [
      nodeResolve({ extensions: ['.ts', '.js', '.mjs'] }),
      dts(),
    ],
  },
];
