/**
 * 规则测试：ImportDeclaration
 * 
 * 位置：Es6Parser.ts Line 1752
 * 分类：modules
 * 编号：702
 * 
 * EBNF规则：
 *   ImportDeclaration:
 *     import ImportClause FromClause ;
 *     import ModuleSpecifier ;
 * 
 * 测试目标：
 * - 测试default导入
 * - 测试named导入
 * - 测试命名空间导入
 * - 测试混合导入（default + named）
 * - 测试导入重命名
 * - 测试多个named导入
 * - 测试side-effect导入
 * - 测试导入路径的各种形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：default导入
import def from './module.js'

// ✅ 测试2：named导入
import {named} from './module.js'

// ✅ 测试3：命名空间导入
import * as ns from './module.js'

// ✅ 测试4：混合导入（default + named）
import defaultExport, {namedExport} from './combined.js'

// ✅ 测试5：混合导入（default + namespace）
import defaultExport, * as ns from './combined.js'

// ✅ 测试6：导入重命名
import {originalName as renamed, another as renamedAgain} from './utils.js'

// ✅ 测试7：多个named导入
import {a, b, c, d, e} from './constants.js'

// ✅ 测试8：side-effect导入（无import子句）
import './styles.css'

/* Es6Parser.ts: ImportDeclaration */
