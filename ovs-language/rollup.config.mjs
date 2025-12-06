import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';

const isWatch = process.argv.includes('--watch');

// 共享的 SWC 配置
const swcOptions = {
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
    },
    transform: {
      decoratorVersion: '2022-03',
      legacyDecorator: true,
    },
    target: 'es2020',
  },
  module: {
    type: 'es6',
  },
};

export default defineConfig([
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
      nodeResolve({
        extensions: ['.ts', '.js', '.json'],
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      swc({ swc: swcOptions }),
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
    external: [],
    plugins: [
      nodeResolve({
        extensions: ['.ts', '.js', '.json'],
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      swc({ swc: swcOptions }),
    ],
  },
]);

