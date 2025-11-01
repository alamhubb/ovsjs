/**
 * 规则测试：ImportedBinding
 * 
 * 位置：Es6Parser.ts Line 1880
 * 分类：identifiers
 * 编号：120
 * 
 * 规则特征：
 * - 简单规则：直接使用BindingIdentifier
 * 
 * 规则语法：
 *   ImportedBinding:
 *     BindingIdentifier
 * 
 * 测试目标：
 * - 测试import语句中的绑定标识符
 * - 在各种import场景中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：default import
import defaultExport from './module.js'

// ✅ 测试2：named import - 单个
import {name} from './module.js'

// ✅ 测试3：named import - 多个
import {name, age, value} from './module.js'

// ✅ 测试4：namespace import
import * as everything from './module.js'

// ✅ 测试5：renamed import
import {originalName as newName} from './module.js'

// ✅ 测试6：混合import
import React, {useState, useEffect} from 'react'

// ✅ 测试7：default + namespace
import lodash, * as _ from 'lodash'

// ✅ 测试8：多个import语句
import fs from 'fs'
import path from 'path'
import {readFile, writeFile} from 'fs/promises'
/* Es6Parser.ts: IdentifierName */

/**
 * 规则测试：ImportedBinding
 * 
 * 位置：Es6Parser.ts Line 1880
 * 分类：identifiers
 * 编号：120
 * 
 * 规则特征：
 * - 简单规则：直接使用BindingIdentifier
 * 
 * 规则语法：
 *   ImportedBinding:
 *     BindingIdentifier
 * 
 * 测试目标：
 * - 测试import语句中的绑定标识符
 * - 在各种import场景中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：default import
import defaultExport from './module.js'

// ✅ 测试2：named import - 单个
import {name} from './module.js'

// ✅ 测试3：named import - 多个
import {name, age, value} from './module.js'

// ✅ 测试4：namespace import
import * as everything from './module.js'

// ✅ 测试5：renamed import
import {originalName as newName} from './module.js'

// ✅ 测试6：混合import
import React, {useState, useEffect} from 'react'

// ✅ 测试7：default + namespace
import lodash, * as _ from 'lodash'

// ✅ 测试8：多个import语句
import fs from 'fs'
import path from 'path'
import {readFile, writeFile} from 'fs/promises'
/* Es6Parser.ts: IdentifierName */
