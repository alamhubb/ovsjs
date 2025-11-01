/**
 * 规则测试：LabelIdentifier
 * 
 * 位置：Es6Parser.ts Line 112
 * 分类：identifiers
 * 编号：103
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- Identifier
 * 
 * 规则语法：
 *   LabelIdentifier:
 *     Identifier
 * 
 * 测试目标：
 * - 测试标签标识符（用于break/continue的目标）
 * - 在循环和块语句中使用标签
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：for循环标签 + break
myLabel: for (let i = 0; i < 10; i++) {
    if (i === 5) break myLabel
}

// ✅ 测试2：while循环标签 + break
outer: while (true) {
    break outer
}

// ✅ 测试3：嵌套循环标签 + break外层
outerLoop: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) break outerLoop
    }
}

// ✅ 测试4：for循环标签 + continue
loop: for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue loop
    console.log(i)
}

// ✅ 测试5：do-while循环标签
doLabel: do {
    break doLabel
} while (true)

// ✅ 测试6：块语句标签
blockLabel: {
    console.log('test')
    break blockLabel
    console.log('unreachable')
}

// ✅ 测试7：多层嵌套标签
outer: for (let i = 0; i < 3; i++) {
    middle: for (let j = 0; j < 3; j++) {
        inner: for (let k = 0; k < 3; k++) {
            if (k === 1) break middle
        }
    }
}

// ✅ 测试8：switch内的标签
switchLabel: switch (x) {
    case 1:
        break switchLabel
    default:
        break
}
/* Es6Parser.ts: Identifier (not reserved word in label context) */
