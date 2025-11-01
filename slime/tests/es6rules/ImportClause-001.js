
/* Es6Parser.ts: Or[NameSpaceImport, NamedImports, DefaultBinding, DefaultBinding NameSpaceImport, DefaultBinding NamedImports] */


// ============================================
// 来自文件: 703-ImportClause.js
// ============================================

/**
 * 规则测试：ImportClause
 * 
 * 位置：Es6Parser.ts Line 1771
 * 分类：modules
 * 编号：703
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   ImportClause:
 *     ImportedDefaultBindingCommaNameSpaceImport  (长规则1)
 *     ImportedDefaultBindingCommaNamedImports     (长规则2)
 *     ImportedDefaultBinding                      (短规则1)
 *     NameSpaceImport                             (短规则2)
 *     NamedImports                                (短规则3)
 * 
 * 测试目标：
 * - 覆盖所有5个Or分支
 * - 验证长规则优先原则（问题#4的关键）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：ImportedDefaultBinding only
import defaultExport from './module.js'

// ✅ 测试2：NamedImports only - 单个named
import {name} from './module.js'

// ✅ 测试3：NamedImports only - 多个named
import {name1, name2, name3} from './module.js'

// ✅ 测试4：NameSpaceImport only
import * as everything from './module.js'

// ✅ 测试5：ImportedDefaultBindingCommaNamedImports - 单个named
// 这是问题#4的关键测试
import defaultExport1, {named1} from './module1.js'

// ✅ 测试6：ImportedDefaultBindingCommaNamedImports - 多个named
import defaultExport2, {named1, named2} from './module2.js'

// ✅ 测试7：ImportedDefaultBindingCommaNamedImports - named with rename
import React, {useState as useStateHook, useEffect} from 'react'

// ✅ 测试8：ImportedDefaultBindingCommaNameSpaceImport
import lodash, * as _ from 'lodash'

// ✅ 测试9：复杂场景 - 多个import语句
import axios, {get, post, put, delete as del} from 'axios'
import Vue, * as VueAll from 'vue'
import {debounce, throttle} from 'lodash-es'

/* Es6Parser.ts: ImportClause */


// ============================================
// 合并来自: ImportList-001.js
// ============================================


/* Es6Parser.ts: ImportSpecifier (Comma ImportSpecifier)* */
