import ObjectScriptParser from "./parser/ObjectScriptParser";
import SlimeGenerator from "slime-generator/src/SlimeGenerator";
import ObjectCstToSlimeAstUtil from "./factory/ObjectCstToSlimeAst.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst";

/**
 * 深拷贝对象
 */
function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 递归清除 CST 节点的 tokens 属性
 */
function traverseClearTokens(currentNode: SubhutiCst): SubhutiCst {
  if (!currentNode) return currentNode;

  if (currentNode.children && currentNode.children.length > 0) {
    currentNode.children.forEach(child => traverseClearTokens(child));
  }

  currentNode.tokens = undefined;
  return currentNode;
}


Error.stackTraceLimit = 50

console.log('========== ObjectScript 多继承测试 ==========')

// ============================================
// 测试多继承语法
// ============================================

// 测试1：无构造函数（默认无参调用）
const multiInheritanceCode = `
class B {
  name = "B"
  foo() { return "B.foo" }
  bar() { return this.foo() + "-bar" }
}

class C {
  age = 18
  baz() { return "C.baz" }
}

class A extends B, C {
  foo() { return "A.foo" }
}
`

// 测试2：有构造函数，使用 super.ClassName(args) 语法
const multiInheritanceWithConstructorCode = `
class B {
  constructor(name) { this.name = name }
  foo() { return "B.foo" }
}

class C {
  constructor(age) { this.age = age }
  baz() { return "C.baz" }
}

class A extends B, C {
  constructor(name, age) {
    super.B(name)
    super.C(age)
  }
  foo() { return "A.foo" }
}
`

console.log('========== 测试多继承语法 ==========')
console.log('原始代码:')
console.log(multiInheritanceCode)

console.log('\n========== 1. Parser (解析 CST) ==========')
const parser = new ObjectScriptParser(multiInheritanceCode)
let curCst = parser.Program()

console.log('CST 生成成功')
const outCst = cloneDeep(curCst)
const cstForAst = traverseClearTokens(outCst)
console.log('CST 结构（简化）:')
console.log(JSON.stringify(cstForAst, null, 2).substring(0, 2000))

console.log('\n========== 2. CST to AST (转换) ==========')
const ast = ObjectCstToSlimeAstUtil.toProgram(cstForAst)
console.log('AST 生成成功')
console.log('AST body 数量:', ast.body?.length || 0)
console.log('需要 $osRuntime:', ObjectCstToSlimeAstUtil.needsOsRuntime)

// 检查第三个类（A）是否正确转换
if (ast.body && ast.body.length >= 3) {
  const classA = ast.body[2] as any
  console.log('\n类 A 的 AST:')
  console.log('  - Type:', classA.type)
  console.log('  - Name:', classA.id?.name)
  console.log('  - SuperClass:', classA.superClass)  // 应该是 null（多继承移除了原生继承）
  console.log('  - Body 元素数量:', classA.body?.body?.length)

  // 检查构造函数
  const constructor = classA.body?.body?.find((m: any) => m.kind === 'constructor')
  if (constructor) {
    console.log('  - 构造函数已生成 ✅')
    // 打印构造函数体
    const body = constructor.value?.body?.body
    if (body && body.length > 0) {
      const firstStmt = body[0]
      if (firstStmt.type === 'ExpressionStatement') {
        const callExpr = firstStmt.expression
        if (callExpr.type === 'CallExpression') {
          const args = callExpr.arguments
          console.log('  - 构造函数调用参数数量:', args?.length)
          if (args && args.length >= 2) {
            const arrayArg = args[1]
            console.log('  - 父类数组类型:', arrayArg?.type)
            console.log('  - 父类数组元素数量:', arrayArg?.elements?.length)
            console.log('  - 父类数组元素:', JSON.stringify(arrayArg?.elements?.map((e: any) => e?.name || e?.type)))
          }
        }
      }
    }
  }
}

console.log('\n完整 AST:')
console.log(JSON.stringify(ast, null, 2).substring(0, 3000))

console.log('\n========== 3. AST to Code (生成代码) ==========')
const result = SlimeGenerator.generator(ast)
console.log('生成的代码:')
console.log('---')
console.log(result.code)
console.log('---')

// ============================================
// 测试带有 super.ClassName() 语法的编译
// ============================================
console.log('\n========== 3.5 测试 super.ClassName() 语法编译 ==========')
console.log('原始代码:')
console.log(multiInheritanceWithConstructorCode)

const parser2 = new ObjectScriptParser(multiInheritanceWithConstructorCode)
let curCst2 = parser2.Program()
const outCst2 = cloneDeep(curCst2)
const cstForAst2 = traverseClearTokens(outCst2)

const ast2 = ObjectCstToSlimeAstUtil.toProgram(cstForAst2)
const result2 = SlimeGenerator.generator(ast2)
console.log('生成的代码:')
console.log('---')
console.log(result2.code)
console.log('---')

// ============================================
// 运行时测试：验证多继承功能
// ============================================
console.log('\n========== 4. 运行时测试（无参构造函数） ==========')

// 引入运行时
import { $osRuntime } from './runtime/osRuntime.js'

// 定义 Symbol 用于测试
const mySymbol = Symbol('mySymbol')

// 定义父类
class B {
  name = "B";
  [mySymbol] = "B.symbolValue"  // Symbol 属性

  foo() { return "B.foo" }
  bar() { return this.foo() + "-bar" }

  // 静态成员
  static staticMethod() { return "B.staticMethod" }
  static staticValue = 100
}

class C {
  age = 18
  baz() { return "C.baz" }

  // 静态成员
  static cStaticMethod() { return "C.cStaticMethod" }
}

// 测试1：模拟编译后的代码（无构造函数 - 默认无参调用）
class A1 {
  constructor() {
    // 默认无参调用所有父类
    $osRuntime.initParent(this, B, [])
    $osRuntime.initParent(this, C, [])
  }
  foo() { return "A.foo" }
}

const a1 = new A1()

console.log('--- 基本方法和属性 ---')
console.log('a1.foo():', (a1 as any).foo())  // 应该是 "A.foo"
console.log('a1.bar():', (a1 as any).bar())  // 应该是 "A.foo-bar" (多态)
console.log('a1.baz():', (a1 as any).baz())  // 应该是 "C.baz"
console.log('a1.name:', (a1 as any).name)    // 应该是 "B"
console.log('a1.age:', (a1 as any).age)      // 应该是 18

console.log('\n--- instanceof 测试 ---')
console.log('a1 instanceof A1:', a1 instanceof A1)  // true
console.log('a1 instanceof B:', a1 instanceof B)    // true (通过 Symbol.hasInstance)
console.log('a1 instanceof C:', a1 instanceof C)    // true (通过 Symbol.hasInstance)

console.log('\n--- 静态成员测试 ---')
console.log('A1.staticMethod():', (A1 as any).staticMethod?.())  // 应该是 "B.staticMethod"
console.log('A1.staticValue:', (A1 as any).staticValue)          // 应该是 100
console.log('A1.cStaticMethod():', (A1 as any).cStaticMethod?.()) // 应该是 "C.cStaticMethod"

console.log('\n--- Symbol 属性测试 ---')
console.log('a1[mySymbol]:', (a1 as any)[mySymbol])  // 应该是 "B.symbolValue"

// ============================================
// 测试2：有构造函数，使用 super.ClassName(args) 语法
// ============================================
console.log('\n========== 5. 运行时测试（super.ClassName() 语法） ==========')

class B2 {
  name: string
  constructor(name: string) {
    this.name = name
  }
  foo() { return "B2.foo" }
}

class C2 {
  age: number
  constructor(age: number) {
    this.age = age
  }
  baz() { return "C2.baz" }
}

// 测试2：模拟编译后的代码（有构造函数 - super.ClassName(args)）
class A2 {
  constructor(name: string, age: number) {
    // super.B2(name) 编译为 $osRuntime.initParent(this, B2, [name])
    $osRuntime.initParent(this, B2, [name])
    // super.C2(age) 编译为 $osRuntime.initParent(this, C2, [age])
    $osRuntime.initParent(this, C2, [age])
  }
  foo() { return "A2.foo" }
}

const a2 = new A2("Tom", 25)

console.log('--- 带参数构造函数测试 ---')
console.log('a2.foo():', (a2 as any).foo())  // 应该是 "A2.foo"
console.log('a2.baz():', (a2 as any).baz())  // 应该是 "C2.baz"
console.log('a2.name:', (a2 as any).name)    // 应该是 "Tom" ✅
console.log('a2.age:', (a2 as any).age)      // 应该是 25 ✅

console.log('\n--- instanceof 测试 ---')
console.log('a2 instanceof A2:', a2 instanceof A2)  // true
console.log('a2 instanceof B2:', a2 instanceof B2)  // true
console.log('a2 instanceof C2:', a2 instanceof C2)  // true

// ============================================
// 测试3：继承链（父类的父类）
// ============================================
console.log('\n========== 6. 继承链测试（父类的父类） ==========')

class Base {
  baseMethod() { return "Base.baseMethod" }
  baseProp = "baseProp"
}

class B3 extends Base {
  b3Method() { return "B3.b3Method" }
}

class C3 {
  c3Method() { return "C3.c3Method" }
}

class A3 {
  constructor() {
    $osRuntime.initParent(this, B3, [])
    $osRuntime.initParent(this, C3, [])
  }
}

const a3 = new A3()

console.log('--- 继承链方法访问 ---')
console.log('a3.baseMethod():', (a3 as any).baseMethod())  // 应该是 "Base.baseMethod" ✅
console.log('a3.b3Method():', (a3 as any).b3Method())      // 应该是 "B3.b3Method" ✅
console.log('a3.c3Method():', (a3 as any).c3Method())      // 应该是 "C3.c3Method" ✅
console.log('a3.baseProp:', (a3 as any).baseProp)          // 应该是 "baseProp" ✅

// ============================================
// 测试4：super 调用（方案D）
// ============================================
console.log('\n========== 7. super 调用测试（方案D） ==========')

class B4 {
  name = "B4.name"
  foo() { return "B4.foo" }
  bar() { return "B4.bar" }
}

class C4 {
  name = "C4.name"
  foo() { return "C4.foo" }
  baz() { return "C4.baz" }
}

class A4 {
  constructor() {
    $osRuntime.initParent(this, B4, [])
    $osRuntime.initParent(this, C4, [])
  }

  foo() { return "A4.foo" }

  // 测试 superCall（按优先级）
  testSuperCall() {
    return $osRuntime.superCall(this, 'foo', [])  // 应该调用 B4.foo
  }

  // 测试 superCallOn（显式指定）
  testSuperCallOnB() {
    return $osRuntime.superCallOn(this, B4, 'foo', [])
  }
  testSuperCallOnC() {
    return $osRuntime.superCallOn(this, C4, 'foo', [])
  }

  // 测试 superGet（按优先级）
  testSuperGet() {
    return $osRuntime.superGet(this, 'name')  // 应该返回 B4.name
  }

  // 测试 superGetOn（显式指定）
  testSuperGetOnC() {
    return $osRuntime.superGetOn(this, C4, 'name')
  }

  // 测试 superSet
  testSuperSet() {
    $osRuntime.superSet(this, 'name', 'modified')
  }
}

const a4 = new A4()

console.log('--- superCall 测试（按优先级） ---')
console.log('a4.testSuperCall():', (a4 as any).testSuperCall())  // 应该是 "B4.foo"

console.log('\n--- superCallOn 测试（显式指定） ---')
console.log('a4.testSuperCallOnB():', (a4 as any).testSuperCallOnB())  // 应该是 "B4.foo"
console.log('a4.testSuperCallOnC():', (a4 as any).testSuperCallOnC())  // 应该是 "C4.foo"

console.log('\n--- superGet 测试 ---')
console.log('a4.testSuperGet():', (a4 as any).testSuperGet())      // 应该是 "B4.name"
console.log('a4.testSuperGetOnC():', (a4 as any).testSuperGetOnC()) // 应该是 "C4.name"

console.log('\n--- superSet 测试 ---')
console.log('修改前 a4.name:', (a4 as any).name)
;(a4 as any).testSuperSet()
console.log('修改后 a4.name:', (a4 as any).name)  // 应该是 "modified"

// ============================================
// 测试5：私有字段 #field
// ============================================
console.log('\n========== 8. 私有字段测试 ==========')

class B5 {
  #secret = "B5's secret"

  getSecret() { return this.#secret }
  setSecret(val: string) { this.#secret = val }
}

class C5 {
  c5Method() { return "C5" }
}

class A5 {
  constructor() {
    $osRuntime.initParent(this, B5, [])
    $osRuntime.initParent(this, C5, [])
  }
}

const a5 = new A5()

console.log('--- 私有字段访问（通过父类方法） ---')
console.log('a5.getSecret():', (a5 as any).getSecret())  // 应该是 "B5's secret" ✅
;(a5 as any).setSecret("new secret")
console.log('a5.getSecret() after set:', (a5 as any).getSecret())  // 应该是 "new secret" ✅

// ============================================
// 测试9: 编译器转换方法体中的 super 调用
// ============================================
console.log('\n========== 9. 编译器转换 super 调用测试 ==========')

const superCallCode = `
class B {
  name = "B.name"
  foo() { return "B.foo" }
}

class C {
  name = "C.name"
  foo() { return "C.foo" }
  bar() { return "C.bar" }
}

class A extends B, C {
  foo() { return "A.foo" }

  // 测试 super.foo() 调用（按优先级）
  testSuperCall() {
    return super.foo()
  }

  // 测试 super.B.foo() 调用（显式指定）
  testSuperCallOnB() {
    return super.B.foo()
  }

  testSuperCallOnC() {
    return super.C.foo()
  }

  // 测试 super.name 属性访问
  testSuperGet() {
    return super.name
  }

  testSuperGetOnC() {
    return super.C.name
  }

  // 测试 super.name = x 属性赋值
  testSuperSet() {
    super.name = "modified"
  }

  testSuperSetOnC() {
    super.C.name = "C.modified"
  }
}
`

console.log('原始代码:')
console.log(superCallCode)

// 解析 CST
const superCallParser = new ObjectScriptParser(superCallCode)
const superCallCst = traverseClearTokens(cloneDeep(superCallParser.Program()))

// CST 转 AST
const superCallAst = ObjectCstToSlimeAstUtil.toProgram(superCallCst)

// AST 转代码
const superCallGenResult = SlimeGenerator.generator(superCallAst)
const superCallGeneratedCode = superCallGenResult.code

console.log('编译后代码:')
console.log('---')
console.log(superCallGeneratedCode)
console.log('---')

// 验证编译结果包含正确的运行时调用
const checks = [
  { pattern: /\$osRuntime\.superCall\(this,\s*['"]foo['"]\s*,\s*\[\]\)/, desc: 'super.foo() → superCall' },
  { pattern: /\$osRuntime\.superCallOn\(this,\s*B\s*,\s*['"]foo['"]\s*,\s*\[\]\)/, desc: 'super.B.foo() → superCallOn' },
  { pattern: /\$osRuntime\.superCallOn\(this,\s*C\s*,\s*['"]foo['"]\s*,\s*\[\]\)/, desc: 'super.C.foo() → superCallOn' },
  { pattern: /\$osRuntime\.superGet\(this,\s*['"]name['"]\)/, desc: 'super.name → superGet' },
  { pattern: /\$osRuntime\.superGetOn\(this,\s*C\s*,\s*['"]name['"]\)/, desc: 'super.C.name → superGetOn' },
  { pattern: /\$osRuntime\.superSet\(this,\s*['"]name['"]\s*,\s*['"]modified['"]\)/, desc: 'super.name = x → superSet' },
  { pattern: /\$osRuntime\.superSetOn\(this,\s*C\s*,\s*['"]name['"]\s*,\s*['"]C\.modified['"]\)/, desc: 'super.C.name = x → superSetOn' },
]

console.log('\n--- 编译结果验证 ---')
for (const check of checks) {
  const passed = check.pattern.test(superCallGeneratedCode)
  console.log(`${passed ? '✅' : '❌'} ${check.desc}`)
}

// ============================================
// 测试10: 单继承保持原生 extends
// ============================================
console.log('\n========== 10. 单继承保持原生 extends ==========')

const singleInheritanceCode = `
class Parent {
  name = "Parent"
  foo() { return "Parent.foo" }
}

class Child extends Parent {
  bar() { return "Child.bar" }
}
`

const singleParser = new ObjectScriptParser(singleInheritanceCode)
const singleCst = traverseClearTokens(cloneDeep(singleParser.Program()))
const singleAst = ObjectCstToSlimeAstUtil.toProgram(singleCst)
const singleNeedsOsRuntime = ObjectCstToSlimeAstUtil.needsOsRuntime
const singleGenerated = SlimeGenerator.generator(singleAst)

console.log('单继承原始代码:')
console.log(singleInheritanceCode)
console.log('编译后代码:')
console.log(singleGenerated.code)

// 验证：单继承应该保持原生 extends，不应该有 $osRuntime
const hasSuperClass = /class Child extends Parent/.test(singleGenerated.code)
const hasOsRuntime = /\$osRuntime/.test(singleGenerated.code)
console.log(`\n--- 单继承验证 ---`)
console.log(`保持原生 extends: ${hasSuperClass ? '✅' : '❌'}`)
console.log(`没有 $osRuntime: ${!hasOsRuntime ? '✅' : '❌'}`)
console.log(`needsOsRuntime: ${singleNeedsOsRuntime} (应该是 false)`)

// ============================================
// 测试11: 菱形继承问题分析
// ============================================
console.log('\n========== 11. 菱形继承问题分析 ==========')

let baseConstructorCallCount = 0

class DiamondBase {
  baseValue = "DiamondBase"
  constructor() {
    baseConstructorCallCount++
    console.log(`  DiamondBase 构造函数被调用，第 ${baseConstructorCallCount} 次`)
  }
  getBaseValue() { return this.baseValue }
}

class DiamondB extends DiamondBase {
  bValue = "DiamondB"
  constructor() {
    super()
    this.baseValue = "B's base"  // 修改继承的属性
  }
}

class DiamondC extends DiamondBase {
  cValue = "DiamondC"
  constructor() {
    super()
    this.baseValue = "C's base"  // 修改继承的属性
  }
}

// 模拟编译后的 DiamondA
class DiamondA {
  constructor() {
    $osRuntime.initParent(this, DiamondB, [])
    $osRuntime.initParent(this, DiamondC, [])
  }
}

baseConstructorCallCount = 0
const diamondA = new DiamondA()

console.log('\n--- 菱形继承分析结果 ---')
console.log(`DiamondBase 构造函数调用次数: ${baseConstructorCallCount}`)
console.log(`diamondA.baseValue: ${(diamondA as any).baseValue}`)  // 应该是 B's base（优先级）
console.log(`diamondA.bValue: ${(diamondA as any).bValue}`)
console.log(`diamondA.cValue: ${(diamondA as any).cValue}`)
console.log(`diamondA.getBaseValue(): ${(diamondA as any).getBaseValue()}`)

console.log('\n--- instanceof 测试 ---')
console.log(`diamondA instanceof DiamondA: ${diamondA instanceof DiamondA}`)
console.log(`diamondA instanceof DiamondB: ${$osRuntime.isInstanceOf(diamondA, DiamondB)}`)
console.log(`diamondA instanceof DiamondC: ${$osRuntime.isInstanceOf(diamondA, DiamondC)}`)
console.log(`diamondA instanceof DiamondBase: ${$osRuntime.isInstanceOf(diamondA, DiamondBase)}`)

// ============================================
// 测试12: 重复继承检测
// ============================================
console.log('\n========== 12. 重复继承检测 ==========')

const duplicateInheritanceCode = `
class B { }
class C { }
class A extends B, C, B { }
`

console.log('重复继承代码:')
console.log(duplicateInheritanceCode)

try {
  const dupParser = new ObjectScriptParser(duplicateInheritanceCode)
  const dupCst = traverseClearTokens(cloneDeep(dupParser.Program()))
  ObjectCstToSlimeAstUtil.toProgram(dupCst)
  console.log('❌ 应该抛出错误但没有')
} catch (e: any) {
  console.log('✅ 正确检测到重复继承:')
  console.log(`   错误信息: ${e.message}`)
}

// ============================================
// 测试13: getParentClasses 辅助方法
// ============================================
console.log('\n========== 13. getParentClasses 辅助方法 ==========')

class Parent1 {
  p1Method() { return "Parent1" }
}

class Parent2 {
  p2Method() { return "Parent2" }
}

class MultiChild {
  constructor() {
    $osRuntime.initParent(this, Parent1, [])
    $osRuntime.initParent(this, Parent2, [])
  }
}

const multiChild = new MultiChild()

console.log('--- getParentClasses 测试 ---')
const parentClasses = $osRuntime.getParentClasses(multiChild)
console.log(`父类数量: ${parentClasses.length}`)
console.log(`父类列表: [${parentClasses.map(c => c.name).join(', ')}]`)
console.log(`包含 Parent1: ${parentClasses.includes(Parent1) ? '✅' : '❌'}`)
console.log(`包含 Parent2: ${parentClasses.includes(Parent2) ? '✅' : '❌'}`)

console.log('\n--- getParentInstance 测试 ---')
const p1Instance = $osRuntime.getParentInstance(multiChild, Parent1)
const p2Instance = $osRuntime.getParentInstance(multiChild, Parent2)
console.log(`Parent1 实例存在: ${p1Instance ? '✅' : '❌'}`)
console.log(`Parent2 实例存在: ${p2Instance ? '✅' : '❌'}`)
console.log(`p1Instance.p1Method(): ${p1Instance?.p1Method?.()}`)
console.log(`p2Instance.p2Method(): ${p2Instance?.p2Method?.()}`)

console.log('\n========== 所有测试完成 ✅ ==========')


