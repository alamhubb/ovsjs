/**
 * CssTs Types - TypeScript type definitions for CssTs atomic styles
 * 
 * 这个包提供所有原子类的类型定义，支持 IDE 代码补全和类型检查。
 * 
 * 文件结构:
 * - CsstsAtoms.d.ts  原子类接口定义（自动生成）
 * - global.d.ts      全局变量声明（自动生成）
 * - runtime.d.ts     运行时工具类型（手写）
 * - src/generator/   生成器源代码
 * - dist/            生成的配置文件
 */

// 导出原子类接口
export type { CsstsAtoms } from './CsstsAtoms'

// 导出运行时类型
export type { CsstsRuntime, StyleObject } from './runtime'

// 全局类型声明（通过 tsconfig 的 types 字段引入）
import './global'
