/**
 * 性能监控示例
 * 
 * 展示如何使用增强的 getMemoStats() 进行性能分析和调优
 */

import SubhutiParser from "../src/parser/SubhutiParser.ts"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken.ts"

// ============================================
// 场景1：基础性能监控
// ============================================

function basicMonitoring(tokens: SubhutiMatchToken[]) {
    const parser = new MyParser(tokens)
    const cst = parser.Program()
    
    // ✅ 获取详细统计
    const stats = parser.getMemoStats()
    
    console.log('=== Packrat Parsing 统计 ===')
    console.log(`命中: ${stats.hits}`)
    console.log(`未命中: ${stats.misses}`)
    console.log(`总查询: ${stats.total}`)
    console.log(`命中率: ${stats.hitRate}`)
    console.log('')
    console.log(`缓存规则数: ${stats.cacheSize}`)
    console.log(`总条目数: ${stats.totalEntries}`)
    console.log(`平均每规则: ${stats.avgEntriesPerRule} 条`)
    console.log('')
    console.log(`内存估算: ${stats.estimatedMemory.mb} MB`)
    console.log('')
    console.log('性能建议:')
    stats.suggestions.forEach(s => console.log(`  ${s}`))
}

// 输出示例：
// === Packrat Parsing 统计 ===
// 命中: 15234
// 未命中: 3456
// 总查询: 18690
// 命中率: 81.5%
//
// 缓存规则数: 127
// 总条目数: 9823
// 平均每规则: 77.3 条
//
// 内存估算: 1.41 MB
//
// 性能建议:
//   ✅ 缓存命中率优秀（≥ 70%）
//   ⚠️ 缓存使用率高（> 90%），建议增加 maxSize

// ============================================
// 场景2：性能调优
// ============================================

function performanceTuning(tokens: SubhutiMatchToken[]) {
    // 测试不同的缓存大小
    const configs = [
        { maxSize: 5000 },
        { maxSize: 10000 },
        { maxSize: 20000 },
        { maxSize: Infinity }
    ]
    
    console.log('=== 缓存大小性能测试 ===\n')
    
    for (const config of configs) {
        const parser = new MyParser([], undefined, config)
        parser.setTokens(tokens)
        
        const startTime = performance.now()
        parser.Program()
        const elapsed = performance.now() - startTime
        
        const stats = parser.getMemoStats()
        
        console.log(`maxSize: ${config.maxSize === Infinity ? '∞' : config.maxSize}`)
        console.log(`  耗时: ${elapsed.toFixed(2)}ms`)
        console.log(`  命中率: ${stats.hitRate}`)
        console.log(`  内存: ${stats.estimatedMemory.mb} MB`)
        console.log(`  建议: ${stats.suggestions[0]}`)
        console.log('')
    }
}

// 输出示例：
// === 缓存大小性能测试 ===
//
// maxSize: 5000
//   耗时: 145.23ms
//   命中率: 65.2%
//   内存: 0.72 MB
//   建议: ✅ 缓存命中率良好（50-70%）
//
// maxSize: 10000
//   耗时: 132.45ms
//   命中率: 81.5%
//   内存: 1.41 MB
//   建议: ✅ 缓存命中率优秀（≥ 70%）
//
// maxSize: 20000
//   耗时: 130.12ms
//   命中率: 85.3%
//   内存: 1.89 MB
//   建议: ✅ 缓存命中率优秀（≥ 70%）

// ============================================
// 场景3：生产环境监控
// ============================================

class ProductionParser {
    private parser: MyParser
    
    constructor() {
        this.parser = new MyParser()
    }
    
    parse(code: string) {
        const tokens = lexer.tokenize(code)
        this.parser.setTokens(tokens)
        
        const startTime = performance.now()
        const cst = this.parser.Program()
        const elapsed = performance.now() - startTime
        
        // ✅ 自动监控和告警
        const stats = this.parser.getMemoStats()
        
        // 性能告警
        if (elapsed > 1000) {
            console.warn(`⚠️ 解析耗时 ${elapsed.toFixed(2)}ms（> 1s）`)
        }
        
        // 内存告警
        const memoryMB = parseFloat(stats.estimatedMemory.mb)
        if (memoryMB > 10) {
            console.warn(`⚠️ 缓存占用 ${memoryMB.toFixed(2)}MB（> 10MB）`)
            console.log('建议：增加 maxSize 或清理缓存')
        }
        
        // 命中率告警
        const hitRate = parseFloat(stats.hitRate)
        if (hitRate < 50) {
            console.warn(`⚠️ 缓存命中率 ${hitRate}%（< 50%）`)
            console.log('建议：检查语法规则是否有问题')
        }
        
        // ✅ 定期清理（长时间运行）
        if (stats.totalEntries > 50000) {
            console.log('📊 缓存过大，自动清理...')
            this.parser.clearMemoCache()
        }
        
        return cst
    }
}

// ============================================
// 场景4：对比测试（Packrat vs 无缓存）
// ============================================

function comparePackratVsNoCache(tokens: SubhutiMatchToken[]) {
    console.log('=== Packrat Parsing 性能对比 ===\n')
    
    // 测试1：启用 Packrat
    const parser1 = new MyParser(tokens)
    const start1 = performance.now()
    parser1.Program()
    const time1 = performance.now() - start1
    const stats1 = parser1.getMemoStats()
    
    console.log('启用 Packrat (LRU 10000):')
    console.log(`  耗时: ${time1.toFixed(2)}ms`)
    console.log(`  命中率: ${stats1.hitRate}`)
    console.log(`  内存: ${stats1.estimatedMemory.mb} MB`)
    console.log('')
    
    // 测试2：禁用 Packrat
    const parser2 = new MyParser(tokens)
    parser2.enableMemoization = false
    const start2 = performance.now()
    parser2.Program()
    const time2 = performance.now() - start2
    
    console.log('禁用 Packrat:')
    console.log(`  耗时: ${time2.toFixed(2)}ms`)
    console.log(`  内存: 0 MB（无缓存）`)
    console.log('')
    
    // ✅ 性能提升分析
    const speedup = (time2 / time1).toFixed(2)
    console.log(`Packrat 性能提升: ${speedup}x`)
    
    if (parseFloat(speedup) > 2) {
        console.log('✅ Packrat 显著提升性能（> 2x）')
    } else if (parseFloat(speedup) > 1.2) {
        console.log('✅ Packrat 有效提升性能（1.2-2x）')
    } else {
        console.log('⚠️ Packrat 提升有限（< 1.2x），可能语法简单')
    }
}

// 输出示例：
// === Packrat Parsing 性能对比 ===
//
// 启用 Packrat (LRU 10000):
//   耗时: 132.45ms
//   命中率: 81.5%
//   内存: 1.41 MB
//
// 禁用 Packrat:
//   耗时: 456.78ms
//   内存: 0 MB（无缓存）
//
// Packrat 性能提升: 3.45x
// ✅ Packrat 显著提升性能（> 2x）

// ============================================
// 占位类
// ============================================

class MyParser extends SubhutiParser {
    Program() { return undefined }
}

const lexer = {
    tokenize(code: string): SubhutiMatchToken[] { return [] }
}

