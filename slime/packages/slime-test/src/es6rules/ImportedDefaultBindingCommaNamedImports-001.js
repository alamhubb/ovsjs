/**
 * 规则测试：ImportedDefaultBindingCommaNamedImports
 * 
 * 位置：Es2025Parser.ts Line 1799
 * 分类：identifiers
 * 编号：118
 * 
 * EBNF规则：
 *   ImportedDefaultBindingCommaNamedImports:
 *     ImportedDefaultBinding , NamedImports
 * 
 * 规则特征：
 * ✓ default导入 + named导入的组合
 * 
 * 测试目标：
 * - 测试default与named导入的结合
 * - 验证多个named导入
 * - 测试导入重命名
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础组合导入
import def, {named} from './module.js'

// ✅ 测试2：React和Hooks
import React, {useState} from 'react'

// ✅ 测试3：多个named导入
import express, {Router, Request, Response} from 'express'

// ✅ 测试4：导入重命名
import config, {DB_HOST as host, DB_PORT as port} from './config.js'

// ✅ 测试5：混合regular和重命名
import utils, {helper, parseData as parse} from './utils.js'

// ✅ 测试6：npm包的default + named
import moment, {duration, utc} from 'moment'

// ✅ 测试7：深层路径导入
import service, {query, update, delete as remove} from '../../services/api.js'

// ✅ 测试8：多个组合导入
import lodash, {map, filter} from 'lodash'
import jquery, {ajax, get} from 'jquery'

/* Es2025Parser.ts: ImportedDefaultBinding , NamedImports */

/**
 * 规则测试：ImportedDefaultBindingCommaNamedImports
 * 
 * 位置：Es2025Parser.ts Line 1799
 * 分类：identifiers
 * 编号：118
 * 
 * EBNF规则：
 *   ImportedDefaultBindingCommaNamedImports:
 *     ImportedDefaultBinding , NamedImports
 * 
 * 规则特征：
 * ✓ default导入 + named导入的组合
 * 
 * 测试目标：
 * - 测试default与named导入的结合
 * - 验证多个named导入
 * - 测试导入重命名
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础组合导入
import def, {named} from './module.js'

// ✅ 测试2：React和Hooks
import React, {useState} from 'react'

// ✅ 测试3：多个named导入
import express, {Router, Request, Response} from 'express'

// ✅ 测试4：导入重命名
import config, {DB_HOST as host, DB_PORT as port} from './config.js'

// ✅ 测试5：混合regular和重命名
import utils, {helper, parseData as parse} from './utils.js'

// ✅ 测试6：npm包的default + named
import moment, {duration, utc} from 'moment'

// ✅ 测试7：深层路径导入
import service, {query, update, delete as remove} from '../../services/api.js'

// ✅ 测试8：多个组合导入
import lodash, {map, filter} from 'lodash'
import jquery, {ajax, get} from 'jquery'

/* Es2025Parser.ts: ImportedDefaultBinding , NamedImports */
