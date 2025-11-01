
/* Es6Parser.ts: * as ImportedBinding */


// ============================================
// 来自文件: 704-NameSpaceImport.js
// ============================================

/**
 * 规则测试：NameSpaceImport
 * 
 * 位置：Es6Parser.ts Line 1811
 * 分类：modules
 * 编号：704
 * 
 * EBNF规则：
 *   NameSpaceImport:
 *     * as BindingIdentifier
 * 
 * 测试目标：
 * - 测试基础命名空间导入
 * - 测试不同模块路径（相对、绝对等）
 * - 测试各种命名空间名称
 * - 测试同一文件多个导入
 * - 测试与其他导入混合
 * - 测试深层模块路径
 * - 测试npm包命名空间导入
 * - 测试命名空间导入后的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础命名空间导入
import * as everything from './module.js'

// ✅ 测试2：短别名命名空间导入
import * as _ from 'lodash'

// ✅ 测试3：使用下划线开头的别名
import * as utils from './utils.js'

// ✅ 测试4：多个命名空间导入（来自不同模块）
import * as math from './math/index.js'
import * as string from './string/index.js'

// ✅ 测试5：深层模块路径
import * as helpers from '../../../helpers/index.js'

// ✅ 测试6：npm包的命名空间导入
import * as React from 'react'
import * as Vue from 'vue'

// ✅ 测试7：带数字和下划线的别名
import * as Module2_utils from './module-v2.js'

// ✅ 测试8：相对路径的各种形式
import * as sibling from './sibling.js'
import * as parent from '../parent.js'
import * as current from './current/index.js'

/* Es6Parser.ts: NameSpaceImport */
