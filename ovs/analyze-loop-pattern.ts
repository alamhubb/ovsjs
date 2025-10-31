/**
 * 分析Parser日志中的循环模式
 * 用于诊断无限循环问题
 */

import * as fs from 'fs'
import * as path from 'path'

// 读取日志文件
const logFile = path.join(__dirname, '../subhuti/src/parser/fasdfs.txt')
const content = fs.readFileSync(logFile, 'utf-8')

// 解析日志
const lines = content.split('\n').filter(line => line.trim())

// 每两行是一组 (规则名 + 深度)
const entries: Array<{rule: string, depth: number}> = []
for (let i = 0; i < lines.length; i += 2) {
  if (i + 1 < lines.length) {
    entries.push({
      rule: lines[i].trim(),
      depth: parseInt(lines[i + 1].trim())
    })
  }
}

console.log('总记录数:', entries.length)
console.log('深度范围:', Math.min(...entries.map(e => e.depth)), '~', Math.max(...entries.map(e => e.depth)))

// 找出循环模式
console.log('\n=== 寻找循环模式 ===')

// 统计每个深度的规则
const depthGroups = new Map<number, string[]>()
entries.forEach(({rule, depth}) => {
  if (!depthGroups.has(depth)) {
    depthGroups.set(depth, [])
  }
  depthGroups.get(depth)!.push(rule)
})

// 分析深度31的循环
console.log('\n深度31的规则序列:')
const depth31Rules = depthGroups.get(31) || []
console.log('总数:', depth31Rules.length)

// 找出重复的序列
const sequenceLength = 20 // 检查20个规则的序列
const sequences = new Map<string, number>()

for (let i = 0; i <= depth31Rules.length - sequenceLength; i++) {
  const seq = depth31Rules.slice(i, i + sequenceLength).join(' → ')
  sequences.set(seq, (sequences.get(seq) || 0) + 1)
}

// 输出出现次数最多的序列
const sortedSeq = Array.from(sequences.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)

console.log('\n出现次数最多的规则序列 (前5个):')
sortedSeq.forEach(([seq, count], index) => {
  console.log(`\n${index + 1}. 出现次数: ${count}`)
  console.log('序列:', seq.split(' → ').slice(0, 10).join('\n    → '))
})

// 分析循环结构
console.log('\n=== 分析循环结构 ===')

// 找出哪些规则在深度31出现最多
const ruleCounts = new Map<string, number>()
depth31Rules.forEach(rule => {
  ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1)
})

const topRules = Array.from(ruleCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)

console.log('\n深度31出现最多的规则 (前15):')
topRules.forEach(([rule, count], index) => {
  console.log(`${index + 1}. ${rule}: ${count}次`)
})

// 检测简单的A→B→A循环
console.log('\n=== 检测直接循环 ===')
for (let i = 0; i < depth31Rules.length - 2; i++) {
  if (depth31Rules[i] === depth31Rules[i + 2]) {
    console.log(`发现循环: ${depth31Rules[i]} → ${depth31Rules[i + 1]} → ${depth31Rules[i]}`)
    break
  }
}

// 导出分析结果
const analysis = {
  totalEntries: entries.length,
  depth31Count: depth31Rules.length,
  topRules: topRules,
  循环模式: sortedSeq[0] ? sortedSeq[0][0].split(' → ').slice(0, 10) : []
}

fs.writeFileSync(
  path.join(__dirname, 'loop-analysis-result.json'),
  JSON.stringify(analysis, null, 2)
)

console.log('\n分析结果已保存到: loop-analysis-result.json')


