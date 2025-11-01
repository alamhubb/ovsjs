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
