/**
 * 规则测试：ExportSpecifier
 * 分类：modules | 编号：404
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1-16：ExportSpecifier各种导出说明符形式
export { x } from './module'
export { x, y } from './module'
export { x, y, z } from './module'
export { Component } from 'react'
export { Component, Fragment } from 'react'
export { Component as MyComponent } from 'react'
export { a as A, b as B } from './module'
export { first, second as S, third } from './data'
export * from './utils'
export * as Utils from './utils'
export { default } from './module'
export { default as Default } from './module'
export { a, b, c, d, e } from './large'
export { helper1, helper2, helper3 } from '../utils'
export { getConfig, setConfig, resetConfig } from './config'
export { one, two, three as THREE } from './numbers'

/* Es6Parser.ts: ExportSpecifier */
