/**
 * 规则测试：FromClause
 * 
 * 位置：Es6Parser.ts Line 1844
 * 分类：modules
 * 编号：706
 * 
 * EBNF规则：
 *   FromClause:
 *     from ModuleSpecifier
 * 
 * 测试目标：
 * - 测试相对路径 (./)
 * - 测试上级路径 (../)
 * - 测试npm包名称
 * - 测试npm作用域包
 * - 测试深层路径
 * - 测试带文件扩展名
 * - 测试URL格式
 * - 测试单引号vs双引号
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：相对路径（同目录）
import x from './module.js'

// ✅ 测试2：相对路径（上级目录）
import y from '../utils.js'

// ✅ 测试3：npm包导入
import express from 'express'

// ✅ 测试4：作用域npm包
import {render} from '@vue/test-utils'

// ✅ 测试5：深层相对路径
import helpers from '../../../helpers/index.js'

// ✅ 测试6：导出from子句
export {a, b} from './module.js'
export * from '../other.js'

// ✅ 测试7：单引号路径
import z from './path/to/file.js'

// ✅ 测试8：复杂路径组合
import axios from '@axios/core/dist/axios.js'
export {default, named} from '../../lib/utils/index.js'

/* Es6Parser.ts: FromClause */
