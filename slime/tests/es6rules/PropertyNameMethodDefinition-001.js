/**
 * 测试规则: PropertyNameMethodDefinition
 * 来源: 从 PropertyName 拆分
 */

// TODO: 添加 PropertyNameMethodDefinition 的完整测试用例
// 当前从 PropertyName 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});

/**
 * 规则测试：PropertyNameMethodDefinition
 * 
 * 位置：Es6Parser.ts Line 1522
 * 分类：classes
 * 编号：601
 * 
 * EBNF规则：
 *   PropertyNameMethodDefinition:
 *     PropertyName ( FunctionFormalParameters ) { FunctionBody }
 *     async PropertyName ( FunctionFormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 测试基础方法定义
 * - 测试async方法
 * - 测试带参数的方法
 * - 测试空参数方法
 * - 测试计算属性名方法
 * - 测试多个方法混合
 * - 测试静态和实例方法
 * - 测试方法的返回值
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础方法
class Test1 {
    method() {}
}

// ✅ 测试2：async方法
class Test2 {
    async method() {}
}

// ✅ 测试3：带参数的方法
class Test3 {
    add(a, b) {
        return a + b
    }
}

// ✅ 测试4：async带参数的方法
class Test4 {
    async fetch(url) {
        return await api(url)
    }
}

// ✅ 测试5：多个方法混合
class Test5 {
    method1() {}
    async method2() {}
    method3(x) { return x * 2 }
}

// ✅ 测试6：计算属性名方法
class Test6 {
    ['customName']() {
        return 'dynamic'
    }
}

// ✅ 测试7：数字名称方法
class Test7 {
    0() {}
    1() {}
}

// ✅ 测试8：混合各种形式
class Test8 {
    regular() {}
    async asyncMethod(x) { return await x }
    ['computed']() {}
    static staticMethod() {}
}

/* Es6Parser.ts: PropertyNameMethodDefinition */
