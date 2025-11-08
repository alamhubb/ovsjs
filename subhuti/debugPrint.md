# 规则路径追踪 - 设计文档## 📋 需求描述**目标：** 追踪规则执行路径，动态缩进显示，支持规则链合并。**关键点：**1. 规则进入 → 加入缓冲区2. Token 消费 → 触发输出3. 输出时：识别连续规则，折叠成链4. 缩进规则：基于最近一个未退出的已输出规则---## 🎯 设计方案### 数据结构// 缓冲区项interface PendingOutput {  ruleName: string  depth: number          // 在 ruleStack 中的深度  displayDepth?: number  // flush 时计算  outputted: boolean     // 是否已输出  hasExited: boolean     // 是否已退出  orSuffix: string       // Or 标记  canChain: boolean      // 是否可折叠}// 状态pendingOutputs: PendingOutput[]  // 缓冲区（包含历史）ruleStack: RuleStackItem[]       // 规则栈（用于退出时定位）### 核心流程
typescript
// 缓冲区项
interface PendingOutput {
ruleName: string
depth: number // 在 ruleStack 中的深度
displayDepth?: number // flush 时计算
outputted: boolean // 是否已输出
hasExited: boolean // 是否已退出
orSuffix: string // Or 标记
canChain: boolean // 是否可折叠
}
// 状态
pendingOutputs: PendingOutput[] // 缓冲区（包含历史）
ruleStack: RuleStackItem[] // 规则栈（用于退出时定位）
### 核心流程� 伪代码### 1. 规则进入onRuleEnter(ruleName: string) {  // 推入规则栈  ruleStack.push({ruleName, hasExited: false})    const depth = ruleStack.length - 1    // 计算 Or 标记  const orSuffix = getOrSuffix(depth, currentOrInfo)    // 加入缓冲区（不计算 displayDepth）  pendingOutputs.push({    ruleName,    depth,    outputted: false,    hasExited: false,    orSuffix,    canChain: orSuffix === ''  })}### 2. 规则退出onRuleExit(ruleName: string) {  // 标记缓冲区  const item = pendingOutputs.find(    item => item.depth === ruleStack.length - 1 &&             item.ruleName === ruleName  )  if (item) {    item.hasExited = true  }    // 弹出栈  ruleStack.pop()}### 3. Token 消费onTokenConsume(success: boolean) {  if (!success) return    flushPendingOutputs()  outputToken()}### 4. Flush（核心）flushPendingOutputs() {  // 1. 过滤待输出的项  const toOutput = pendingOutputs.filter(item => !item.outputted)    // 2. 查找基准深度  let baseDepth = -1  for (let i = pendingOutputs.length - 1; i >= 0; i--) {    const item = pendingOutputs[i]    if (item.outputted && !item.hasExited) {      baseDepth = item.displayDepth      break    }  }    let begin = baseDepth === -1 ? 0 : baseDepth + 1    // 3. 识别链并计算 displayDepth  let i = 0  while (i < toOutput.length) {    // 查找连续的可折叠链    const chain = []    let j = i    while (j < toOutput.length && toOutput[j].canChain) {      if (chain.length === 0 ||           toOutput[j].depth === chain[chain.length - 1].depth + 1) {        chain.push(toOutput[j])        j++      } else {        break      }    }        if (chain.length > 1) {      // 链：共享 displayDepth      for (const item of chain) {        item.displayDepth = begin      }      outputChain(chain)      i = j    } else {      // 单独：使用 begin，然后递增      toOutput[i].displayDepth = begin      outputSingle(toOutput[i])      begin++      i++    }  }    // 4. 标记已输出  for (const item of toOutput) {    item.outputted = true  }    // 5. 清理已退出的项  pendingOutputs = pendingOutputs.filter(item => !item.hasExited)}### 5. 输出方法// 输出单个规则outputSingle(item: PendingOutput) {  const indent = '  '.repeat(item.displayDepth)  console.log(indent + item.ruleName + item.orSuffix)}// 输出规则链outputChain(chain: PendingOutput[]) {  const indent = '  '.repeat(chain[0].displayDepth)  const names = chain.map(item => item.ruleName).join(' > ')  console.log(indent + names)}---## 🔑 关键点### 1. displayDepth 延迟计算- 进入时不计算（信息不完整）- flush 时计算（知道全部规则和链结构）### 2. 基准深度查找
规则进入 → 加入缓冲区
不计算 displayDepth
outputted = false
hasExited = false
规则退出 → 标记
找到对应项，设置 hasExited = true
Token 消费 → flush
过滤：outputted = false 的项
查找基准：最后一个 outputted=true && hasExited=false
计算 begin = 基准.displayDepth + 1（无基准则 0）
识别链：连续 + canChain
计算 displayDepth：
链：都用 begin
单独：begin，然后 begin++
输出
标记：outputted = true
清理：删除 hasExited=true 的项
---## 💻 伪代码### 1. 规则进入onRuleEnter(ruleName: string) {  // 推入规则栈  ruleStack.push({ruleName, hasExited: false})    const depth = ruleStack.length - 1    // 计算 Or 标记  const orSuffix = getOrSuffix(depth, currentOrInfo)    // 加入缓冲区（不计算 displayDepth）  pendingOutputs.push({    ruleName,    depth,    outputted: false,    hasExited: false,    orSuffix,    canChain: orSuffix === ''  })}
2. 规则退出
   onRuleExit(ruleName: string) {  // 标记缓冲区  const item = pendingOutputs.find(    item => item.depth === ruleStack.length - 1 &&             item.ruleName === ruleName  )  if (item) {    item.hasExited = true  }    // 弹出栈  ruleStack.pop()}
3. Token 消费
   onTokenConsume(success: boolean) {  if (!success) return    flushPendingOutputs()  outputToken()}
4. Flush（核心）
   flushPendingOutputs() {  // 1. 过滤待输出的项  const toOutput = pendingOutputs.filter(item => !item.outputted)    // 2. 查找基准深度  let baseDepth = -1  for (let i = pendingOutputs.length - 1; i >= 0; i--) {    const item = pendingOutputs[i]    if (item.outputted && !item.hasExited) {      baseDepth = item.displayDepth      break    }  }    let begin = baseDepth === -1 ? 0 : baseDepth + 1    // 3. 识别链并计算 displayDepth  let i = 0  while (i < toOutput.length) {    // 查找连续的可折叠链    const chain = []    let j = i    while (j < toOutput.length && toOutput[j].canChain) {      if (chain.length === 0 ||           toOutput[j].depth === chain[chain.length - 1].depth + 1) {        chain.push(toOutput[j])        j++      } else {        break      }    }        if (chain.length > 1) {      // 链：共享 displayDepth      for (const item of chain) {        item.displayDepth = begin      }      outputChain(chain)      i = j    } else {      // 单独：使用 begin，然后递增      toOutput[i].displayDepth = begin      outputSingle(toOutput[i])      begin++      i++    }  }    // 4. 标记已输出  for (const item of toOutput) {    item.outputted = true  }    // 5. 清理已退出的项  pendingOutputs = pendingOutputs.filter(item => !item.hasExited)}
5. 输出方法
   // 输出单个规则outputSingle(item: PendingOutput) {  const indent = '  '.repeat(item.displayDepth)  console.log(indent + item.ruleName + item.orSuffix)}// 输出规则链outputChain(chain: PendingOutput[]) {  const indent = '  '.repeat(chain[0].displayDepth)  const names = chain.map(item => item.ruleName).join(' > ')  console.log(indent + names)}
   🔑 关键点
1. displayDepth 延迟计算
   进入时不计算（信息不完整）
   flush 时计算（知道全部规则和链结构）
2. 基准深度查找
   从后往前找第一个：outputted=true && hasExited=falsebegin = 基准.displayDepth + 1：**- 逻辑简单清晰- displayDepth 计算准确- 状态集中管理- 易于调试和维护
3. 链识别规则
   连续递增（depth: n → n+1 → n+2）都是 canChain=true（无 Or 标记）
4. 部分清空
   只删除 hasExited=true保留未退出的（作为历史基准）
   📊 示例
   输入
   Script 进入  StatementList 进入    Token 消费  LexicalDeclaration 进入    Token 消费  LexicalDeclaration 退出StatementList 退出Script 退出
   输出
   Script > StatementList  🔹 Consume token[0]  LexicalDeclaration    🔹 Consume token[1]
   pendingOutputs 变化
1. 初始: []2. Script 进入:   [{Script, outputted:false, hasExited:false}]3. StatementList 进入:   [{Script, ...}, {StatementList, outputted:false, hasExited:false}]4. Token 消费 → flush:   计算: Script.displayDepth=0, StatementList.displayDepth=0   输出: "Script > StatementList"   标记: outputted=true   [{Script, outputted:true, hasExited:false, displayDepth:0},    {StatementList, outputted:true, hasExited:false, displayDepth:0}]5. LexicalDeclaration 进入:   [..., {LexicalDeclaration, outputted:false, hasExited:false}]6. Token 消费 → flush:   基准: StatementList (outputted:true, hasExited:false, displayDepth:0)   begin = 0 + 1 = 1   计算: LexicalDeclaration.displayDepth=1   输出: "  LexicalDeclaration"   标记: outputted=true   清理: 无（都未退出）7. LexicalDeclaration 退出:   标记: LexicalDeclaration.hasExited=true8. 下次 flush:   清理: 删除 LexicalDeclaration
   🎯 总结
   核心思想： 延迟计算 displayDepth，在 flush 时根据完整信息确定缩进。
   优势：
   逻辑简单清晰
   displayDepth 计算准确
   状态集中管理
   易于调试和维护


