import { LRUCache } from "lru-cache";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import fastCartesian from "fast-cartesian";
import graphlib from "@dagrejs/graphlib";

//#region rolldown:runtime
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __export = (all, symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);

//#endregion
//#region src/SubhutiTokenLookahead.ts
var SubhutiTokenLookahead = class {
	constructor() {
		this._parseSuccess = true;
	}
	get parserFail() {
		return !this._parseSuccess;
	}
	/**
	* 标记解析失败（用于手动失败）
	*
	* 用于自定义验证逻辑中标记解析失败
	*
	* @returns never (实际返回 undefined，但类型声明为 never 以便链式调用)
	*/
	setParseFail() {
		this._parseSuccess = false;
	}
	/**
	* 获取当前 token（由子类实现）
	*/
	get curToken() {}
	/**
	* 前瞻：获取未来的 token（不消费）
	* 由子类 SubhutiParser 覆盖实现
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @returns token 或 undefined（EOF）
	*/
	peek(offset = 1) {}
	/**
	* LA (LookAhead) - 前瞻获取 token（不消费）
	*
	* 这是 parser 领域的标准术语：
	* - LA(1) = 当前 token
	* - LA(2) = 下一个 token
	* - LA(n) = 第 n 个 token
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @returns token 或 undefined（EOF）
	*/
	LA(offset = 1) {
		return this.peek(offset);
	}
	/**
	* 前瞻：获取连续的 N 个 token
	*
	* @param count 要获取的 token 数量
	* @returns token 数组（长度可能小于 count，如果遇到 EOF）
	*/
	peekSequence(count) {
		const result = [];
		for (let i = 1; i <= count; i++) {
			const token = this.peek(i);
			if (!token) break;
			result.push(token);
		}
		return result;
	}
	/**
	* [lookahead = token]
	* 规范：正向前瞻，检查下一个 token 是否匹配
	*/
	lookahead(tokenName, offset = 1) {
		return this.peek(offset)?.tokenName === tokenName;
	}
	/**
	* [lookahead ≠ token]
	* 规范：否定前瞻，检查下一个 token 是否不匹配
	*/
	lookaheadNot(tokenName, offset = 1) {
		const token = this.peek(offset);
		return token ? token.tokenName !== tokenName : true;
	}
	/**
	* [lookahead ∈ {t1, t2, ...}]
	* 规范：正向集合前瞻，检查下一个 token 是否在集合中
	*/
	lookaheadIn(tokenNames, offset = 1) {
		const token = this.peek(offset);
		return token ? tokenNames.includes(token.tokenName) : false;
	}
	/**
	* [lookahead ∉ {t1, t2, ...}]
	* 规范：否定集合前瞻，检查下一个 token 是否不在集合中
	*/
	lookaheadNotIn(tokenNames, offset = 1) {
		const token = this.peek(offset);
		return token ? !tokenNames.includes(token.tokenName) : true;
	}
	/**
	* [lookahead = t1 t2 ...]
	* 规范：序列前瞻，检查连续的 token 序列是否匹配
	*/
	lookaheadSequence(tokenNames) {
		const peeked = this.peekSequence(tokenNames.length);
		if (peeked.length !== tokenNames.length) return false;
		return peeked.every((token, i) => token.tokenName === tokenNames[i]);
	}
	/**
	* [lookahead ≠ t1 t2 ...]
	* 规范：否定序列前瞻，检查连续的 token 序列是否不匹配
	*/
	lookaheadNotSequence(tokenNames) {
		return !this.lookaheadSequence(tokenNames);
	}
	/**
	* 检查：token 序列匹配且中间无换行符
	*
	* @param tokenNames token 名称序列
	* @returns true = 序列匹配且中间都在同一行
	*
	* @example
	* // async [no LineTerminator here] function
	* if (this.lookaheadSequenceNoLT(['AsyncTok', 'FunctionTok'])) { ... }
	*/
	lookaheadSequenceNoLT(tokenNames) {
		const peeked = this.peekSequence(tokenNames.length);
		if (peeked.length !== tokenNames.length) return false;
		for (let i = 0; i < tokenNames.length; i++) {
			if (peeked[i].tokenName !== tokenNames[i]) return false;
			if (i > 0 && peeked[i].hasLineBreakBefore) return false;
		}
		return true;
	}
	/**
	* [no LineTerminator here]
	* 检查当前 token 前是否有换行符
	*/
	lookaheadHasLineBreak() {
		return this.curToken?.hasLineBreakBefore ?? false;
	}
	/**
	* 断言：当前 token 必须是指定类型
	* 如果不是，则标记失败
	*
	* @param tokenName - 必须的 token 类型
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead = =]
	* this.assertLookahead('Assign')
	*/
	assertLookahead(tokenName, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookahead(tokenName, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 不能是指定类型
	* 如果是，则标记失败
	*
	* @param tokenName - 不允许的 token 类型
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ else]
	* this.assertLookaheadNot('ElseTok')
	*/
	assertLookaheadNot(tokenName, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNot(tokenName, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 必须在指定集合中
	* 如果不在，则标记失败
	*
	* @param tokenNames - 允许的 token 类型列表
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ∈ {8, 9}]
	* this.assertLookaheadIn(['DecimalDigit8', 'DecimalDigit9'])
	*/
	assertLookaheadIn(tokenNames, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadIn(tokenNames, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 不能在指定集合中
	* 如果在，则标记失败
	*
	* @param tokenNames - 不允许的 token 类型列表
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ∉ {{, function, class}]
	* this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
	*/
	assertLookaheadNotIn(tokenNames, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNotIn(tokenNames, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：必须是指定的 token 序列
	* 如果不匹配，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead = async function]
	* this.assertLookaheadSequence(['AsyncTok', 'FunctionTok'])
	*/
	assertLookaheadSequence(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadSequence(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：不能是指定的 token 序列
	* 如果匹配，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ let []
	* this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
	*/
	assertLookaheadNotSequence(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNotSequence(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：不能是指定的 token 序列（考虑换行符约束）
	* 如果序列匹配且中间没有换行符，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ async [no LineTerminator here] function]
	* this.assertLookaheadNotSequenceNoLT(['AsyncTok', 'FunctionTok'])
	*/
	assertLookaheadNotSequenceNoLT(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = !this.lookaheadSequenceNoLT(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 前不能有换行符
	* 如果有，则标记失败
	*
	* @returns 断言是否成功
	*
	* @example
	* // [no LineTerminator here]
	* this.assertNoLineBreak()
	*/
	assertNoLineBreak() {
		if (!this._parseSuccess) return false;
		const result = !this.lookaheadHasLineBreak();
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：条件必须为真
	* 如果条件为假，则标记失败
	*
	* @param condition - 要检查的条件
	* @returns 断言是否成功（即条件本身）
	*
	* @example
	* // 断言：标识符不能是保留字
	* const cst = this.tokenConsumer.Identifier()
	* this.assertCondition(!(cst && ReservedWords.has(cst.value!)))
	*/
	assertCondition(condition) {
		if (!this._parseSuccess) return false;
		if (!condition) this._parseSuccess = false;
		return condition;
	}
	/**
	* 检查当前 token 是否匹配指定类型
	* 对应 Babel 的 match 方法
	* @param tokenName token 类型名称
	*/
	match(tokenName) {
		return this.curToken?.tokenName === tokenName;
	}
};

//#endregion
//#region src/struct/SubhutiCst.ts
var SubhutiCst = class {
	constructor(cst) {
		if (cst) {
			this.name = cst.name;
			this.children = cst.children;
			this.value = cst.value;
		}
	}
	/**
	* 获取指定名称的第 N 个子节点
	*
	* @param name 子节点名称
	* @param index 索引（默认 0，即第一个）
	* @returns 匹配的子节点，如果不存在返回 undefined
	*
	* 用法：
	* ```typescript
	* const leftOperand = cst.getChild('Expression', 0)
	* const rightOperand = cst.getChild('Expression', 1)
	* ```
	*/
	getChild(name, index = 0) {
		if (!this.children) return void 0;
		return this.children.filter((c) => c.name === name)[index];
	}
	/**
	* 获取所有指定名称的子节点
	*
	* @param name 子节点名称
	* @returns 匹配的子节点数组
	*
	* 用法：
	* ```typescript
	* const allStatements = cst.getChildren('Statement')
	* ```
	*/
	getChildren(name) {
		if (!this.children) return [];
		return this.children.filter((c) => c.name === name);
	}
	/**
	* 获取指定名称的 token 节点
	*
	* @param tokenName Token 名称
	* @returns 匹配的 token 节点，如果不存在返回 undefined
	*
	* 用法：
	* ```typescript
	* const identifier = cst.getToken('Identifier')
	* console.log(identifier?.value)
	* ```
	*/
	getToken(tokenName) {
		if (!this.children) return void 0;
		return this.children.find((c) => c.name === tokenName && c.value !== void 0);
	}
	/**
	* 检查是否有指定名称的子节点
	*
	* @param name 子节点名称
	* @returns 如果存在返回 true，否则返回 false
	*
	* 用法：
	* ```typescript
	* if (cst.hasChild('ElseClause')) {
	*   // 处理 else 分支
	* }
	* ```
	*/
	hasChild(name) {
		if (!this.children) return false;
		return this.children.some((c) => c.name === name);
	}
	/**
	* 获取子节点数量
	*/
	get childCount() {
		return this.children?.length || 0;
	}
	/**
	* 是否为叶子节点（token 节点）
	*/
	get isToken() {
		return this.value !== void 0;
	}
	/**
	* 是否为空节点（无子节点）
	*/
	get isEmpty() {
		return !this.children || this.children.length === 0;
	}
};

//#endregion
//#region src/SubhutiError.ts
/**
* 解析错误类
*
* 设计理念：
* - 清晰的视觉层次
* - 关键信息突出显示
* - 智能修复建议（只保留最常见的场景）
*
* 参考：Rust compiler error messages
*/
var ParsingError = class extends Error {
	constructor(message, details, useDetailed = true) {
		super(message);
		this.name = "ParsingError";
		this.type = details.type || "parsing";
		this.expected = details.expected;
		this.found = details.found;
		this.position = details.position;
		this.ruleStack = Object.freeze([...details.ruleStack]);
		this.loopRuleName = details.loopRuleName;
		this.loopDetectionSet = details.loopDetectionSet ? Object.freeze([...details.loopDetectionSet]) : void 0;
		this.loopCstDepth = details.loopCstDepth;
		this.loopCacheStats = details.loopCacheStats;
		this.loopTokenContext = details.loopTokenContext ? Object.freeze([...details.loopTokenContext]) : void 0;
		this.hint = details.hint;
		this.rulePath = details.rulePath;
		this.useDetailed = useDetailed;
		if (details.suggestions && details.suggestions.length > 0) this.suggestions = Object.freeze([...details.suggestions]);
		else if (this.type === "parsing" && useDetailed) this.suggestions = Object.freeze(this.generateSuggestions());
		else this.suggestions = Object.freeze([]);
	}
	/**
	* 智能修复建议生成器（简化版）⭐
	* 
	* 只保留最常见的 8 种错误场景：
	* 1. 闭合符号缺失（{} () []）
	* 2. 分号问题
	* 3. 关键字拼写错误
	* 4. 标识符错误
	* 5. EOF 问题
	*/
	generateSuggestions() {
		const suggestions = [];
		const { expected, found } = this;
		if (expected === "RBrace") suggestions.push("💡 可能缺少闭合花括号 }");
		else if (expected === "RParen") suggestions.push("💡 可能缺少闭合括号 )");
		else if (expected === "RBracket") suggestions.push("💡 可能缺少闭合方括号 ]");
		else if (expected === "Semicolon") suggestions.push("💡 可能缺少分号 ;");
		else if (found?.tokenName === "Semicolon" && expected !== "Semicolon") suggestions.push("💡 意外的分号");
		else if (expected.endsWith("Tok") && found?.tokenName === "Identifier") {
			const keyword = expected.replace("Tok", "").toLowerCase();
			suggestions.push(`💡 期望关键字 "${keyword}"，检查是否拼写错误`);
		} else if (expected === "Identifier") {
			if (found?.tokenName === "Number") suggestions.push("💡 变量名不能以数字开头");
			else if (found?.tokenName?.endsWith("Tok")) {
				const keyword = found.tokenName.replace("Tok", "").toLowerCase();
				suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`);
			}
		}
		if (!found || found.tokenName === "EOF") suggestions.push("💡 代码意外结束，检查是否有未闭合的括号、花括号或引号");
		return suggestions.slice(0, 3);
	}
	/**
	* 格式化错误信息（根据类型和模式选择）⭐
	*/
	toString() {
		if (this.type === "or-branch-shadowing") return this.toOrBranchShadowingString();
		if (this.type === "left-recursion" || this.type === "infinite-loop") return this.toLoopDetailedString();
		return this.useDetailed ? this.toDetailedString() : this.toSimpleString();
	}
	/**
	* 详细格式（Rust 风格 + 智能建议）
	*/
	toDetailedString() {
		const lines = [];
		lines.push("❌ Parsing Error");
		lines.push("");
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName || "EOF"} @ line ${this.position.line}:${this.position.column} (pos ${this.position.codeIndex})`);
		lines.push("");
		lines.push(`Expected: ${this.expected}`);
		lines.push(`Found:    ${this.found?.tokenName || "EOF"}`);
		if (this.ruleStack.length > 0) {
			lines.push("");
			lines.push("Rule stack:");
			const visible = this.ruleStack.slice(-5);
			const hidden = this.ruleStack.length - visible.length;
			if (hidden > 0) lines.push(`  ... (${hidden} more)`);
			visible.forEach((rule, i) => {
				const prefix = i === visible.length - 1 ? "└─>" : "├─>";
				lines.push(`  ${prefix} ${rule}`);
			});
		}
		if (this.suggestions.length > 0) {
			lines.push("");
			lines.push("Suggestions:");
			this.suggestions.forEach((suggestion) => {
				lines.push(`  ${suggestion}`);
			});
		}
		return lines.join("\n");
	}
	/**
	* 简单格式（基本信息）
	*/
	toSimpleString() {
		return `Parsing Error at token[${this.position.tokenIndex}] line ${this.position.line}:${this.position.column}: Expected ${this.expected}, found ${this.found?.tokenName || "EOF"}`;
	}
	/**
	* 简洁格式（用于日志）
	*/
	toShortString() {
		return this.toSimpleString();
	}
	/**
	* 格式化左递归路径（更清晰的显示）
	*/
	formatLeftRecursionPath(lines) {
		if (!this.loopRuleName || this.ruleStack.length === 0) return;
		let firstRecursionIndex = -1;
		let recursiveRuleName = this.loopRuleName;
		const ruleCounts = /* @__PURE__ */ new Map();
		for (let i = 0; i < this.ruleStack.length; i++) {
			const rule = this.ruleStack[i];
			const count = (ruleCounts.get(rule) || 0) + 1;
			ruleCounts.set(rule, count);
			if (count === 2 && firstRecursionIndex === -1) {
				firstRecursionIndex = this.ruleStack.indexOf(rule);
				recursiveRuleName = rule;
			}
		}
		if (firstRecursionIndex === -1) {
			lines.push(`  完整调用栈:`);
			this.ruleStack.forEach((rule, i) => {
				lines.push(`    ${i + 1}. ${rule}`);
			});
			return;
		}
		const recursionPath = this.ruleStack.slice(firstRecursionIndex);
		const pathType = recursionPath.length === 1 ? "直接左递归" : "间接左递归";
		lines.push(`  类型: ${pathType}`);
		lines.push(`  循环规则: ${recursiveRuleName}`);
		lines.push(`  路径: ${recursionPath.join(" → ")} → ${recursiveRuleName} ⚠️`);
		lines.push("");
		lines.push("  详细调用栈:");
		recursionPath.forEach((rule, i) => {
			const marker = i === 0 ? " ← 首次调用" : rule === recursiveRuleName ? " ← 循环" : "";
			lines.push(`    ${i + 1}. ${rule}${marker}`);
		});
		lines.push(`    ${recursionPath.length + 1}. ${recursiveRuleName} ⚠️ 循环点`);
	}
	/**
	* 循环错误详细格式⭐
	* 
	* 展示信息：
	* - 循环规则名和位置
	* - 当前 token 信息
	* - 完整规则调用栈
	* - 循环检测集合内容
	* - CST 栈深度
	* - 缓存统计（可选）
	* - Token 上下文（可选）
	* - 修复建议
	*/
	toLoopDetailedString() {
		const lines = [];
		lines.push(`❌ 检测到${this.type === "left-recursion" ? "左递归" : "无限循环"}`);
		lines.push("");
		lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`);
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName || "EOF"}("${this.found?.tokenValue || ""}") @ line ${this.position.line}:${this.position.column}`);
		lines.push("");
		if (this.rulePath) {
			lines.push("规则路径:");
			lines.push(this.rulePath);
			lines.push("");
		} else if (this.ruleStack.length > 0) if (this.type === "left-recursion") {
			lines.push("左递归路径:");
			this.formatLeftRecursionPath(lines);
			lines.push("");
		} else {
			lines.push("规则调用栈:");
			const visible = this.ruleStack.slice(-8);
			const hidden = this.ruleStack.length - visible.length;
			if (hidden > 0) lines.push(`  ... (隐藏 ${hidden} 层)`);
			visible.forEach((rule, i) => {
				const isLast = i === visible.length - 1;
				const prefix = "  " + "  ".repeat(i) + (isLast ? "└─>" : "├─>");
				lines.push(`${prefix} ${rule}`);
			});
			lines.push(`  ${"  ".repeat(visible.length)}└─> ${this.loopRuleName} ⚠️ 循环点`);
			lines.push("");
		}
		lines.push("诊断信息:");
		lines.push(`  • CST 栈深度: ${this.loopCstDepth}`);
		if (this.loopDetectionSet) {
			lines.push(`  • 循环检测点: ${this.loopDetectionSet.length} 个`);
			if (this.loopDetectionSet.length > 0 && this.loopDetectionSet.length <= 10) lines.push(`    ${this.loopDetectionSet.join(", ")}`);
			else if (this.loopDetectionSet.length > 10) lines.push(`    ${this.loopDetectionSet.slice(0, 10).join(", ")} ...`);
		}
		if (this.loopCacheStats) {
			lines.push(`  • 缓存命中率: ${this.loopCacheStats.hitRate} (${this.loopCacheStats.hits} hits / ${this.loopCacheStats.misses} misses)`);
			lines.push(`  • 缓存大小: ${this.loopCacheStats.currentSize}`);
		}
		if (this.loopTokenContext && this.loopTokenContext.length > 0) {
			lines.push("");
			lines.push("Token 上下文:");
			this.loopTokenContext.forEach((token) => {
				const marker = token === this.found ? " <-- 当前位置" : "";
				lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`);
			});
		}
		if (this.hint) {
			lines.push("💡 提示:");
			lines.push(`  ${this.hint}`);
			lines.push("");
		}
		lines.push("");
		lines.push("⚠️ PEG 解析器无法直接处理左递归。");
		lines.push("请重构语法以消除左递归。");
		lines.push("");
		lines.push("示例:");
		lines.push("  ❌ 错误:  Expression → Expression '+' Term | Term");
		lines.push("  ✅ 正确:  Expression → Term ('+' Term)*");
		lines.push("");
		lines.push("常见模式:");
		lines.push("  • 左递归:       A → A 'x' | 'y'          →  改为: A → 'y' ('x')*");
		lines.push("  • 间接左递归:   A → B, B → C, C → A      →  需要手动展开或重构");
		lines.push("  • 循环依赖:     A → B, B → A             →  检查是否有空匹配分支");
		return lines.join("\n");
	}
	/**
	* Or 分支遮蔽错误格式化（详细版）
	*/
	toOrBranchShadowingString() {
		const lines = [];
		lines.push("");
		lines.push("=".repeat(80));
		lines.push("❌ 检测到 Or 分支遮蔽问题");
		lines.push("=".repeat(80));
		lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`);
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName}("${this.found?.tokenValue}") @ line ${this.position.line}:${this.position.column}`);
		lines.push("");
		if (this.ruleStack.length > 0) {
			lines.push("规则调用栈:");
			this.ruleStack.forEach((rule, index) => {
				const marker = index === this.ruleStack.length - 1 ? " <-- 当前规则" : "";
				lines.push(`  [${index}] ${rule}${marker}`);
			});
			lines.push("");
		}
		if (this.loopTokenContext && this.loopTokenContext.length > 0) {
			lines.push("Token 上下文:");
			this.loopTokenContext.forEach((token) => {
				const marker = token === this.found ? " <-- 当前位置" : "";
				lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`);
			});
			lines.push("");
		}
		if (this.hint) {
			lines.push("💡 提示:");
			lines.push(`  ${this.hint}`);
			lines.push("");
		}
		lines.push("");
		lines.push("⚠️ 这不是左递归问题，而是 Or 分支遮蔽问题！");
		lines.push("");
		lines.push("问题原因:");
		lines.push("  在 PEG 中，Or 是顺序选择（Ordered Choice）：");
		lines.push("  - 第一个匹配的分支会立即返回");
		lines.push("  - 如果前面的分支\"部分匹配\"了输入，后面的分支永远无法尝试");
		lines.push("  - 这导致某些输入无法正确解析");
		lines.push("");
		lines.push("示例:");
		lines.push("  ❌ 错误顺序:");
		lines.push("    LeftHandSideExpression → NewExpression | CallExpression");
		lines.push("    // NewExpression 包含 MemberExpression");
		lines.push("    // CallExpression 也包含 MemberExpression，但还有 Arguments");
		lines.push("    // NewExpression 会先匹配 \"console.log\"，导致 CallExpression 无法匹配 \"console.log(...)\"");
		lines.push("");
		lines.push("  ✅ 正确顺序:");
		lines.push("    LeftHandSideExpression → CallExpression | NewExpression");
		lines.push("    // 先尝试更长的规则（CallExpression）");
		lines.push("    // 再尝试更短的规则（NewExpression）");
		lines.push("");
		lines.push("修复方法:");
		lines.push("  1. 调整 Or 分支顺序：将更具体、更长的规则放在前面");
		lines.push("  2. 确保前面的分支不会\"遮蔽\"后面的分支");
		lines.push("  3. 如果两个分支有包含关系，将\"更大\"的分支放在前面");
		return lines.join("\n");
	}
};
/**
* Subhuti 错误处理器
* 
* 管理错误创建和格式化
*/
var SubhutiErrorHandler = class {
	constructor() {
		this.enableDetailedErrors = true;
	}
	/**
	* 设置是否启用详细错误
	* 
	* @param enable - true: 详细错误（Rust风格+建议），false: 简单错误
	*/
	setDetailed(enable) {
		this.enableDetailedErrors = enable;
	}
	/**
	* 创建解析错误
	* 
	* @param details - 错误详情
	* @returns ParsingError 实例
	*/
	createError(details) {
		return new ParsingError(`Expected ${details.expected}`, details, this.enableDetailedErrors);
	}
};

//#endregion
//#region src/SubhutiDebugRuleTracePrint.ts
/**
* SubhutiDebugRuleTracePrint - 规则路径输出工具类
*
* 职责：
* - 负责规则执行路径的格式化输出
* - 处理规则链的折叠显示
* - 计算缩进和显示深度
* - 生成 Or 分支标记
*
* 设计：
* - 纯静态方法，无实例状态
* - 直接基于 RuleStackItem[] 进行输出
* - 可以修改传入的状态对象（副作用）
* - 直接输出到控制台
*
* 配置：
* - showRulePath: 控制是否输出规则执行路径（默认 true）
*/
let _showRulePath = true;
/**
* 设置是否显示规则执行路径
* @param show - true 显示，false 不显示
*/
function setShowRulePath(show) {
	_showRulePath = show;
}
/**
* 获取当前是否显示规则执行路径
*/
function getShowRulePath() {
	return _showRulePath;
}
/**
* 树形输出格式化辅助类
*
* 提供统一的格式化工具方法供调试工具使用
*
* 核心功能：
* 1. formatLine - 统一的行输出格式化（自动处理缩进、拼接、过滤空值）
* 2. formatTokenValue - Token 值转义和截断
* 3. formatLocation - 位置信息格式化
* 4. formatRuleChain - 规则链拼接
*/
var TreeFormatHelper = class {
	/**
	* 格式化一行输出
	*
	* @param parts - 内容数组（null/undefined/'' 会被自动过滤）
	* @param options - 配置选项
	*/
	static formatLine(content, options) {
		return (options.prefix ?? "  ".repeat(options.depth ?? 0)) + content;
	}
	static contentJoin(parts) {
		return parts.filter((p) => p !== null && p !== void 0 && p !== "");
	}
	/**
	* 格式化 Token 值（处理特殊字符和长度限制）
	*
	* @param value - 原始值
	* @param maxLength - 最大长度（超过则截断）
	*/
	static formatTokenValue(value, maxLength = 40) {
		let escaped = value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
		if (escaped.length > maxLength) escaped = escaped.slice(0, maxLength) + "...";
		return escaped;
	}
	/**
	* 格式化位置信息
	*
	* @param loc - 位置对象 {start: {line, column}, end: {line, column}}
	*/
	static formatLocation(loc) {
		if (!loc?.start || !loc?.end) return "";
		const startLine = loc.start.line;
		const startCol = loc.start.column;
		const endLine = loc.end.line;
		const endCol = loc.end.column;
		if (startLine === endLine) return `[${startLine}:${startCol}-${endCol}]`;
		else return `[${startLine}:${startCol}-${endLine}:${endCol}]`;
	}
	/**
	* 格式化规则链（用于折叠显示）
	*
	* @param rules - 规则名数组
	* @param separator - 分隔符（默认 " > "）
	*/
	static formatRuleChain(rules, separator = " > ") {
		return rules.join(separator);
	}
};
var SubhutiDebugRuleTracePrint = class SubhutiDebugRuleTracePrint {
	/**
	* 统一的 Or 标记格式化方法
	* 所有字符串拼接都在这里处理
	*
	* @param item - 规则栈项
	* @returns 显示后缀（如 "" / " [Or]" / " [Or #1/3]"）
	*/
	static formatOrSuffix(item) {
		if (item.orBranchInfo) {
			const info = item.orBranchInfo;
			if (info.isOrEntry) return " [Or]";
			else if (info.isOrBranch) return ` [Or #${info.branchIndex + 1}/${info.totalBranches}]`;
			else return `错误`;
		}
		return "";
	}
	/**
	* 判断是否是 Or 相关节点
	*/
	static isOrEntry(item) {
		return item.orBranchInfo?.isOrEntry;
	}
	static getPrintToken(tokenItem, location) {
		const value = TreeFormatHelper.formatTokenValue(tokenItem.tokenValue || "", 20);
		if (tokenItem.tokenSuccess) return [
			"✅",
			"Consume",
			`token[${tokenItem.tokenIndex}]`,
			value,
			"-",
			`<${tokenItem.tokenName}>`,
			location || "[]"
		].join(" ");
		else return [
			"❌",
			`token[${tokenItem.tokenIndex}]`,
			"Expect:",
			tokenItem.tokenExpectName,
			"-",
			"Get:",
			value,
			"-",
			`<${tokenItem.tokenName}>`
		].join(" ");
	}
	/**
	* 格式化一行（返回字符串）
	*/
	static formatLine(str, depth, symbol = "└─") {
		return TreeFormatHelper.formatLine(str, { prefix: "│  ".repeat(depth) + symbol });
	}
	static consoleLog(...strs) {
		if (!_showRulePath) return;
		console.log(...strs);
	}
	/**
	* 非缓存场景：格式化待处理的规则日志（返回字符串数组）
	* 特点：只有一次断链，只有一个折叠段
	*
	* 【设计思路】
	* 1. 不需要提前标记 shouldBreakLine
	* 2. 遍历时直接判断是否到达断点
	* 3. 到达断点前：积累到折叠链
	* 4. 到达断点后：逐个输出并赋值 shouldBreakLine = true
	*/
	static formatPendingOutputs_NonCache_Impl(ruleStack) {
		if (!ruleStack.length) throw new Error("系统错误：ruleStack 为空");
		const allLines = [];
		let unOutputIndex = ruleStack.findIndex((item) => !item.outputted);
		if (unOutputIndex < 0) unOutputIndex = ruleStack.length;
		let pendingRules = ruleStack.slice(unOutputIndex);
		const lastOutputted = ruleStack[unOutputIndex - 1];
		let baseDepth = 0;
		if (lastOutputted) baseDepth = lastOutputted.displayDepth;
		let lastOrIndex = [...pendingRules].reverse().findIndex((item) => !!item.orBranchInfo?.isOrEntry);
		const breakPoint = Math.max(lastOrIndex + 1, 2);
		if (breakPoint < pendingRules.length - 1) {
			const singleRules = pendingRules.splice(-breakPoint);
			const groups = [];
			let currentGroup = [pendingRules[0]];
			groups.push(currentGroup);
			for (let i = 1; i < pendingRules.length; i++) {
				const item = pendingRules[i];
				const prevItem = pendingRules[i - 1];
				if (item.shouldBreakLine === prevItem.shouldBreakLine) currentGroup.push(item);
				else {
					currentGroup = [item];
					groups.push(currentGroup);
				}
			}
			for (const group of groups) if (group[0].shouldBreakLine) {
				const result$1 = this.formatMultipleSingleRule(group, baseDepth);
				allLines.push(...result$1.lines);
				baseDepth = result$1.depth;
			} else {
				baseDepth++;
				const lines = this.formatChainRule(group, baseDepth);
				allLines.push(...lines);
			}
			const result = this.formatMultipleSingleRule(singleRules, baseDepth);
			allLines.push(...result.lines);
		} else {
			const result = this.formatMultipleSingleRule(pendingRules, baseDepth);
			allLines.push(...result.lines);
		}
		return allLines;
	}
	/**
	* 非缓存场景：输出待处理的规则日志（直接输出到控制台）
	*/
	static flushPendingOutputs_NonCache_Impl(ruleStack) {
		this.formatPendingOutputs_NonCache_Impl(ruleStack).forEach((line) => this.consoleLog(line));
		return ruleStack[ruleStack.length - 1]?.displayDepth || 0;
	}
	static flushPendingOutputs_Cache_Impl(ruleStack) {
		let pendingRules = ruleStack.filter((item) => !item.outputted);
		if (pendingRules.length === 0) throw new Error("不该触发没有规则场景");
		const groups = [];
		let currentGroup = [pendingRules[0]];
		groups.push(currentGroup);
		for (let i = 1; i < pendingRules.length; i++) {
			const item = pendingRules[i];
			const prevItem = pendingRules[i - 1];
			if (item.shouldBreakLine === prevItem.shouldBreakLine) currentGroup.push(item);
			else {
				currentGroup = [item];
				groups.push(currentGroup);
			}
		}
		for (const group of groups) if (group[0].shouldBreakLine) this.printMultipleSingleRule(group);
		else this.printChainRule(group);
	}
	/**
	* 格式化折叠链（返回字符串数组）
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static formatChainRule(rules, depth = rules[0].displayDepth) {
		if (!rules.length) throw new Error("系统错误");
		const names = rules.map((r) => SubhutiDebugRuleTracePrint.getRuleItemLogContent(r));
		const displayNames = names.length > 4 ? [
			...names.slice(0, 2),
			"...",
			...names.slice(-2)
		] : names;
		const line = SubhutiDebugRuleTracePrint.formatLine(displayNames.join(" > "), depth, "├─");
		rules.forEach((r) => {
			r.displayDepth = depth;
			r.outputted = true;
		});
		return [line];
	}
	/**
	* 打印折叠链（直接输出到控制台）
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static printChainRule(rules, depth = rules[0].displayDepth) {
		this.formatChainRule(rules, depth).forEach((line) => this.consoleLog(line));
	}
	/**
	* 格式化单独规则（返回字符串数组）
	* 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
	*
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static formatMultipleSingleRule(rules, depth = rules[0].displayDepth) {
		const lines = [];
		rules.forEach((item, index) => {
			depth++;
			const isLast = index === rules.length - 1;
			if (!item.isManuallyAdded) item.displayDepth = depth;
			let branch = isLast ? "└─" : "├─";
			let printStr = this.getRuleItemLogContent(item);
			const line = SubhutiDebugRuleTracePrint.formatLine(printStr, item.displayDepth, branch);
			lines.push(line);
			item.outputted = true;
		});
		return {
			lines,
			depth
		};
	}
	/**
	* 打印单独规则（直接输出到控制台）
	* 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
	*
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static printMultipleSingleRule(rules, depth = rules[0].displayDepth) {
		const result = this.formatMultipleSingleRule(rules, depth);
		result.lines.forEach((line) => this.consoleLog(line));
		return result.depth;
	}
	static getRuleItemLogContent(tokenItem) {
		let res = "错误";
		if (tokenItem.orBranchInfo) {
			const branchInfo = tokenItem.orBranchInfo;
			if (tokenItem.orBranchInfo.isOrEntry) res = "🔀 " + tokenItem.ruleName + "(Or)";
			else if (tokenItem.orBranchInfo.isOrBranch) res = `[Branch #${branchInfo.branchIndex + 1}](${tokenItem.ruleName})`;
		} else if (tokenItem.tokenExpectName) res = SubhutiDebugRuleTracePrint.getPrintToken(tokenItem);
		else res = tokenItem.ruleName;
		if (tokenItem.isManuallyAdded) res += ` ⚡[Cached]`;
		return res;
	}
};

//#endregion
//#region src/SubhutiDebug.ts
/**
* Subhuti 调试工具集
*
* 职责：
* - 提供独立的调试工具（无状态）
* - CST 分析、Token 验证、高级调试方法
*
* 使用场景：
* - 测试脚本直接调用
* - 外部工具集成
* - 自定义验证逻辑
*
* @version 4.0.0 - 职责分离
* @date 2025-11-06
*/
var SubhutiDebugUtils = class SubhutiDebugUtils {
	/**
	* 收集 CST 中的所有 token 值
	*
	* @param node - CST 节点
	* @returns token 值数组
	*
	* @example
	* ```typescript
	* const cst = parser.Script()
	* const tokens = SubhutiDebugUtils.collectTokens(cst)
	* console.log(tokens)  // ['const', 'obj', '=', '{', 'sum', ':', '5', '+', '6', '}']
	* ```
	*/
	static collectTokens(node) {
		const values = [];
		if (!node) return values;
		if (node.value !== void 0 && (!node.children || node.children.length === 0)) values.push(node.value);
		if (node.children && Array.isArray(node.children)) for (const child of node.children) values.push(...SubhutiDebugUtils.collectTokens(child));
		return values;
	}
	/**
	* 验证 CST 的 token 完整性
	*
	* @param cst - CST 节点
	* @param inputTokens - 输入 token 数组或 token 值数组
	* @returns 验证结果
	*
	* @example
	* ```typescript
	* const result = SubhutiDebugUtils.validateTokenCompleteness(cst, tokens)
	* if (result.complete) {
	*     console.log('✅ Token 完整')
	* } else {
	*     console.log('❌ 缺失:', result.missing)
	* }
	* ```
	*/
	static validateTokenCompleteness(cst, inputTokens) {
		const inputValues = inputTokens.map((t) => typeof t === "string" ? t : t.tokenValue || "").filter((v) => v !== "");
		const cstTokens = SubhutiDebugUtils.collectTokens(cst);
		const missing = [];
		for (let i = 0; i < inputValues.length; i++) if (i >= cstTokens.length || inputValues[i] !== cstTokens[i]) missing.push(inputValues[i]);
		return {
			complete: missing.length === 0 && inputValues.length === cstTokens.length,
			inputCount: inputValues.length,
			cstCount: cstTokens.length,
			inputTokens: inputValues,
			cstTokens,
			missing
		};
	}
	/**
	* 验证 CST 结构完整性
	*
	* @param node - CST 节点
	* @param path - 节点路径（用于错误报告）
	* @returns 错误列表
	*/
	static validateStructure(node, path$1 = "root") {
		const errors = [];
		if (node === null) {
			errors.push({
				path: path$1,
				issue: "Node is null"
			});
			return errors;
		}
		if (node === void 0) {
			errors.push({
				path: path$1,
				issue: "Node is undefined"
			});
			return errors;
		}
		if (!node.name && node.value === void 0) errors.push({
			path: path$1,
			issue: "Node has neither name nor value",
			node: {
				...node,
				children: node.children ? `[${node.children.length} children]` : void 0
			}
		});
		if (node.children !== void 0) {
			if (!Array.isArray(node.children)) {
				errors.push({
					path: path$1,
					issue: `children is not an array (type: ${typeof node.children})`,
					node: {
						name: node.name,
						childrenType: typeof node.children
					}
				});
				return errors;
			}
			node.children.forEach((child, index) => {
				const childPath = `${path$1}.children[${index}]`;
				if (child === null) {
					errors.push({
						path: childPath,
						issue: "Child is null"
					});
					return;
				}
				if (child === void 0) {
					errors.push({
						path: childPath,
						issue: "Child is undefined"
					});
					return;
				}
				const childErrors = SubhutiDebugUtils.validateStructure(child, childPath);
				errors.push(...childErrors);
			});
		}
		if (node.value !== void 0 && node.children && node.children.length > 0) errors.push({
			path: path$1,
			issue: `Leaf node has both value and non-empty children`,
			node: {
				name: node.name,
				value: node.value,
				childrenCount: node.children.length
			}
		});
		return errors;
	}
	/**
	* 获取 CST 统计信息
	*
	* @param node - CST 节点
	* @returns 统计信息
	*/
	static getCSTStatistics(node) {
		const stats = {
			totalNodes: 0,
			leafNodes: 0,
			maxDepth: 0,
			nodeTypes: /* @__PURE__ */ new Map()
		};
		const traverse = (node$1, depth) => {
			if (!node$1) return;
			stats.totalNodes++;
			stats.maxDepth = Math.max(stats.maxDepth, depth);
			if (node$1.name) stats.nodeTypes.set(node$1.name, (stats.nodeTypes.get(node$1.name) || 0) + 1);
			if (!node$1.children || node$1.children.length === 0) stats.leafNodes++;
			else for (const child of node$1.children) traverse(child, depth + 1);
		};
		traverse(node, 0);
		return stats;
	}
	/**
	* 格式化 CST 为树形结构字符串
	*
	* @param cst - CST 节点
	* @param prefix - 前缀（递归使用）
	* @param isLast - 是否为最后一个子节点（递归使用）
	* @returns 树形结构字符串
	*/
	static formatCst(cst, prefix = "", isLast = true) {
		const lines = [];
		const connector = isLast ? "└─" : "├─";
		const nodeLine = SubhutiDebugUtils.formatNode(cst, prefix, connector);
		lines.push(nodeLine);
		if (cst.children && cst.children.length > 0) {
			const childPrefix = prefix + (isLast ? "   " : "│  ");
			cst.children.forEach((child, index) => {
				const isLastChild = index === cst.children.length - 1;
				lines.push(SubhutiDebugUtils.formatCst(child, childPrefix, isLastChild));
			});
		}
		return lines.join("\n");
	}
	/**
	* 格式化单个节点（使用 TreeFormatHelper）
	*/
	static formatNode(cst, prefix, connector) {
		if (cst.value !== void 0) {
			const value = TreeFormatHelper.formatTokenValue(cst.value);
			const location = cst.loc ? TreeFormatHelper.formatLocation(cst.loc) : null;
			return TreeFormatHelper.formatLine([
				connector,
				cst.name + ":",
				`"${value}"`,
				location
			].join(""), { prefix });
		} else return TreeFormatHelper.formatLine([connector, cst.name].join(""), { prefix });
	}
	/**
	* 二分增量调试 - 从最底层规则逐层测试到顶层
	*
	* 这是一个强大的调试工具，用于快速定位问题层级。
	* 它会从最底层规则开始逐层测试，直到找到第一个失败的层级。
	*
	* @param tokens - 输入 token 流
	* @param ParserClass - Parser 类（构造函数）
	* @param levels - 测试层级配置（从底层到顶层）
	* @param options - 可选配置
	* @param options.enableDebugOnLastLevel - 是否在最后一层启用 debug（默认 true）
	* @param options.stopOnFirstError - 遇到第一个错误时停止（默认 true）
	* @param options.showStackTrace - 显示堆栈跟踪（默认 true）
	* @param options.stackTraceLines - 堆栈跟踪显示行数（默认 10）
	*
	* @example
	* ```typescript
	* import { SubhutiDebugUtils } from 'subhuti/src/SubhutiDebug'
	* import Es2025Parser from './Es2025Parser'
	*
	* const tokens = lexer.tokenize("let count = 1")
	*
	* SubhutiDebugUtils.bisectDebug(tokens, Es2025Parser, [
	*     { name: 'LexicalDeclaration', call: (p) => p.LexicalDeclaration({In: true}) },
	*     { name: 'Declaration', call: (p) => p.Declaration() },
	*     { name: 'StatementListItem', call: (p) => p.StatementListItem() },
	*     { name: 'Script', call: (p) => p.Script() }
	* ], { enableDebugOnLastLevel: false })
	* ```
	*/
	static bisectDebug(tokens, ParserClass, levels, options) {
		const opts = {
			enableDebugOnLastLevel: true,
			stopOnFirstError: true,
			showStackTrace: true,
			stackTraceLines: 10,
			...options
		};
		console.log("\n🔬 二分增量调试模式");
		console.log("=".repeat(80));
		console.log("策略：从最底层规则逐层测试，找出问题层级\n");
		for (let i = 0; i < levels.length; i++) {
			const level = levels[i];
			console.log(`\n[${"▸".repeat(i + 1)}] 测试层级 ${i + 1}: ${level.name}`);
			console.log("-".repeat(80));
			try {
				const parser = new ParserClass(tokens);
				if (opts.enableDebugOnLastLevel && i === levels.length - 1) {
					if (typeof parser.debug === "function") parser.debug();
				}
				const result = level.call(parser);
				if (!result) {
					console.log(`\n⚠️ ${level.name} 返回 undefined`);
					continue;
				}
				const validation = SubhutiDebugUtils.validateTokenCompleteness(result, tokens);
				if (validation.complete) console.log(`\n✅ ${level.name} 解析成功（Token完整: ${validation.cstCount}/${validation.inputCount}）`);
				else {
					console.log(`\n❌ ${level.name} Token不完整`);
					console.log(`   输入tokens: ${validation.inputCount} 个`);
					console.log(`   CST tokens:  ${validation.cstCount} 个`);
					console.log(`   输入列表: [${validation.inputTokens.join(", ")}]`);
					console.log(`   CST列表:  [${validation.cstTokens.join(", ")}]`);
					if (validation.missing.length > 0) console.log(`   ❌ 缺失或错位: [${validation.missing.join(", ")}]`);
					console.log(`\n🔍 问题定位: ${level.name} 未能消费所有token`);
					if (i > 0) {
						console.log(`   ⚠️ 前一层级（${levels[i - 1].name}）也可能有问题`);
						console.log(`   💡 建议: 检查 ${level.name} 和 ${levels[i - 1].name} 的实现`);
					} else console.log(`   💡 建议: 检查 ${level.name} 的实现，确保所有token都被正确处理`);
					if (opts.stopOnFirstError) return;
				}
			} catch (error) {
				console.log(`\n❌ ${level.name} 解析失败`);
				console.log(`   错误: ${error.message}`);
				console.log(`\n🔍 问题定位: ${level.name} 层级出现错误`);
				if (i > 0) {
					console.log(`   ✅ 前一层级（${levels[i - 1].name}）可以工作`);
					console.log(`   ❌ 当前层级（${level.name}）出现问题`);
					console.log(`\n💡 建议: 检查 ${level.name} 的实现，特别是它如何调用 ${levels[i - 1].name}`);
				} else {
					console.log(`   ❌ 最底层规则（${level.name}）就已经失败`);
					console.log(`\n💡 建议: 检查 ${level.name} 的实现和 token 定义`);
				}
				if (opts.showStackTrace && error.stack) {
					console.log(`\n📋 堆栈跟踪（前${opts.stackTraceLines}行）:`);
					error.stack.split("\n").slice(0, opts.stackTraceLines).forEach((line) => console.log(`   ${line}`));
				}
				if (opts.stopOnFirstError) return;
			}
		}
		console.log("\n" + "=".repeat(80));
		console.log("🎉 所有层级测试通过！");
		console.log("=".repeat(80));
	}
};
var SubhutiTraceDebugger = class {
	/**
	* 构造函数
	*
	* @param tokens - 输入 token 流（用于完整性检查和位置信息）
	*/
	constructor(tokens) {
		this.ruleStack = [];
		this.stats = /* @__PURE__ */ new Map();
		this.rulePathCache = /* @__PURE__ */ new Map();
		this.inputTokens = [];
		this.topLevelCst = null;
		this.openDebugLogCache = true;
		this.inputTokens = this.extractValidTokens(tokens || []);
	}
	/**
	* 重置调试器状态，为新一轮解析做准备
	*
	* 职责：
	* - 清空旧的规则路径缓存
	* - 清空旧的性能统计
	* - 刷新 token 快照
	*
	* 调用时机：每次顶层规则开始前（由 SubhutiParser 调用）
	*/
	resetForNewParse(tokens) {
		this.rulePathCache.clear();
		this.stats.clear();
		if (tokens) this.inputTokens = this.extractValidTokens(tokens);
	}
	/**
	* 从 token 流中提取有效 token（排除注释、空格等）
	*
	* @returns 完整的 token 对象数组（包含 tokenValue, tokenName, loc 等）
	*/
	extractValidTokens(tokens) {
		const excludeNames = [
			"SingleLineComment",
			"MultiLineComment",
			"Spacing",
			"LineBreak"
		];
		return tokens.filter((t) => {
			const name = t.tokenName || "";
			return excludeNames.indexOf(name) === -1;
		});
	}
	/**
	* 深拷贝 RuleStackItem（手动拷贝每个字段）
	*/
	deepCloneRuleStackItem(item) {
		if (item.ruleName) {
			if (!item.childs.length) throw new Error("系统错误");
		}
		return {
			ruleName: item.ruleName,
			tokenName: item.tokenName,
			tokenValue: item.tokenValue,
			startTime: item.startTime,
			outputted: item.outputted,
			tokenIndex: item.tokenIndex,
			tokenSuccess: item.tokenSuccess,
			tokenExpectName: item.tokenExpectName,
			shouldBreakLine: item.shouldBreakLine,
			displayDepth: item.displayDepth,
			childs: item.childs,
			orBranchInfo: item.orBranchInfo ? {
				orIndex: item.orBranchInfo.orIndex,
				branchIndex: item.orBranchInfo.branchIndex,
				isOrEntry: item.orBranchInfo.isOrEntry,
				isOrBranch: item.orBranchInfo.isOrBranch,
				totalBranches: item.orBranchInfo.totalBranches
			} : void 0
		};
	}
	/**
	* 生成缓存键（包含 Or 节点信息）
	*/
	generateCacheKey(item) {
		return `${item.ruleName}:${item.tokenIndex.toString()}:${item.orBranchInfo ? item.orBranchInfo.isOrEntry ? "1" : "0" : "0"}:${item.orBranchInfo ? item.orBranchInfo.isOrBranch ? "1" : "0" : "0"}:${item.orBranchInfo?.orIndex?.toString() ?? "-1"}:${item.orBranchInfo?.branchIndex?.toString() ?? "-1"}:${item.tokenValue ?? ""}:${item.tokenName ?? ""}:${item.tokenExpectName ?? ""}:${item.tokenSuccess ?? false}`;
	}
	createTokenItem(tokenIndex, tokenValue, tokenName, expectName, success) {
		return {
			ruleName: void 0,
			tokenSuccess: success,
			tokenExpectName: expectName,
			startTime: 0,
			outputted: false,
			tokenIndex,
			shouldBreakLine: true,
			tokenValue,
			tokenName
		};
	}
	/**
	* 从缓存恢复规则路径（递归恢复整个链条）
	*
	* @param cacheKey - 缓存键
	* @param isRoot - 是否是根节点
	* @param OrBranchNeedNewLine - 是否需要单独行，or相关专用
	* @param displayDepth - 父节点的 displayDepth（用于计算当前节点的深度）
	*/
	restoreFromCacheAndPushAndPrint(cacheKey, displayDepth, OrBranchNeedNewLine, isRoot = true) {
		const cached = this.cacheGet(cacheKey);
		if (!cached) throw new Error("系统错误");
		const restoredItem = this.deepCloneRuleStackItem(cached);
		restoredItem.outputted = false;
		restoredItem.isManuallyAdded = true;
		restoredItem.shouldBreakLine = false;
		OrBranchNeedNewLine = false;
		const lastRowShouldBreakLine = this.ruleStack[this.ruleStack.length - 1].shouldBreakLine;
		let tempBreakLine = false;
		if (isRoot) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (OrBranchNeedNewLine) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (restoredItem.tokenExpectName) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (restoredItem.orBranchInfo && restoredItem.orBranchInfo.isOrEntry && restoredItem.childs.length > 1) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
			OrBranchNeedNewLine = true;
		} else if (["UpdateExpression"].indexOf(restoredItem.ruleName) > -1) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (lastRowShouldBreakLine) {
			displayDepth++;
			tempBreakLine = true;
		}
		restoredItem.displayDepth = displayDepth;
		if (OrBranchNeedNewLine && restoredItem.orBranchInfo) OrBranchNeedNewLine = restoredItem.orBranchInfo.isOrBranch || false;
		let childBeginIndex = this.ruleStack.push(restoredItem);
		if (cached.childs) {
			let i = 0;
			for (const childKey of cached.childs) {
				const nextItem = this.restoreFromCacheAndPushAndPrint(childKey, displayDepth, OrBranchNeedNewLine, false);
				if (!isRoot && i === 0 && lastRowShouldBreakLine && !restoredItem.shouldBreakLine && nextItem.shouldBreakLine) {
					this.ruleStack.splice(childBeginIndex);
					if (!tempBreakLine) displayDepth++;
					restoredItem.shouldBreakLine = true;
					restoredItem.displayDepth = displayDepth;
					this.restoreFromCacheAndPushAndPrint(childKey, displayDepth, OrBranchNeedNewLine, false);
				}
				i++;
			}
		}
		if (isRoot) {
			SubhutiDebugRuleTracePrint.flushPendingOutputs_Cache_Impl(this.ruleStack);
			this.ruleStack.splice(childBeginIndex);
		}
		return restoredItem;
	}
	/**
	* 规则进入事件处理器 - 立即建立父子关系版本
	*
	* 流程：
	* 1. 检查缓存命中（缓存命中直接回放）
	* 2. 从栈顶获取父节点（上一行）
	* 3. 立即建立父→子关系
	* 4. 记录当前规则到缓存
	* 5. 推入栈
	*
	* @param ruleName - 规则名称
	* @param tokenIndex - 规则进入时的 token 索引
	*/
	onRuleEnter(ruleName, tokenIndex) {
		const startTime = performance.now();
		let stat = this.stats.get(ruleName);
		if (!stat) {
			stat = {
				ruleName,
				totalCalls: 0,
				actualExecutions: 0,
				cacheHits: 0,
				totalTime: 0,
				executionTime: 0,
				avgTime: 0
			};
			this.stats.set(ruleName, stat);
		}
		stat.totalCalls++;
		const ruleItem = {
			ruleName,
			tokenIndex,
			startTime,
			outputted: false,
			childs: []
		};
		if (this.openDebugLogCache) {
			const cacheKey = this.generateCacheKey(ruleItem);
			if (this.cacheGet(cacheKey)) {
				let depth = SubhutiDebugRuleTracePrint.flushPendingOutputs_NonCache_Impl(this.ruleStack);
				this.restoreFromCacheAndPushAndPrint(cacheKey, depth, false);
				return startTime;
			}
		}
		this.ruleStack.push(ruleItem);
		return startTime;
	}
	onRuleExit(ruleName, cacheHit, startTime) {
		let duration = 0;
		if (startTime !== void 0 && typeof startTime === "number") duration = performance.now() - startTime;
		if (this.ruleStack.length === 0) throw new Error(`❌ Rule exit error: ruleStack is empty when exiting ${ruleName}`);
		const curRule = this.ruleStack.pop();
		if (!curRule || curRule.ruleName !== ruleName) throw new Error(`❌ Rule exit mismatch: expected ${ruleName} at top, got ${curRule?.ruleName || "undefined"}`);
		const stat = this.stats.get(ruleName);
		if (stat) {
			stat.totalTime += duration;
			if (cacheHit) stat.cacheHits++;
			else {
				stat.actualExecutions++;
				stat.executionTime += duration;
				if (stat.actualExecutions > 0) stat.avgTime = stat.executionTime / stat.actualExecutions;
			}
		}
		if (!curRule.outputted) return;
		const cacheKey = this.generateCacheKey(curRule);
		const parentItem = this.ruleStack[this.ruleStack.length - 1];
		if (parentItem) {
			if (!parentItem.childs) throw new Error(`❌ Parent rule ${parentItem.ruleName} does not have childs array when exiting rule ${ruleName}`);
			if (parentItem.childs.some((key) => key === cacheKey)) {
				console.log(`  ❌ 重复检测：规则 ${ruleName} 已存在于父节点的 childs 中`);
				console.log(`  父节点的所有子节点键:`);
				parentItem.childs.forEach((key, idx) => {
					console.log(`    [${idx}] ${key}`);
				});
				throw new Error(`❌ Rule ${ruleName} already exists in parent rule ${parentItem.ruleName}'s childs`);
			}
			this.parentPushChild(parentItem, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curRule);
			this.cacheSet(cacheKey, cloned);
		}
	}
	cacheSet(key, value) {
		if (!value.tokenExpectName) {
			if (!value.childs || value.childs?.length === 0) throw new Error("bugai wei 0");
		}
		this.rulePathCache.set(key, value);
	}
	cacheGet(key) {
		return this.rulePathCache.get(key);
	}
	onTokenConsume(tokenIndex, tokenValue, tokenName, expectName, success) {
		if (this.ruleStack.length === 0) throw new Error(`❌ Token consume error: ruleStack is empty when consuming token ${tokenName}`);
		const parentRule = this.ruleStack[this.ruleStack.length - 1];
		if (!success) {
			if (tokenIndex <= parentRule.tokenIndex) return;
		}
		const tokenItem = this.createTokenItem(tokenIndex, tokenValue, tokenName, expectName, success);
		const tokenKey = this.generateCacheKey(tokenItem);
		if (!this.rulePathCache.has(tokenKey)) this.cacheSet(tokenKey, this.deepCloneRuleStackItem(tokenItem));
		if (!parentRule.childs) throw new Error(`❌ Parent rule ${parentRule.ruleName} does not have childs array when consuming token ${tokenName}`);
		if (parentRule.childs.some((key) => key === tokenKey)) throw new Error(`❌ Token ${tokenName} already exists in parent rule ${parentRule.ruleName}'s childs`);
		this.parentPushChild(parentRule, tokenKey);
		const depth = SubhutiDebugRuleTracePrint.flushPendingOutputs_NonCache_Impl(this.ruleStack);
		const token = this.inputTokens[tokenIndex];
		let location = null;
		if (success) {
			if (token) {
				if (token.loc) location = TreeFormatHelper.formatLocation(token.loc);
				else if (token.rowNum !== void 0 && token.columnStartNum !== void 0) {
					const row = token.rowNum;
					const start = token.columnStartNum;
					location = `[${row}:${start}-${token.columnEndNum ?? start + tokenValue.length - 1}]`;
				}
			}
		}
		const tokenStr = SubhutiDebugRuleTracePrint.getPrintToken(tokenItem, location);
		const line = SubhutiDebugRuleTracePrint.formatLine(tokenStr, depth);
		SubhutiDebugRuleTracePrint.consoleLog(line);
	}
	onOrEnter(parentRuleName, tokenIndex) {
		let orIndex = 0;
		if (this.ruleStack.length > 0) {
			const parentRule = this.ruleStack[this.ruleStack.length - 1];
			if (parentRule.childs) for (const childKey of parentRule.childs) {
				const childItem = this.cacheGet(childKey);
				if (childItem && childItem.orBranchInfo?.isOrEntry) orIndex++;
			}
		}
		this.ruleStack.push({
			ruleName: parentRuleName,
			startTime: performance.now(),
			outputted: false,
			shouldBreakLine: true,
			tokenIndex,
			childs: [],
			orBranchInfo: {
				orIndex,
				isOrEntry: true,
				isOrBranch: false,
				startTokenIndex: tokenIndex,
				branchAttempts: []
			}
		});
	}
	onOrExit(parentRuleName) {
		if (this.ruleStack.length === 0) throw new Error(`❌ Or exit error: ruleStack is empty when exiting Or for ${parentRuleName}`);
		const curOrNode = this.ruleStack.pop();
		if (!(curOrNode.ruleName === parentRuleName && curOrNode.orBranchInfo && curOrNode.orBranchInfo.isOrEntry && !curOrNode.orBranchInfo.isOrBranch)) {
			const orInfo = curOrNode.orBranchInfo ? `(entry=${curOrNode.orBranchInfo.isOrEntry}, branch=${curOrNode.orBranchInfo.isOrBranch})` : "(no orBranchInfo)";
			throw new Error(`❌ Or exit mismatch: expected ${parentRuleName}(OrEntry) at top, got ${curOrNode.ruleName}${orInfo}`);
		}
		if (!curOrNode.outputted) return;
		const cacheKey = this.generateCacheKey(curOrNode);
		const parentItem = this.ruleStack[this.ruleStack.length - 1];
		if (parentItem) {
			if (!parentItem.childs) throw new Error(`❌ Parent rule ${parentItem.ruleName} does not have childs array when exiting Or ${parentRuleName}`);
			if (parentItem.childs.some((key) => key === cacheKey)) throw new Error(`❌ ${cacheKey} Or ${parentRuleName} already exists in parent rule ${parentItem.ruleName}'s childs`);
			this.parentPushChild(parentItem, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curOrNode);
			this.cacheSet(cacheKey, cloned);
		}
	}
	onOrBranch(branchIndex, totalBranches, parentRuleName) {
		const tokenIndex = this.ruleStack.length > 0 ? this.ruleStack[this.ruleStack.length - 1]?.tokenIndex ?? 0 : 0;
		let orIndex = void 0;
		if (this.ruleStack.length > 0) {
			const parentOrEntry = this.ruleStack[this.ruleStack.length - 1];
			if (parentOrEntry.orBranchInfo?.isOrEntry) orIndex = parentOrEntry.orBranchInfo.orIndex;
		}
		this.ruleStack.push({
			ruleName: parentRuleName,
			startTime: performance.now(),
			outputted: false,
			tokenIndex,
			childs: [],
			orBranchInfo: {
				orIndex,
				isOrEntry: false,
				isOrBranch: true,
				branchIndex,
				totalBranches
			}
		});
	}
	onOrBranchExit(parentRuleName, branchIndex) {
		if (this.ruleStack.length === 0) throw new Error(`❌ OrBranch exit error: ruleStack is empty when exiting branch ${branchIndex} for ${parentRuleName}`);
		const curBranchNode = this.ruleStack.pop();
		if (!(curBranchNode.ruleName === parentRuleName && curBranchNode.orBranchInfo && curBranchNode.orBranchInfo.isOrBranch && !curBranchNode.orBranchInfo.isOrEntry && curBranchNode.orBranchInfo.branchIndex === branchIndex)) {
			const info = curBranchNode.orBranchInfo;
			const infoStr = info ? `(entry=${info.isOrEntry}, branch=${info.isOrBranch}, idx=${info.branchIndex})` : "(no orInfo)";
			throw new Error(`❌ OrBranch exit mismatch: expected ${parentRuleName}(branchIdx=${branchIndex}) at top, got ${curBranchNode.ruleName}${infoStr}`);
		}
		if (!curBranchNode.outputted) return;
		const cacheKey = this.generateCacheKey(curBranchNode);
		const parentOrNode = this.ruleStack[this.ruleStack.length - 1];
		if (parentOrNode) {
			if (!parentOrNode.childs) throw new Error(`❌ Parent Or node ${parentOrNode.ruleName} does not have childs array when exiting branch ${branchIndex}`);
			if (parentOrNode.childs.some((key) => key === cacheKey)) throw new Error(`❌ OrBranch ${branchIndex} already exists in parent Or node ${parentOrNode.ruleName}'s childs`);
			this.parentPushChild(parentOrNode, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curBranchNode);
			this.cacheSet(cacheKey, cloned);
		}
	}
	onBacktrack(fromTokenIndex, toTokenIndex) {}
	/**
	* 收集所有 token 值（内部调用 SubhutiDebugUtils）
	*/
	collectTokenValues(node) {
		return SubhutiDebugUtils.collectTokens(node);
	}
	/**
	* 检查 Token 完整性（内部调用 SubhutiDebugUtils）
	*/
	checkTokenCompleteness(cst) {
		const result = SubhutiDebugUtils.validateTokenCompleteness(cst, this.inputTokens);
		return {
			input: result.inputTokens,
			cst: result.cstTokens,
			missing: result.missing
		};
	}
	/**
	* 验证 CST 结构完整性（内部调用 SubhutiDebugUtils）
	*/
	validateStructure(node, path$1 = "root") {
		return SubhutiDebugUtils.validateStructure(node, path$1);
	}
	/**
	* 获取 CST 统计信息（内部调用 SubhutiDebugUtils）
	*/
	getCSTStatistics(node) {
		return SubhutiDebugUtils.getCSTStatistics(node);
	}
	/**
	* 获取性能摘要
	*/
	getSummary() {
		const allStats = Array.from(this.stats.values());
		if (allStats.length === 0) return "📊 性能摘要：无数据";
		const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0);
		const totalExecutions = allStats.reduce((sum, s) => sum + s.actualExecutions, 0);
		const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0);
		const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0);
		const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : "0.0";
		const lines = [];
		lines.push("⏱️  性能摘要");
		lines.push("─".repeat(40));
		lines.push(`总耗时: ${totalTime.toFixed(2)}ms`);
		lines.push(`总调用: ${totalCalls.toLocaleString()} 次`);
		lines.push(`实际执行: ${totalExecutions.toLocaleString()} 次`);
		lines.push(`缓存命中: ${totalCacheHits.toLocaleString()} 次 (${cacheHitRate}%)`);
		lines.push("");
		const top5 = allStats.filter((s) => s.actualExecutions > 0).sort((a, b) => b.executionTime - a.executionTime).slice(0, 5);
		if (top5.length > 0) {
			lines.push("Top 5 慢规则:");
			top5.forEach((stat, i) => {
				const avgUs = (stat.avgTime * 1e3).toFixed(1);
				lines.push(`  ${i + 1}. ${stat.ruleName}: ${stat.executionTime.toFixed(2)}ms (${stat.totalCalls}次, 平均${avgUs}μs)`);
			});
		}
		return lines.join("\n");
	}
	/**
	* 设置要展示的 CST（由 Parser 在解析完成后调用）
	*/
	setCst(cst) {
		this.topLevelCst = cst || null;
	}
	parentPushChild(parent, child) {
		parent.childs.push(child);
	}
	/**
	* 自动输出完整调试报告
	*/
	autoOutput() {
		console.log("\n" + "=".repeat(60));
		console.log("🔍 Subhuti Debug 输出");
		console.log("=".repeat(60));
		console.log("\n【第一部分：性能摘要】");
		console.log("─".repeat(60));
		console.log("\n" + this.getSummary());
		console.log("\n📋 所有规则详细统计:");
		Array.from(this.stats.values()).sort((a, b) => b.executionTime - a.executionTime).forEach((stat) => {
			const cacheRate = stat.totalCalls > 0 ? (stat.cacheHits / stat.totalCalls * 100).toFixed(1) : "0.0";
			console.log(`  ${stat.ruleName}: ${stat.totalCalls}次 | 执行${stat.actualExecutions}次 | 耗时${stat.executionTime.toFixed(2)}ms | 缓存${cacheRate}%`);
		});
		console.log("\n" + "=".repeat(60));
		if (this.topLevelCst) {
			console.log("\n【第二部分：CST 验证报告】");
			console.log("─".repeat(60));
			console.log("\n🔍 CST 验证报告");
			console.log("─".repeat(60));
			const structureErrors = this.validateStructure(this.topLevelCst);
			console.log(`\n📌 结构完整性: ${structureErrors.length === 0 ? "✅" : "❌"}`);
			if (structureErrors.length > 0) {
				console.log(`   发现 ${structureErrors.length} 个错误:`);
				structureErrors.forEach((err, i) => {
					console.log(`\n   [${i + 1}] ${err.path}`);
					console.log(`       问题: ${err.issue}`);
					if (err.node) {
						const nodeStr = JSON.stringify(err.node, null, 2).split("\n").map((line) => `       ${line}`).join("\n");
						console.log(nodeStr);
					}
				});
			} else console.log("   无结构错误");
			const tokenResult = this.checkTokenCompleteness(this.topLevelCst);
			console.log(`\n📌 Token 完整性: ${tokenResult.missing.length === 0 ? "✅" : "❌"}`);
			console.log(`   输入 tokens: ${tokenResult.input.length} 个`);
			console.log(`   CST tokens:  ${tokenResult.cst.length} 个`);
			console.log(`   输入列表: [${tokenResult.input.join(", ")}]`);
			console.log(`   CST列表:  [${tokenResult.cst.join(", ")}]`);
			if (tokenResult.missing.length > 0) console.log(`   ❌ 缺失: [${tokenResult.missing.join(", ")}]`);
			else console.log(`   ✅ 完整保留`);
			const stats = this.getCSTStatistics(this.topLevelCst);
			console.log(`\n📌 CST 统计:`);
			console.log(`   总节点数: ${stats.totalNodes}`);
			console.log(`   叶子节点: ${stats.leafNodes}`);
			console.log(`   最大深度: ${stats.maxDepth}`);
			console.log(`   节点类型: ${stats.nodeTypes.size} 种`);
			console.log(`\n   节点类型分布:`);
			Array.from(stats.nodeTypes.entries()).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
				console.log(`     ${name}: ${count}`);
			});
			console.log("─".repeat(60));
			console.log("\n【第三部分：CST 可视化】");
			console.log("─".repeat(60));
			console.log("\n📊 CST 结构");
			console.log("─".repeat(60));
			console.log(SubhutiDebugUtils.formatCst(this.topLevelCst));
			console.log("─".repeat(60));
		}
		console.log("\n" + "=".repeat(60));
		console.log("🎉 Debug 输出完成");
		console.log("=".repeat(60));
	}
};
SubhutiTraceDebugger.collectTokens = SubhutiDebugUtils.collectTokens;
SubhutiTraceDebugger.validateTokenCompleteness = SubhutiDebugUtils.validateTokenCompleteness;

//#endregion
//#region src/SubhutiPackratCache.ts
/**
* Subhuti SubhutiPackratCache Cache - 集成 LRU 缓存 + 统计的 SubhutiPackratCache Parsing 管理器 ⭐⭐⭐
*
* 职责：
* - LRU 缓存实现（使用成熟的 lru-cache 库）
* - 统计缓存命中率
* - 应用和存储缓存结果
* - 提供性能分析建议
*
* 设计理念：
* - 使用开源库：基于 lru-cache（10k+ stars，每周 4000万+ 下载）
* - 默认最优：LRU(10000) 生产级配置
* - 零配置：开箱即用
* - 高性能：lru-cache 高度优化，所有操作 O(1)
* - 集成统计：hits/misses/stores 与缓存操作原子化
*
* 使用示例：
* ```typescript
* // 默认配置（推荐 99%）- LRU(10000)
* const cache = new SubhutiPackratCache()
*
* // 自定义缓存大小（大文件）- LRU(50000)
* const cache = new SubhutiPackratCache(50000)
*
* // 无限缓存（小文件 + 内存充足）
* const cache = new SubhutiPackratCache(0)
* ```
*
* 性能：
* - get: O(1) 常数时间
* - set: O(1) 常数时间
* - 统计集成：零额外开销
*/
var SubhutiPackratCache = class {
	/**
	* 构造 SubhutiPackratCache Cache
	*
	* 使用示例：
	* ```typescript
	* // 默认配置（推荐 99%）
	* new SubhutiPackratCache()          → LRU(10000)
	*
	* // 大文件
	* new SubhutiPackratCache(50000)     → LRU(50000)
	*
	* // 超大文件
	* new SubhutiPackratCache(100000)    → LRU(100000)
	*
	* // 无限缓存（小文件 + 内存充足）
	* new SubhutiPackratCache(0)         → Unlimited
	* ```
	*
	* @param maxSize 最大缓存条目数
	*                - 0：无限缓存，永不淘汰
	*                - >0：启用 LRU，达到上限自动淘汰最旧条目
	*                - 默认：10000（适用 99% 场景）
	*/
	constructor(maxSize = 1e4) {
		this.stats = {
			hits: 0,
			misses: 0,
			stores: 0
		};
		this.maxSize = maxSize;
		if (maxSize === 0) this.cache = new LRUCache({ max: Infinity });
		else this.cache = new LRUCache({ max: maxSize });
	}
	/**
	* 查询缓存 - O(1) ⭐⭐⭐
	*
	* 集成功能：
	* - LRU 查找（由 lru-cache 库自动处理）
	* - 统计记录（hits / misses）
	* - 自动更新访问顺序（由 lru-cache 库自动处理）
	*
	* @param ruleName 规则名称
	* @param tokenIndex token 索引
	* @returns 缓存结果，未命中返回 undefined
	*/
	get(ruleName, tokenIndex) {
		const key = `${ruleName}:${tokenIndex}`;
		const result = this.cache.get(key);
		if (result === void 0) {
			this.stats.misses++;
			return;
		}
		this.stats.hits++;
		return result;
	}
	/**
	* 存储缓存 - O(1) ⭐⭐⭐
	*
	* 集成功能：
	* - LRU 存储（由 lru-cache 库自动处理）
	* - 统计记录（stores）
	* - 自动淘汰旧条目（由 lru-cache 库自动处理）
	*
	* @param ruleName 规则名称
	* @param tokenIndex token 索引
	* @param result 缓存结果
	*/
	set(ruleName, tokenIndex, result) {
		const key = `${ruleName}:${tokenIndex}`;
		this.stats.stores++;
		this.cache.set(key, result);
	}
	/**
	* 清空所有缓存
	*
	* 使用场景：
	* - 解析新文件前
	* - 手动清理内存
	* - 测试重置
	*/
	clear() {
		this.cache.clear();
		this.stats.hits = 0;
		this.stats.misses = 0;
		this.stats.stores = 0;
	}
	/**
	* 获取缓存的总条目数
	*/
	get size() {
		return this.cache.size;
	}
	/**
	* 获取缓存统计报告（唯一对外API）⭐
	*
	* 这是获取统计信息的唯一方法，包含完整的分析数据：
	* - 基础统计：hits、misses、stores、total、命中率
	* - 缓存信息：最大容量、当前大小、使用率
	* - 性能建议：根据数据自动生成
	*
	* 使用示例：
	* ```typescript
	* const report = cache.getStatsReport()
	* console.log(`命中率: ${report.hitRate}`)
	* console.log(`建议: ${report.suggestions.join(', ')}`)
	* ```
	*/
	getStatsReport() {
		const total = this.stats.hits + this.stats.misses;
		const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : "0.0";
		const hitRateNum = parseFloat(hitRate);
		const usageRate = this.maxSize > 0 ? (this.size / this.maxSize * 100).toFixed(1) + "%" : "unlimited";
		const suggestions = [];
		if (hitRateNum >= 70) suggestions.push("✅ 缓存命中率优秀（≥ 70%）");
		else if (hitRateNum >= 50) suggestions.push("✅ 缓存命中率良好（50-70%）");
		else if (hitRateNum >= 30) suggestions.push("⚠️ 缓存命中率偏低（30-50%），可能语法复杂");
		else suggestions.push("❌ 缓存命中率低（< 30%），建议检查语法规则");
		if (this.maxSize > 0) {
			const usageRatio = this.size / this.maxSize;
			if (usageRatio > .9) suggestions.push("⚠️ 缓存使用率高（> 90%），建议增加 maxSize");
			else if (usageRatio > .7) suggestions.push("⚠️ 缓存使用率较高（70-90%），可考虑增加 maxSize");
			if (usageRatio < .1 && total > 1e4) suggestions.push("💡 缓存使用率低（< 10%），可考虑减小 maxSize 节省内存");
		}
		return {
			hits: this.stats.hits,
			misses: this.stats.misses,
			stores: this.stats.stores,
			total,
			hitRate: `${hitRate}%`,
			maxCacheSize: this.maxSize,
			currentSize: this.size,
			usageRate,
			suggestions
		};
	}
};

//#endregion
//#region src/SubhutiTokenConsumer.ts
var SubhutiTokenConsumer = class {
	constructor(parser) {
		this.parser = parser;
	}
	/**
	* 消费一个 token（修改 Parser 状态）
	* @param tokenName token 名称（来自 TokenNames）
	* @param goal 可选的词法目标（用于模板尾部等场景）
	*/
	consume(tokenName, goal) {
		return this.parser._consumeToken(tokenName, goal);
	}
};

//#endregion
//#region src/SubhutiLexer.ts
/**
* 正则表达式字面量的 pattern（用于 Parser 层的 rescan）
* 根据 ECMAScript 规范，RegularExpressionFirstChar 不能是 * (避免与 /* 注释冲突)
*/
const REGEXP_LITERAL_PATTERN = /^\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[dgimsuvy]*/;
/**
* 尝试匹配正则表达式字面量
* 用于 Parser 层在需要时重新扫描 Slash 为 RegularExpressionLiteral
*
* @param text 要匹配的文本（应以 / 开头）
* @returns 匹配的正则表达式字面量字符串，或 null
*/
function matchRegExpLiteral(text) {
	const match = text.match(REGEXP_LITERAL_PATTERN);
	return match ? match[0] : null;
}
/**
* 词法目标（对应 ECMAScript 规范的 InputElement）
*/
let LexicalGoal = /* @__PURE__ */ function(LexicalGoal$1) {
	/** InputElementDiv - 期望除法运算符 */
	LexicalGoal$1["InputElementDiv"] = "InputElementDiv";
	/** InputElementRegExp - 期望正则表达式 */
	LexicalGoal$1["InputElementRegExp"] = "InputElementRegExp";
	/** InputElementTemplateTail - 期望模板尾部（} 开头的模板部分） */
	LexicalGoal$1["InputElementTemplateTail"] = "InputElementTemplateTail";
	return LexicalGoal$1;
}({});
const SubhutiLexerTokenNames = {
	TemplateHead: "TemplateHead",
	TemplateMiddle: "TemplateMiddle",
	TemplateTail: "TemplateTail"
};
/**
* Subhuti Lexer - 词法分析器
* 
* 核心特性：
* - 预编译正则（构造时一次性处理）
* - 词法层 lookahead（OptionalChaining 等）
* - 模板字符串状态管理（InputElement 切换）
* 
* @version 1.0.0
*/
var SubhutiLexer = class {
	constructor(tokens) {
		this._templateDepth = 0;
		this._lastRowNum = 1;
		this._allTokens = tokens.map((token) => {
			if (!token.pattern) return token;
			return {
				...token,
				pattern: new RegExp("^(?:" + token.pattern.source + ")", token.pattern.flags)
			};
		});
		this._tokensOutsideTemplate = this._allTokens.filter((t) => t.name !== SubhutiLexerTokenNames.TemplateMiddle && t.name !== SubhutiLexerTokenNames.TemplateTail);
	}
	/**
	* 词法分析主入口
	* @param code 源代码
	* @returns Token 流
	*/
	tokenize(code) {
		const result = [];
		let index = 0;
		let rowNum = 1;
		let columnNum = 1;
		this._lastRowNum = 1;
		while (index < code.length) {
			const matched = this._matchToken(code, index, rowNum, columnNum, result);
			if (!matched) {
				const errorChar = code[index];
				throw new Error(`Unexpected character "${errorChar}" at position ${index} (line ${rowNum}, column ${columnNum})`);
			}
			if (!matched.skip) {
				result.push(matched.token);
				this._lastRowNum = rowNum;
			}
			const valueLength = matched.token.tokenValue.length;
			index += valueLength;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				rowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else columnNum += valueLength;
			this._updateTemplateDepth(matched.token.tokenName);
		}
		return result;
	}
	_matchToken(code, index, rowNum, columnNum, matchedTokens) {
		const remaining = code.slice(index);
		const lastTokenName = matchedTokens.length > 0 ? matchedTokens[matchedTokens.length - 1].tokenName : null;
		for (const token of this._getActiveTokens()) {
			const match = remaining.match(token.pattern);
			if (!match) continue;
			if (token.contextConstraint?.onlyAtStart && index !== 0) continue;
			if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) continue;
			if (token.contextConstraint?.onlyAfter) {
				if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) continue;
			}
			if (token.contextConstraint?.notAfter) {
				if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) continue;
			}
			if (token.lookaheadAfter?.not) {
				const afterText = remaining.slice(match[0].length);
				const { not } = token.lookaheadAfter;
				if (not instanceof RegExp ? not.test(afterText) : afterText.startsWith(not)) continue;
			}
			return {
				token: this._createMatchToken(token, match[0], index, rowNum, columnNum),
				skip: token.skip
			};
		}
		return null;
	}
	_createMatchToken(token, value, index, rowNum, columnNum) {
		return {
			tokenName: token.name,
			tokenValue: value,
			index,
			rowNum,
			columnStartNum: columnNum,
			columnEndNum: columnNum + value.length - 1,
			hasLineBreakBefore: rowNum > this._lastRowNum
		};
	}
	/**
	* 根据模板深度返回活跃的 tokens
	* 实现 ECMAScript 规范的 InputElement 切换机制
	* 
	* 使用预编译策略：构造时过滤一次，运行时只选择数组（性能优化）
	*/
	_getActiveTokens() {
		return this._templateDepth > 0 ? this._allTokens : this._tokensOutsideTemplate;
	}
	/**
	* 更新模板字符串嵌套深度
	*
	* 实现 ECMAScript 规范的 InputElement 切换机制：
	* - TemplateHead (`${`) 进入模板上下文（深度 +1）
	* - TemplateTail (}`) 退出模板上下文（深度 -1）
	* - TemplateMiddle: 保持深度不变
	*
	* 参考实现：Babel、Acorn、TypeScript Scanner
	* 行业标准做法：直接硬编码 token 名称，无需配置
	*/
	_updateTemplateDepth(tokenName) {
		if (tokenName === SubhutiLexerTokenNames.TemplateHead) this._templateDepth++;
		else if (tokenName === SubhutiLexerTokenNames.TemplateTail) this._templateDepth--;
	}
	/**
	* 尝试匹配模板 token (TemplateMiddle 或 TemplateTail)
	* 仅在 InputElementTemplateTail 模式下使用
	*/
	_matchTemplateToken(remaining, index, rowNum, columnNum) {
		for (const token of this._allTokens) {
			if (token.name !== SubhutiLexerTokenNames.TemplateMiddle && token.name !== SubhutiLexerTokenNames.TemplateTail) continue;
			const match = remaining.match(token.pattern);
			if (match) return {
				token: this._createMatchTokenWithLastRow(token.name, match[0], index, rowNum, columnNum, rowNum),
				skip: false
			};
		}
		return null;
	}
	/**
	* 创建初始词法状态
	*/
	createInitialState() {
		return {
			position: 0,
			rowNum: 1,
			columnNum: 1,
			templateDepth: 0,
			lastTokenRowNum: 1,
			lastTokenName: null
		};
	}
	/**
	* 按需读取下一个 token
	*
	* @param code 源代码
	* @param state 当前词法状态（会被修改）
	* @param lexicalGoal 词法目标（InputElementDiv 或 InputElementRegExp）
	* @returns token 或 null（EOF）
	*/
	readNextToken(code, state, lexicalGoal = LexicalGoal.InputElementDiv) {
		while (state.position < code.length) {
			const matched = this._matchTokenWithGoal(code, state.position, state.rowNum, state.columnNum, state.lastTokenName, state.templateDepth, lexicalGoal);
			if (!matched) {
				const errorChar = code[state.position];
				throw new Error(`Unexpected character "${errorChar}" at position ${state.position} (line ${state.rowNum}, column ${state.columnNum})`);
			}
			const valueLength = matched.token.tokenValue.length;
			state.position += valueLength;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				state.rowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				state.columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else state.columnNum += valueLength;
			if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateHead) state.templateDepth++;
			else if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateTail) state.templateDepth--;
			if (matched.skip) continue;
			state.lastTokenRowNum = matched.token.rowNum;
			state.lastTokenName = matched.token.tokenName;
			return matched.token;
		}
		return null;
	}
	/**
	* 检查是否到达文件末尾
	*/
	isEOF(code, state) {
		let pos = state.position;
		while (pos < code.length) {
			const remaining = code.slice(pos);
			const whitespaceMatch = remaining.match(/^[\s]+/);
			if (whitespaceMatch) {
				pos += whitespaceMatch[0].length;
				continue;
			}
			const singleLineComment = remaining.match(/^\/\/[^\n\r]*/);
			if (singleLineComment) {
				pos += singleLineComment[0].length;
				continue;
			}
			const multiLineComment = remaining.match(/^\/\*[\s\S]*?\*\//);
			if (multiLineComment) {
				pos += multiLineComment[0].length;
				continue;
			}
			return false;
		}
		return true;
	}
	/**
	* 带词法目标的 token 匹配
	*/
	_matchTokenWithGoal(code, index, rowNum, columnNum, lastTokenName, templateDepth, lexicalGoal) {
		const remaining = code.slice(index);
		const activeTokens = this._tokensOutsideTemplate;
		for (const token of activeTokens) {
			if (lexicalGoal === LexicalGoal.InputElementTemplateTail) {
				const templateMatch = this._matchTemplateToken(remaining, index, rowNum, columnNum);
				if (templateMatch) return templateMatch;
			}
			if (token.name === "Slash" || token.name === "DivideAssign") {
				if (lexicalGoal === LexicalGoal.InputElementRegExp && remaining.startsWith("/")) {
					const regexpMatch = matchRegExpLiteral(remaining);
					if (regexpMatch) return {
						token: this._createMatchTokenWithLastRow("RegularExpressionLiteral", regexpMatch, index, rowNum, columnNum, rowNum),
						skip: false
					};
				}
			}
			const match = remaining.match(token.pattern);
			if (!match) continue;
			if (token.contextConstraint?.onlyAtStart && index !== 0) continue;
			if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) continue;
			if (token.contextConstraint?.onlyAfter) {
				if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) continue;
			}
			if (token.contextConstraint?.notAfter) {
				if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) continue;
			}
			if (token.lookaheadAfter?.not) {
				const afterText = remaining.slice(match[0].length);
				const { not } = token.lookaheadAfter;
				if (not instanceof RegExp ? not.test(afterText) : afterText.startsWith(not)) continue;
			}
			return {
				token: this._createMatchTokenWithLastRow(token.name, match[0], index, rowNum, columnNum, this._lastRowNum),
				skip: token.skip
			};
		}
		return null;
	}
	/**
	* 在指定位置用指定模式读取单个 token
	*
	* @param code 源代码
	* @param codeIndex 起始位置
	* @param line 起始行号
	* @param column 起始列号
	* @param goal 词法目标
	* @param lastTokenName 上一个 token 的名称（用于上下文约束）
	* @param templateDepth 模板字符串深度
	* @returns TokenCacheEntry 或 null（EOF）
	*/
	readTokenAt(code, codeIndex, line, column, goal, lastTokenName = null, templateDepth = 0) {
		let pos = codeIndex;
		let rowNum = line;
		let columnNum = column;
		let lastRowNum = line;
		let currentLastTokenName = lastTokenName;
		while (pos < code.length) {
			const matched = this._matchTokenWithGoal(code, pos, rowNum, columnNum, currentLastTokenName, templateDepth, goal);
			if (!matched) {
				const errorChar = code[pos];
				throw new Error(`Unexpected character "${errorChar}" at position ${pos} (line ${rowNum}, column ${columnNum})`);
			}
			const valueLength = matched.token.tokenValue.length;
			const nextPos = pos + valueLength;
			let nextRowNum = rowNum;
			let nextColumnNum = columnNum;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				nextRowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				nextColumnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else nextColumnNum += valueLength;
			if (matched.skip) {
				pos = nextPos;
				rowNum = nextRowNum;
				columnNum = nextColumnNum;
				continue;
			}
			const token = {
				tokenName: matched.token.tokenName,
				tokenValue: matched.token.tokenValue,
				index: pos,
				rowNum,
				columnStartNum: columnNum,
				columnEndNum: columnNum + valueLength - 1,
				hasLineBreakBefore: rowNum > lastRowNum
			};
			return {
				token,
				nextCodeIndex: nextPos,
				nextLine: nextRowNum,
				nextColumn: nextColumnNum,
				lastTokenName: token.tokenName
			};
		}
		return null;
	}
	/**
	* 创建 token（带 lastRowNum 参数）
	*/
	_createMatchTokenWithLastRow(tokenName, value, index, rowNum, columnNum, lastRowNum) {
		return {
			tokenName,
			tokenValue: value,
			index,
			rowNum,
			columnStartNum: columnNum,
			columnEndNum: columnNum + value.length - 1,
			hasLineBreakBefore: rowNum > lastRowNum
		};
	}
};

//#endregion
//#region src/validation/SubhutiRuleCollector.ts
var SubhutiRuleCollector_exports = /* @__PURE__ */ __export({ SubhutiRuleCollector: () => SubhutiRuleCollector });
var SubhutiRuleCollector;
var init_SubhutiRuleCollector = __esmMin((() => {
	SubhutiRuleCollector = class SubhutiRuleCollector {
		constructor() {
			this.ruleASTs = /* @__PURE__ */ new Map();
			this.tokenAstCache = /* @__PURE__ */ new Map();
			this.currentRuleStack = [];
			this.currentRuleName = "";
			this.isExecutingTopLevelRule = false;
			this.executingRuleStack = /* @__PURE__ */ new Set();
		}
		/**
		* 收集所有规则 - 静态方法
		*
		* @param parser Parser 实例
		* @returns 规则名称 → AST 的映射
		*/
		static collectRules(parser) {
			return new SubhutiRuleCollector().collect(parser);
		}
		/**
		* 收集所有规则（私有实现）
		*/
		collect(parser) {
			parser.enableAnalysisMode();
			const proxy = this.createAnalyzeProxy(parser);
			const ruleNames = this.getAllRuleNames(parser);
			for (const ruleName of ruleNames) this.collectRule(proxy, ruleName);
			parser.disableAnalysisMode();
			return {
				cstMap: this.ruleASTs,
				tokenMap: this.tokenAstCache
			};
		}
		/**
		* 创建分析代理（拦截 Parser 方法调用）
		*/
		createAnalyzeProxy(parser) {
			const collector = this;
			const proxy = new Proxy(parser, { get(target, prop) {
				if (prop === "Or") {
					[
						"ConditionalExpression",
						"AssignmentExpression",
						"Expression",
						"Statement"
					].includes(collector.currentRuleName);
					return (alternatives) => {
						return collector.handleOr(alternatives, proxy);
					};
				}
				if (prop === "Many") return (fn) => collector.handleMany(fn, proxy);
				if (prop === "Option") return (fn) => collector.handleOption(fn, proxy);
				if (prop === "AtLeastOne") return (fn) => collector.handleAtLeastOne(fn, proxy);
				if (prop === "consume" || prop === "_consumeToken") return (tokenName) => collector.handleConsume(tokenName);
				if (prop === "tokenConsumer") {
					const originalConsumer = Reflect.get(target, prop);
					return collector.createTokenConsumerProxy(originalConsumer);
				}
				const original = Reflect.get(target, prop);
				if (typeof original === "function" && typeof prop === "string" && /^[A-Z]/.test(prop) && ![
					"Or",
					"Many",
					"Option",
					"AtLeastOne",
					"consume",
					"_consumeToken",
					"tokenConsumer"
				].includes(prop)) return function(...args) {
					[
						"ConditionalExpression",
						"AssignmentExpression",
						"Expression",
						"Statement"
					].includes(prop);
					if (collector.isExecutingTopLevelRule && prop === collector.currentRuleName) {
						collector.isExecutingTopLevelRule = false;
						if (collector.executingRuleStack.has(prop)) return collector.handleSubrule(prop);
						collector.executingRuleStack.add(prop);
						try {
							return (original.__originalFunction__ || original).call(proxy, ...args);
						} finally {
							collector.executingRuleStack.delete(prop);
						}
					}
					return collector.handleSubrule(prop);
				};
				return original;
			} });
			return proxy;
		}
		/**
		* 创建 TokenConsumer 代理（拦截 token 消费调用）
		*/
		createTokenConsumerProxy(tokenConsumer) {
			const collector = this;
			return new Proxy(tokenConsumer, { get(target, prop) {
				const original = Reflect.get(target, prop);
				if (typeof original === "function" && typeof prop === "string") return function(...args) {
					collector.handleConsume(prop);
				};
				return original;
			} });
		}
		/**
		* 收集单个规则
		*
		* 异常处理说明：
		* - ✅ Parser 在分析模式下不会抛出解析相关的异常（左递归、无限循环、Token 消费失败等）
		* - ✅ 但仍需 try-catch 捕获业务逻辑错误（如废弃方法主动抛出的 Error）
		* - ✅ 即使抛出错误，Proxy 也已经收集到了部分 AST，仍然保存
		*
		* 这与之前的设计不同：
		* - 之前：依赖异常来控制流程（不好的设计）
		* - 现在：只捕获真正的业务错误（正常的异常处理）
		*/
		collectRule(proxy, ruleName) {
			const startTime = Date.now();
			this.currentRuleName = ruleName;
			this.currentRuleStack = [];
			this.isExecutingTopLevelRule = false;
			const rootNode = {
				type: "sequence",
				ruleName,
				nodes: []
			};
			this.currentRuleStack.push(rootNode);
			try {
				const ruleMethod = proxy[ruleName];
				if (typeof ruleMethod === "function") {
					this.isExecutingTopLevelRule = true;
					ruleMethod.call(proxy);
					this.isExecutingTopLevelRule = false;
				}
				this.ruleASTs.set(ruleName, rootNode);
				const elapsed = Date.now() - startTime;
				if (elapsed > 1e4) console.error(`❌❌❌ Rule "${ruleName}" took ${elapsed}ms (${(elapsed / 1e3).toFixed(2)}s) - EXTREMELY SLOW!`);
			} catch (error) {
				this.ruleASTs.set(ruleName, rootNode);
				Date.now() - startTime;
			}
		}
		/**
		* 获取所有规则名称（遍历整个原型链，只收集被 @SubhutiRule 装饰的方法）
		*
		* 通过检查 __isSubhutiRule__ 元数据标记来区分规则方法和普通方法
		*/
		getAllRuleNames(parser) {
			const ruleNames = /* @__PURE__ */ new Set();
			let prototype = Object.getPrototypeOf(parser);
			while (prototype && prototype !== Object.prototype) {
				for (const key of Object.getOwnPropertyNames(prototype)) {
					if (key === "constructor") continue;
					const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
					if (descriptor && typeof descriptor.value === "function") {
						if (descriptor.value.__isSubhutiRule__ === true) ruleNames.add(key);
					}
				}
				prototype = Object.getPrototypeOf(prototype);
			}
			return Array.from(ruleNames);
		}
		/**
		* 处理 Or 规则
		*/
		handleOr(alternatives, target) {
			const altNodes = [];
			for (let i = 0; i < alternatives.length; i++) {
				const alt = alternatives[i];
				this.currentRuleStack.push({
					type: "sequence",
					nodes: []
				});
				try {
					alt.alt.call(target);
					const result = this.currentRuleStack.pop();
					if (result) altNodes.push(result);
				} catch (error) {
					const result = this.currentRuleStack.pop();
					if (result && result.nodes && result.nodes.length > 0) altNodes.push(result);
				}
			}
			if (altNodes.length > 0) this.recordNode({
				type: "or",
				alternatives: altNodes
			});
		}
		/**
		* 处理 Many 规则
		*/
		handleMany(fn, target) {
			this.currentRuleStack.push({
				type: "sequence",
				nodes: []
			});
			try {
				fn.call(target);
				const innerNode = this.currentRuleStack.pop();
				if (innerNode) this.recordNode({
					type: "many",
					node: innerNode
				});
			} catch (error) {
				const innerNode = this.currentRuleStack.pop();
				if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
					type: "many",
					node: innerNode
				});
			}
		}
		/**
		* 处理 Option 规则
		*/
		handleOption(fn, target) {
			this.currentRuleStack.push({
				type: "sequence",
				nodes: []
			});
			try {
				fn.call(target);
				const innerNode = this.currentRuleStack.pop();
				if (innerNode) this.recordNode({
					type: "option",
					node: innerNode
				});
			} catch (error) {
				const innerNode = this.currentRuleStack.pop();
				if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
					type: "option",
					node: innerNode
				});
			}
		}
		/**
		* 处理 AtLeastOne 规则
		*/
		handleAtLeastOne(fn, target) {
			this.currentRuleStack.push({
				type: "sequence",
				nodes: []
			});
			try {
				fn.call(target);
				const innerNode = this.currentRuleStack.pop();
				if (innerNode) this.recordNode({
					type: "atLeastOne",
					node: innerNode
				});
			} catch (error) {
				const innerNode = this.currentRuleStack.pop();
				if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
					type: "atLeastOne",
					node: innerNode
				});
			}
		}
		/**
		* 处理 consume
		*/
		handleConsume(tokenName) {
			const tokenNode = {
				type: "consume",
				tokenName
			};
			this.tokenAstCache.set(tokenName, tokenNode);
			this.recordNode(tokenNode);
		}
		/**
		* 处理子规则调用
		*/
		handleSubrule(ruleName) {
			this.recordNode({
				type: "subrule",
				ruleName
			});
		}
		/**
		* 记录节点到当前序列
		*/
		recordNode(node) {
			const currentSeq = this.currentRuleStack[this.currentRuleStack.length - 1];
			if (currentSeq) currentSeq.nodes.push(node);
		}
	};
}));

//#endregion
//#region src/validation/ArrayTria.ts
var ArrayTrieNode, ArrayTrie;
var init_ArrayTria = __esmMin((() => {
	ArrayTrieNode = class {
		constructor() {
			this.children = /* @__PURE__ */ new Map();
			this.fullPaths = [];
		}
	};
	ArrayTrie = class {
		constructor() {
			this.root = new ArrayTrieNode();
		}
		/**
		* 插入路径到前缀树
		*
		* 核心逻辑：
		* 1. 从 root 开始
		* 2. 遍历路径的每个 token（字符串）
		* 3. 如果子节点不存在，创建新节点
		* 4. 移动到子节点
		* 5. 在每个节点存储完整路径的引用
		*
		* 时间复杂度：O(k)，k=路径长度（token数）
		*/
		insert(path$1) {
			let node = this.root;
			for (const ruleName of path$1) {
				if (!node.children.has(ruleName)) node.children.set(ruleName, new ArrayTrieNode());
				node = node.children.get(ruleName);
				node.fullPaths.push(path$1);
			}
		}
		/**
		* 查找完全相同的路径
		*/
		findEqual(path$1) {
			let node = this.root;
			for (const token of path$1) {
				if (!node.children.has(token)) return null;
				node = node.children.get(token);
			}
			for (const fullPath of node.fullPaths) if (this.isEqual(path$1, fullPath)) return fullPath;
			return null;
		}
		/**
		* 查找以 prefix 为前缀的路径（且不等于 prefix）
		*
		* 核心逻辑：
		* 1. 从 root 开始
		* 2. 沿着 prefix 的每个 token 向下遍历
		* 3. 如果找不到对应的子节点，返回 null
		* 4. 找到前缀节点后，检查 fullPaths 中是否有更长的路径
		* 5. 返回第一个匹配的完整路径
		*
		* 时间复杂度：O(k)，k=前缀长度（token数）
		*/
		findPrefixMatch(prefix) {
			let node = this.root;
			for (const token of prefix) {
				if (!node.children.has(token)) return null;
				node = node.children.get(token);
			}
			for (const fullPath of node.fullPaths) if (this.isPrefix(prefix, fullPath)) return fullPath;
			return null;
		}
		/**
		* 检查两个路径数组是否完全相同
		*
		* 核心逻辑：
		* 1. 长度必须相同
		* 2. 逐个比较 token，必须完全相同
		*
		* 时间复杂度：O(k)，k=路径长度
		*
		* @returns 如果两个路径完全相同返回 true，否则返回 false
		* @param prefix
		* @param fullPath
		*/
		isEqual(prefix, fullPath) {
			if (prefix.length !== fullPath.length) return false;
			for (let i = 0; i < prefix.length; i++) if (prefix[i] !== fullPath[i]) return false;
			return true;
		}
		/**
		* 检查 prefix 是否是 fullPath 的前缀
		*
		* 核心逻辑：
		* 1. 前缀必须比完整路径短
		* 2. 逐个比较 token，必须完全相同
		*
		* 时间复杂度：O(k)，k=前缀长度
		*/
		isPrefix(prefix, fullPath) {
			if (fullPath.length < prefix.length) return false;
			for (let i = 0; i < prefix.length; i++) if (prefix[i] !== fullPath[i]) return false;
			return true;
		}
	};
}));

//#endregion
//#region src/validation/SubhutiGrammarAnalyzer.ts
var SubhutiGrammarAnalyzer_exports = /* @__PURE__ */ __export({
	EXPANSION_LIMITS: () => EXPANSION_LIMITS,
	SubhutiGrammarAnalyzer: () => SubhutiGrammarAnalyzer
});
var Graph, alg, PerformanceAnalyzer, EXPANSION_LIMITS, SubhutiGrammarAnalyzer;
var init_SubhutiGrammarAnalyzer = __esmMin((() => {
	init_ArrayTria();
	({Graph, alg} = graphlib);
	PerformanceAnalyzer = class {
		constructor() {
			this.stats = /* @__PURE__ */ new Map();
			this.callStack = [];
			this.cacheStats = {
				subRuleHandlerTotal: 0,
				recursiveReturn: 0,
				levelLimitReturn: 0,
				dfsFirstKCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsAllCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsLevelCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				getDirectChildren: {
					hit: 0,
					miss: 0,
					total: 0
				},
				dfsFirst1: {
					hit: 0,
					miss: 0,
					total: 0
				},
				dfsFirstK: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsLevel: {
					hit: 0,
					miss: 0,
					total: 0
				},
				expandOneLevel: {
					hit: 0,
					miss: 0,
					total: 0
				},
				expandOneLevelTruncated: {
					hit: 0,
					miss: 0,
					total: 0
				},
				actualCompute: 0,
				bfsOptimization: {
					totalCalls: 0,
					skippedLevels: 0,
					fromLevel1: 0,
					fromCachedLevel: 0
				}
			};
		}
		startMethod(methodName) {
			const callId = this.callStack.length;
			this.callStack.push({
				methodName,
				startTime: Date.now(),
				childTime: 0
			});
			return callId;
		}
		endMethod(callId, inputSize, outputSize) {
			const call = this.callStack[callId];
			if (!call) throw new Error(`调用栈错误: callId ${callId} 不存在`);
			const totalDuration = Date.now() - call.startTime;
			const netDuration = totalDuration - call.childTime;
			if (callId > 0) {
				const parentCall = this.callStack[callId - 1];
				parentCall.childTime += totalDuration;
			}
			if (!this.stats.has(call.methodName)) this.stats.set(call.methodName, {
				count: 0,
				totalTime: 0,
				netTime: 0,
				maxTime: 0,
				minTime: Infinity,
				inputSizes: [],
				outputSizes: []
			});
			const stat = this.stats.get(call.methodName);
			stat.count++;
			stat.totalTime += totalDuration;
			stat.netTime += netDuration;
			stat.maxTime = Math.max(stat.maxTime, netDuration);
			stat.minTime = Math.min(stat.minTime, netDuration);
			if (inputSize !== void 0) stat.inputSizes.push(inputSize);
			if (outputSize !== void 0) stat.outputSizes.push(outputSize);
			this.callStack.pop();
			return netDuration;
		}
		record(methodName, duration, inputSize, outputSize) {
			if (!this.stats.has(methodName)) this.stats.set(methodName, {
				count: 0,
				totalTime: 0,
				netTime: 0,
				maxTime: 0,
				minTime: Infinity,
				inputSizes: [],
				outputSizes: []
			});
			const stat = this.stats.get(methodName);
			stat.count++;
			stat.totalTime += duration;
			stat.netTime += duration;
			stat.maxTime = Math.max(stat.maxTime, duration);
			stat.minTime = Math.min(stat.minTime, duration);
			if (inputSize !== void 0) stat.inputSizes.push(inputSize);
			if (outputSize !== void 0) stat.outputSizes.push(outputSize);
		}
		recordCacheHit(cacheType) {
			this.cacheStats[cacheType].hit++;
			this.cacheStats[cacheType].total++;
		}
		recordCacheMiss(cacheType) {
			this.cacheStats[cacheType].miss++;
			this.cacheStats[cacheType].total++;
		}
		recordActualCompute() {
			this.cacheStats.actualCompute++;
		}
		report() {
			console.log("\n📊 ===== 性能分析报告 =====\n");
			console.log("🎯 subRuleHandler 调用统计:");
			console.log(`   总调用次数: ${this.cacheStats.subRuleHandlerTotal}`);
			console.log(`   递归检测返回: ${this.cacheStats.recursiveReturn}`);
			console.log(`   层级限制返回: ${this.cacheStats.levelLimitReturn}`);
			console.log(`   正常处理: ${this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn}`);
			console.log("");
			console.log("💾 缓存命中率统计:");
			console.log(`   DFS_First1 (深度优先 First(1)):`);
			console.log(`     命中: ${this.cacheStats.dfsFirst1.hit}`);
			console.log(`     未命中: ${this.cacheStats.dfsFirst1.miss}`);
			console.log(`     总次数: ${this.cacheStats.dfsFirst1.total}`);
			console.log(`     命中率: ${this.cacheStats.dfsFirst1.total > 0 ? (this.cacheStats.dfsFirst1.hit / this.cacheStats.dfsFirst1.total * 100).toFixed(1) : 0}%`);
			console.log(`   DFS_FirstK (深度优先 First(K)):`);
			console.log(`     命中: ${this.cacheStats.dfsFirstK.hit}`);
			console.log(`     未命中: ${this.cacheStats.dfsFirstK.miss}`);
			console.log(`     总次数: ${this.cacheStats.dfsFirstK.total}`);
			console.log(`     命中率: ${this.cacheStats.dfsFirstK.total > 0 ? (this.cacheStats.dfsFirstK.hit / this.cacheStats.dfsFirstK.total * 100).toFixed(1) : 0}%`);
			console.log(`   GetDirectChildren (懒加载缓存):`);
			console.log(`     命中: ${this.cacheStats.getDirectChildren.hit}`);
			console.log(`     未命中: ${this.cacheStats.getDirectChildren.miss}`);
			console.log(`     总次数: ${this.cacheStats.getDirectChildren.total}`);
			console.log(`     命中率: ${this.cacheStats.getDirectChildren.total > 0 ? (this.cacheStats.getDirectChildren.hit / this.cacheStats.getDirectChildren.total * 100).toFixed(1) : 0}%`);
			if (this.cacheStats.bfsOptimization.totalCalls > 0) {
				console.log(`\n   🚀 BFS 增量优化效果:`);
				console.log(`     总调用次数: ${this.cacheStats.bfsOptimization.totalCalls}`);
				console.log(`     从 level 1 开始: ${this.cacheStats.bfsOptimization.fromLevel1} (${(this.cacheStats.bfsOptimization.fromLevel1 / this.cacheStats.bfsOptimization.totalCalls * 100).toFixed(1)}%)`);
				console.log(`     从缓存层级开始: ${this.cacheStats.bfsOptimization.fromCachedLevel} (${(this.cacheStats.bfsOptimization.fromCachedLevel / this.cacheStats.bfsOptimization.totalCalls * 100).toFixed(1)}%)`);
				console.log(`     总计跳过层数: ${this.cacheStats.bfsOptimization.skippedLevels}`);
				if (this.cacheStats.bfsOptimization.fromCachedLevel > 0) {
					const avgSkipped = this.cacheStats.bfsOptimization.skippedLevels / this.cacheStats.bfsOptimization.fromCachedLevel;
					console.log(`     平均每次跳过: ${avgSkipped.toFixed(2)} 层`);
				}
			}
			if (this.cacheStats.bfsLevel.total > 0) {
				console.log(`   BFS_Level (handleDFS特殊场景: firstK=∞, maxLevel=1):`);
				console.log(`     命中: ${this.cacheStats.bfsLevel.hit}`);
				console.log(`     未命中: ${this.cacheStats.bfsLevel.miss}`);
				console.log(`     总次数: ${this.cacheStats.bfsLevel.total}`);
				console.log(`     命中率: ${(this.cacheStats.bfsLevel.hit / this.cacheStats.bfsLevel.total * 100).toFixed(1)}%`);
			}
			if (this.cacheStats.expandOneLevel.total > 0) {
				console.log(`   ExpandOneLevel (BFS路径展开缓存):`);
				console.log(`     命中: ${this.cacheStats.expandOneLevel.hit}`);
				console.log(`     未命中: ${this.cacheStats.expandOneLevel.miss}`);
				console.log(`     总次数: ${this.cacheStats.expandOneLevel.total}`);
				console.log(`     命中率: ${(this.cacheStats.expandOneLevel.hit / this.cacheStats.expandOneLevel.total * 100).toFixed(1)}%`);
			}
			console.log(`   实际计算次数 (getDirectChildren): ${this.cacheStats.actualCompute}`);
			console.log("");
			const expectedNormalProcess = this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn;
			const actualCacheOperations = this.cacheStats.dfsFirst1.hit + this.cacheStats.dfsFirstK.hit + this.cacheStats.actualCompute;
			console.log(`📈 统计验证:`);
			console.log(`   预期正常处理: ${expectedNormalProcess}`);
			console.log(`   实际缓存操作: ${actualCacheOperations}`);
			console.log(`   差异: ${expectedNormalProcess - actualCacheOperations} (应该接近0)`);
			console.log("");
			const sorted = Array.from(this.stats.entries()).sort((a, b) => b[1].netTime - a[1].netTime).slice(0, 20);
			const totalTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.totalTime, 0);
			const totalNetTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.netTime, 0);
			console.log("⏱️  方法耗时统计 (按净耗时排序, Top 20):");
			console.log("=".repeat(80));
			for (const [method, stat] of sorted) {
				const avgNetTime = stat.netTime / stat.count;
				const avgTotalTime = stat.totalTime / stat.count;
				const percentage = totalNetTime > 0 ? (stat.netTime / totalNetTime * 100).toFixed(1) : "0.0";
				const avgInput = stat.inputSizes.length > 0 ? stat.inputSizes.reduce((a, b) => a + b, 0) / stat.inputSizes.length : 0;
				const avgOutput = stat.outputSizes.length > 0 ? stat.outputSizes.reduce((a, b) => a + b, 0) / stat.outputSizes.length : 0;
				console.log(`📌 ${method}:`);
				console.log(`   净耗时: ${stat.netTime.toFixed(0)}ms (${percentage}%) | 总耗时: ${stat.totalTime.toFixed(0)}ms`);
				console.log(`   调用次数: ${stat.count}次, 平均净耗时: ${avgNetTime.toFixed(2)}ms, 平均总耗时: ${avgTotalTime.toFixed(2)}ms`);
				console.log(`   最大耗时: ${stat.maxTime.toFixed(0)}ms, 最小耗时: ${stat.minTime === Infinity ? 0 : stat.minTime.toFixed(0)}ms`);
				if (stat.inputSizes.length > 0 && stat.outputSizes.length > 0) console.log(`   输入→输出: ${avgInput.toFixed(1)} → ${avgOutput.toFixed(1)} (${(avgOutput / avgInput).toFixed(1)}x)`);
				console.log("");
			}
			console.log(`⏱️  所有方法净耗时总和: ${totalNetTime.toFixed(2)}ms`);
			console.log(`⏱️  所有方法总耗时总和: ${totalTime.toFixed(2)}ms`);
			console.log("=".repeat(80));
			console.log("");
		}
		clear() {
			this.stats.clear();
			this.cacheStats = {
				subRuleHandlerTotal: 0,
				recursiveReturn: 0,
				levelLimitReturn: 0,
				dfsFirstKCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsAllCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsLevelCache: {
					hit: 0,
					miss: 0,
					total: 0
				},
				getDirectChildren: {
					hit: 0,
					miss: 0,
					total: 0
				},
				dfsFirst1: {
					hit: 0,
					miss: 0,
					total: 0
				},
				dfsFirstK: {
					hit: 0,
					miss: 0,
					total: 0
				},
				bfsLevel: {
					hit: 0,
					miss: 0,
					total: 0
				},
				expandOneLevel: {
					hit: 0,
					miss: 0,
					total: 0
				},
				expandOneLevelTruncated: {
					hit: 0,
					miss: 0,
					total: 0
				},
				actualCompute: 0,
				bfsOptimization: {
					totalCalls: 0,
					skippedLevels: 0,
					fromLevel1: 0,
					fromCachedLevel: 0
				}
			};
		}
	};
	EXPANSION_LIMITS = {
		FIRST_K: 3,
		FIRST_Max: 100,
		LEVEL_1: 1,
		LEVEL_K: 1,
		INFINITY: Infinity,
		RuleJoinSymbol: "",
		MAX_BRANCHES: Infinity
	};
	SubhutiGrammarAnalyzer = class {
		/**
		* 写入日志（使用当前深度控制缩进，自动添加文件名前缀）
		* 使用同步写入确保日志立即刷新到磁盘
		*/
		writeLog(message, depth) {
			if (this.currentLogFd !== null && this.currentRuleName) {
				const indent = "  ".repeat(depth !== void 0 ? depth : this.currentDepth);
				const logFileName = `${this.currentRuleName}-执行中.log`;
				const logLine = `${indent}[${logFileName}] ${message}\n`;
				try {
					fs.writeSync(this.currentLogFd, logLine, null, "utf8");
				} catch (error) {
					console.error(`写入日志失败: ${logFileName}`, error);
				}
			}
		}
		/**
		* 开始记录规则日志
		*/
		startRuleLogging(ruleName) {
			console.log(`🔍 startRuleLogging 被调用: ${ruleName}`);
			this.endRuleLogging();
			this.currentRuleName = ruleName;
			this.currentDepth = 0;
			const __filename = fileURLToPath(import.meta.url);
			let subhutiDir = path.dirname(__filename);
			while (subhutiDir !== path.dirname(subhutiDir)) {
				if (path.basename(subhutiDir) === "subhuti") break;
				subhutiDir = path.dirname(subhutiDir);
			}
			const logDir = path.join(subhutiDir, "logall");
			if (!fs.existsSync(logDir)) {
				fs.mkdirSync(logDir, { recursive: true });
				console.log(`📁 创建日志目录: ${logDir}`);
			} else console.log(`📁 使用日志目录: ${logDir}`);
			const logFilePath = path.join(logDir, `${ruleName}-执行中.log`);
			this.currentLogFilePath = logFilePath;
			console.log(`[DEBUG] 准备创建日志文件: ${logFilePath}`);
			try {
				console.log(`[DEBUG] 开始写入文件内容...`);
				const initialContent = `========== 开始处理规则: ${ruleName} ==========\n时间: ${(/* @__PURE__ */ new Date()).toISOString()}\n\n`;
				this.currentLogFd = fs.openSync(logFilePath, "w");
				fs.writeSync(this.currentLogFd, initialContent, null, "utf8");
				console.log(`[DEBUG] 文件描述符已打开并写入初始内容`);
				if (fs.existsSync(logFilePath)) {
					const stats = fs.statSync(logFilePath);
					console.log(`✅ 日志文件已创建: ${logFilePath}, 大小: ${stats.size} bytes`);
				} else {
					console.error(`❌ 文件写入后不存在: ${logFilePath}`);
					if (this.currentLogFd !== null) {
						fs.closeSync(this.currentLogFd);
						this.currentLogFd = null;
					}
					return;
				}
			} catch (error) {
				console.error(`❌ 创建日志文件失败: ${logFilePath}`);
				console.error(`错误类型: ${error?.constructor?.name || typeof error}`);
				console.error(`错误消息: ${error?.message || String(error)}`);
				if (error?.stack) console.error(`错误堆栈:`, error.stack);
				if (this.currentLogFd !== null) {
					try {
						fs.closeSync(this.currentLogFd);
					} catch (e) {}
					this.currentLogFd = null;
				}
			}
		}
		/**
		* 结束记录规则日志
		*/
		endRuleLogging() {
			if (this.currentLogFd !== null && this.currentRuleName && this.currentLogFilePath) {
				this.writeLog("", 0);
				this.writeLog(`========== 结束处理规则: ${this.currentRuleName} ==========`, 0);
				const ruleName = this.currentRuleName;
				const executingFilePath = this.currentLogFilePath;
				const __filename = fileURLToPath(import.meta.url);
				let subhutiDir = path.dirname(__filename);
				while (subhutiDir !== path.dirname(subhutiDir)) {
					if (path.basename(subhutiDir) === "subhuti") break;
					subhutiDir = path.dirname(subhutiDir);
				}
				const logDir = path.join(subhutiDir, "logall");
				const completedFilePath = path.join(logDir, `${ruleName}-执行完.log`);
				console.log(`[DEBUG] 准备关闭日志文件: ${ruleName}`);
				try {
					fs.closeSync(this.currentLogFd);
					this.currentLogFd = null;
					this.currentLogFilePath = null;
					console.log(`[DEBUG] 文件描述符已关闭，准备重命名文件`);
					console.log(`[DEBUG] 源文件: ${executingFilePath}`);
					console.log(`[DEBUG] 目标文件: ${completedFilePath}`);
					if (fs.existsSync(executingFilePath)) {
						console.log(`[DEBUG] 源文件存在，开始重命名`);
						fs.renameSync(executingFilePath, completedFilePath);
						console.log(`✅ 日志文件已重命名: ${ruleName}-执行中.log -> ${ruleName}-执行完.log`);
					} else console.error(`❌ 源文件不存在: ${executingFilePath}`);
				} catch (error) {
					console.error(`❌ 关闭或重命名日志文件失败: ${executingFilePath} -> ${completedFilePath}`, error);
				}
			}
			this.currentRuleName = null;
			this.currentDepth = 0;
			this.currentLogFd = null;
			this.currentLogFilePath = null;
		}
		/**
		* 封装的缓存 get 方法（统一管理所有缓存统计）
		*
		* ✅ 设计原则：
		* - 每次 get 调用都会增加 total 计数
		* - 如果缓存存在则 hit++，否则 miss++
		* - total 始终等于 hit + miss
		*
		* @param cacheType - 缓存类型
		* @param key - 缓存键
		* @returns 缓存的值，如果不存在返回 undefined
		*/
		getCacheValue(cacheType, key) {
			let result;
			switch (cacheType) {
				case "dfsFirstKCache":
					result = this.dfsFirstKCache.get(key);
					break;
				case "bfsAllCache":
					result = this.bfsAllCache.get(key);
					break;
				case "bfsLevelCache":
					result = this.bfsLevelCache.get(key);
					break;
			}
			if (result !== void 0) this.perfAnalyzer.recordCacheHit(cacheType);
			else {
				if (cacheType === "bfsAllCache") {}
				this.perfAnalyzer.recordCacheMiss(cacheType);
			}
			return result;
		}
		/**
		* 构造函数
		*
		* @param ruleASTs 规则名称 → AST 的映射
		* @param tokenCache
		* @param options 配置选项
		*/
		constructor(ruleASTs, tokenCache, options) {
			this.ruleASTs = ruleASTs;
			this.tokenCache = tokenCache;
			this.recursiveDetectionSet = /* @__PURE__ */ new Set();
			this.currentRuleName = null;
			this.currentLogFd = null;
			this.currentLogFilePath = null;
			this.currentDepth = 0;
			this.dfsFirstKCache = /* @__PURE__ */ new Map();
			this.bfsAllCache = /* @__PURE__ */ new Map();
			this.bfsLevelCache = /* @__PURE__ */ new Map();
			this.perfAnalyzer = new PerformanceAnalyzer();
			this.detectedLeftRecursionErrors = /* @__PURE__ */ new Map();
			this.compareStats = {
				firstKDetected: 0,
				bothDetected: 0,
				firstKOnlyDetected: 0
			};
			this.depthMap = /* @__PURE__ */ new Map();
			this.depmap = /* @__PURE__ */ new Map();
			this.operationStartTime = 0;
			this.currentProcessingRule = "";
			this.timeoutSeconds = 1e3;
			this.options = { maxLevel: options?.maxLevel ?? 5 };
		}
		getRuleNodeByAst(ruleName) {
			const ruleNode = this.ruleASTs.get(ruleName);
			if (!ruleNode) throw new Error("系统错误");
			return ruleNode;
		}
		/**
		* 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
		*
		* 实现方式：
		* - 遍历所有规则的 AST
		* - 递归查找所有 Or 节点
		* - 先计算每个分支的 First(1) 集合
		* - 如果有冲突，再深入检测 First(5)
		*
		* @returns Or 冲突错误列表
		*/
		/**
		* 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
		*
		* 实现方式：
		* - 遍历所有规则的 AST
		* - 递归查找所有 Or 节点
		* - 先计算每个分支的 First(1) 集合
		* - 如果有冲突，再深入检测 First(5)
		*
		* @returns Or 冲突错误列表
		*/
		checkAllOrConflicts() {
			const orConflictErrors = [];
			this.compareStats = {
				firstKDetected: 0,
				bothDetected: 0,
				firstKOnlyDetected: 0
			};
			const perfStats = {
				totalTime: 0,
				ruleStats: /* @__PURE__ */ new Map()
			};
			const startTime = Date.now();
			for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
				const ruleStartTime = Date.now();
				const ruleStats = {
					time: 0,
					orNodeCount: 0,
					pathCount: 0,
					maxPathCount: 0
				};
				const error = this.checkOrConflictsInNodeSmart(ruleName, ruleAST, ruleStats);
				if (error) orConflictErrors.push(error);
				ruleStats.time = Date.now() - ruleStartTime;
				perfStats.ruleStats.set(ruleName, ruleStats);
			}
			perfStats.totalTime = Date.now() - startTime;
			console.log(`\n📊 FirstK vs MaxLevel 检测对比统计:`);
			console.log(`   FirstK 检测到问题: ${this.compareStats.firstKDetected} 个`);
			console.log(`   两者都检测到: ${this.compareStats.bothDetected} 个`);
			console.log(`   仅 FirstK 检测到 (MaxLevel 未检测到): ${this.compareStats.firstKOnlyDetected} 个`);
			return orConflictErrors;
		}
		/**
		* 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
		*
		* @param ruleName 规则名
		* @param node 当前节点
		* @param ruleStats 规则统计信息
		*/
		checkOrConflictsInNodeSmart(ruleName, node, ruleStats) {
			let error;
			switch (node.type) {
				case "or":
					if (ruleStats) ruleStats.orNodeCount++;
					error = this.detectOrBranchConflictsWithCache(ruleName, node, ruleStats);
					if (error) return error;
					for (const alt of node.alternatives) {
						error = this.checkOrConflictsInNodeSmart(ruleName, alt, ruleStats);
						if (error) return error;
					}
					break;
				case "sequence":
					for (const child of node.nodes) {
						error = this.checkOrConflictsInNodeSmart(ruleName, child, ruleStats);
						if (error) return error;
					}
					break;
				case "option":
				case "many":
				case "atLeastOne":
					error = this.checkOrConflictsInNodeSmart(ruleName, node.node, ruleStats);
					if (error) return error;
					break;
				case "consume":
				case "subrule": break;
			}
		}
		/**
		* 获取 Or 节点所有分支的完整路径（深度展开）
		*
		* 核心逻辑：
		* 1. 展开每个分支到第一层（得到规则名序列）
		* 2. 从 cache 获取每个规则的所有路径
		* 3. 笛卡尔积组合，得到分支的所有可能路径
		* 4. 返回每个分支的路径集合
		*
		* @param orNode - Or 节点
		* @param firstK - First(K) 的 K 值
		* @param cacheType - 缓存类型
		* @returns 每个分支的路径集合数组
		*/
		getOrNodeAllBranchRules(ruleName, orNode, firstK, cacheType) {
			let allOrs = [];
			for (const seqNode of orNode.alternatives) {
				const nodeAllBranches = this.expandNode(seqNode, EXPANSION_LIMITS.INFINITY, 1, 1, false);
				const isMore = firstK === EXPANSION_LIMITS.INFINITY;
				if (isMore) {
					if (["ImportCall"].includes(ruleName)) {
						console.log(ruleName);
						console.log(nodeAllBranches);
					}
				}
				let allBranchAllSeq = [];
				for (const branch of nodeAllBranches) {
					const seqAllBranches = branch.map((rule) => {
						if (this.tokenCache.has(rule)) return [[rule]];
						const paths = this.getCacheValue(cacheType, rule);
						if (!paths) throw new Error("系统错误");
						return paths;
					});
					const branchAllSeq = this.cartesianProduct(seqAllBranches, firstK);
					if (isMore) {
						if (branchAllSeq.length > 1e4) {
							console.log(ruleName);
							console.log("branchAllSeq.length");
							console.log(branchAllSeq.length);
						}
					}
					allBranchAllSeq = allBranchAllSeq.concat(branchAllSeq);
				}
				allOrs.push(this.deduplicate(allBranchAllSeq));
			}
			return allOrs;
		}
		removeDuplicatePaths(pathsFront, pathsBehind) {
			if (pathsBehind.length === 0) return [];
			const frontSet = /* @__PURE__ */ new Set();
			for (const path$1 of pathsFront) {
				const key = path$1.join(EXPANSION_LIMITS.RuleJoinSymbol);
				frontSet.add(key);
			}
			const uniqueBehind = [];
			for (const path$1 of pathsBehind) {
				const key = path$1.join(EXPANSION_LIMITS.RuleJoinSymbol);
				if (!frontSet.has(key)) uniqueBehind.push(path$1);
			}
			return uniqueBehind;
		}
		/**
		* 使用前缀树检测两个路径集合中是否存在完全相同的路径
		*
		* @param pathsFront - 前面分支的路径数组
		* @param pathsBehind - 后面分支的路径数组
		* @returns 如果找到完全相同的路径返回该路径，否则返回 null
		*/
		findEqualPath(pathsFront, pathsBehind) {
			const behindSet = /* @__PURE__ */ new Set();
			for (const path$1 of pathsBehind) behindSet.add(path$1.join(EXPANSION_LIMITS.RuleJoinSymbol));
			for (const pathFront of pathsFront) {
				const key = pathFront.join(EXPANSION_LIMITS.RuleJoinSymbol);
				if (behindSet.has(key)) return pathFront;
			}
		}
		/**
		* 使用前缀树检测两个路径集合中的前缀关系
		*
		* @param pathsFront - 前面分支的路径数组
		* @param pathsBehind - 后面分支的路径数组
		* @returns 如果找到前缀关系返回 { prefix, full }，否则返回 null
		*/
		trieTreeFindPrefixMatch(pathsFront, pathsBehind) {
			if (pathsBehind.length === 0 || pathsFront.length === 0) return null;
			const uniqueBehind = this.removeDuplicatePaths(pathsFront, pathsBehind);
			if (uniqueBehind.length === 0) return null;
			const trie = new ArrayTrie();
			for (const path$1 of uniqueBehind) trie.insert(path$1);
			for (const pathFront of pathsFront) {
				const fullPath = trie.findPrefixMatch(pathFront);
				if (fullPath) return {
					prefix: pathFront,
					full: fullPath
				};
			}
			return null;
		}
		/**
		* 生成前缀冲突的修复建议
		*
		* @param ruleName - 规则名
		* @param branchA - 分支A索引
		* @param branchB - 分支B索引
		* @param conflict - 冲突信息
		* @returns 修复建议
		*/
		getPrefixConflictSuggestion(ruleName, branchA, branchB, conflict) {
			if (conflict.type === "equal") return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`;
			return ``;
		}
		/**
		* 线路1：使用 First(K) 检测 Or 分支冲突（智能检测）
		*
		* 检测逻辑：对每个路径对，根据长度选择检测方法
		* - 路径长度都等于 firstK：检测是否完全相同（findEqualPath）
		* - 前面路径长度 < firstK：检测是否是前缀（findPrefixRelation）
		*
		* 数据源：dfsFirstKCache（First(K) 的展开结果）
		*
		* @param ruleName 输出错误日志使用
		* @param orNode - Or 节点
		* @param ruleStats
		*/
		detectOrBranchEqualWithFirstK(ruleName, orNode, ruleStats) {
			if (orNode.alternatives.length < 2) return;
			const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.FIRST_K, "dfsFirstKCache");
			const firstK = EXPANSION_LIMITS.FIRST_K;
			if (ruleStats) {
				const totalPaths = branchPathSets.reduce((sum, paths) => sum + paths.length, 0);
				const maxPaths = Math.max(...branchPathSets.map((paths) => paths.length));
				ruleStats.pathCount += totalPaths;
				ruleStats.maxPathCount = Math.max(ruleStats.maxPathCount, maxPaths);
			}
			for (let i = 0; i < branchPathSets.length; i++) for (let j = i + 1; j < branchPathSets.length; j++) {
				const pathsFront = branchPathSets[i];
				const pathsBehind = branchPathSets[j];
				const equalPath = this.findEqualPath(pathsFront, pathsBehind);
				if (equalPath) {
					const equalPathStr = equalPath.join(EXPANSION_LIMITS.RuleJoinSymbol);
					return {
						level: "ERROR",
						type: "or-identical-branches",
						ruleName,
						branchIndices: [i, j],
						conflictPaths: {
							pathA: equalPathStr,
							pathB: equalPathStr
						},
						message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 的前 ${firstK} 个 token 完全相同`,
						suggestion: this.getEqualBranchSuggestion(ruleName, i, j, equalPathStr)
					};
				}
				const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind);
				if (prefixRelation) {
					const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol);
					const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol);
					return {
						level: "ERROR",
						type: "prefix-conflict",
						ruleName,
						branchIndices: [i, j],
						conflictPaths: {
							pathA: prefixStr,
							pathB: fullStr
						},
						message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}（在 First(${firstK}) 阶段检测到）`,
						suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
							prefix: prefixStr,
							full: fullStr,
							type: "prefix"
						})
					};
				}
			}
		}
		/**
		* 线路2：使用 MaxLevel 检测 Or 分支的前缀遮蔽关系
		*
		* 检测目标：前面的分支是否是后面分支的前缀
		* 数据源：bfsAllCache（深度展开的完整路径）
		* 检测方法：findPrefixRelation()
		* 性能：O(n²) - 深度检测
		*
		* 适用场景：
		* - 检测前缀遮蔽问题
		* - 需要深度展开才能发现的冲突
		*
		* @param ruleName - 规则名
		* @param orNode - Or 节点
		*/
		detectOrBranchPrefixWithMaxLevel(ruleName, orNode, ruleStats) {
			if (orNode.alternatives.length < 2) return;
			const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.INFINITY, "bfsAllCache");
			if (ruleStats) {
				branchPathSets.reduce((sum, paths) => sum + paths.length, 0);
				Math.max(...branchPathSets.map((paths) => paths.length));
			}
			for (let i = 0; i < branchPathSets.length; i++) for (let j = i + 1; j < branchPathSets.length; j++) {
				const pathsFront = branchPathSets[i];
				const pathsBehind = branchPathSets[j];
				const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind);
				if (prefixRelation) {
					const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol);
					const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol);
					return {
						level: "ERROR",
						type: "prefix-conflict",
						ruleName,
						branchIndices: [i, j],
						conflictPaths: {
							pathA: prefixStr,
							pathB: fullStr
						},
						message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}`,
						suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
							prefix: prefixStr,
							full: fullStr,
							type: "prefix"
						})
					};
				}
			}
		}
		/**
		* 生成相同分支的修复建议
		*/
		getEqualBranchSuggestion(ruleName, branchA, branchB, equalPath) {
			return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

检测到的问题：
  相同路径: ${equalPath}

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

修复建议：
1. **删除重复分支**：保留其中一个分支即可
2. **检查逻辑**：确认是否是复制粘贴错误
3. **合并分支**：如果语义相同，合并为一个分支

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`;
		}
		detectOrBranchConflictsWithCache(ruleName, orNode, ruleStats) {
			const orStartTime = Date.now();
			let firstKError = this.detectOrBranchEqualWithFirstK(ruleName, orNode, ruleStats);
			if (!firstKError) return;
			this.compareStats.firstKDetected++;
			const maxLevelError = this.detectOrBranchPrefixWithMaxLevel(ruleName, orNode, ruleStats);
			if (maxLevelError) this.compareStats.bothDetected++;
			else this.compareStats.firstKOnlyDetected++;
			Date.now() - orStartTime;
			if (firstKError.type === "prefix-conflict") {
				if (!maxLevelError) {
					const errorMsg = `
🔴 ========== 防御性检查失败 ==========
规则: ${ruleName}
问题: First(K) 检测到遮蔽，但 MaxLevel 未检测到

First(K) 检测结果:
  类型: ${firstKError.type}
  分支: ${firstKError.branchIndices[0] + 1} → ${firstKError.branchIndices[1] + 1}
  前缀: ${firstKError.conflictPaths?.pathA}
  完整: ${firstKError.conflictPaths?.pathB}

MaxLevel 检测结果: 无冲突

可能原因:
1. First(K) 误报（检测逻辑错误）
2. MaxLevel 漏检（检测逻辑错误）
3. dfsFirstKCache 和 bfsAllCache 数据不一致
==========================================`;
					console.error(errorMsg);
					throw new Error(`防御性检查失败: First(K) 检测到遮蔽但 MaxLevel 未检测到 (规则: ${ruleName})`);
				}
			}
			return maxLevelError;
		}
		findRuleDepth(ruleName) {
			if (this.recursiveDetectionSet.has(ruleName)) return 1;
			this.recursiveDetectionSet.add(ruleName);
			try {
				const node = this.ruleASTs.get(ruleName);
				const result = this.findNodeDepth(node);
				if (result > 1e6) {
					console.log(ruleName);
					console.log(result);
				}
				return result;
			} finally {
				this.recursiveDetectionSet.delete(ruleName);
			}
		}
		manyAndOptionDepth(node) {
			const num = this.findNodeDepth(node.node);
			return num + num;
		}
		atLeastOneDepth(node) {
			const num = this.findNodeDepth(node.node);
			return num + num;
		}
		seqDepth(seq) {
			if (seq.nodes.length < 1) return 1;
			let all = 1;
			for (let i = 0; i < seq.nodes.length; i++) {
				const node = seq.nodes[i];
				const depth = this.findNodeDepth(node);
				all = all * depth;
			}
			return all;
		}
		orDepth(or) {
			if (or.alternatives.length < 1) throw new Error("xitongcuowu");
			let orPossibility = 0;
			for (let i = 0; i < or.alternatives.length; i++) {
				const alternative = or.alternatives[i];
				const depth = this.findNodeDepth(alternative);
				orPossibility += depth;
			}
			if (orPossibility === 0) throw new Error("系统错误");
			return orPossibility;
		}
		findNodeDepth(node) {
			this.checkTimeout("findNodeDepth");
			const callId = this.perfAnalyzer.startMethod("findNodeDepth");
			let result;
			switch (node.type) {
				case "consume":
					result = 1;
					break;
				case "subrule":
					result = this.findRuleDepth(node.ruleName);
					break;
				case "or":
					result = this.orDepth(node);
					break;
				case "sequence":
					result = this.seqDepth(node);
					break;
				case "option":
				case "many":
				case "atLeastOne":
					result = this.manyAndOptionDepth(node);
					break;
				default: throw new Error(`未知节点类型: ${node.type}`);
			}
			this.perfAnalyzer.endMethod(callId, void 0);
			return result;
		}
		deepDepth(node, depth) {
			this.checkTimeout("deepDepth");
			const callId = this.perfAnalyzer.startMethod("findNodeDepth");
			let result;
			let tempary = [];
			switch (node.type) {
				case "consume":
					result = depth;
					break;
				case "subrule":
					const ruleName = node.ruleName;
					if (this.depmap.has(ruleName)) return this.depmap.get(ruleName);
					if (this.recursiveDetectionSet.has(ruleName)) return depth;
					depth++;
					this.recursiveDetectionSet.add(ruleName);
					const subNode = this.ruleASTs.get(ruleName);
					result = this.deepDepth(subNode, depth);
					this.recursiveDetectionSet.delete(ruleName);
					break;
				case "or":
					tempary = [];
					for (const alternative of node.alternatives) tempary.push(this.deepDepth(alternative, depth));
					result = Math.max(...tempary);
					break;
				case "sequence":
					tempary = [];
					for (const alternative of node.nodes) tempary.push(this.deepDepth(alternative, depth));
					result = Math.max(...tempary);
					break;
				case "option":
				case "many":
				case "atLeastOne":
					result = this.deepDepth(node.node, depth);
					break;
				default: throw new Error(`未知节点类型: ${node.type}`);
			}
			this.perfAnalyzer.endMethod(callId, void 0);
			return result;
		}
		collectDependencies(node, fromRule) {
			switch (node.type) {
				case "consume":
					this.graph.setEdge(fromRule, node.tokenName);
					break;
				case "subrule":
					this.graph.setEdge(fromRule, node.ruleName);
					break;
				case "sequence":
					node.nodes.forEach((n) => this.collectDependencies(n, fromRule));
					break;
				case "or":
					node.alternatives.forEach((alt) => this.collectDependencies(alt, fromRule));
					break;
				case "option":
				case "many":
				case "atLeastOne":
					this.collectDependencies(node.node, fromRule);
					break;
			}
		}
		graphToMermaid(g) {
			const lines = ["graph TD"];
			for (const edge of g.edges()) lines.push(`    ${edge.v} --> ${edge.w}`);
			return lines.join("\n");
		}
		grachScc() {
			this.graph = new Graph({ directed: true });
			for (const [ruleName, node] of this.ruleASTs) {
				this.graph.setNode(ruleName);
				this.collectDependencies(node, ruleName);
			}
			const dotString = write(this.graph);
			console.log(dotString);
			const sccs = alg.tarjan(this.graph);
			console.log("=== 强连通分量（循环） ===");
			for (const scc of sccs) if (scc.length > 1) {
				console.log("====================");
				console.log(`循环: `);
				console.log(`${scc.length}`);
			}
		}
		computeRuleDepth() {
			for (const node of this.ruleASTs.values()) {
				this.recursiveDetectionSet.clear();
				const result = this.deepDepth(node, 1);
				console.log(node.ruleName);
				console.log(result);
				this.depmap.set(node.ruleName, result);
			}
		}
		computeRulePossibility() {
			for (const node of this.ruleASTs.values()) {
				this.recursiveDetectionSet.clear();
				const ruleName = node.ruleName;
				console.log("进入规则：" + ruleName);
				const result = this.findNodeDepth(node);
				if (this.depthMap.has(ruleName)) {
					const num = this.depthMap.get(ruleName);
					if (result !== num) {
						console.log("更新设置");
						console.log(ruleName);
						console.log("jiuzhi");
						console.log(num);
						console.log("心智");
						console.log(result);
						this.depthMap.set(ruleName, result);
						throw new Error("系统错误");
					}
				} else {
					this.depthMap.set(ruleName, result);
					console.log("初次设置");
					console.log(ruleName);
					console.log(result);
				}
			}
		}
		/**
		* 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
		*
		* 应该在收集 AST 之后立即调用
		*
		* @returns { errors: 验证错误列表, stats: 统计信息 }
		*/
		initCacheAndCheckLeftRecursion() {
			this.operationStartTime = Date.now();
			const totalStartTime = Date.now();
			const stats = {
				dfsFirstKTime: 0,
				bfsMaxLevelTime: 0,
				orDetectionTime: 0,
				leftRecursionCount: 0,
				orConflictCount: 0,
				totalTime: 0,
				dfsFirstKCacheSize: 0,
				bfsAllCacheSize: 0,
				firstK: 0,
				cacheUsage: {
					dfsFirstK: {
						hit: 0,
						miss: 0,
						total: 0,
						hitRate: 0
					},
					bfsLevelCache: {
						hit: 0,
						miss: 0,
						total: 0,
						hitRate: 0,
						size: 0
					},
					getDirectChildren: {
						hit: 0,
						miss: 0,
						total: 0,
						hitRate: 0
					}
				}
			};
			this.detectedLeftRecursionErrors.clear();
			this.operationStartTime = Date.now();
			const t1_2_start = Date.now();
			console.log(`\n📦 ===== BFS MaxLevel 缓存生成开始 =====`);
			console.log(`目标层级: Level 1 到 Level ${EXPANSION_LIMITS.LEVEL_K}`);
			const ruleNames = Array.from(this.ruleASTs.keys());
			for (const ruleName of ruleNames) {
				this.recursiveDetectionSet.clear();
				this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.INFINITY, true);
			}
			const startLevel = EXPANSION_LIMITS.LEVEL_K;
			for (let level = startLevel; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
				console.log(`\n📊 正在生成 Level ${level} 的缓存...`);
				let levelRuleIndex = 0;
				for (const ruleName of ruleNames) {
					levelRuleIndex++;
					const key = `${ruleName}:${level}`;
					if (this.bfsLevelCache.has(key)) continue;
					const ruleStartTime = Date.now();
					this.expandPathsByBFSCache(ruleName, level);
					const ruleDuration = Date.now() - ruleStartTime;
					const cachedPaths = this.bfsLevelCache.get(key);
					const pathCount = cachedPaths ? cachedPaths.length : 0;
					if (ruleDuration > 10 || pathCount > 100) console.log(`  ✅ 生成完成: ${ruleName}, Level ${level} (耗时: ${ruleDuration}ms, 路径数: ${pathCount})`);
				}
				console.log(`📊 Level ${level} 缓存生成完成`);
			}
			console.log(`\n📦 正在聚合所有层级的数据到 bfsAllCache...`);
			let aggregateIndex = 0;
			for (const ruleName of ruleNames) {
				aggregateIndex++;
				const aggregateStartTime = Date.now();
				let allLevelPaths = [];
				for (let level = startLevel; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
					const key = `${ruleName}:${level}`;
					if (this.bfsLevelCache.has(key)) {
						const levelPaths = this.getCacheValue("bfsLevelCache", key);
						allLevelPaths = allLevelPaths.concat(levelPaths);
					}
				}
				const deduplicated = this.deduplicate(allLevelPaths);
				this.bfsAllCache.set(ruleName, deduplicated);
				if (deduplicated.length > 1e3) {
					const aggregateDuration = Date.now() - aggregateStartTime;
					console.log(`  [${aggregateIndex}/${ruleNames.length}] 聚合完成: ${ruleName} (耗时: ${aggregateDuration}ms, 路径数: ${deduplicated.length})`);
				}
			}
			stats.bfsMaxLevelTime = Date.now() - t1_2_start;
			console.log(`\n✅ BFS MaxLevel 缓存生成完成 (总耗时: ${stats.bfsMaxLevelTime}ms)`);
			console.log(`========================================\n`);
			this.operationStartTime = 0;
			for (const error of this.detectedLeftRecursionErrors.values()) {
				const ruleAST = this.getRuleNodeByAst(error.ruleName);
				error.suggestion = this.getLeftRecursionSuggestion(error.ruleName, ruleAST, new Set([error.ruleName]));
			}
			stats.leftRecursionCount = this.detectedLeftRecursionErrors.size;
			const leftRecursionErrors = Array.from(this.detectedLeftRecursionErrors.values());
			const t2 = Date.now();
			const orConflictErrors = this.checkAllOrConflicts();
			stats.orDetectionTime = Date.now() - t2;
			stats.orConflictCount = orConflictErrors.length;
			const allErrors = [];
			allErrors.push(...leftRecursionErrors);
			allErrors.push(...orConflictErrors);
			stats.totalTime = Date.now() - totalStartTime;
			stats.dfsFirstKCacheSize = this.dfsFirstKCache.size;
			stats.bfsAllCacheSize = this.bfsAllCache.size;
			stats.firstK = EXPANSION_LIMITS.FIRST_K;
			const dfsFirstKCacheStats = this.perfAnalyzer.cacheStats.dfsFirstKCache;
			const bfsAllCacheStats = this.perfAnalyzer.cacheStats.bfsAllCache;
			const bfsLevelCacheStats = this.perfAnalyzer.cacheStats.bfsLevelCache;
			const getDirectChildrenStats = this.perfAnalyzer.cacheStats.getDirectChildren;
			stats.cacheUsage = {
				dfsFirstK: {
					hit: dfsFirstKCacheStats.hit,
					miss: dfsFirstKCacheStats.miss,
					total: dfsFirstKCacheStats.total,
					hitRate: dfsFirstKCacheStats.total > 0 ? dfsFirstKCacheStats.hit / dfsFirstKCacheStats.total * 100 : 0,
					getCount: dfsFirstKCacheStats.total
				},
				bfsAllCache: {
					hit: bfsAllCacheStats.hit,
					miss: bfsAllCacheStats.miss,
					total: bfsAllCacheStats.total,
					hitRate: bfsAllCacheStats.total > 0 ? bfsAllCacheStats.hit / bfsAllCacheStats.total * 100 : 0,
					getCount: bfsAllCacheStats.total,
					size: this.bfsAllCache.size
				},
				bfsLevelCache: {
					hit: bfsLevelCacheStats.hit,
					miss: bfsLevelCacheStats.miss,
					total: bfsLevelCacheStats.total,
					hitRate: bfsLevelCacheStats.total > 0 ? bfsLevelCacheStats.hit / bfsLevelCacheStats.total * 100 : 0,
					size: this.bfsLevelCache.size,
					getCount: bfsLevelCacheStats.total
				},
				getDirectChildren: {
					hit: getDirectChildrenStats.hit,
					miss: getDirectChildrenStats.miss,
					total: getDirectChildrenStats.total,
					hitRate: getDirectChildrenStats.total > 0 ? getDirectChildrenStats.hit / getDirectChildrenStats.total * 100 : 0
				}
			};
			this.perfAnalyzer.report();
			return {
				errors: allErrors,
				stats
			};
		}
		cartesianProductInner1(arrays, firstK) {
			const callId = this.perfAnalyzer.startMethod("cartesianProduct");
			if (arrays.length === 0) return [[]];
			if (arrays.length === 1) {
				const inputSize$1 = arrays[0].length;
				this.perfAnalyzer.endMethod(callId, inputSize$1, inputSize$1);
				return arrays[0];
			}
			const perfStats = {
				totalBranches: 0,
				skippedByLength: 0,
				skippedByDuplicate: 0,
				actualCombined: 0,
				maxResultSize: 0,
				movedToFinal: 0
			};
			const arrayFirst = arrays[0];
			let result = arrayFirst.filter((item) => item.length < firstK);
			let finalResult = arrayFirst.filter((item) => item.length >= firstK).map((item) => item.join(EXPANSION_LIMITS.RuleJoinSymbol));
			const finalResultSet = new Set(finalResult);
			for (let i = 1; i < arrays.length; i++) {
				this.checkTimeout(`cartesianProduct-数组${i}/${arrays.length}`);
				const arrilen = arrays[i].length;
				const currentArray = this.deduplicate(arrays[i]);
				if (arrilen > currentArray.length) throw new Error("系统错误");
				const temp = [];
				let seqIndex = 0;
				const totalSeqs = result.length;
				const shouldLogProgress = totalSeqs > 1e3 || currentArray.length > 1e3;
				const cartesianStartTime = shouldLogProgress ? Date.now() : 0;
				if (shouldLogProgress) totalSeqs * currentArray.length;
				for (const seq of result) {
					if (currentArray.length * seq.length > 3e4) {}
					seqIndex++;
					if (seqIndex % 1e3 === 0 || seqIndex === totalSeqs) {
						this.checkTimeout(`cartesianProduct-seq${seqIndex}/${totalSeqs}`);
						if (shouldLogProgress) {
							Date.now() - cartesianStartTime;
							(seqIndex / totalSeqs * 100).toFixed(1);
						}
					}
					const availableLength = firstK - seq.length;
					if (availableLength < 0) throw new Error("系统错误：序列长度超过限制");
					else if (availableLength === 0) {
						const seqKey$1 = seq.join(EXPANSION_LIMITS.RuleJoinSymbol);
						finalResultSet.add(seqKey$1);
						perfStats.movedToFinal++;
						perfStats.skippedByLength += currentArray.length;
						continue;
					}
					const seqDeduplicateSet = /* @__PURE__ */ new Set();
					const seqLength = seq.length;
					const seqKey = seqLength > 0 ? seq.join(EXPANSION_LIMITS.RuleJoinSymbol) : "";
					for (const branch of currentArray) {
						perfStats.totalBranches++;
						const truncatedBranch = branch.length <= availableLength ? branch : branch.slice(0, availableLength);
						const truncatedLength = truncatedBranch.length;
						const branchKey = truncatedBranch.join(EXPANSION_LIMITS.RuleJoinSymbol);
						if (seqDeduplicateSet.has(branchKey)) {
							perfStats.skippedByDuplicate++;
							continue;
						}
						seqDeduplicateSet.add(branchKey);
						const combinedLength = seqLength + truncatedLength;
						if (combinedLength > firstK) throw new Error("系统错误：笛卡尔积拼接后长度超过限制");
						if (combinedLength === firstK) {
							const combinedKey = seqKey ? seqKey + EXPANSION_LIMITS.RuleJoinSymbol + branchKey : branchKey;
							finalResultSet.add(combinedKey);
							perfStats.movedToFinal++;
						} else {
							const combined = new Array(combinedLength);
							for (let j = 0; j < seqLength; j++) combined[j] = seq[j];
							for (let j = 0; j < truncatedLength; j++) combined[seqLength + j] = truncatedBranch[j];
							temp.push(combined);
						}
						perfStats.actualCombined++;
					}
				}
				const dedupStartTime = Date.now();
				result = this.deduplicate(temp);
				Date.now() - dedupStartTime;
				perfStats.maxResultSize = Math.max(perfStats.maxResultSize, result.length + finalResultSet.size);
				if (result.length + finalResultSet.size > 1e5) console.warn(`⚠️ 笛卡尔积中间结果较大: temp=${result.length}, final=${finalResultSet.size} (数组 ${i}/${arrays.length - 1})`);
				if (result.length === 0 && finalResultSet.size > 0) break;
			}
			let finalArray = [];
			for (const seqStr of finalResultSet) if (seqStr === "") finalArray.push([]);
			else finalArray.push(seqStr.split(EXPANSION_LIMITS.RuleJoinSymbol));
			finalArray = finalArray.concat(result);
			const finalDedupStartTime = Date.now();
			const deduplicatedFinalArray = this.deduplicate(finalArray);
			Date.now() - finalDedupStartTime;
			for (const resultElement of deduplicatedFinalArray) if (resultElement.length > firstK) throw new Error("系统错误：最终结果长度超过限制");
			const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0);
			this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length);
			return deduplicatedFinalArray;
		}
		/**
		* 计算笛卡尔积（优化版：先截取再拼接 + seq级别去重 + 提前移入最终结果集）
		* [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
		*
		* ⚠️ 重要：空分支处理
		* - 空分支 [] 参与笛卡尔积时，会被正常拼接
		* - [...seq, ...[]] = [...seq]，相当于只保留 seq
		* - 例如：[[a]] × [[], [b]] → [[a], [a,b]]
		* - 这正是 option/many 需要的行为：可以跳过或执行
		*
		* 🔧 优化策略：
		* 1. 先计算可拼接长度，避免拼接超长数据
		* 2. seq 级别去重，提前跳过重复分支
		* 3. 修复循环逻辑，逐个数组处理
		* 4. 长度达到 firstK 的序列立即移入最终结果集，不再参与后续计算
		* 5. 所有序列都达到 firstK 时提前结束，跳过剩余数组
		*/
		cartesianProduct(arrays, firstK) {
			return this.cartesianProductInner1(arrays, firstK);
		}
		cartesianProductInner2(arrays, firstK) {
			const callId = this.perfAnalyzer.startMethod("cartesianProduct");
			let deduplicatedFinalArray = fastCartesian(arrays).map((item) => {
				return item.flat();
			});
			const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0);
			this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length);
			return deduplicatedFinalArray;
		}
		/**
		* 深度优先展开（DFS - Depth-First Search）
		*
		* 🚀 算法：递归深入，自然展开到token
		*
		* 适用场景：
		* - maxLevel = INFINITY（无限层级）
		* - 需要完全展开到token
		* - 适合 First(K) + 完全展开
		*
		* 优势：
		* - 递归处理AST，代码简洁
		* - 自然深入到叶子节点
		* - 配合 firstK 截取，可提前终止部分分支
		*
		* @param node - AST 节点（可选）
		* @param ruleName - 规则名（可选）
		* @param firstK - 取前 K 个符号
		* @param curLevel - 当前层级（默认 0）
		* @param maxLevel - 最大展开层级（通常为 Infinity）
		* @param isFirstPosition - 是否在第一个位置（用于左递归检测）
		* @returns 展开后的路径数组 string[][]
		*
		* 调用方式：
		* - expandPathsByDFS(node, null, firstK, curLevel, maxLevel) - 传入节点
		* - expandPathsByDFS(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
		*
		* 核心逻辑：递归处理 AST 节点
		* - consume: 返回 [[tokenName]]
		* - subrule: 递归展开
		* - sequence: 笛卡尔积组合子节点
		* - or: 合并所有分支
		* - option/many: 添加空分支
		*/
		expandNode(node, firstK, curLevel, maxLevel, isFirstPosition = false) {
			const callId = this.perfAnalyzer.startMethod("expandNode");
			let result;
			switch (node.type) {
				case "consume":
					result = [[node.tokenName]];
					break;
				case "subrule":
					result = this.expandPathsByDFSCache(node.ruleName, firstK, curLevel, maxLevel, isFirstPosition);
					break;
				case "or":
					result = this.expandOr(node.alternatives, firstK, curLevel, maxLevel, isFirstPosition);
					break;
				case "sequence":
					result = this.expandSequenceNode(node, firstK, curLevel, maxLevel, isFirstPosition);
					break;
				case "option":
				case "many":
					result = this.expandOption(node.node, firstK, curLevel, maxLevel, isFirstPosition);
					break;
				case "atLeastOne":
					result = this.expandAtLeastOne(node.node, firstK, curLevel, maxLevel, isFirstPosition);
					break;
				default: throw new Error(`未知节点类型: ${node.type}`);
			}
			this.perfAnalyzer.endMethod(callId, void 0, result.length);
			return result;
		}
		checkTimeout(location) {
			if (!this.operationStartTime) return;
			const elapsed = (Date.now() - this.operationStartTime) / 1e3;
			this.timeoutSeconds - elapsed;
			if (elapsed > this.timeoutSeconds) {
				const errorMsg = `
❌ ========== 操作超时 ==========
超时位置: ${location}
当前规则: ${this.currentProcessingRule}
已耗时: ${elapsed.toFixed(2)}秒
超时阈值: ${this.timeoutSeconds}秒

建议：
1. 检查是否存在笛卡尔积爆炸
2. 检查是否有循环递归未被检测
3. 查看日志最后处理的规则和子节点
================================`;
				console.error(errorMsg);
				throw new Error(`操作超时: ${elapsed.toFixed(2)}秒 (超时位置: ${location})`);
			}
		}
		expandSequenceNode(node, firstK, curLevel, maxLevel, isFirstPosition = true) {
			const callId = this.perfAnalyzer.startMethod("expandSequenceNode");
			this.checkTimeout("expandSequenceNode-开始");
			if (node.nodes.length === 0) return [[]];
			let requiredCount = 0;
			let expandToIndex = node.nodes.length;
			for (let i = 0; i < node.nodes.length; i++) {
				const child = node.nodes[i];
				if (child.type !== "option" && child.type !== "many") {
					requiredCount++;
					if (requiredCount >= firstK) {
						expandToIndex = i + 1;
						break;
					}
				}
			}
			const nodesToExpand = node.nodes.slice(0, expandToIndex);
			const allBranches = [];
			let minLengthSum = 0;
			for (let i = 0; i < nodesToExpand.length; i++) {
				this.checkTimeout(`expandSequenceNode-子节点${i + 1}`);
				const expandChildStartTime = Date.now();
				let branches = this.expandNode(nodesToExpand[i], firstK, curLevel, maxLevel, isFirstPosition && i === 0);
				Date.now() - expandChildStartTime;
				if (branches.length === 0) return [];
				branches = branches.map((item) => item.slice(0, firstK));
				allBranches.push(branches);
				let minLength = Infinity;
				for (const b of branches) {
					const len = b.length;
					if (len < minLength) {
						minLength = len;
						if (minLength === 0) break;
					}
				}
				minLengthSum += minLength;
				if (minLengthSum >= firstK) break;
			}
			if (allBranches.length === 0) return [];
			this.checkTimeout("expandSequenceNode-笛卡尔积前");
			const result = this.cartesianProduct(allBranches, firstK);
			this.checkTimeout("expandSequenceNode-笛卡尔积后");
			const finalResult = this.truncateAndDeduplicate(result, firstK);
			this.perfAnalyzer.endMethod(callId, node.nodes.length, finalResult.length);
			return finalResult;
		}
		/**
		* 广度优先展开（BFS - Breadth-First Search）
		*
		* 🚀 算法：逐层循环，精确控制层数
		* 🔥 优化：增量复用 - 从最近的缓存层级开始，而非每次从 level 1 开始
		*
		* 适用场景：
		* - maxLevel = 具体值（如 3, 5）
		* - 需要展开到指定层级
		* - 适合 First(∞) + 限制层数
		*
		* 设计理念：
		* - BFS 只负责按层级完整展开（firstK=∞）
		* - 不负责截取操作
		* - 截取由外层调用者统一处理
		*
		* 优化策略：
		* - 增量复用：level3 = level2 + 展开1层
		* - 缓存查找：从 maxLevel-1 → maxLevel-2 → ... → level 1
		* - 跳过中间计算：避免重复展开低层级
		*
		* @param ruleName 顶层规则名
		* @param maxLevel 目标层级
		* @returns 展开到目标层级的完整路径（不截取）
		*
		* 核心逻辑（增量展开）：
		* 1. 查找最近的缓存层级（maxLevel-1, maxLevel-2, ..., 1）
		* 2. 从最近的缓存开始展开（而非总是从 level 1）
		* 3. 每次展开1层：调用 expandSinglePath
		* 4. 分离已完成（全token）和未完成（含规则名）的路径
		* 5. 继续展开未完成的路径
		* 6. 达到目标层级后停止
		*
		* 示例：
		* 展开 level 4：
		*   - 查找 level 3 缓存 → 找到 ✅
		*   - level 3 + 展开1层 = level 4
		*   - 节省：level 1→2→3 的计算
		*/
		/**
		* BFS 展开（纯递归实现，智能缓存复用）
		*
		* 核心思想：
		* 1. 查找最大可用缓存块（如 level 3）
		* 2. 对缓存的每个路径中的规则名，递归调用自己
		* 3. 缓存并返回结果
		*
		* 示例：查找 A:10，缓存有 A:3
		* - 找到 A:3 = [a1, B, c1]
		* - 对 B 递归调用 expandPathsByBFSCache(B, 7, [B])
		*   - 找到 B:3 = [b1, C, c1]
		*   - 对 C 递归调用 expandPathsByBFSCache(C, 4, [C])
		*     - 找到 C:3 = [c1, D, c3]
		*     - 对 D 递归调用 expandPathsByBFSCache(D, 1, [D])
		*       - 返回 getDirectChildren(D)
		*     - 缓存 C:4 ✅
		*   - 缓存 B:7 ✅
		* - 缓存 A:10 ✅
		*
		* BFS 展开（纯净版，单方法递归实现）
		*
		* 核心逻辑：
		* 1. 查找 ruleName 的最近缓存
		* 2. 对缓存的每个路径中的规则名，递归调用自己
		* 3. 自动缓存中间结果
		*
		* 示例：查找 A:10，缓存有 A:3
		* - 查找 A:10 → 找到 A:3 = [[a1, B, c1]]
		* - 对 B 递归：expandPathsByBFSCacheClean(B, 7)
		*   - 查找 B:7 → 找到 B:3 = [[b1, C, d1]]
		*   - 对 C 递归：expandPathsByBFSCacheClean(C, 4)
		*     - 查找 C:4 → 找到 C:3 = [[c1, D, e1]]
		*     - 对 D 递归：expandPathsByBFSCacheClean(D, 1)
		*       → 返回 getDirectChildren(D)
		*     - 缓存 C:4 ✅
		*   - 缓存 B:7 ✅
		* - 缓存 A:10 ✅
		*
		* @param ruleName 规则名
		* @param targetLevel 目标层级
		* @returns 展开结果
		*/
		expandPathsByBFSCache(ruleName, targetLevel) {
			const depth = this.currentDepth;
			if (targetLevel === 0) throw new Error("系统错误");
			const tokenNode = this.tokenCache?.get(ruleName);
			if (tokenNode && tokenNode.type === "consume") return [[ruleName]];
			if (targetLevel === EXPANSION_LIMITS.LEVEL_1) {
				this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth);
				this.currentDepth = depth + 1;
				const result = this.getDirectChildren(ruleName);
				this.currentDepth = depth;
				this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth);
				this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=1), 路径数: ${result.length} [执行完]`, depth);
				return result;
			}
			const key = `${ruleName}:${targetLevel}`;
			this.currentProcessingRule = `${ruleName}:Level${targetLevel}`;
			this.checkTimeout(`expandPathsByBFSCache-${ruleName}-Level${targetLevel}`);
			if (this.bfsLevelCache.has(key)) {
				const cached = this.getCacheValue("bfsLevelCache", key);
				this.writeLog(`✅ BFS缓存命中: ${key}, 路径数: ${cached.length}`, depth);
				this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth);
				return cached;
			}
			this.writeLog(`❌ BFS缓存未命中: ${key}`, depth);
			let cachedLevel = 1;
			let cachedBranches = null;
			for (let level = Math.min(targetLevel, EXPANSION_LIMITS.LEVEL_K); level >= 2; level--) {
				const cacheKey = `${ruleName}:${level}`;
				if (this.bfsLevelCache.has(cacheKey)) {
					cachedLevel = level;
					cachedBranches = this.getCacheValue("bfsLevelCache", cacheKey);
					this.writeLog(`✅ 找到缓存: ${cacheKey}, 路径数: ${cachedBranches.length}`, depth);
					if (level === targetLevel) {
						this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 使用缓存, 路径数: ${cachedBranches.length} [执行完]`, depth);
						return cachedBranches;
					}
					break;
				} else this.writeLog(`❌ 没有缓存: ${cacheKey}`, depth);
			}
			if (!cachedBranches) {
				this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth);
				cachedLevel = EXPANSION_LIMITS.LEVEL_1;
				this.currentDepth = depth + 1;
				cachedBranches = this.getDirectChildren(ruleName);
				this.currentDepth = depth;
				this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth);
			}
			const remainingLevels = targetLevel - cachedLevel;
			if (remainingLevels <= 0) throw new Error("系统错误");
			let expandedPaths = [];
			const totalPaths = cachedBranches.length;
			const branchResults = [];
			for (let branchIndex = 0; branchIndex < cachedBranches.length; branchIndex++) {
				const branchSeqRules = cachedBranches[branchIndex];
				if (branchIndex % 10 === 0 || branchIndex === cachedBranches.length - 1) this.checkTimeout(`expandPathsByBFSCache-${ruleName}-处理路径${branchIndex + 1}/${totalPaths}`);
				const branchAllRuleBranchSeqs = [];
				for (let ruleIndex = 0; ruleIndex < branchSeqRules.length; ruleIndex++) {
					const subRuleName = branchSeqRules[ruleIndex];
					this.checkTimeout(`expandPathsByBFSCache-${ruleName}-展开符号${ruleIndex + 1}/${branchSeqRules.length}:${subRuleName}`);
					if (branchSeqRules.includes(subRuleName) && branchSeqRules.indexOf(subRuleName) < ruleIndex) {
						this.writeLog(`⚠️ 递归检测: ${subRuleName} 已在路径中，不再展开`, depth);
						branchAllRuleBranchSeqs.push([[subRuleName]]);
						continue;
					}
					this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行中]`, depth);
					this.currentDepth = depth + 1;
					const result = this.expandPathsByBFSCache(subRuleName, remainingLevels);
					this.currentDepth = depth;
					branchAllRuleBranchSeqs.push(result);
					this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行完], 结果数: ${result.length}`, depth);
				}
				const branchSizes = branchAllRuleBranchSeqs.map((b) => b.length);
				const estimatedCombinations = branchSizes.reduce((a, b) => a * b, 1);
				const totalInputSize = branchSizes.reduce((a, b) => a + b, 0);
				this.writeLog(`笛卡尔积计算 [执行中]: 分支数: ${branchAllRuleBranchSeqs.length}, 各分支大小: [${branchSizes.join(", ")}], 预计组合数: ${estimatedCombinations}, 总输入大小: ${totalInputSize}`, depth);
				const pathResult = this.cartesianProduct(branchAllRuleBranchSeqs, EXPANSION_LIMITS.INFINITY);
				this.writeLog(`笛卡尔积计算 [执行完]: 结果数: ${pathResult.length}, 预计组合数: ${estimatedCombinations}`, depth);
				this.checkTimeout(`expandPathsByBFSCache-${ruleName}-路径${branchIndex + 1}-笛卡尔积后`);
				if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
					const branchName = branchSeqRules.join(" ");
					branchResults.push({
						branchName,
						paths: pathResult
					});
				}
				expandedPaths = expandedPaths.concat(pathResult);
			}
			this.checkTimeout(`expandPathsByBFSCache-${ruleName}-去重前`);
			const finalResult = this.deduplicate(expandedPaths);
			if (this.bfsLevelCache.has(key)) throw new Error("系统错误");
			if (!this.isRuleNameOnly(finalResult, ruleName)) {
				this.bfsLevelCache.set(key, finalResult);
				this.writeLog(`📦 存储缓存: ${key}, 路径数: ${finalResult.length}`, depth);
			} else this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth);
			if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
				this.writeLog(``, depth);
				this.writeLog(`📋 完整结果 (共 ${finalResult.length} 条路径, ${branchResults.length} 个语法分支):`, depth);
				this.writeLog(`${"=".repeat(80)}`, depth);
				for (let i = 0; i < branchResults.length; i++) {
					const branch = branchResults[i];
					this.writeLog(``, depth);
					this.writeLog(`分支 ${i + 1}: ${branch.branchName} (${branch.paths.length} 条路径)`, depth);
					this.writeLog(`${"-".repeat(80)}`, depth);
					branch.paths.forEach((path$1, index) => {
						this.writeLog(`   ${(index + 1).toString().padStart(4, " ")}. ${path$1.join(" ")}`, depth);
					});
				}
				this.writeLog(`${"=".repeat(80)}`, depth);
				this.writeLog(``, depth);
			}
			this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 路径数: ${finalResult.length} [执行完]`, depth);
			return finalResult;
		}
		/**
		* 获取规则的直接子节点（展开1层）
		*
		* @param ruleName 规则名
		* @returns 直接子节点的所有路径（展开1层）
		*
		* 优先级：
		* 1. 从 bfsLevelCache 获取 "ruleName:1"（如果已初始化）
		* 2. 动态计算并缓存
		*
		* 示例：
		* - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
		* - IfStatement → [[If, LParen, Expression, RParen, Statement]]
		*/
		getDirectChildren(ruleName) {
			const maxLevel = EXPANSION_LIMITS.LEVEL_1;
			const key = `${ruleName}:${maxLevel}`;
			const depth = this.currentDepth;
			if (this.bfsLevelCache.has(key)) {
				this.perfAnalyzer.recordCacheHit("getDirectChildren");
				const cached = this.getCacheValue("bfsLevelCache", key);
				this.writeLog(`✅ getDirectChildren缓存命中: ${key}, 路径数: ${cached.length}`, depth);
				this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth);
				return cached;
			}
			this.perfAnalyzer.recordCacheMiss("getDirectChildren");
			this.writeLog(`❌ getDirectChildren缓存未命中: ${key}`, depth);
			const tokenNode = this.tokenCache?.get(ruleName);
			if (tokenNode && tokenNode.type === "consume") {
				const result$1 = [[ruleName]];
				this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), Token节点, 路径数: 1 [执行完]`, depth);
				return result$1;
			}
			if (!this.getRuleNodeByAst(ruleName)) throw new Error(`系统错误：规则不存在: ${ruleName}`);
			const t0 = Date.now();
			const result = this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.INFINITY, 0, maxLevel, false);
			Date.now() - t0;
			const shouldCache = !this.isRuleNameOnly(result, ruleName);
			if (shouldCache && !this.bfsLevelCache.has(key)) {
				this.bfsLevelCache.set(key, result);
				this.writeLog(`📦 存储BFS缓存: ${key}, 路径数: ${result.length}`, depth);
			} else if (!shouldCache) this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth);
			this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 路径数: ${result.length} [执行完]`, depth);
			return result;
		}
		/**
		* 处理 DFS 模式（深度优先展开，无限层级）
		*
		* @param ruleName 规则名
		* @param firstK 截取数量
		* @param curLevel 当前层级
		* @param maxLevel
		* @param isFirstPosition 是否在第一个位置（用于左递归检测）
		* @returns 展开结果
		*/
		expandPathsByDFSCache(ruleName, firstK, curLevel, maxLevel, isFirstPosition) {
			const t0 = Date.now();
			this.perfAnalyzer.cacheStats.subRuleHandlerTotal++;
			if (!ruleName) throw new Error("系统错误");
			if (curLevel === maxLevel) {
				this.perfAnalyzer.cacheStats.levelLimitReturn++;
				return [[ruleName]];
			} else if (curLevel > maxLevel) throw new Error("系统错误");
			curLevel++;
			if (firstK === EXPANSION_LIMITS.FIRST_K) {
				const cached = this.getCacheValue("dfsFirstKCache", ruleName);
				if (cached !== void 0) {
					const duration = Date.now() - t0;
					this.perfAnalyzer.record("subRuleHandler", duration);
					return cached;
				}
			} else if (firstK === EXPANSION_LIMITS.INFINITY) {
				if (maxLevel !== EXPANSION_LIMITS.LEVEL_1) throw new Error(`系统错误：不支持的参数组合 firstK=${firstK}, maxLevel=${maxLevel}`);
			}
			if (this.recursiveDetectionSet.has(ruleName)) if (isFirstPosition) {
				if (!this.detectedLeftRecursionErrors.has(ruleName)) {
					const error = {
						level: "FATAL",
						type: "left-recursion",
						ruleName,
						branchIndices: [],
						conflictPaths: {
							pathA: "",
							pathB: ""
						},
						message: `规则 "${ruleName}" 存在左递归`,
						suggestion: ""
					};
					this.detectedLeftRecursionErrors.set(ruleName, error);
				}
				this.perfAnalyzer.cacheStats.recursiveReturn++;
				return [[ruleName]];
			} else {
				this.perfAnalyzer.cacheStats.recursiveReturn++;
				return [[ruleName]];
			}
			this.recursiveDetectionSet.add(ruleName);
			try {
				this.perfAnalyzer.recordActualCompute();
				const expandCallId = this.perfAnalyzer.startMethod("expandPathsByDFSCache");
				const subNode = this.getRuleNodeByAst(ruleName);
				const finalResult = this.expandNode(subNode, firstK, curLevel, maxLevel, isFirstPosition);
				this.perfAnalyzer.endMethod(expandCallId, void 0, finalResult.length);
				const shouldCache = !this.isRuleNameOnly(finalResult, ruleName);
				if (firstK === EXPANSION_LIMITS.FIRST_K) {
					if (shouldCache && !this.dfsFirstKCache.has(ruleName)) this.dfsFirstKCache.set(ruleName, finalResult);
				} else if (firstK === EXPANSION_LIMITS.INFINITY) {
					if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
						const key = ruleName + `:${EXPANSION_LIMITS.LEVEL_1}`;
						if (shouldCache && !this.bfsLevelCache.has(key)) this.bfsLevelCache.set(key, finalResult);
					}
				}
				return finalResult;
			} finally {
				this.recursiveDetectionSet.delete(ruleName);
			}
		}
		/**
		* 判断展开结果是否是规则名本身（未展开）
		*
		* 规则名本身的情况：[[ruleName]] - 只有一个路径，且这个路径只有一个元素，就是这个规则名
		*
		* @param result 展开结果
		* @param ruleName 规则名
		* @returns 如果是规则名本身返回 true，否则返回 false
		*/
		isRuleNameOnly(result, ruleName) {
			if (result.length === 1 && result[0].length === 1 && result[0][0] === ruleName) return true;
			return false;
		}
		/**
		* 去重：移除重复的分支
		*
		* 例如：[[a,b], [c,d], [a,b]] → [[a,b], [c,d]]
		*
		* ⚠️ 重要：空分支处理
		* - 空分支 [] 会被序列化为空字符串 ""
		* - 空分支不会被过滤，会正常参与去重
		* - 例如：[[], [a], []] → [[], [a]]
		*/
		deduplicate(branches) {
			const callId = this.perfAnalyzer.startMethod("deduplicate");
			const seen = /* @__PURE__ */ new Set();
			const result = [];
			for (const branch of branches) {
				const key = branch.join(EXPANSION_LIMITS.RuleJoinSymbol);
				if (!seen.has(key)) {
					seen.add(key);
					result.push(branch);
				}
			}
			this.perfAnalyzer.endMethod(callId, branches.length, result.length);
			return result;
		}
		/**
		* 截取并去重：先截取到 firstK，再去重
		*
		* 使用场景：笛卡尔积后路径变长，需要截取
		*
		* 例如：[[a,b,c], [d,e,f]], firstK=2 → [[a,b], [d,e]]
		*
		* ⚠️ 重要：空分支处理
		* - 空分支 [] slice(0, firstK) 还是 []
		* - 空分支不会被过滤，会正常参与去重
		* - 例如：[[], [a,b,c]], firstK=2 → [[], [a,b]]
		*
		* 🔧 优化：如果 firstK=INFINITY，不需要截取，只去重
		*/
		truncateAndDeduplicate(branches, firstK) {
			const callId = this.perfAnalyzer.startMethod("truncateAndDeduplicate");
			if (firstK === EXPANSION_LIMITS.INFINITY) {
				const result$1 = this.deduplicate(branches);
				this.perfAnalyzer.endMethod(callId, branches.length, result$1.length);
				return result$1;
			}
			const truncated = branches.map((branch) => branch.slice(0, firstK));
			const result = this.deduplicate(truncated);
			this.perfAnalyzer.endMethod(callId, branches.length, result.length);
			return result;
		}
		/**
		* 展开 Or 节点
		*
		* 核心逻辑：合并所有分支的展开结果
		*
		* 例如：or(abc / de) firstK=2
		*   → abc 展开为 [[a,b]]
		*   → de 展开为 [[d,e]]
		*   → 合并为 [[a,b], [d,e]]
		*
		* ⚠️ 重要：空分支在 or 中的处理
		* - 如果某个分支是 option/many，可能包含空分支 []
		* - 例如：or(option(a) / b)
		*   → option(a) 展开为 [[], [a]]
		*   → b 展开为 [[b]]
		*   → 合并为 [[], [a], [b]]
		* - 空分支会被正常保留，不会被过滤
		*
		* 注意：不需要截取，因为子节点已保证长度≤firstK
		*
		* 🔴 关键：Or 分支中的每个替代也是"第一个位置"
		* - 在 PEG 的选择中，每个分支都是独立的起点
		* - Or 分支内的第一个规则需要检测左递归
		* - 例如：A → A '+' B | C
		*   - 第一个分支 A '+' B 中，A 在第一个位置，需要检测
		*   - 第二个分支 C 中，C 也在第一个位置
		*/
		expandOr(alternatives, firstK, curLevel, maxLevel, isFirstPosition = true) {
			const callId = this.perfAnalyzer.startMethod("expandOr");
			if (alternatives.length === 0) throw new Error("系统错误：Or 节点没有分支");
			let result = [];
			for (const alt of alternatives) {
				const branches = this.expandNode(alt, firstK, curLevel, maxLevel, isFirstPosition);
				result = result.concat(branches);
			}
			if (result.length === 0) throw new Error("系统错误：Or 节点所有分支都没有结果");
			const finalResult = this.deduplicate(result);
			this.perfAnalyzer.endMethod(callId, alternatives.length, finalResult.length);
			return finalResult;
		}
		/**
		* 展开 Option/Many 节点
		*
		* option(X) = ε | X（0次或1次）
		* many(X) = ε | X | XX | XXX...（0次或多次）
		*
		* First 集合：
		* First(option(X)) = {ε} ∪ First(X)
		* First(many(X)) = {ε} ∪ First(X)
		*
		* 例如：option(abc) firstK=2
		*   → abc 展开为 [[a,b]]
		*   → 结果为 [[], [a,b]]（空分支 + 内部分支）
		*
		* ⚠️⚠️⚠️ 关键：空分支 [] 的重要性 ⚠️⚠️⚠️
		* - 空分支 [] 表示 option/many 可以跳过（0次）
		* - 空分支在后续处理中不会被过滤：
		*   1. deduplicate：[] join(',') = ""，正常去重
		*   2. cartesianProduct：[...seq, ...[]] = [...seq]，正常拼接
		*   3. truncateAndDeduplicate：[] slice(0,k) = []，正常截取
		* - 空分支必须保留，否则 option/many 的语义就错了！
		*
		* 注意：不需要截取，因为子节点已保证长度≤firstK
		*
		* 🔴 关键：Option 内的规则也需要检测左递归
		* - 虽然 option(X) 可以跳过，但当内部有递归时也是左递归
		* - 例如：A → option(A) B
		*   - option(A) 中的 A 在第一个位置，需要检测左递归
		*/
		expandOption(node, firstK, curLevel, maxLevel, isFirstPosition = true) {
			const callId = this.perfAnalyzer.startMethod("expandOption");
			const result = [[], ...this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition)];
			const finalResult = this.deduplicate(result);
			this.perfAnalyzer.endMethod(callId, void 0, finalResult.length);
			return finalResult;
		}
		/**
		* 展开 AtLeastOne 节点
		*
		* atLeastOne(X) = X | XX | XXX...（至少1次）
		*
		* First 集合：
		* First(atLeastOne(X)) = First(X) ∪ First(XX)
		*
		* 例如：atLeastOne(ab) firstK=3
		*   → ab 展开为 [[a,b]]
		*   → 1次：[[a,b]]
		*   → 2次：[[a,b,a,b]] 截取到3 → [[a,b,a]]
		*   → 结果为 [[a,b], [a,b,a]]
		*
		* ⚠️ 重要：空分支说明
		* - atLeastOne 至少执行1次，不会产生空分支 []
		* - 与 option/many 不同，atLeastOne 的结果不包含 []
		* - 但如果内部节点包含空分支（来自嵌套的 option/many）：
		*   例如：atLeastOne(option(a))
		*   → option(a) 展开为 [[], [a]]
		*   → 1次：[[], [a]]
		*   → 2次：[[], [a]] × 2 → [[], [a]]（空分支拼接还是空分支）
		*   → 结果为 [[], [a]]
		* - 空分支会被正常保留，不会被过滤
		*
		* 注意：doubleBranches 需要内部截取，因为拼接后会超过 firstK
		*
		* 🔴 关键：AtLeastOne 内的规则也需要检测左递归
		*/
		expandAtLeastOne(node, firstK, curLevel, maxLevel, isFirstPosition = true) {
			const callId = this.perfAnalyzer.startMethod("expandAtLeastOne");
			const innerBranches = this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition);
			const doubleBranches = innerBranches.map((branch) => {
				return [...branch, ...branch].slice(0, firstK);
			});
			const result = [...innerBranches, ...doubleBranches];
			const finalResult = this.deduplicate(result);
			this.perfAnalyzer.endMethod(callId, void 0, finalResult.length);
			return finalResult;
		}
		/**
		* 生成左递归修复建议
		*
		* @param ruleName 规则名
		* @param node 规则节点
		* @param firstSet First 集合
		* @returns 修复建议
		*/
		getLeftRecursionSuggestion(ruleName, node, firstSet) {
			if (node.type === "or") return `PEG 不支持左递归！请将左递归改为右递归，或使用 Many/AtLeastOne。

示例：
  ❌ 左递归（非法）：
     ${ruleName} → ${ruleName} '+' Term | Term

  ✅ 右递归（合法）：
     ${ruleName} → Term ('+' Term)*

  或使用 Many：
     ${ruleName} → Term
     ${ruleName}Suffix → '+' Term
     完整形式 → ${ruleName} ${ruleName}Suffix*

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(", ")}${firstSet.size > 5 ? ", ..." : ""}}
包含 ${ruleName} 本身，说明存在左递归。`;
			return `PEG 不支持左递归！请重构语法以消除左递归。

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(", ")}${firstSet.size > 5 ? ", ..." : ""}}
包含 ${ruleName} 本身，说明存在左递归。`;
		}
	};
}));

//#endregion
//#region src/validation/SubhutiValidationError.ts
init_SubhutiGrammarAnalyzer();
init_SubhutiRuleCollector();
/**
* 语法验证异常
*/
var SubhutiGrammarValidationError = class extends Error {
	constructor(errors, stats) {
		super("Grammar validation failed");
		this.errors = errors;
		this.stats = stats;
		this.name = "SubhutiGrammarValidationError";
	}
	/**
	* 格式化错误信息（包含统计信息）
	*/
	toString() {
		const lines = [];
		for (const error of this.errors) {
			let title = "";
			if (error.type === "prefix-conflict" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				title = `[${error.level}] 分支 ${j} 被分支 ${i} 遮蔽`;
			} else if (error.type === "or-identical-branches" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				title = `[${error.level}] 分支 ${i} 和分支 ${j} 完全相同`;
			} else title = `[${error.level}] ${error.message}`;
			lines.push(title);
			lines.push(`  Rule: ${error.ruleName}`);
			lines.push(`  Branches: [${error.branchIndices.join(", ")}]`);
			if (error.conflictPaths) {
				lines.push(`  Path A: ${error.conflictPaths.pathA}`);
				lines.push(`  Path B: ${error.conflictPaths.pathB}`);
			}
			if (error.type === "prefix-conflict" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				lines.push(`  Suggestion: 将分支 ${j} 移到分支 ${i} 前面（长规则在前，短规则在后）`);
			} else lines.push(`  Suggestion: ${error.suggestion}`);
			lines.push("");
		}
		if (this.stats) {
			const s = this.stats;
			lines.push("");
			lines.push("=".repeat(60));
			lines.push("📊 ========== 统计信息 ==========");
			lines.push("=".repeat(60));
			lines.push("");
			lines.push("⏱️  时间统计：");
			lines.push(`   总耗时: ${s.totalTime}ms`);
			lines.push(`   ├─ First(K) 缓存生成: ${s.dfsFirstKTime}ms (${(s.dfsFirstKTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push(`   ├─ MaxLevel 缓存生成: ${s.bfsMaxLevelTime}ms (${(s.bfsMaxLevelTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push(`   └─ Or 冲突检测: ${s.orDetectionTime}ms (${(s.orDetectionTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push("");
			lines.push("🔍 检测结果：");
			lines.push(`   ├─ 左递归错误: ${s.leftRecursionCount} 个`);
			lines.push(`   └─ Or 分支遮蔽: ${s.orConflictCount} 个`);
			lines.push(`   总计: ${this.errors.length} 个错误`);
			lines.push("");
			lines.push("📦 缓存信息：");
			lines.push(`   ├─ dfsFirstKCache: ${s.dfsFirstKCacheSize} 条 (First(${s.firstK}))`);
			lines.push(`   └─ bfsAllCache: ${s.bfsAllCacheSize} 条 (MaxLevel)`);
			if (s.cacheUsage) {
				lines.push("");
				lines.push("💾 缓存使用率：");
				const dfs = s.cacheUsage.dfsFirstK;
				lines.push(`   dfsFirstKCache:`);
				lines.push(`      查询次数: ${dfs.getCount}`);
				lines.push(`      命中次数: ${dfs.hit}`);
				lines.push(`      未命中次数: ${dfs.miss}`);
				lines.push(`      命中率: ${dfs.hitRate.toFixed(1)}%`);
				lines.push(`      缓存总条数: ${s.dfsFirstKCacheSize}`);
				const bfsAll = s.cacheUsage.bfsAllCache;
				lines.push(`   bfsAllCache:`);
				lines.push(`      查询次数: ${bfsAll.getCount}`);
				lines.push(`      命中次数: ${bfsAll.hit}`);
				lines.push(`      未命中次数: ${bfsAll.miss}`);
				lines.push(`      命中率: ${bfsAll.total > 0 ? bfsAll.hitRate.toFixed(1) : "0.0"}%`);
				lines.push(`      缓存总条数: ${bfsAll.size}`);
				const bfsLevel = s.cacheUsage.bfsLevelCache;
				lines.push(`   bfsLevelCache:`);
				lines.push(`      查询次数: ${bfsLevel.getCount}`);
				lines.push(`      命中次数: ${bfsLevel.hit}`);
				lines.push(`      未命中次数: ${bfsLevel.miss}`);
				lines.push(`      命中率: ${bfsLevel.total > 0 ? bfsLevel.hitRate.toFixed(1) : "N/A"}%`);
				lines.push(`      缓存总条数: ${bfsLevel.size}`);
				const gdc = s.cacheUsage.getDirectChildren;
				if (gdc.total > 0) {
					lines.push(`   getDirectChildren (懒加载):`);
					lines.push(`      查询次数: ${gdc.total}`);
					lines.push(`      命中次数: ${gdc.hit}`);
					lines.push(`      未命中次数: ${gdc.miss}`);
					lines.push(`      命中率: ${gdc.hitRate.toFixed(1)}%`);
					lines.push(`      缓存总条数: 与 bfsLevelCache 共用`);
				}
			}
			lines.push("");
			lines.push("=".repeat(60));
		}
		return lines.join("\n");
	}
};

//#endregion
//#region src/validation/SubhutiGrammarValidator.ts
/**
* SubhutiGrammarValidator - 语法验证器
*
* 职责：
* 1. 提供静态验证方法
* 2. 封装验证流程（收集 → 分析 → 检测 → 报告）
*
* 设计：
* - 纯静态方法，无实例状态
* - 使用 Proxy 方案收集 AST（零侵入）
* - 有问题直接抛异常
*
* @version 2.0.0 - 静态方法重构
*/
var SubhutiGrammarValidator = class {
	/**
	* 验证语法：有问题直接抛异常
	*
	* 流程（分层检测）：
	* 1. 使用 Proxy 收集规则 AST
	* 2. 分析所有可能路径和 First 集合
	* 3. Level 0: 左递归检测 (FATAL) - 最先检测，最致命
	* 4. Level 1 & 2: Or 分支冲突检测 (FATAL/ERROR)
	* 5. 有错误抛 SubhutiGrammarValidationError
	*
	* @param parser Parser 实例
	* @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
	* @throws SubhutiGrammarValidationError 语法有冲突时抛出
	*/
	static validate(parser) {
		const ruleASTs = SubhutiRuleCollector.collectRules(parser);
		const result = new SubhutiGrammarAnalyzer(ruleASTs.cstMap, ruleASTs.tokenMap).initCacheAndCheckLeftRecursion();
		if (result.errors.length > 0) {
			const error = new SubhutiGrammarValidationError(result.errors, result.stats);
			console.error("\n" + error.toString());
		}
	}
};

//#endregion
//#region src/SubhutiParser.ts
/**
* Subhuti Parser - 高性能 PEG Parser 框架
*
* 核心特性：
* - Packrat Parsing（线性时间复杂度，LRU 缓存）
* - 返回值语义（成功返回 CST，失败返回 undefined）
*
* 架构设计：
* - 继承 SubhutiTokenLookahead（前瞻能力）
* - 实现 ITokenConsumerContext（提供消费接口）
* - 支持泛型扩展 SubhutiTokenConsumer
*
* @version 5.0.0
*/
var SubhutiParser = class extends SubhutiTokenLookahead {
	/**
	* 设置同步点 Token
	*/
	setSyncTokens(tokens) {
		this._syncTokens = new Set(tokens);
		return this;
	}
	/**
	* 添加同步点 Token
	*/
	addSyncTokens(tokens) {
		for (const token of tokens) this._syncTokens.add(token);
		return this;
	}
	/**
	* 启用容错模式
	*/
	enableErrorRecovery() {
		this._errorRecoveryMode = true;
		return this;
	}
	/**
	* 获取容错模式状态
	*/
	get errorRecoveryMode() {
		return this._errorRecoveryMode;
	}
	getRuleStack() {
		return this.cstStack.map((item) => item.name);
	}
	/**
	* 获取未被解析的 tokens 列表
	*/
	get unparsedTokens() {
		return this._unparsedTokens;
	}
	/**
	* 是否有未被解析的 tokens
	*/
	get hasUnparsedTokens() {
		return this._unparsedTokens.length > 0;
	}
	/**
	* 构造函数 - 按需词法分析模式
	*
	* @param sourceCode 源代码
	* @param options 配置选项
	*/
	constructor(sourceCode = "", options) {
		super();
		this.cstStack = [];
		this._lexer = null;
		this._sourceCode = "";
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._lastTokenName = null;
		this._templateDepth = 0;
		this._defaultGoal = LexicalGoal.InputElementDiv;
		this._tokenCache = /* @__PURE__ */ new Map();
		this._parsedTokens = [];
		this._analysisMode = false;
		this._errorRecoveryMode = false;
		this._syncTokens = new Set([
			"LetTok",
			"ConstTok",
			"VarTok",
			"FunctionTok",
			"ClassTok",
			"AsyncTok",
			"IfTok",
			"ForTok",
			"WhileTok",
			"DoTok",
			"SwitchTok",
			"TryTok",
			"ThrowTok",
			"ReturnTok",
			"BreakTok",
			"ContinueTok",
			"ImportTok",
			"ExportTok",
			"DebuggerTok",
			"Semicolon"
		]);
		this._errorHandler = new SubhutiErrorHandler();
		this.loopDetectionSet = /* @__PURE__ */ new Set();
		this.enableMemoization = true;
		this._partialMatchCandidates = [];
		this._unparsedTokens = [];
		this._parseRecordRoot = null;
		this._parseRecordStack = [];
		this.className = this.constructor.name;
		this._cache = new SubhutiPackratCache();
		this._sourceCode = sourceCode;
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._lastTokenName = null;
		this._templateDepth = 0;
		this._tokenCache = /* @__PURE__ */ new Map();
		this._parsedTokens = [];
		if (options?.tokenDefinitions) this._lexer = new SubhutiLexer(options.tokenDefinitions);
		if (options?.tokenConsumer) this.tokenConsumer = new options.tokenConsumer(this);
		else this.tokenConsumer = new SubhutiTokenConsumer(this);
	}
	/**
	* 获取已解析的 token 列表
	*/
	get parsedTokens() {
		return this._parsedTokens;
	}
	/**
	* 获取最后解析的 token 索引
	* @returns token 索引，如果没有已解析的 token 则返回 -1
	*/
	get lastTokenIndex() {
		return this._parsedTokens.length - 1;
	}
	/**
	* 获取当前正在处理的 token 索引（下一个将被 consume 的 token）
	* @returns 当前 token 索引
	*/
	get currentTokenIndex() {
		return this._parsedTokens.length;
	}
	/**
	* 获取或解析指定位置和模式的 token
	*
	* @param codeIndex 源码位置
	* @param line 行号
	* @param column 列号
	* @param goal 词法目标
	* @returns TokenCacheEntry 或 null（EOF）
	*/
	_getOrParseToken(codeIndex, line, column, goal) {
		if (!this._lexer) return null;
		const positionCache = this._tokenCache.get(codeIndex);
		if (positionCache?.has(goal)) return positionCache.get(goal);
		const entry = this._lexer.readTokenAt(this._sourceCode, codeIndex, line, column, goal, this._lastTokenName, this._templateDepth);
		if (!entry) return null;
		if (!positionCache) this._tokenCache.set(codeIndex, /* @__PURE__ */ new Map());
		this._tokenCache.get(codeIndex).set(goal, entry);
		return entry;
	}
	/**
	* LA (LookAhead) - 前瞻获取 token（支持模式数组）
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @param goals 每个位置的词法目标（可选，不传用默认值）
	* @returns token 或 undefined（EOF）
	*/
	LA(offset = 1, goals) {
		let currentIndex = this._codeIndex;
		let currentLine = this._codeLine;
		let currentColumn = this._codeColumn;
		for (let i = 0; i < offset; i++) {
			const goal = goals?.[i] ?? this._defaultGoal;
			const entry = this._getOrParseToken(currentIndex, currentLine, currentColumn, goal);
			if (!entry) return void 0;
			if (i === offset - 1) return entry.token;
			currentIndex = entry.nextCodeIndex;
			currentLine = entry.nextLine;
			currentColumn = entry.nextColumn;
		}
	}
	/**
	* peek - 前瞻获取 token（支持模式数组）
	*/
	peek(offset = 1, goals) {
		return this.LA(offset, goals);
	}
	/**
	* 获取当前 token（使用默认词法目标）
	*/
	get curToken() {
		return this.LA(1);
	}
	/**
	* 供 TokenConsumer 使用的 consume 方法
	* @param tokenName token 名称
	* @param goal 可选的词法目标（用于模板尾部等场景）
	*/
	_consumeToken(tokenName, goal) {
		return this.consume(tokenName, goal);
	}
	/**
	* 供 TokenConsumer 使用的标记解析失败方法
	* 用于软关键字检查失败时标记解析失败
	*/
	_markParseFail() {
		this._parseSuccess = false;
	}
	get curCst() {
		return this.cstStack[this.cstStack.length - 1];
	}
	cache(enable = true) {
		this.enableMemoization = enable;
		return this;
	}
	/**
	* 启用调试模式
	* @param showRulePath - 是否显示规则执行路径（默认 true）
	*                       传入 false 时只显示性能统计和 CST 验证报告
	*/
	debug(showRulePath = true) {
		setShowRulePath(showRulePath);
		this._debugger = new SubhutiTraceDebugger(this._parsedTokens);
		return this;
	}
	errorHandler(enable = true) {
		this._errorHandler.setDetailed(enable);
		return this;
	}
	/**
	* 启用分析模式（用于语法验证，不抛异常）
	*
	* 在分析模式下：
	* - 不抛出左递归异常
	* - 不抛出无限循环异常
	* - 不抛出 Token 消费失败异常
	* - 不抛出 EOF 检测异常
	*
	* @internal 仅供 SubhutiRuleCollector 使用
	*/
	enableAnalysisMode() {
		this._analysisMode = true;
	}
	/**
	* 禁用分析模式（恢复正常模式）
	*
	* @internal 仅供 SubhutiRuleCollector 使用
	*/
	disableAnalysisMode() {
		this._analysisMode = false;
	}
	/**
	* 启用语法验证（链式调用），验证语法（检测 Or 规则冲突）
	*
	* 用法：
	* ```typescript
	* const parser = new Es2025Parser(tokens).validate()
	* const cst = parser.Script()
	* ```
	*
	* @returns this - 支持链式调用
	* @throws SubhutiGrammarValidationError - 语法有冲突时抛出
	*/
	validate() {
		SubhutiGrammarValidator.validate(this);
		return this;
	}
	/**
	* 检测是否是直接或间接左递归
	*
	* ✅ 这个方法可以准确判断左递归
	* ❌ 不能判断是否是 Or 分支遮蔽（返回 false 只表示不是左递归）
	*
	* @param ruleName 当前规则名称
	* @param ruleStack 规则调用栈
	* @returns true: 确定是左递归, false: 不是左递归（但不能确定是什么问题）
	*/
	isDirectLeftRecursion(ruleName, ruleStack) {
		const ruleCounts = /* @__PURE__ */ new Map();
		for (const rule of ruleStack) ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1);
		for (const count of ruleCounts.values()) if (count >= 2) return true;
		return false;
	}
	/**
	* 抛出循环错误信息
	*
	* @param ruleName 当前规则名称
	*/
	throwLoopError(ruleName) {
		if (this._analysisMode) {
			this._parseSuccess = false;
			return;
		}
		const currentToken = this.curToken;
		const tokenContext = this.getTokenContext(2);
		const cacheStatsReport = this._cache.getStatsReport();
		const ruleStack = this.getRuleStack();
		const errorType = this.isDirectLeftRecursion(ruleName, ruleStack) ? "left-recursion" : "or-branch-shadowing";
		throw this._errorHandler.createError({
			type: errorType,
			expected: "",
			found: currentToken,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: currentToken?.rowNum || this._codeLine,
				column: currentToken?.columnStartNum || this._codeColumn
			},
			ruleStack: [...ruleStack],
			loopRuleName: ruleName,
			loopDetectionSet: Array.from(this.loopDetectionSet),
			loopCstDepth: this.cstStack.length,
			loopCacheStats: {
				hits: cacheStatsReport.hits,
				misses: cacheStatsReport.misses,
				hitRate: cacheStatsReport.hitRate,
				currentSize: cacheStatsReport.currentSize
			},
			loopTokenContext: tokenContext,
			hint: "检查规则定义，确保在递归前消费了 token"
		});
	}
	/**
	* 规则执行入口（由 @SubhutiRule 装饰器调用）
	* 职责：前置检查 → 循环检测 → Packrat 缓存 → 核心执行 → 后置处理
	*/
	executeRuleWrapper(targetFun, ruleName, className, ...args) {
		if (this.checkRuleIsThisClass(ruleName, className)) return;
		const isTopLevel = this.cstStack.length === 0;
		if (isTopLevel) this.initTopLevelData();
		if (this.parserFail) return;
		const tokenIndex = this.currentTokenIndex;
		const key = `${ruleName}:${tokenIndex}`;
		if (this.loopDetectionSet.has(key)) this.throwLoopError(ruleName);
		this.loopDetectionSet.add(key);
		try {
			const startTime = this._debugger?.onRuleEnter(ruleName, tokenIndex);
			if (this.enableMemoization) {
				const cached = this._cache.get(ruleName, tokenIndex);
				if (cached !== void 0) {
					this._debugger?.onRuleExit(ruleName, true, startTime);
					if (this.errorRecoveryMode && cached.endTokenIndex > tokenIndex) {
						const recordNode$1 = {
							name: ruleName,
							startTokenIndex: tokenIndex,
							endTokenIndex: cached.endTokenIndex,
							children: cached.recordNode?.children ? [...cached.recordNode.children] : []
						};
						const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1];
						if (recordParent) recordParent.children.push(recordNode$1);
						for (let i = this._parseRecordStack.length - 1; i >= 0; i--) {
							const ancestor = this._parseRecordStack[i];
							if (cached.endTokenIndex > ancestor.endTokenIndex) ancestor.endTokenIndex = cached.endTokenIndex;
						}
					}
					const cst$1 = this.applyCachedResult(cached);
					if (!cst$1.children?.length) cst$1.children = void 0;
					return cst$1;
				}
			}
			const startTokenIndex = tokenIndex;
			let recordNode = null;
			if (this.errorRecoveryMode) {
				recordNode = {
					name: ruleName,
					children: [],
					startTokenIndex: tokenIndex,
					endTokenIndex: tokenIndex
				};
				this._parseRecordStack.push(recordNode);
			}
			const cst = this.executeRuleCore(ruleName, targetFun, ...args);
			if (this.errorRecoveryMode && recordNode) {
				this._parseRecordStack.pop();
				if (recordNode.endTokenIndex > recordNode.startTokenIndex) {
					const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1];
					if (recordParent) recordParent.children.push(recordNode);
				}
			}
			if (this.enableMemoization) {
				const endTokenIndex = this.currentTokenIndex;
				const finalEndIndex = recordNode ? Math.max(recordNode.endTokenIndex, endTokenIndex) : endTokenIndex;
				const consumedTokens = this._parseSuccess ? this._parsedTokens.slice(startTokenIndex) : void 0;
				this._cache.set(ruleName, startTokenIndex, {
					endTokenIndex: finalEndIndex,
					cst,
					parseSuccess: this._parseSuccess,
					recordNode,
					parsedTokens: consumedTokens
				});
			}
			this.onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime);
			if (isTopLevel && this._parseSuccess) {
				if (!this.isEof) {
					const nextToken = this.LA(1);
					throw new Error(`Parser internal error: parsing succeeded but source code remains unconsumed. Next token: "${nextToken?.tokenValue}" (${nextToken?.tokenName}) at position ${this._codeIndex}`);
				}
			}
			if (isTopLevel && this.parserFail) this.handleTopLevelError(ruleName, startTokenIndex);
			if (!cst.children?.length) cst.children = void 0;
			return cst;
		} finally {
			this.loopDetectionSet.delete(key);
		}
	}
	initTopLevelData() {
		this._parseSuccess = true;
		this.cstStack.length = 0;
		this.loopDetectionSet.clear();
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._parsedTokens = [];
		this._tokenCache.clear();
		this._debugger?.resetForNewParse?.(this._parsedTokens);
	}
	checkRuleIsThisClass(ruleName, className) {
		if (this.hasOwnProperty(ruleName)) {
			if (className !== this.className) return true;
		}
	}
	onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime) {
		if (cst && !cst.children?.length) cst.children = void 0;
		if (!isTopLevel) this._debugger?.onRuleExit(ruleName, false, startTime);
		else if (this._debugger) {
			if ("setCst" in this._debugger) this._debugger.setCst(cst);
			this._debugger?.autoOutput?.();
		}
	}
	/**
	* 执行规则函数核心逻辑
	* 职责：创建 CST → 执行规则 → 成功则添加到父节点
	*/
	executeRuleCore(ruleName, targetFun, ...args) {
		const cst = new SubhutiCst();
		cst.name = ruleName;
		cst.children = [];
		this.cstStack.push(cst);
		targetFun.apply(this, args);
		this.cstStack.pop();
		if (this._parseSuccess) {
			const parentCst = this.cstStack[this.cstStack.length - 1];
			if (parentCst) parentCst.children.push(cst);
			this.setLocation(cst);
		}
		return cst;
	}
	setLocation(cst) {
		if (cst.children && cst.children[0]?.loc) {
			const lastChild = cst.children[cst.children.length - 1];
			cst.loc = {
				type: cst.name,
				start: cst.children[0].loc.start,
				end: lastChild?.loc?.end || cst.children[0].loc.end
			};
		}
	}
	/**
	* Or 规则 - 顺序选择（PEG 风格）
	*
	* 核心逻辑：
	* - 依次尝试每个分支，第一个成功的分支生效
	* - 所有分支都失败则整体失败
	*
	* 优化：只有消费了 token 才需要回溯（没消费 = 状态没变）
	*/
	Or(alternatives) {
		if (this.parserFail) return;
		const savedState = this.saveState();
		const startCodeIndex = this._codeIndex;
		const totalCount = alternatives.length;
		const parentRuleName = this.curCst?.name || "Unknown";
		this._debugger?.onOrEnter?.(parentRuleName, startCodeIndex);
		for (let i = 0; i < totalCount; i++) {
			const alt = alternatives[i];
			const isLast = i === totalCount - 1;
			this._debugger?.onOrBranch?.(i, totalCount, parentRuleName);
			alt.alt();
			this._debugger?.onOrBranchExit?.(parentRuleName, i);
			if (this._parseSuccess) {
				this._debugger?.onOrExit?.(parentRuleName);
				return;
			}
			if (!isLast) {
				this.recordPartialMatchAndRestore(savedState, startCodeIndex);
				this._parseSuccess = true;
			}
		}
		this._debugger?.onOrExit?.(parentRuleName);
	}
	/**
	* Many 规则 - 0次或多次（EBNF { ... }）
	*
	* 循环执行直到失败或没消费 token
	*/
	Many(fn) {
		while (this.tryAndRestore(fn));
	}
	/**
	* 带容错的 Many 规则（使用解析记录树）
	* - 当全局 errorRecoveryMode 开启时，解析失败会尝试恢复并继续
	* - 使用解析记录树记录所有解析尝试，只增不删
	* - 失败时从解析记录树提取最优路径恢复 CST
	* @param fn 要执行的规则函数
	*/
	ManyWithRecovery(fn) {
		if (!this.errorRecoveryMode) throw new Error("非容错模式不应该进入 ManyWithRecovery");
		this._unparsedTokens.length = 0;
		while (!this.parserFailOrIsEof) {
			const startTokenIndex = this.currentTokenIndex;
			this._parseRecordRoot = {
				name: "__ParseRecordRoot__",
				children: [],
				startTokenIndex,
				endTokenIndex: startTokenIndex
			};
			this._parseRecordStack = [this._parseRecordRoot];
			if (this.tryAndRestore(fn)) {
				this._parseRecordRoot = null;
				this._parseRecordStack = [];
				continue;
			}
			const syncIndex = this.findNextSyncPoint(this._codeIndex + 1);
			const recoveredCST = this.recoverFromParseRecord(this._parseRecordRoot, syncIndex);
			if (recoveredCST && recoveredCST.children && recoveredCST.children.length > 0) {
				const currentCst = this.curCst;
				if (currentCst) currentCst.children.push(...recoveredCST.children);
				const maxTokenIndex = this.getParseRecordMaxEndIndex(this._parseRecordRoot, syncIndex);
				if (maxTokenIndex > 0 && maxTokenIndex <= this._parsedTokens.length) {
					const lastToken = this._parsedTokens[maxTokenIndex - 1];
					this._codeIndex = lastToken.index + lastToken.tokenValue.length;
				}
			} else this._codeIndex++;
			this._parseRecordRoot = null;
			this._parseRecordStack = [];
			this._parseSuccess = true;
		}
		if (this._unparsedTokens.length > 0) this._parseSuccess = false;
	}
	/**
	* 从解析记录树恢复 CST
	* 找到 endTokenIndex <= maxIndex 的最深路径，转换为 CST
	*/
	recoverFromParseRecord(root, maxIndex) {
		if (!root || root.children.length === 0) return null;
		const cst = new SubhutiCst();
		cst.name = root.name;
		cst.children = this.parseRecordChildrenToCST(root.children, maxIndex);
		if (!cst.children || cst.children.length === 0) return null;
		return cst;
	}
	/**
	* 将解析记录树子节点转换为 CST 子节点
	*
	* 选择策略：
	* 1. 按 startTokenIndex 分组（同一位置开始的是 Or 的不同分支）
	* 2. 对于每组，选择 endTokenIndex <= maxIndex 且最大的
	* 3. 如果有多个相同深度的，选择最后一个
	*/
	parseRecordChildrenToCST(nodes, maxIndex) {
		const groups = /* @__PURE__ */ new Map();
		for (const node of nodes) {
			if (node.endTokenIndex > maxIndex) continue;
			const key = node.startTokenIndex;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(node);
		}
		const selectedNodes = [];
		for (const [startIdx, group] of groups) {
			let best = null;
			for (const node of group) if (!best || node.endTokenIndex >= best.endTokenIndex) best = node;
			if (best) selectedNodes.push(best);
		}
		selectedNodes.sort((a, b) => a.startTokenIndex - b.startTokenIndex);
		return selectedNodes.map((node) => this.parseRecordNodeToCST(node, maxIndex));
	}
	/**
	* 将单个解析记录节点转换为 CST 节点
	*/
	parseRecordNodeToCST(node, maxIndex) {
		const cst = new SubhutiCst();
		cst.name = node.name;
		if (node.token) {
			cst.value = node.value;
			cst.loc = {
				type: node.token.tokenName,
				value: node.token.tokenValue,
				start: {
					index: node.token.index || 0,
					line: node.token.rowNum || 0,
					column: node.token.columnStartNum || 0
				},
				end: {
					index: (node.token.index || 0) + node.token.tokenValue.length,
					line: node.token.rowNum || 0,
					column: node.token.columnEndNum || 0
				}
			};
		}
		if (node.children.length > 0) {
			cst.children = this.parseRecordChildrenToCST(node.children, maxIndex);
			if (cst.children.length === 0) cst.children = void 0;
			else this.setLocation(cst);
		}
		return cst;
	}
	/**
	* 获取解析记录树中 <= maxIndex 的最大 endTokenIndex
	*/
	getParseRecordMaxEndIndex(root, maxIndex) {
		let maxEnd = root.endTokenIndex <= maxIndex ? root.endTokenIndex : 0;
		for (const child of root.children) {
			const childMax = this.getParseRecordMaxEndIndex(child, maxIndex);
			if (childMax > maxEnd) maxEnd = childMax;
		}
		return maxEnd;
	}
	/**
	* 找到下一个同步点（语句开始 token）
	* @param fromIndex 从哪个源码位置开始查找
	* @returns 同步点的源码位置，如果没找到返回源码末尾
	*/
	findNextSyncPoint(fromIndex) {
		for (let i = fromIndex; i < this._sourceCode.length; i++) {
			const entry = this._getOrParseToken(i, this._codeLine, this._codeColumn, this._defaultGoal);
			if (entry && this._syncTokens.has(entry.token.tokenName)) return i;
		}
		return this._sourceCode.length;
	}
	/**
	* 创建 ErrorNode，包含指定范围内的 token
	* @param startIndex 起始源码位置（包含）
	* @param endIndex 结束源码位置（不包含）
	* @returns ErrorNode CST 节点
	*/
	createErrorNode(startIndex, endIndex) {
		const errorNode = new SubhutiCst();
		errorNode.name = "ErrorNode";
		errorNode.children = [];
		for (const token of this._parsedTokens) if (token.index >= startIndex && token.index < endIndex) {
			const tokenNode = new SubhutiCst();
			tokenNode.name = token.tokenName;
			tokenNode.value = token.tokenValue;
			tokenNode.loc = {
				type: token.tokenName,
				value: token.tokenValue,
				start: {
					index: token.index,
					line: token.rowNum,
					column: token.columnStartNum
				},
				end: {
					index: token.index + (token.tokenValue?.length || 0),
					line: token.rowNum,
					column: token.columnEndNum
				}
			};
			errorNode.children.push(tokenNode);
		}
		if (errorNode.children.length > 0) {
			const first = errorNode.children[0];
			const last = errorNode.children[errorNode.children.length - 1];
			errorNode.loc = {
				type: "ErrorNode",
				start: first.loc.start,
				end: last.loc.end
			};
		}
		return errorNode;
	}
	/**
	* Option 规则 - 0次或1次（EBNF [ ... ]）
	*
	* 尝试执行一次，失败则回溯，不影响整体解析状态
	*/
	Option(fn) {
		this.tryAndRestore(fn);
	}
	/**
	* AtLeastOne 规则 - 1次或多次
	*
	* 第一次必须成功，后续循环执行直到失败
	*/
	AtLeastOne(fn) {
		if (this.parserFail) return;
		fn();
		while (this.tryAndRestore(fn));
	}
	/**
	* 顶层规则失败时的错误处理
	*
	* @param ruleName 规则名
	* @param startIndex 规则开始时的源码位置
	*/
	handleTopLevelError(ruleName, startIndex) {
		if (this._analysisMode) return;
		const noTokenConsumed = this.currentTokenIndex === startIndex;
		const found = this.curToken;
		throw this._errorHandler.createError({
			type: "parsing",
			expected: noTokenConsumed ? "valid syntax" : "EOF (end of file)",
			found,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: found?.rowNum ?? this._codeLine,
				column: found?.columnStartNum ?? this._codeColumn
			},
			ruleStack: this.getRuleStack().length > 0 ? this.getRuleStack() : [ruleName]
		});
	}
	get parserFailOrIsEof() {
		return this.parserFail || this.isEof;
	}
	/**
	* 消费 token（智能错误管理）
	* - 失败时返回 undefined，不抛异常
	* - 支持传入词法目标（可选）
	*/
	consume(tokenName, goal) {
		if (this.parserFail) return;
		if (this.isEof) {
			this._parseSuccess = false;
			return;
		}
		const actualGoal = goal ?? this._defaultGoal;
		const entry = this._getOrParseToken(this._codeIndex, this._codeLine, this._codeColumn, actualGoal);
		if (!entry) {
			this._parseSuccess = false;
			return;
		}
		const token = entry.token;
		if (token.tokenName !== tokenName) {
			this._parseSuccess = false;
			this._debugger?.onTokenConsume(this._codeIndex, token.tokenValue, token.tokenName, tokenName, false);
			return;
		}
		this._debugger?.onTokenConsume(this._codeIndex, token.tokenValue, token.tokenName, tokenName, true);
		const cst = this.generateCstByToken(token);
		if (token.tokenName === "TemplateHead") this._templateDepth++;
		else if (token.tokenName === "TemplateTail") this._templateDepth--;
		this._codeIndex = entry.nextCodeIndex;
		this._codeLine = entry.nextLine;
		this._codeColumn = entry.nextColumn;
		this._lastTokenName = entry.lastTokenName;
		this._parsedTokens.push(token);
		return cst;
	}
	generateCstByToken(token) {
		const cst = new SubhutiCst();
		cst.name = token.tokenName;
		cst.value = token.tokenValue;
		cst.loc = {
			type: token.tokenName,
			value: token.tokenValue,
			start: {
				index: token.index || 0,
				line: token.rowNum || 0,
				column: token.columnStartNum || 0
			},
			end: {
				index: (token.index || 0) + token.tokenValue.length,
				line: token.rowNum || 0,
				column: token.columnEndNum || 0
			}
		};
		const currentCst = this.curCst;
		if (currentCst) currentCst.children.push(cst);
		if (this.errorRecoveryMode) {
			const newEndIndex = this.currentTokenIndex;
			const tokenNode = {
				name: token.tokenName,
				children: [],
				startTokenIndex: this.lastTokenIndex,
				endTokenIndex: newEndIndex,
				token,
				value: token.tokenValue
			};
			const recordCurrent = this._parseRecordStack[this._parseRecordStack.length - 1];
			if (recordCurrent) recordCurrent.children.push(tokenNode);
			for (const ancestor of this._parseRecordStack) ancestor.endTokenIndex = newEndIndex;
		}
		return cst;
	}
	saveState() {
		const currentCst = this.curCst;
		return {
			codeIndex: this._codeIndex,
			codeLine: this._codeLine,
			codeColumn: this._codeColumn,
			lastTokenName: this._lastTokenName,
			curCstChildrenLength: currentCst?.children?.length || 0,
			parsedTokensLength: this._parsedTokens.length
		};
	}
	restoreState(backData) {
		const fromIndex = this._codeIndex;
		const toIndex = backData.codeIndex;
		if (fromIndex !== toIndex) this._debugger?.onBacktrack?.(fromIndex, toIndex);
		this._codeIndex = backData.codeIndex;
		this._codeLine = backData.codeLine;
		this._codeColumn = backData.codeColumn;
		this._lastTokenName = backData.lastTokenName;
		this._parsedTokens.length = backData.parsedTokensLength;
		const currentCst = this.curCst;
		if (currentCst) currentCst.children.length = backData.curCstChildrenLength;
	}
	/**
	* 【容错模式】记录部分匹配并回溯
	* - 解析记录树方案中，部分匹配由 _parseRecordRoot 记录
	* - 这里只需要回溯 CST（解析记录树是只增不删的）
	*
	* @param savedState 保存的状态
	* @param startCodeIndex 起始源码位置
	*/
	recordPartialMatchAndRestore(savedState, startCodeIndex) {
		this.restoreState(savedState);
	}
	/**
	* 检查是否已到达源码末尾
	*/
	get isEof() {
		return this._getOrParseToken(this._codeIndex, this._codeLine, this._codeColumn, this._defaultGoal) === null;
	}
	/**
	* 尝试执行函数，失败时自动回溯并重置状态
	*
	* @param fn 要执行的函数
	* @returns true: 成功且消费了 token，false: 失败或没消费 token
	*/
	tryAndRestore(fn) {
		if (this.parserFailOrIsEof) return false;
		const savedState = this.saveState();
		const startIndex = this._codeIndex;
		fn();
		if (this.parserFail) {
			this.recordPartialMatchAndRestore(savedState, startIndex);
			this._parseSuccess = true;
			return false;
		}
		return this._codeIndex !== startIndex;
	}
	/**
	* 应用缓存结果（恢复状态）
	*/
	applyCachedResult(cached) {
		if (cached.parsedTokens && cached.parsedTokens.length > 0) {
			this._parsedTokens.push(...cached.parsedTokens);
			const lastToken = cached.parsedTokens[cached.parsedTokens.length - 1];
			this._codeIndex = lastToken.index + lastToken.tokenValue.length;
			this._codeLine = lastToken.rowNum;
			this._codeColumn = lastToken.columnEndNum;
			this._lastTokenName = lastToken.tokenName;
		}
		this._parseSuccess = cached.parseSuccess;
		if (cached.parseSuccess) {
			const parentCst = this.cstStack[this.cstStack.length - 1];
			if (parentCst) parentCst.children.push(cached.cst);
		}
		return cached.cst;
	}
	/**
	* 获取 token 上下文（从 parsedTokens 获取最近的 N 个 token）
	*
	* @param contextSize - 上下文大小（默认 2）
	* @returns token 上下文数组
	*/
	getTokenContext(contextSize = 2) {
		const tokens = this._parsedTokens;
		const len = tokens.length;
		const start = Math.max(0, len - contextSize);
		return tokens.slice(start);
	}
	/**
	* 生成当前规则路径的字符串（用于错误信息）
	*
	* @returns 格式化后的规则路径字符串数组
	*/
	formatCurrentRulePath() {
		if (!this._debugger) return this.formatSimpleRulePath();
		const ruleStack = this._debugger.ruleStack;
		if (!ruleStack || ruleStack.length === 0) return ["  (empty)"];
		return SubhutiDebugRuleTracePrint.formatPendingOutputs_NonCache_Impl(ruleStack);
	}
	/**
	* 简单格式化规则路径（当没有调试器时）
	*/
	formatSimpleRulePath() {
		const ruleStack = this.getRuleStack();
		if (ruleStack.length === 0) return ["  (empty)"];
		const lines = [];
		for (let i = 0; i < ruleStack.length; i++) {
			const rule = ruleStack[i];
			const isLast = i === ruleStack.length - 1;
			const indent = "  ".repeat(i);
			const connector = i === 0 ? "" : "└─ ";
			const marker = isLast ? " ← 当前位置" : "";
			lines.push(`  ${indent}${connector}${rule}${marker}`);
		}
		return lines;
	}
	/**
	* 创建无限循环错误
	*
	* @param ruleName - 规则名称
	* @param hint - 修复提示
	* @returns ParsingError 实例（分析模式下返回 null）
	*/
	createInfiniteLoopError(ruleName, hint) {
		if (this._analysisMode) {
			this._parseSuccess = false;
			return null;
		}
		const rulePath = this.formatCurrentRulePath().join("\n");
		const ruleStack = this.getRuleStack();
		const errorType = this.isDirectLeftRecursion(ruleName, ruleStack) ? "left-recursion" : "infinite-loop";
		return this._errorHandler.createError({
			type: errorType,
			expected: "",
			found: this.curToken,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: this.curToken?.rowNum || this._codeLine,
				column: this.curToken?.columnStartNum || this._codeColumn
			},
			ruleStack: [...ruleStack],
			loopRuleName: ruleName,
			loopDetectionSet: [],
			loopCstDepth: this.cstStack.length,
			loopTokenContext: this.getTokenContext(2),
			hint,
			rulePath
		});
	}
};

//#endregion
//#region src/struct/SubhutiMatchToken.ts
var SubhutiMatchToken = class {
	constructor(osvToken) {
		this.tokenName = osvToken.tokenName;
		this.tokenValue = osvToken.tokenValue;
		this.rowNum = osvToken.rowNum;
		this.columnStartNum = osvToken.columnStartNum;
		this.columnEndNum = osvToken.columnEndNum;
		this.index = osvToken.index;
		this.hasLineBreakBefore = osvToken.hasLineBreakBefore;
	}
};
function createMatchToken(osvToken) {
	return new SubhutiMatchToken(osvToken);
}

//#endregion
//#region src/struct/SubhutiCreateToken.ts
var SubhutiCreateToken = class {
	constructor(ovsToken) {
		this.name = ovsToken.name;
		this.type = ovsToken.type || ovsToken.name;
		this.pattern = ovsToken.pattern;
		if (ovsToken.value) this.value = ovsToken.value;
		else this.value = emptyValue;
		this.isKeyword = ovsToken.isKeyword ?? false;
		this.skip = ovsToken.skip;
		this.lookaheadAfter = ovsToken.lookaheadAfter;
		this.contextConstraint = ovsToken.contextConstraint;
	}
};
const emptyValue = "Error:CannotUseValue";

//#endregion
//#region src/validation/SubhutiConflictDetector.ts
var SubhutiConflictDetector_exports = /* @__PURE__ */ __export({ SubhutiConflictDetector: () => SubhutiConflictDetector });
var SubhutiConflictDetector;
var init_SubhutiConflictDetector = __esmMin((() => {
	SubhutiConflictDetector = class {};
}));

//#endregion
//#region src/validation/SubhutiValidationDebugger.ts
init_SubhutiConflictDetector();
var SubhutiValidationDebugger = class {
	constructor() {
		this.events = [];
		this.ruleInfos = /* @__PURE__ */ new Map();
		this.conflictInfos = [];
		this.stats = {
			totalRules: 0,
			collectedRules: 0,
			totalPaths: 0,
			totalConflicts: 0,
			fatalErrors: 0,
			warnings: 0,
			collectTime: 0,
			analyzeTime: 0,
			detectTime: 0,
			totalTime: 0
		};
		this.options = {
			traceCollect: true,
			traceCompute: true,
			traceDetect: true,
			showPaths: true,
			maxPathsToShow: 10,
			autoOutput: true
		};
	}
	/**
	* 配置调试选项
	*/
	configure(options) {
		Object.assign(this.options, options);
		return this;
	}
	/**
	* 钩子方法：验证完成后调用（轻量侵入模式）
	* 
	* Parser 会在 validateGrammar() 完成后调用此方法
	* 
	* @param ruleASTs 收集到的规则 AST
	* @param errors 检测到的错误
	*/
	onValidationComplete(ruleASTs, errors) {
		this.stats.collectedRules = ruleASTs.size;
		this.stats.totalRules = ruleASTs.size;
		this.stats.totalConflicts = errors.length;
		this.stats.fatalErrors = errors.filter((e) => e.level === "FATAL").length;
		this.stats.warnings = errors.filter((e) => e.level === "ERROR").length;
		const { SubhutiGrammarAnalyzer: SubhutiGrammarAnalyzer$1 } = (init_SubhutiGrammarAnalyzer(), __toCommonJS(SubhutiGrammarAnalyzer_exports));
		const analyzer = new SubhutiGrammarAnalyzer$1(ruleASTs, { maxPaths: 100 });
		let totalPaths = 0;
		for (const [ruleName, ast] of ruleASTs) {
			const nodeCount = this.countASTNodes(ast);
			const paths = analyzer.computePaths(ruleName);
			totalPaths += paths.length;
			this.ruleInfos.set(ruleName, {
				ruleName,
				astNodeCount: nodeCount,
				pathCount: paths.length,
				maxPathLength: Math.max(...paths.map((p) => this.countTokens(p)), 0),
				pathComputeTime: 0,
				hasConflict: false
			});
		}
		this.stats.totalPaths = totalPaths;
		for (const error of errors) {
			const info = this.ruleInfos.get(error.ruleName);
			if (info) info.hasConflict = true;
		}
		console.log("\n" + "=".repeat(80));
		console.log("🔍 Subhuti Grammar Validation Debug");
		console.log("=".repeat(80));
		console.log(`\n✓ 收集了 ${ruleASTs.size} 个规则`);
		console.log(`✓ 计算了 ${totalPaths.toLocaleString()} 条路径`);
		console.log(`✓ 发现 ${errors.length} 个冲突`);
		if (errors.length > 0) this.outputReport(errors);
		console.log("=".repeat(80));
	}
	/**
	* 调试完整的验证流程（独立调用，完全无侵入）
	* 
	* @param parser Parser 实例
	* @param validateOptions 验证选项
	* @returns 验证结果
	*/
	debug(parser, validateOptions) {
		const startTime = performance.now();
		console.log("\n" + "=".repeat(80));
		console.log("🔍 Subhuti Grammar Validation Debug");
		console.log("=".repeat(80));
		try {
			console.log("\n【步骤 1：规则收集】");
			console.log("─".repeat(80));
			const { SubhutiRuleCollector: SubhutiRuleCollector$1 } = (init_SubhutiRuleCollector(), __toCommonJS(SubhutiRuleCollector_exports));
			const collector = new SubhutiRuleCollector$1();
			const collectStart = performance.now();
			const ruleASTs = this.instrumentCollector(collector, parser);
			this.stats.collectTime = performance.now() - collectStart;
			console.log(`✓ 收集完成：${ruleASTs.size} 个规则，耗时 ${this.stats.collectTime.toFixed(2)}ms`);
			console.log("\n【步骤 2：路径计算】");
			console.log("─".repeat(80));
			const { SubhutiGrammarAnalyzer: SubhutiGrammarAnalyzer$1 } = (init_SubhutiGrammarAnalyzer(), __toCommonJS(SubhutiGrammarAnalyzer_exports));
			const analyzer = new SubhutiGrammarAnalyzer$1(ruleASTs, { maxPaths: validateOptions?.maxPaths || 100 });
			const analyzeStart = performance.now();
			this.instrumentAnalyzer(analyzer, ruleASTs);
			this.stats.analyzeTime = performance.now() - analyzeStart;
			console.log(`✓ 计算完成：${this.stats.totalPaths} 条路径，耗时 ${this.stats.analyzeTime.toFixed(2)}ms`);
			console.log("\n【步骤 3：冲突检测】");
			console.log("─".repeat(80));
			const { SubhutiConflictDetector: SubhutiConflictDetector$1 } = (init_SubhutiConflictDetector(), __toCommonJS(SubhutiConflictDetector_exports));
			const detector = new SubhutiConflictDetector$1(analyzer, ruleASTs);
			const detectStart = performance.now();
			const errors = this.instrumentDetector(detector, ruleASTs);
			this.stats.detectTime = performance.now() - detectStart;
			this.stats.totalConflicts = errors.length;
			this.stats.fatalErrors = errors.filter((e) => e.level === "FATAL").length;
			this.stats.warnings = errors.filter((e) => e.level === "ERROR").length;
			console.log(`✓ 检测完成：${errors.length} 个冲突，耗时 ${this.stats.detectTime.toFixed(2)}ms`);
			this.stats.totalTime = performance.now() - startTime;
			if (this.options.autoOutput) this.outputReport(errors);
			return {
				success: errors.length === 0,
				errors
			};
		} catch (error) {
			console.error("\n❌ 验证调试失败:", error.message);
			throw error;
		}
	}
	/**
	* 注入规则收集器（追踪收集过程）
	*/
	instrumentCollector(collector, parser) {
		if (this.options.traceCollect) console.log("开始收集规则...\n");
		const ruleASTs = collector.collectRules(parser);
		this.stats.collectedRules = ruleASTs.size;
		this.stats.totalRules = ruleASTs.size;
		if (this.options.traceCollect) {
			console.log("\n收集到的规则：");
			let index = 1;
			for (const [ruleName, ast] of ruleASTs) {
				const nodeCount = this.countASTNodes(ast);
				console.log(`  ${index}. ${ruleName} (${nodeCount} 个节点)`);
				this.ruleInfos.set(ruleName, {
					ruleName,
					astNodeCount: nodeCount,
					pathCount: 0,
					maxPathLength: 0,
					pathComputeTime: 0,
					hasConflict: false
				});
				index++;
			}
		}
		return ruleASTs;
	}
	/**
	* 注入语法分析器（追踪路径计算）
	*/
	instrumentAnalyzer(analyzer, ruleASTs) {
		if (this.options.traceCompute) console.log("开始计算路径...\n");
		let totalPaths = 0;
		for (const ruleName of ruleASTs.keys()) {
			const start = performance.now();
			const paths = analyzer.computePaths(ruleName);
			const duration = performance.now() - start;
			totalPaths += paths.length;
			const info = this.ruleInfos.get(ruleName);
			if (info) {
				info.pathCount = paths.length;
				info.maxPathLength = Math.max(...paths.map((p) => this.countTokens(p)));
				info.pathComputeTime = duration;
			}
			if (this.options.traceCompute) {
				console.log(`  ${ruleName}: ${paths.length} 条路径 (最长 ${this.countTokens(paths[0] || "")} tokens, ${duration.toFixed(2)}ms)`);
				if (this.options.showPaths && paths.length > 0) {
					const showCount = Math.min(paths.length, this.options.maxPathsToShow);
					for (let i = 0; i < showCount; i++) {
						const path$1 = paths[i];
						const tokens = path$1 === "" ? "(空路径)" : path$1.replace(/,/g, " → ").slice(0, -3);
						console.log(`    [${i}] ${tokens}`);
					}
					if (paths.length > showCount) console.log(`    ... 还有 ${paths.length - showCount} 条路径`);
					console.log("");
				}
			}
		}
		this.stats.totalPaths = totalPaths;
	}
	/**
	* 注入冲突检测器（追踪检测过程）
	*/
	instrumentDetector(detector, ruleASTs) {
		if (this.options.traceDetect) console.log("开始检测冲突...\n");
		const errors = detector.detectAllConflicts();
		if (this.options.traceDetect) if (errors.length === 0) console.log("  ✓ 未发现冲突");
		else {
			console.log(`  ✗ 发现 ${errors.length} 个冲突:\n`);
			errors.forEach((error, index) => {
				console.log(`  [${index + 1}] ${error.ruleName} - ${error.message}`);
				console.log(`      类型: ${error.type}`);
				console.log(`      分支: [${error.branchIndices.join(", ")}]`);
				console.log(`      路径A: ${this.formatPath(error.conflictPaths.pathA)}`);
				console.log(`      路径B: ${this.formatPath(error.conflictPaths.pathB)}`);
				console.log(`      建议: ${error.suggestion}`);
				console.log("");
				const info = this.ruleInfos.get(error.ruleName);
				if (info) info.hasConflict = true;
			});
		}
		return errors;
	}
	/**
	* 输出完整调试报告
	*/
	outputReport(errors) {
		console.log("\n" + "=".repeat(80));
		console.log("📊 验证调试报告");
		console.log("=".repeat(80));
		console.log("\n【第一部分：总体统计】");
		console.log("─".repeat(80));
		console.log("\n⏱️  性能统计");
		console.log(`  总耗时: ${this.stats.totalTime.toFixed(2)}ms`);
		console.log(`    - 规则收集: ${this.stats.collectTime.toFixed(2)}ms (${(this.stats.collectTime / this.stats.totalTime * 100).toFixed(1)}%)`);
		console.log(`    - 路径计算: ${this.stats.analyzeTime.toFixed(2)}ms (${(this.stats.analyzeTime / this.stats.totalTime * 100).toFixed(1)}%)`);
		console.log(`    - 冲突检测: ${this.stats.detectTime.toFixed(2)}ms (${(this.stats.detectTime / this.stats.totalTime * 100).toFixed(1)}%)`);
		console.log("\n📋 规则统计");
		console.log(`  总规则数: ${this.stats.totalRules}`);
		console.log(`  已收集: ${this.stats.collectedRules}`);
		console.log(`  总路径数: ${this.stats.totalPaths.toLocaleString()}`);
		console.log(`  平均路径/规则: ${(this.stats.totalPaths / this.stats.collectedRules).toFixed(1)}`);
		console.log("\n⚠️  冲突统计");
		console.log(`  总冲突数: ${this.stats.totalConflicts}`);
		console.log(`  致命错误: ${this.stats.fatalErrors}`);
		console.log(`  警告: ${this.stats.warnings}`);
		console.log("\n【第二部分：规则详情】");
		console.log("─".repeat(80));
		const topPathRules = Array.from(this.ruleInfos.values()).sort((a, b) => b.pathCount - a.pathCount).slice(0, 5);
		console.log("\n📈 路径最多的规则（Top 5）:");
		topPathRules.forEach((info, i) => {
			const conflictMark = info.hasConflict ? "⚠️ " : "✓ ";
			console.log(`  ${i + 1}. ${conflictMark}${info.ruleName}: ${info.pathCount.toLocaleString()} 条路径 (最长 ${info.maxPathLength} tokens, ${info.pathComputeTime.toFixed(2)}ms)`);
		});
		const conflictRules = Array.from(this.ruleInfos.values()).filter((info) => info.hasConflict);
		if (conflictRules.length > 0) {
			console.log("\n⚠️  有冲突的规则:");
			conflictRules.forEach((info, i) => {
				console.log(`  ${i + 1}. ${info.ruleName}: ${info.pathCount} 条路径, AST ${info.astNodeCount} 个节点`);
			});
		}
		if (errors.length > 0) {
			console.log("\n【第三部分：冲突详情】");
			console.log("─".repeat(80));
			errors.forEach((error, index) => {
				console.log(`\n🔴 冲突 ${index + 1}/${errors.length}`);
				console.log("─".repeat(40));
				console.log(`规则: ${error.ruleName}`);
				console.log(`类型: ${error.type}`);
				console.log(`级别: ${error.level}`);
				console.log(`分支: [${error.branchIndices.join(", ")}]`);
				console.log(`\n问题: ${error.message}`);
				console.log(`\n路径对比:`);
				console.log(`  分支 ${error.branchIndices[0]}: ${this.formatPath(error.conflictPaths.pathA)}`);
				console.log(`  分支 ${error.branchIndices[1]}: ${this.formatPath(error.conflictPaths.pathB)}`);
				const analysis = this.analyzeConflict(error);
				console.log(`\n原因分析:`);
				console.log(`  ${analysis}`);
				console.log(`\n修复建议:`);
				console.log(`  ${error.suggestion}`);
			});
		}
		console.log("\n" + "=".repeat(80));
		console.log("🎉 验证调试完成");
		console.log("=".repeat(80));
	}
	/**
	* 计算 AST 节点数量
	*/
	countASTNodes(node) {
		switch (node.type) {
			case "consume":
			case "subrule": return 1;
			case "sequence": return 1 + node.nodes.reduce((sum, n) => sum + this.countASTNodes(n), 0);
			case "or": return 1 + node.alternatives.reduce((sum, n) => sum + this.countASTNodes(n), 0);
			case "option":
			case "many":
			case "atLeastOne": return 1 + this.countASTNodes(node.node);
			default: return 0;
		}
	}
	/**
	* 计算路径中的 token 数量
	*/
	countTokens(path$1) {
		if (path$1 === "") return 0;
		return (path$1.match(/,/g) || []).length;
	}
	/**
	* 格式化路径（用于显示）
	*/
	formatPath(path$1) {
		if (path$1 === "") return "(空路径)";
		if (path$1.startsWith("<")) return path$1;
		return path$1.replace(/,/g, " → ").slice(0, -3);
	}
	/**
	* 分析冲突原因
	*/
	analyzeConflict(error) {
		if (error.type === "empty-path") return `分支 ${error.branchIndices[0]} 可以匹配空输入（0个token），导致后续所有分支（包括分支 ${error.branchIndices[1]}）都不可达。这通常是由 Option() 或 Many() 引起的。`;
		if (error.type === "prefix-conflict") {
			const pathA = error.conflictPaths.pathA;
			const pathB = error.conflictPaths.pathB;
			const tokensA = this.countTokens(pathA);
			const tokensB = this.countTokens(pathB);
			return `分支 ${error.branchIndices[0]} 的路径（${tokensA} tokens）是 分支 ${error.branchIndices[1]} 路径（${tokensB} tokens）的前缀。这意味着当输入匹配前 ${tokensA} 个token时，Parser会优先选择分支 ${error.branchIndices[0]}，导致分支 ${error.branchIndices[1]} 永远不会被尝试。`;
		}
		return "未知冲突类型";
	}
	/**
	* 获取统计信息（供外部使用）
	*/
	getStats() {
		return { ...this.stats };
	}
	/**
	* 获取规则信息（供外部使用）
	*/
	getRuleInfos() {
		return new Map(this.ruleInfos);
	}
	/**
	* 清除所有数据
	*/
	clear() {
		this.events = [];
		this.ruleInfos.clear();
		this.conflictInfos = [];
		this.stats = {
			totalRules: 0,
			collectedRules: 0,
			totalPaths: 0,
			totalConflicts: 0,
			fatalErrors: 0,
			warnings: 0,
			collectTime: 0,
			analyzeTime: 0,
			detectTime: 0,
			totalTime: 0
		};
	}
};

//#endregion
//#region src/validation/SubhutiValidationLogger.ts
/**
* Subhuti Validation Logger - 统一的日志工具
* 
* 功能：
* 1. 提供统一的日志接口
* 2. 支持日志级别控制
* 3. 支持按规则名过滤日志
* 4. 性能优化：日志关闭时零开销
* 
* @version 1.0.0
*/
/**
* 日志级别
*/
let LogLevel = /* @__PURE__ */ function(LogLevel$1) {
	LogLevel$1[LogLevel$1["NONE"] = 0] = "NONE";
	LogLevel$1[LogLevel$1["ERROR"] = 1] = "ERROR";
	LogLevel$1[LogLevel$1["WARN"] = 2] = "WARN";
	LogLevel$1[LogLevel$1["INFO"] = 3] = "INFO";
	LogLevel$1[LogLevel$1["DEBUG"] = 4] = "DEBUG";
	return LogLevel$1;
}({});
/**
* 验证日志工具
*/
var SubhutiValidationLogger = class {
	/**
	* 配置日志
	* 
	* @param config 日志配置
	*/
	static configure(config) {
		this.config = {
			...this.config,
			...config
		};
	}
	/**
	* 检查是否应该输出日志
	* 
	* @param level 日志级别
	* @param ruleName 规则名（可选）
	* @returns 是否应该输出
	*/
	static shouldLog(level, ruleName) {
		if (this.config.level < level) return false;
		if (ruleName && this.config.enabledRules && this.config.enabledRules.length > 0) {
			if (!this.config.enabledRules.includes(ruleName)) return false;
		}
		return true;
	}
	/**
	* 输出调试日志
	* 
	* @param message 消息
	* @param ruleName 规则名（可选）
	*/
	static debug(message, ruleName) {
		if (!this.shouldLog(LogLevel.DEBUG, ruleName)) return;
		console.log(`[DEBUG] ${message}`);
	}
	/**
	* 输出信息日志
	* 
	* @param message 消息
	* @param ruleName 规则名（可选）
	*/
	static info(message, ruleName) {
		if (!this.shouldLog(LogLevel.INFO, ruleName)) return;
		console.log(`[INFO] ${message}`);
	}
	/**
	* 输出警告日志
	* 
	* @param message 消息
	* @param ruleName 规则名（可选）
	*/
	static warn(message, ruleName) {
		if (!this.shouldLog(LogLevel.WARN, ruleName)) return;
		console.warn(`[WARN] ${message}`);
	}
	/**
	* 输出错误日志
	* 
	* @param message 消息
	* @param ruleName 规则名（可选）
	*/
	static error(message, ruleName) {
		if (!this.shouldLog(LogLevel.ERROR, ruleName)) return;
		console.error(`[ERROR] ${message}`);
	}
	/**
	* 获取当前配置
	*/
	static getConfig() {
		return { ...this.config };
	}
	/**
	* 重置配置为默认值
	*/
	static reset() {
		this.config = {
			level: LogLevel.NONE,
			enabledRules: []
		};
	}
};
SubhutiValidationLogger.config = {
	level: LogLevel.NONE,
	enabledRules: []
};

//#endregion
//#region src/validation/index.ts
init_SubhutiRuleCollector();
init_SubhutiGrammarAnalyzer();

//#endregion
//#region src/logutil.ts
var LogUtil = class {
	static ensureLogFile() {
		if (!this.logFilePath) {
			const __filename = fileURLToPath(import.meta.url);
			const __dirname = path.dirname(__filename);
			this.logFilePath = path.join(__dirname, "templog.txt");
			if (!fs.existsSync(this.logFilePath)) fs.writeFileSync(this.logFilePath, "=== Log Started ===\n");
		}
		return this.logFilePath;
	}
	static log(data, msg = null) {
		try {
			(/* @__PURE__ */ new Date()).toISOString();
			let logMessage = ``;
			if (data !== void 0) if (typeof data === "object") logMessage += "\n" + JSON.stringify(data, null, 2);
			else logMessage += "\n" + String(data);
			fs.appendFileSync(this.ensureLogFile(), logMessage);
		} catch (error) {
			console.error("Failed to write log:", error);
		}
	}
	static clear() {
		try {
			fs.writeFileSync(this.ensureLogFile(), "=== Log Cleared ===\n");
		} catch (error) {
			console.error("Failed to clear log:", error);
		}
	}
};

//#endregion
export { EXPANSION_LIMITS, LexicalGoal, LogLevel, LogUtil, ParsingError, REGEXP_LITERAL_PATTERN, SubhutiConflictDetector, SubhutiCreateToken, SubhutiCst, SubhutiDebugRuleTracePrint, SubhutiDebugUtils, SubhutiErrorHandler, SubhutiGrammarAnalyzer, SubhutiGrammarValidationError, SubhutiGrammarValidator, SubhutiLexer, SubhutiLexerTokenNames, SubhutiMatchToken, SubhutiPackratCache, SubhutiParser, SubhutiRuleCollector, SubhutiTokenConsumer, SubhutiTokenLookahead, SubhutiTraceDebugger, SubhutiValidationDebugger, SubhutiValidationLogger, TreeFormatHelper, createMatchToken, emptyValue, getShowRulePath, matchRegExpLiteral, setShowRulePath };
//# sourceMappingURL=index.mjs.map