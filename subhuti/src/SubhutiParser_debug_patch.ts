// 这是一个临时补丁文件，用于添加调试信息
// 将这些代码片段复制到 SubhutiParser.ts 中对应的位置

// ============================================
// 1. 在 throwLoopError 方法开头添加调试信息
// ============================================
// 位置：line 228，在 "// 获取当前 token 信息" 之前添加

console.error('\n' + '='.repeat(80))
console.error('🔴 左递归检测触发！')
console.error('='.repeat(80))
console.error(`规则名称: ${ruleName}`)
console.error(`当前 tokenIndex: ${this.tokenIndex}`)
console.error(`检测键: ${ruleName}:${this.tokenIndex}`)
console.error(`loopDetectionSet 内容:`)
Array.from(this.loopDetectionSet).forEach((key, index) => {
    console.error(`  [${index}] ${key}`)
})
console.error(`规则调用栈 (ruleStack):`)
this.ruleStack.forEach((rule, index) => {
    console.error(`  [${index}] ${rule}`)
})
console.error('='.repeat(80) + '\n')

// ============================================
// 2. 在 executeRuleWithCacheAndLoopDetection 方法中添加调试信息
// ============================================
// 位置：line 305-354，在关键位置添加 console.log

// 在 line 306 (const key = ...) 之后添加：
if (ruleName === 'StatementList') {
    console.log(`🔍 [StatementList] 进入规则，tokenIndex=${this.tokenIndex}, key=${key}`)
    console.log(`   当前 loopDetectionSet:`, Array.from(this.loopDetectionSet))
}

// 在 line 309 (if (this.loopDetectionSet.has(key))) 之前添加：
if (ruleName === 'StatementList') {
    console.log(`🔍 [StatementList] 检查循环，has(${key})=${this.loopDetectionSet.has(key)}`)
}

// 在 line 314 (this.loopDetectionSet.add(key)) 之后添加：
if (ruleName === 'StatementList') {
    console.log(`🔍 [StatementList] 添加到 loopDetectionSet: ${key}`)
    console.log(`   更新后 loopDetectionSet:`, Array.from(this.loopDetectionSet))
}

// 在 line 352 (this.loopDetectionSet.delete(key)) 之后添加：
if (ruleName === 'StatementList') {
    console.log(`🔍 [StatementList] 从 loopDetectionSet 删除: ${key}`)
    console.log(`   更新后 loopDetectionSet:`, Array.from(this.loopDetectionSet))
}

// ============================================
// 3. 在 AtLeastOne 方法中添加调试信息
// ============================================
// 位置：line 546-562

// 在 line 551 (fn()) 之前添加：
const currentRuleName = this.ruleStack[this.ruleStack.length - 1] || 'Unknown'
if (currentRuleName === 'StatementList') {
    console.log(`🔍 [AtLeastOne in StatementList] 第一次调用，tokenIndex=${this.tokenIndex}`)
}

// 在 line 557 (while (this.tryAndRestore(fn))) 之前添加：
if (currentRuleName === 'StatementList') {
    console.log(`🔍 [AtLeastOne in StatementList] 进入 while 循环，tokenIndex=${this.tokenIndex}`)
}

// 在 while 循环内部添加：
while (this.tryAndRestore(fn)) {
    if (currentRuleName === 'StatementList') {
        console.log(`🔍 [AtLeastOne in StatementList] while 循环迭代成功，tokenIndex=${this.tokenIndex}`)
    }
}

// ============================================
// 4. 在 tryAndRestore 方法中添加调试信息
// ============================================
// 位置：line 681-727

// 在 line 682 (const savedState = ...) 之后添加：
const currentRuleName = this.ruleStack[this.ruleStack.length - 1] || 'Unknown'
if (currentRuleName === 'StatementList') {
    console.log(`🔍 [tryAndRestore in StatementList] 开始，startTokenIndex=${startTokenIndex}`)
}

// 在 line 687 (if (this._parseSuccess)) 内部添加：
if (currentRuleName === 'StatementList') {
    console.log(`🔍 [tryAndRestore in StatementList] 成功，tokenIndex=${this.tokenIndex}, consumed=${this.tokenIndex !== startTokenIndex}`)
}

// 在 line 724 (this.restoreState(savedState)) 之后添加：
if (currentRuleName === 'StatementList') {
    console.log(`🔍 [tryAndRestore in StatementList] 失败，回溯到 tokenIndex=${this.tokenIndex}`)
}

