/**
 * 规则测试：CaseClauses
 * 
 * 位置：Es2025Parser.ts Line 1320
 * 分类：others
 * 编号：924
 * 
 * EBNF规则：
 *   CaseClauses:
 *     CaseClause+
 * 
 * 测试目标：
 * - 测试单个case子句
 * - 测试多个case子句
 * - 测试case表达式的多样性
 * - 测试case中的单个语句
 * - 测试case中的多个语句
 * - 测试fall-through（无break）
 * - 测试case中的控制流语句
 * - 测试复杂case组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：单个case子句    CaseClauses -> CaseClause (1个)
switch (x) {
    case 1:
        doA()
}

// ✅ 测试2：多个case子句    CaseClauses -> Many (多个CaseClause)
switch (x) {
    case 1:
        doA()
    case 2:
        doB()
}

// ✅ 测试3：case中的多个语句    CaseClauses -> CaseClause (StatementList)
switch (code) {
    case 1:
        let x = 1
        console.log(x)
        return x
    case 2:
        let y = 2
        console.log(y)
        return y
}

// ✅ 测试4：fall-through（无break）    CaseClauses -> 连续多个case (无break分支)
switch (value) {
    case 'a':
        doA()
    case 'b':
        doB()
    case 'c':
        doC()
}

// ✅ 测试5：case中的条件语句    CaseClauses -> CaseClause (IfStatement)
switch (status) {
    case 'active':
        if (isValid()) {
            process()
        }
    case 'pending':
        if (shouldWait()) {
            wait()
        }
}

// ✅ 测试6：case中的循环    CaseClauses -> CaseClause (ForStatement)
switch (type) {
    case 1:
        for (let i = 0; i < 10; i++) {
            handle(i)
        }
    case 2:
        let j = 0
        while (j < 5) {
            process(j++)
        }
}

// ✅ 测试7：case中的嵌套switch
switch (outer) {
    case 1:
        switch (inner) {
            case 'a':
                doA()
            case 'b':
                doB()
        }
    case 2:
        doOuter()
}

// ✅ 测试8：case中的try-catch
switch (action) {
    case 'execute':
        try {
            run()
        } catch (e) {
            handle(e)
        }
    case 'skip':
        skip()
}

/* Es2025Parser.ts: CaseClauses */

/**
 * 规则测试：CaseClauses
 * 
 * 位置：Es2025Parser.ts Line 1320
 * 分类：others
 * 编号：924
 * 
 * EBNF规则：
 *   CaseClauses:
 *     CaseClause+
 * 
 * 测试目标：
 * - 测试单个case子句
 * - 测试多个case子句
 * - 测试case表达式的多样性
 * - 测试case中的单个语句
 * - 测试case中的多个语句
 * - 测试fall-through（无break）
 * - 测试case中的控制流语句
 * - 测试复杂case组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：单个case子句
switch (x) {
    case 1:
        doA()
}

// ✅ 测试2：多个case子句
switch (x) {
    case 1:
        doA()
    case 2:
        doB()
}

// ✅ 测试3：case中的多个语句
switch (code) {
    case 1:
        let x = 1
        console.log(x)
        return x
    case 2:
        let y = 2
        console.log(y)
        return y
}

// ✅ 测试4：fall-through（无break）
switch (value) {
    case 'a':
        doA()
    case 'b':
        doB()
    case 'c':
        doC()
}

// ✅ 测试5：case中的条件语句
switch (status) {
    case 'active':
        if (isValid()) {
            process()
        }
    case 'pending':
        if (shouldWait()) {
            wait()
        }
}

// ✅ 测试6：case中的循环
switch (type) {
    case 1:
        for (let i = 0; i < 10; i++) {
            handle(i)
        }
    case 2:
        let j = 0
        while (j < 5) {
            process(j++)
        }
}

// ✅ 测试7：case中的嵌套switch
switch (outer) {
    case 1:
        switch (inner) {
            case 'a':
                doA()
            case 'b':
                doB()
        }
    case 2:
        doOuter()
}

// ✅ 测试8：case中的try-catch
switch (action) {
    case 'execute':
        try {
            run()
        } catch (e) {
            handle(e)
        }
    case 'skip':
        skip()
}

/* Es2025Parser.ts: CaseClauses */
