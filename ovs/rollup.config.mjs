import { nodeResolve } from '@rollup/plugin-node-resolve'
import swc from 'rollup-plugin-swc3'
import { dts } from 'rollup-plugin-dts'

// 主要构建配置 - 编译 TypeScript + 装饰器
const mainConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js', '.mjs']
    }),
    swc({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true
        },
        transform: {
          decoratorVersion: '2022-03'  // Stage 3 装饰器
        },
        target: 'es2020'
      },
      module: {
        type: 'es6'
      },
      sourceMaps: true
    })
  ],
  // 打包 slime 和 subhuti 源码，其他保持外部
  external: [
    /node_modules/,
    // 保留这些为外部依赖（不打包进来）
    'lru-cache',
    'mnemonist',
    'd3',
    'dagre-d3',
    '@dagrejs/dagre',
    '@dagrejs/graphlib',
    '@dagrejs/graphlib-dot',
    'big-cartesian',
    'fast-cartesian'
  ]
}

// 类型声明配置
const dtsConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.mts',
    format: 'esm'
  },
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js', '.mjs']
    }),
    dts()
  ],
  external: [
    /node_modules/,
    'lru-cache',
    'mnemonist',
    'd3',
    'dagre-d3',
    '@dagrejs/dagre',
    '@dagrejs/graphlib',
    '@dagrejs/graphlib-dot',
    'big-cartesian',
    'fast-cartesian'
  ]
}

export default [mainConfig, dtsConfig]

