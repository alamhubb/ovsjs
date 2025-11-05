/**
 * 规则测试：ImportedDefaultBindingCommaNameSpaceImport
 * 
 * 位置：Es2025Parser.ts Line 1792
 * 分类：identifiers
 * 编号：117
 * 
 * EBNF规则：
 *   ImportedDefaultBindingCommaNameSpaceImport:
 *     ImportedDefaultBinding , NameSpaceImport
 * 
 * 规则特征：
 * ✓ default导入 + namespace导入的组合
 * 
 * 测试目标：
 * - 测试default导入与namespace导入的结合
 * - 验证多种模块路径
 * - 测试重命名场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础导入
import def, * as ns from './module.js'

// ✅ 测试2：短名称default导入
import React, * as R from 'react'

// ✅ 测试3：npm包导入
import express, * as exp from 'express'

// ✅ 测试4：相对路径导入
import config, * as cfg from '../config/index.js'

// ✅ 测试5：嵌套路径导入
import utils, * as u from '../../utils/helpers/index.js'

// ✅ 测试6：深层相对导入
import database, * as db from '../../services/db.js'

// ✅ 测试7：多个导入组合
import module1, * as m1 from './m1.js'
import module2, * as m2 from './m2.js'

// ✅ 测试8：不同命名空间别名
import lodash, * as _ from 'lodash'
import moment, * as m from 'moment'

/* Es2025Parser.ts: ImportedDefaultBinding , NameSpaceImport */

/**
 * 规则测试：ImportedDefaultBindingCommaNameSpaceImport
 * 
 * 位置：Es2025Parser.ts Line 1792
 * 分类：identifiers
 * 编号：117
 * 
 * EBNF规则：
 *   ImportedDefaultBindingCommaNameSpaceImport:
 *     ImportedDefaultBinding , NameSpaceImport
 * 
 * 规则特征：
 * ✓ default导入 + namespace导入的组合
 * 
 * 测试目标：
 * - 测试default导入与namespace导入的结合
 * - 验证多种模块路径
 * - 测试重命名场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础导入
import def, * as ns from './module.js'

// ✅ 测试2：短名称default导入
import React, * as R from 'react'

// ✅ 测试3：npm包导入
import express, * as exp from 'express'

// ✅ 测试4：相对路径导入
import config, * as cfg from '../config/index.js'

// ✅ 测试5：嵌套路径导入
import utils, * as u from '../../utils/helpers/index.js'

// ✅ 测试6：深层相对导入
import database, * as db from '../../services/db.js'

// ✅ 测试7：多个导入组合
import module1, * as m1 from './m1.js'
import module2, * as m2 from './m2.js'

// ✅ 测试8：不同命名空间别名
import lodash, * as _ from 'lodash'
import moment, * as m from 'moment'

/* Es2025Parser.ts: ImportedDefaultBinding , NameSpaceImport */
