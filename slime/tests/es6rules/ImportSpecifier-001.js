/**
 * 规则测试：ImportSpecifier
 * 分类：modules | 编号：403
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1-16：ImportSpecifier各种导入说明符形式
import { x } from './m'
import { x, y } from './m'
import { x, y, z } from './m'
import { component } from 'react'
import { Component, Fragment } from 'react'
import { Component as C } from 'react'
import { a as A, b as B } from './module'
import { first, second as S, third } from './data'
import React, { useState } from 'react'
import React as R, { useEffect } from 'react'
import * as React from 'react'
import { config } from './config.js'
import { Component, Fragment, useState, useEffect } from 'react'
import { helper1, helper2, helper3 } from '../utils'
import { a, b, c, d, e } from './large'
import { default as defaultExport } from './module'

/* Es6Parser.ts: ImportSpecifier */


// ============================================
// 来自文件: 426-ImportSpecifier.js
// ============================================

/**
 * 规则测试：ImportSpecifier
 * 
 * 位置：Es6Parser.ts Line 1859
 * 分类：statements
 * 编号：426
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支


 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

import {name} from './module.js'
import {name as alias} from './module.js'

/* Es6Parser.ts: ImportSpecifier */


// ============================================
// 来自文件: 507-ImportSpecifier.js
// ============================================


/* Es6Parser.ts: IdentifierName (as IdentifierName)? */
