/**
 * Subhuti Parser - 缓存配置使用示例
 * 
 * 展示统一缓存系统的使用方式
 */

import SubhutiParser, { PackratCacheConfig } from "../src/SubhutiParser.ts"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken.ts"

// ============================================
// 场景1：默认使用（推荐 99%）⭐⭐⭐⭐⭐
// ============================================

/**
 * 零配置 - 开箱即用
 * 
 * 默认配置：
 * - Packrat: 启用
 * - 缓存: LRU(10000)
 * - 内存安全: 自动淘汰
 */
function basicUsage(tokens: SubhutiMatchToken[]) {
    // ✅ 不需要任何配置
    const parser = new MyParser(tokens)
    const cst = parser.Program()
    
    // 查看缓存统计
    console.log(parser.getMemoStats())
    // 输出：
    // {
    //   hits: 1234,
    //   misses: 567,
    //   total: 1801,
    //   hitRate: "68.5%",
    //   cacheSize: 89,
    //   totalEntries: 4532
    // }
}

// ============================================
// 场景2：大文件解析（1%）
// ============================================

/**
 * 大文件解析（> 10MB）
 * 
 * 配置：maxSize: 50000
 */
function largeFileUsage(tokens: SubhutiMatchToken[]) {
    const config: PackratCacheConfig = { maxSize: 50000 }
    const parser = new MyParser(tokens, undefined, config)
    const cst = parser.Program()
}

// ============================================
// 场景3：超大文件（< 1%）
// ============================================

/**
 * 超大文件（> 100MB）
 * 
 * 配置：maxSize: 100000
 */
function hugeFileUsage(tokens: SubhutiMatchToken[]) {
    const parser = new MyParser(tokens, undefined, { maxSize: 100000 })
    const cst = parser.Program()
}

// ============================================
// 场景4：小文件 + 内存充足（< 1%）
// ============================================

/**
 * 小文件（< 1MB）+ 内存充足
 * 
 * 配置：maxSize: Infinity（无限缓存）
 */
function unlimitedCacheUsage(tokens: SubhutiMatchToken[]) {
    const parser = new MyParser(tokens, undefined, { maxSize: Infinity })
    const cst = parser.Program()
}

// ============================================
// 场景5：调试模式
// ============================================

/**
 * 调试模式 - 禁用缓存
 */
function debugMode(tokens: SubhutiMatchToken[]) {
    const parser = new MyParser(tokens)
    
    // ✅ 禁用缓存（查看完整执行轨迹）
    parser.enableMemoization = false
    
    const cst = parser.Program()
}

// ============================================
// 场景6：缓存统计分析
// ============================================

/**
 * 缓存性能分析
 */
function cacheAnalysis(tokens: SubhutiMatchToken[]) {
    const parser = new MyParser(tokens)
    const cst = parser.Program()
    
    // ✅ 获取详细统计
    const stats = parser.getMemoStats()
    
    console.log('=== Packrat Parsing 统计 ===')
    console.log(`总查询: ${stats.total}`)
    console.log(`命中: ${stats.hits}`)
    console.log(`未命中: ${stats.misses}`)
    console.log(`命中率: ${stats.hitRate}`)
    console.log(`规则数: ${stats.cacheSize}`)
    console.log(`总条目: ${stats.totalEntries}`)
    
    // ✅ 判断是否需要调整
    if (parseFloat(stats.hitRate) < 50) {
        console.warn('⚠️ 命中率低，可能语法复杂或缓存太小')
    }
    
    if (stats.totalEntries > 9000) {
        console.warn('⚠️ 缓存接近上限，建议增加 maxSize')
    }
}

// ============================================
// 场景7：长时间运行服务
// ============================================

/**
 * LSP Server / Web Worker
 */
class ParserService {
    private parser: MyParser
    
    constructor() {
        // ✅ 默认配置已经是最佳实践
        this.parser = new MyParser()
    }
    
    parse(code: string) {
        const tokens = lexer.tokenize(code)
        this.parser.setTokens(tokens)
        
        const cst = this.parser.Program()
        
        // ✅ 可选：监控缓存（长时间运行）
        const stats = this.parser.getMemoStats()
        if (stats.totalEntries > 50000) {
            console.log('清理缓存...')
            this.parser.clearMemoCache()
        }
        
        return cst
    }
}

// ============================================
// 配置选择指南
// ============================================

/**
 * 推荐配置：
 * 
 * 1. 默认（99%）⭐⭐⭐⭐⭐
 *    new MyParser(tokens)
 *    → LRU(10000)
 * 
 * 2. 大文件（1%）
 *    new MyParser(tokens, undefined, { maxSize: 50000 })
 * 
 * 3. 超大文件（< 0.1%）
 *    new MyParser(tokens, undefined, { maxSize: 100000 })
 * 
 * 4. 小文件 + 内存充足（< 0.1%）
 *    new MyParser(tokens, undefined, { maxSize: Infinity })
 * 
 * 5. 调试（开发时）
 *    parser.enableMemoization = false
 */

// 占位类
class MyParser extends SubhutiParser {
    Program() { return undefined }
}

const lexer = {
    tokenize(code: string): SubhutiMatchToken[] { return [] }
}
