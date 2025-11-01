/**
 * 规则测试：BindingIdentifier
 * 分类：identifiers | 编号：102
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1-16：BindingIdentifier各种绑定场景
const bindVar = 1
let bindLet = 2
var bindVar2 = 3
function bindFunc() {}
class BindClass {}
const { bindProp } = { bindProp: 1 }
const [bindArr] = [1]
try {} catch (bindError) {}
for (let bindFor of []) {}
for (const [bindDestr] of [[]]) {}
const arrow = (bindParam) => bindParam
async function asyncBind() {}
function* genBind() { yield 1 }
async function* asyncGenBind() { yield 1 }
const [bindRest, ...bindSpread] = [1, 2]
import { bindImport } from './m'
export const bindExport = 1

/* Es6Parser.ts: BindingIdentifier */

/**
 * 规则测试：BindingIdentifier
 * 分类：identifiers | 编号：102
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1-16：BindingIdentifier各种绑定场景
const bindVar = 1
let bindLet = 2
var bindVar2 = 3
function bindFunc() {}
class BindClass {}
const { bindProp } = { bindProp: 1 }
const [bindArr] = [1]
try {} catch (bindError) {}
for (let bindFor of []) {}
for (const [bindDestr] of [[]]) {}
const arrow = (bindParam) => bindParam
async function asyncBind() {}
function* genBind() { yield 1 }
async function* asyncGenBind() { yield 1 }
const [bindRest, ...bindSpread] = [1, 2]
import { bindImport } from './m'
export const bindExport = 1

/* Es6Parser.ts: BindingIdentifier */
