/**
 * 测试回溯修复效果
 * 
 * 这个测试专门验证 Or 规则回溯时不会留下失败分支的节点
 */
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

// 测试用例：简单的标识符
// 这会触发多个 Or 规则的尝试
const code = `a`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens ===')
console.log(tokens.map(t => `${t.tokenName}: "${t.tokenValue}"`).join(', '))

const parser = new Es2020Parser(tokens)
const cst = parser.Program()

// 递归统计 CST 节点
function countNodes(node: any): { total: number, empty: number, emptyNodes: string[] } {
    const result = { total: 0, empty: 0, emptyNodes: [] as string[] }
    
    function traverse(n: any, depth: number = 0) {
        result.total++
        
        // 检查是否是空节点（非 token 节点但 children 为空）
        if (n.children && n.children.length === 0 && !n.value) {
            result.empty++
            result.emptyNodes.push(`${'  '.repeat(depth)}${n.name}`)
        }
        
        if (n.children) {
            for (const child of n.children) {
                traverse(child, depth + 1)
            }
        }
    }
    
    traverse(node)
    return result
}

const stats = countNodes(cst)

console.log('\n=== CST 统计 ===')
console.log(`总节点数: ${stats.total}`)
console.log(`空节点数: ${stats.empty}`)
console.log(`空节点占比: ${(stats.empty / stats.total * 100).toFixed(2)}%`)

if (stats.empty > 0) {
    console.log('\n=== 空节点列表 ===')
    console.log(stats.emptyNodes.join('\n'))
}

// 检查是否有重复的 token 节点（回溯失败的标志）
function findDuplicateTokens(node: any): string[] {
    const tokenPositions = new Map<number, string[]>()
    
    function traverse(n: any) {
        if (n.value && n.loc && n.loc.start) {
            const pos = n.loc.start.index
            if (!tokenPositions.has(pos)) {
                tokenPositions.set(pos, [])
            }
            tokenPositions.get(pos)!.push(`${n.name}: "${n.value}"`)
        }
        
        if (n.children) {
            for (const child of n.children) {
                traverse(child)
            }
        }
    }
    
    traverse(node)
    
    const duplicates: string[] = []
    for (const [pos, tokens] of tokenPositions) {
        if (tokens.length > 1) {
            duplicates.push(`位置 ${pos}: ${tokens.join(', ')}`)
        }
    }
    
    return duplicates
}

const duplicates = findDuplicateTokens(cst)

if (duplicates.length > 0) {
    console.log('\n❌ 发现重复的 token 节点（回溯失败）：')
    console.log(duplicates.join('\n'))
} else {
    console.log('\n✅ 没有重复的 token 节点（回溯成功）')
}

// 最终判断
console.log('\n=== 测试结果 ===')
if (stats.empty < 10 && duplicates.length === 0) {
    console.log('✅ 测试通过：空节点数量合理，无重复 token')
} else {
    console.log('❌ 测试失败：')
    if (stats.empty >= 10) {
        console.log(`  - 空节点过多 (${stats.empty} 个)`)
    }
    if (duplicates.length > 0) {
        console.log(`  - 有重复 token (${duplicates.length} 处)`)
    }
}

