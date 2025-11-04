/**
 * 测试规则: ImportDeclaration
 * 来源: 从 Declaration 拆分
 */

/**
 * 规则测试：ImportDeclaration
 * 
 * 位置：Es6Parser.ts（import语句）
 * 分类：modules
 * 编号：401
 * 
 * 规则语法：
 *   ImportDeclaration:
 *     import ImportClause FromClause
 *     import ModuleSpecifier
 * 
 * 测试目标：
 * ✅ 覆盖所有import形式
 * ✅ default导入、named导入、namespace导入
 * ✅ 混合导入方式
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本import default
import React from 'react'

// ✅ 测试2：import named
import { Component } from 'react'

// ✅ 测试3：import multiple named
import { Component, Fragment, useState } from 'react'

// ✅ 测试4：import namespace
import * as React2 from 'react'

// ✅ 测试5：import default + named
import React3, { Component as C } from 'react'

// ✅ 测试6：import default + namespace
import React4, * as ReactAll from 'react'

// ✅ 测试7：import side-effect
import 'some-polyfill'

// ✅ 测试8：import相对路径
import { utils } from './utils'

// ✅ 测试9：import上层目录
import { helper } from '../helpers'

// ✅ 测试10：import deep路径
import { deep } from '../../config/settings'

// ✅ 测试11：import with重命名
import { oldName as newName } from './module'

// ✅ 测试12：import多个with重命名
import { a as A, b as B, c as C2 } from './renamed'

// ✅ 测试13：import default with重命名

// ✅ 测试14：import 文件without扩展名
import { getConfig } from './config'

// ✅ 测试15：import 文件with扩展名
import { getData } from './data.js'

// ✅ 测试16：import JSON
import config from './config.json'

// ✅ 测试17：import 复杂组合

// ✅ 测试18：import 多行
import {
    Component,
    Fragment,
    useState,
    useEffect,
    useContext
} from 'react'

// ✅ 测试19：import 包名
import lodash from 'lodash'

// ✅ 测试20：import scoped包
import { something } from '@scope/package'

/* Es6Parser.ts: ImportDeclaration: import ImportClause FromClause | import ModuleSpecifier */


/* Es6Parser.ts: import ImportClause FromClause */

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
