/**
 * 左递归检测 - 综合测试
 * 
 * 运行方式：
 *   npx tsx subhuti/test-left-recursion-comprehensive.ts
 * 
 * 测试范围：
 * 1. 层级测试（1-4层）
 * 2. 位置测试（第1-4个位置）
 * 3. 功能函数测试（Or/Option/Many/AtLeastOne）
 * 4. 复杂组合测试
 * 5. 混合场景测试
 */

import SubhutiParser, {Subhuti, SubhutiRule} from "./src/SubhutiParser"
import type SubhutiCst from "./src/struct/SubhutiCst"
import {SubhutiRuleCollector} from "./src/validation/SubhutiRuleCollector"
import {SubhutiGrammarAnalyzer} from "./src/validation/SubhutiGrammarAnalyzer"

// ============================================
// 测试 Parser
// ============================================

@Subhuti
class ComprehensiveLeftRecursionTestParser extends SubhutiParser {
    constructor() {
        super([])
    }

    // ============================================
    // 1. 层级测试（1-4层递归）
    // ============================================

    // 1层直接左递归（应该报错）
    @SubhutiRule
    Level1_DirectRecursion(): SubhutiCst | undefined {
        // A → A B
        this.Level1_DirectRecursion()  // ← 直接递归
        this.consume('B_TOKEN')
        return this.curCst
    }

    // 2层间接左递归（应该报错）
    @SubhutiRule
    Level2_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → B C
        this.Level2_IndirectRecursion_B()
        this.consume('C_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Level2_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → A D
        this.Level2_IndirectRecursion_A()  // ← 形成循环 A→B→A
        this.consume('D_TOKEN')
        return this.curCst
    }

    // 3层间接左递归（应该报错）
    @SubhutiRule
    Level3_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → B
        return this.Level3_IndirectRecursion_B()
    }

    @SubhutiRule
    Level3_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → C
        return this.Level3_IndirectRecursion_C()
    }

    @SubhutiRule
    Level3_IndirectRecursion_C(): SubhutiCst | undefined {
        // C → A
        return this.Level3_IndirectRecursion_A()  // ← 形成循环 A→B→C→A
    }

    // 4层间接左递归（应该报错）
    @SubhutiRule
    Level4_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → B E
        this.Level4_IndirectRecursion_B()
        this.consume('E_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Level4_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → C F
        this.Level4_IndirectRecursion_C()
        this.consume('F_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Level4_IndirectRecursion_C(): SubhutiCst | undefined {
        // C → D G
        this.Level4_IndirectRecursion_D()
        this.consume('G_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Level4_IndirectRecursion_D(): SubhutiCst | undefined {
        // D → A H
        this.Level4_IndirectRecursion_A()  // ← 形成循环 A→B→C→D→A
        this.consume('H_TOKEN')
        return this.curCst
    }

    // ============================================
    // 2. 位置测试（第1-4个位置）
    // ============================================

    // 规则在第1个位置（应该报错）
    @SubhutiRule
    Position1_LeftRecursion_A(): SubhutiCst | undefined {
        // A → B
        return this.Position1_LeftRecursion_B()
    }

    @SubhutiRule
    Position1_LeftRecursion_B(): SubhutiCst | undefined {
        // B → A C D E
        this.Position1_LeftRecursion_A()  // ← 第1个位置，左递归！
        this.consume('C_TOKEN')
        this.consume('D_TOKEN')
        this.consume('E_TOKEN')
        return this.curCst
    }

    // 规则在第2个位置（正常）
    @SubhutiRule
    Position2_Normal_A(): SubhutiCst | undefined {
        // A → B
        return this.Position2_Normal_B()
    }

    @SubhutiRule
    Position2_Normal_B(): SubhutiCst | undefined {
        // B → C A D E
        this.consume('C_TOKEN')
        this.Position2_Normal_A()  // ← 第2个位置，正常递归
        this.consume('D_TOKEN')
        this.consume('E_TOKEN')
        return this.curCst
    }

    // 规则在第3个位置（正常）
    @SubhutiRule
    Position3_Normal_A(): SubhutiCst | undefined {
        // A → B
        return this.Position3_Normal_B()
    }

    @SubhutiRule
    Position3_Normal_B(): SubhutiCst | undefined {
        // B → C D A E
        this.consume('C_TOKEN')
        this.consume('D_TOKEN')
        this.Position3_Normal_A()  // ← 第3个位置，正常递归
        this.consume('E_TOKEN')
        return this.curCst
    }

    // 规则在第4个位置（正常）
    @SubhutiRule
    Position4_Normal_A(): SubhutiCst | undefined {
        // A → B
        return this.Position4_Normal_B()
    }

    @SubhutiRule
    Position4_Normal_B(): SubhutiCst | undefined {
        // B → C D E A
        this.consume('C_TOKEN')
        this.consume('D_TOKEN')
        this.consume('E_TOKEN')
        this.Position4_Normal_A()  // ← 第4个位置，正常递归
        return this.curCst
    }

    // ============================================
    // 3. Or 功能测试
    // ============================================

    // Or 第1个分支左递归（应该报错）
    @SubhutiRule
    Or_Branch1_LeftRecursion(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    // 第1个分支：A → A B
                    this.Or_Branch1_LeftRecursion()  // ← 左递归
                    this.consume('B_TOKEN')
                }
            },
            {
                alt: () => {
                    // 第2个分支：A → C
                    this.consume('C_TOKEN')
                }
            }
        ])
    }

    // Or 第2个分支左递归（应该报错）
    @SubhutiRule
    Or_Branch2_LeftRecursion(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    // 第1个分支：A → C
                    this.consume('C_TOKEN')
                }
            },
            {
                alt: () => {
                    // 第2个分支：A → A B
                    this.Or_Branch2_LeftRecursion()  // ← 左递归
                    this.consume('B_TOKEN')
                }
            }
        ])
    }

    // Or 分支中第2个位置（正常）
    @SubhutiRule
    Or_Position2_Normal(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.consume('X_TOKEN')
                    this.Or_Position2_Normal()  // ← 第2个位置，正常
                }
            },
            {
                alt: () => {
                    this.consume('Y_TOKEN')
                }
            }
        ])
    }

    // ============================================
    // 4. Option 功能测试
    // ============================================

    // Option 中的直接左递归（应该报错）
    @SubhutiRule
    Option_DirectRecursion(): SubhutiCst | undefined {
        // A → option(A) B
        this.Option(() => this.Option_DirectRecursion())  // ← 左递归
        this.consume('B_TOKEN')
        return this.curCst
    }

    // Option 中的间接左递归（应该报错）
    @SubhutiRule
    Option_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → option(B) C
        this.Option(() => this.Option_IndirectRecursion_B())
        this.consume('C_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Option_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → A D
        this.Option_IndirectRecursion_A()  // ← 形成循环
        this.consume('D_TOKEN')
        return this.curCst
    }

    // Option 后的第2个位置（正常）
    @SubhutiRule
    Option_Position2_Normal(): SubhutiCst | undefined {
        // A → option(X) A B
        this.Option(() => this.consume('X_TOKEN'))
        this.Option_Position2_Normal()  // ← 第2个位置，正常
        this.consume('B_TOKEN')
        return this.curCst
    }

    // ============================================
    // 5. Many 功能测试
    // ============================================

    // Many 中的直接左递归（应该报错）
    @SubhutiRule
    Many_DirectRecursion(): SubhutiCst | undefined {
        // A → many(A) B
        this.Many(() => this.Many_DirectRecursion())  // ← 左递归
        this.consume('B_TOKEN')
        return this.curCst
    }

    // Many 中的间接左递归（应该报错）
    @SubhutiRule
    Many_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → many(B) C
        this.Many(() => this.Many_IndirectRecursion_B())
        this.consume('C_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Many_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → A D
        this.Many_IndirectRecursion_A()  // ← 形成循环
        this.consume('D_TOKEN')
        return this.curCst
    }

    // Many 后的第2个位置（正常）
    @SubhutiRule
    Many_Position2_Normal(): SubhutiCst | undefined {
        // A → many(X) A B
        this.Many(() => this.consume('X_TOKEN'))
        this.Many_Position2_Normal()  // ← 第2个位置，正常
        this.consume('B_TOKEN')
        return this.curCst
    }

    // ============================================
    // 6. AtLeastOne 功能测试
    // ============================================

    // AtLeastOne 中的直接左递归（应该报错）
    @SubhutiRule
    AtLeastOne_DirectRecursion(): SubhutiCst | undefined {
        // A → atLeastOne(A) B
        this.AtLeastOne(() => this.AtLeastOne_DirectRecursion())  // ← 左递归
        this.consume('B_TOKEN')
        return this.curCst
    }

    // AtLeastOne 中的间接左递归（应该报错）
    @SubhutiRule
    AtLeastOne_IndirectRecursion_A(): SubhutiCst | undefined {
        // A → atLeastOne(B) C
        this.AtLeastOne(() => this.AtLeastOne_IndirectRecursion_B())
        this.consume('C_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    AtLeastOne_IndirectRecursion_B(): SubhutiCst | undefined {
        // B → A D
        this.AtLeastOne_IndirectRecursion_A()  // ← 形成循环
        this.consume('D_TOKEN')
        return this.curCst
    }

    // AtLeastOne 后的第2个位置（正常）
    @SubhutiRule
    AtLeastOne_Position2_Normal(): SubhutiCst | undefined {
        // A → atLeastOne(X) A B
        this.AtLeastOne(() => this.consume('X_TOKEN'))
        this.AtLeastOne_Position2_Normal()  // ← 第2个位置，正常
        this.consume('B_TOKEN')
        return this.curCst
    }

    // ============================================
    // 7. 复杂组合测试
    // ============================================

    // Option(Or(...)) 组合（应该报错）
    @SubhutiRule
    Complex_OptionOr_LeftRecursion(): SubhutiCst | undefined {
        // A → option(A | B) C
        this.Option(() =>
            this.Or([
                {alt: () => this.Complex_OptionOr_LeftRecursion()},  // ← 左递归
                {alt: () => this.consume('B_TOKEN')}
            ])
        )
        this.consume('C_TOKEN')
        return this.curCst
    }

    // Many(Option(...)) 组合（应该报错）
    @SubhutiRule
    Complex_ManyOption_LeftRecursion(): SubhutiCst | undefined {
        // A → many(option(A)) B
        this.Many(() =>
            this.Option(() => this.Complex_ManyOption_LeftRecursion())  // ← 左递归
        )
        this.consume('B_TOKEN')
        return this.curCst
    }

    // Or(Option(...), Many(...)) 组合（应该报错）
    @SubhutiRule
    Complex_OrOptionMany_LeftRecursion(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    // 第1个分支：option(A)
                    this.Option(() => this.Complex_OrOptionMany_LeftRecursion())  // ← 左递归
                }
            },
            {
                alt: () => {
                    // 第2个分支：many(B)
                    this.Many(() => this.consume('B_TOKEN'))
                }
            }
        ])
    }

    // 深层嵌套组合（应该报错）
    @SubhutiRule
    Complex_DeepNested_LeftRecursion(): SubhutiCst | undefined {
        // A → or(option(many(A)))
        return this.Or([
            {
                alt: () =>
                    this.Option(() =>
                        this.Many(() =>
                            this.Complex_DeepNested_LeftRecursion()  // ← 左递归
                        )
                    )
            },
            {
                alt: () => this.consume('ESCAPE_TOKEN')
            }
        ])
    }

    // ============================================
    // 8. 混合场景测试
    // ============================================

    // 多个位置的递归（第1个是左递归，应该报错）
    @SubhutiRule
    Mixed_MultipleRecursion_LeftRecursion_A(): SubhutiCst | undefined {
        return this.Mixed_MultipleRecursion_LeftRecursion_B()
    }

    @SubhutiRule
    Mixed_MultipleRecursion_LeftRecursion_B(): SubhutiCst | undefined {
        // B → A C A D
        this.Mixed_MultipleRecursion_LeftRecursion_A()  // ← 第1个位置，左递归
        this.consume('C_TOKEN')
        this.Mixed_MultipleRecursion_LeftRecursion_A()  // ← 第3个位置，正常递归
        this.consume('D_TOKEN')
        return this.curCst
    }

    // 多分支混合（一些左递归，一些正常）
    @SubhutiRule
    Mixed_MultiBranch(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    // 分支1：左递归
                    this.Mixed_MultiBranch()  // ← 左递归
                    this.consume('X_TOKEN')
                }
            },
            {
                alt: () => {
                    // 分支2：正常
                    this.consume('Y_TOKEN')
                    this.Mixed_MultiBranch()  // ← 第2个位置，正常
                }
            },
            {
                alt: () => {
                    // 分支3：无递归
                    this.consume('Z_TOKEN')
                }
            }
        ])
    }

    // 复杂路径的左递归（应该报错）
    @SubhutiRule
    Mixed_ComplexPath_A(): SubhutiCst | undefined {
        // A → or(B, C)
        return this.Or([
            {alt: () => this.Mixed_ComplexPath_B()},
            {alt: () => this.Mixed_ComplexPath_C()}
        ])
    }

    @SubhutiRule
    Mixed_ComplexPath_B(): SubhutiCst | undefined {
        // B → option(D) E
        this.Option(() => this.Mixed_ComplexPath_D())
        this.Mixed_ComplexPath_E()
        return this.curCst
    }

    @SubhutiRule
    Mixed_ComplexPath_C(): SubhutiCst | undefined {
        // C → many(F) G
        this.Many(() => this.Mixed_ComplexPath_F())
        this.consume('G_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Mixed_ComplexPath_D(): SubhutiCst | undefined {
        // D → A H （通过 option 形成左递归）
        this.Mixed_ComplexPath_A()  // ← 形成循环
        this.consume('H_TOKEN')
        return this.curCst
    }

    @SubhutiRule
    Mixed_ComplexPath_E(): SubhutiCst | undefined {
        // E → I A （但不是第1个位置）
        this.consume('I_TOKEN')
        this.Mixed_ComplexPath_A()  // ← 第2个位置，正常
        return this.curCst
    }

    @SubhutiRule
    Mixed_ComplexPath_F(): SubhutiCst | undefined {
        // F → TOKEN
        return this.consume('F_TOKEN')
    }
}

// ============================================
// 运行测试
// ============================================

console.log('='.repeat(100))
console.log('左递归检测 - 综合测试')
console.log('='.repeat(100))

// 创建 parser
const parser = new ComprehensiveLeftRecursionTestParser()

// 收集规则 AST
console.log(`\n📊 收集规则 AST...`)
const ruleASTs = SubhutiRuleCollector.collectRules(parser)
console.log(`✅ 收集完成：${ruleASTs.cstMap.size} 个规则`)

// 创建语法分析器
const analyzer = new SubhutiGrammarAnalyzer(ruleASTs.cstMap, ruleASTs.tokenMap)
console.log(`✅ 分析器创建成功`)

// 定义测试用例
const testCases = [
    // 1. 层级测试
    {
        name: '1层直接左递归',
        ruleName: 'Level1_DirectRecursion',
        expectedError: true,
        category: '层级测试'
    },
    {
        name: '2层间接左递归',
        ruleName: 'Level2_IndirectRecursion_A',
        expectedError: true,
        category: '层级测试'
    },
    {
        name: '3层间接左递归',
        ruleName: 'Level3_IndirectRecursion_A',
        expectedError: true,
        category: '层级测试'
    },
    {
        name: '4层间接左递归',
        ruleName: 'Level4_IndirectRecursion_A',
        expectedError: true,
        category: '层级测试'
    },

    // 2. 位置测试
    {
        name: '规则在第1个位置',
        ruleName: 'Position1_LeftRecursion_A',
        expectedError: true,
        category: '位置测试'
    },
    {
        name: '规则在第2个位置',
        ruleName: 'Position2_Normal_A',
        expectedError: false,
        category: '位置测试'
    },
    {
        name: '规则在第3个位置',
        ruleName: 'Position3_Normal_A',
        expectedError: false,
        category: '位置测试'
    },
    {
        name: '规则在第4个位置',
        ruleName: 'Position4_Normal_A',
        expectedError: false,
        category: '位置测试'
    },

    // 3. Or 功能测试
    {
        name: 'Or 第1个分支左递归',
        ruleName: 'Or_Branch1_LeftRecursion',
        expectedError: true,
        category: 'Or 功能测试'
    },
    {
        name: 'Or 第2个分支左递归',
        ruleName: 'Or_Branch2_LeftRecursion',
        expectedError: true,
        category: 'Or 功能测试'
    },
    {
        name: 'Or 分支中第2个位置',
        ruleName: 'Or_Position2_Normal',
        expectedError: false,
        category: 'Or 功能测试'
    },

    // 4. Option 功能测试
    {
        name: 'Option 中的直接左递归',
        ruleName: 'Option_DirectRecursion',
        expectedError: true,
        category: 'Option 功能测试'
    },
    {
        name: 'Option 中的间接左递归',
        ruleName: 'Option_IndirectRecursion_A',
        expectedError: true,
        category: 'Option 功能测试'
    },
    {
        name: 'Option 后的第2个位置',
        ruleName: 'Option_Position2_Normal',
        expectedError: false,
        category: 'Option 功能测试'
    },

    // 5. Many 功能测试
    {
        name: 'Many 中的直接左递归',
        ruleName: 'Many_DirectRecursion',
        expectedError: true,
        category: 'Many 功能测试'
    },
    {
        name: 'Many 中的间接左递归',
        ruleName: 'Many_IndirectRecursion_A',
        expectedError: true,
        category: 'Many 功能测试'
    },
    {
        name: 'Many 后的第2个位置',
        ruleName: 'Many_Position2_Normal',
        expectedError: false,
        category: 'Many 功能测试'
    },

    // 6. AtLeastOne 功能测试
    {
        name: 'AtLeastOne 中的直接左递归',
        ruleName: 'AtLeastOne_DirectRecursion',
        expectedError: true,
        category: 'AtLeastOne 功能测试'
    },
    {
        name: 'AtLeastOne 中的间接左递归',
        ruleName: 'AtLeastOne_IndirectRecursion_A',
        expectedError: true,
        category: 'AtLeastOne 功能测试'
    },
    {
        name: 'AtLeastOne 后的第2个位置',
        ruleName: 'AtLeastOne_Position2_Normal',
        expectedError: false,
        category: 'AtLeastOne 功能测试'
    },

    // 7. 复杂组合测试
    {
        name: 'Option(Or(...)) 组合',
        ruleName: 'Complex_OptionOr_LeftRecursion',
        expectedError: true,
        category: '复杂组合测试'
    },
    {
        name: 'Many(Option(...)) 组合',
        ruleName: 'Complex_ManyOption_LeftRecursion',
        expectedError: true,
        category: '复杂组合测试'
    },
    {
        name: 'Or(Option(...), Many(...)) 组合',
        ruleName: 'Complex_OrOptionMany_LeftRecursion',
        expectedError: true,
        category: '复杂组合测试'
    },
    {
        name: '深层嵌套组合',
        ruleName: 'Complex_DeepNested_LeftRecursion',
        expectedError: true,
        category: '复杂组合测试'
    },

    // 8. 混合场景测试
    {
        name: '多个位置的递归（第1个是左递归）',
        ruleName: 'Mixed_MultipleRecursion_LeftRecursion_A',
        expectedError: true,
        category: '混合场景测试'
    },
    {
        name: '多分支混合（部分左递归）',
        ruleName: 'Mixed_MultiBranch',
        expectedError: true,
        category: '混合场景测试'
    },
    {
        name: '复杂路径的左递归',
        ruleName: 'Mixed_ComplexPath_A',
        expectedError: true,
        category: '混合场景测试'
    }
]

// 执行测试
console.log(`\n开始测试 ${testCases.length} 个用例...\n`)

let passCount = 0
let failCount = 0
let currentCategory = ''

for (const testCase of testCases) {
    // 打印分类标题
    if (testCase.category !== currentCategory) {
        currentCategory = testCase.category
        console.log(`\n${'='.repeat(100)}`)
        console.log(`📁 ${currentCategory}`)
        console.log('='.repeat(100))
    }

    console.log(`\n${'─'.repeat(80)}`)
    console.log(`🧪 ${testCase.name}`)
    console.log(`   规则：${testCase.ruleName}`)
    console.log(`   预期：${testCase.expectedError ? '左递归错误' : '正常'}`)
    
    try {
        // 调用展开方法，触发左递归检测
        const result = analyzer.computeFirst1ExpandBranches(testCase.ruleName)
        
        // 没有抛出错误
        if (testCase.expectedError) {
            console.log(`   ❌ 失败：应该检测到左递归，但没有报错`)
            console.log(`      实际结果：${JSON.stringify(result)}`)
            failCount++
        } else {
            console.log(`   ✅ 通过：正常展开`)
            console.log(`      First 集合：${JSON.stringify(result).substring(0, 80)}${result.length > 3 ? '...' : ''}`)
            passCount++
        }
    } catch (error) {
        // 抛出了错误
        const errorMessage = error.message
        const isLeftRecursionError = errorMessage.includes('左递归')
        
        if (testCase.expectedError && isLeftRecursionError) {
            console.log(`   ✅ 通过：正确检测到左递归`)
            console.log(`      错误信息：${errorMessage}`)
            passCount++
        } else if (!testCase.expectedError && isLeftRecursionError) {
            console.log(`   ❌ 失败：不应该报左递归错误`)
            console.log(`      错误信息：${errorMessage}`)
            failCount++
        } else {
            console.log(`   ⚠️  未知错误：${errorMessage}`)
            failCount++
        }
    }
}

// 统计结果
console.log(`\n${'='.repeat(100)}`)
console.log(`测试结果汇总`)
console.log('='.repeat(100))
console.log(`总计：${testCases.length} 个用例`)
console.log(`✅ 通过：${passCount} 个`)
console.log(`❌ 失败：${failCount} 个`)
console.log(`通过率：${(passCount / testCases.length * 100).toFixed(1)}%`)

// 分类统计
const categoryStats = {}
testCases.forEach(tc => {
    if (!categoryStats[tc.category]) {
        categoryStats[tc.category] = { total: 0, passed: 0 }
    }
    categoryStats[tc.category].total++
})

console.log(`\n分类统计：`)
Object.entries(categoryStats).forEach(([category, stats]) => {
    const passed = testCases.filter(tc => 
        tc.category === category && 
        ((tc.expectedError && tc.name.includes('✅')) || 
         (!tc.expectedError && tc.name.includes('✅')))
    ).length
    console.log(`  ${category}: ${stats.total} 个测试`)
})

console.log('='.repeat(100))

if (failCount > 0) {
    console.log(`\n⚠️  有 ${failCount} 个测试失败`)
    process.exit(1)
} else {
    console.log(`\n🎉 所有测试通过！`)
    process.exit(0)
}
