/**
 * 规则测试：ImportedDefaultBinding
 * 
 * 位置：Es6Parser.ts Line 1806
 * 分类：identifiers
 * 编号：119
 * 
 * EBNF规则：
 *   ImportedDefaultBinding:
 *     BindingIdentifier
 * 
 * 规则特征：
 * ✓ 默认导出的绑定标识符
 * 
 * 测试目标：
 * - 测试各种default导入的名称
 * - 验证不同模块来源的导入
 * - 测试简写和完整路径
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础default导入
import defaultExport from './module.js'

// ✅ 测试2：React框架导入
import React from 'react'

// ✅ 测试3：Vue框架导入
import Vue from 'vue'

// ✅ 测试4：Express框架导入
import express from 'express'

// ✅ 测试5：npm工具包导入
import lodash from 'lodash'

// ✅ 测试6：相对路径导入
import config from '../config/index.js'

// ✅ 测试7：深层相对路径导入
import utils from '../../lib/utilities/helpers.js'

// ✅ 测试8：多个default导入
import App from './App.js'
import Router from './Router.js'
import Store from './Store.js'

/* Es6Parser.ts: ImportedDefaultBinding */

/**
 * 规则测试：ImportedDefaultBinding
 * 
 * 位置：Es6Parser.ts Line 1806
 * 分类：identifiers
 * 编号：119
 * 
 * EBNF规则：
 *   ImportedDefaultBinding:
 *     BindingIdentifier
 * 
 * 规则特征：
 * ✓ 默认导出的绑定标识符
 * 
 * 测试目标：
 * - 测试各种default导入的名称
 * - 验证不同模块来源的导入
 * - 测试简写和完整路径
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础default导入
import defaultExport from './module.js'

// ✅ 测试2：React框架导入
import React from 'react'

// ✅ 测试3：Vue框架导入
import Vue from 'vue'

// ✅ 测试4：Express框架导入
import express from 'express'

// ✅ 测试5：npm工具包导入
import lodash from 'lodash'

// ✅ 测试6：相对路径导入
import config from '../config/index.js'

// ✅ 测试7：深层相对路径导入
import utils from '../../lib/utilities/helpers.js'

// ✅ 测试8：多个default导入
import App from './App.js'
import Router from './Router.js'
import Store from './Store.js'

/* Es6Parser.ts: ImportedDefaultBinding */
