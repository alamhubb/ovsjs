/**
 * 测试复杂表达式的回溯
 */
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `Math.max(1, 2) + Math.min(5, 3)`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log(`代码: ${code}`)
console.log(`Token 数量: ${tokens.length}`)

const parser = new Es2020Parser(tokens)
const cst = parser.Program()

// 统计节点
function countNodes(node: any) {
    const stats = {
        total: 0,
        emptyRules: 0,  // 空规则节点（非 token）
        tokens: 0,       // token 节点
        emptyRuleNodes: [] as string[]
    }
    
    function traverse(n: any, path: string = '') {
        stats.total++
        
        const fullPath = path ? `${path} > ${n.name}` : n.name
        
        if (n.children && n.children.length === 0) {
            if (n.value) {
                // Token 节点（有 value）
                stats.tokens++
            } else {
                // 空规则节点（无 value，无 children）
                stats.emptyRules++
                stats.emptyRuleNodes.push(fullPath)
            }
        }
        
        if (n.children) {
            for (const child of n.children) {
                traverse(child, fullPath)
            }
        }
    }
    
    traverse(node)
    return stats
}

const stats = countNodes(cst)

console.log('\n=== CST 统计 ===')
console.log(`总节点数: ${stats.total}`)
console.log(`Token 节点: ${stats.tokens}`)
console.log(`空规则节点: ${stats.emptyRules}`)
console.log(`空规则占比: ${(stats.emptyRules / stats.total * 100).toFixed(2)}%`)

if (stats.emptyRules > 50) {
    console.log('\n⚠️  空规则节点过多！前20个：')
    console.log(stats.emptyRuleNodes.slice(0, 20).join('\n'))
} else if (stats.emptyRules > 0) {
    console.log('\n✅ 空规则节点数量合理：')
    console.log(stats.emptyRuleNodes.slice(0, 10).join('\n'))
    if (stats.emptyRuleNodes.length > 10) {
        console.log(`... 还有 ${stats.emptyRuleNodes.length - 10} 个`)
    }
}

// 检查重复 token
function findDuplicates(node: any) {
    const seen = new Map<string, number>()
    let duplicates = 0
    
    function traverse(n: any) {
        if (n.value && n.loc && n.loc.start) {
            const key = `${n.loc.start.index}:${n.value}`
            seen.set(key, (seen.get(key) || 0) + 1)
        }
        if (n.children) {
            for (const child of n.children) {
                traverse(child)
            }
        }
    }
    
    traverse(node)
    
    for (const [key, count] of seen) {
        if (count > 1) {
            duplicates += count - 1
        }
    }
    
    return duplicates
}

const duplicates = findDuplicates(cst)

console.log('\n=== 回溯检查 ===')
if (duplicates > 0) {
    console.log(`❌ 发现 ${duplicates} 个重复 token（回溯失败）`)
} else {
    console.log(`✅ 无重复 token（回溯成功）`)
}

// 最终结果
console.log('\n=== 测试结果 ===')
if (stats.emptyRules < 50 && duplicates === 0) {
    console.log('✅ 测试通过：CST 结构正常')
    console.log(`   - 空规则节点: ${stats.emptyRules} 个（合理范围）`)
    console.log(`   - 回溯机制: 工作正常`)
} else {
    console.log('❌ 测试失败')
    if (stats.emptyRules >= 50) {
        console.log(`   - 空规则节点过多: ${stats.emptyRules} 个`)
    }
    if (duplicates > 0) {
        console.log(`   - 回溯失败: ${duplicates} 个重复 token`)
    }
}

