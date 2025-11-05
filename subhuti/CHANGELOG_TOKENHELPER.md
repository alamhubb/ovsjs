# SubhutiTokenHelper 重构说明

## 📅 更新日期
2025-11-05

## 🎯 重构目标
将分散的 token 操作功能统一到 `SubhutiTokenHelper` 类，提供统一的访问入口。

## 🔄 主要变更

### 1. 文件变更

#### 新增文件
- ✅ `src/SubhutiTokenHelper.ts` - 统一的 token 操作类（合并了 SubhutiTokenConsumer 和 SubhutiLookahead）

#### 删除文件
- ❌ `src/SubhutiTokenConsumer.ts` - 已合并到 SubhutiTokenHelper
- ❌ `src/SubhutiLookahead.ts` - 已合并到 SubhutiTokenHelper

#### 修改文件
- 📝 `src/SubhutiParser.ts` - 更新类型引用、添加 getter
- 📝 `tests/test-lookahead.ts` - 改用实例方法
- 📝 `examples/lookahead-usage-example.ts` - 改用实例方法
- 📝 `README.md` - 更新示例代码

### 2. API 变更

#### SubhutiParser 变更

```typescript
// 旧 API
export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer>
readonly tokenConsumer: T
constructor(tokens, TokenConsumerClass?: SubhutiTokenConsumerConstructor<T>)

// 新 API
export default class SubhutiParser<T extends SubhutiTokenHelper = SubhutiTokenHelper>
readonly tokenHelper: T
constructor(tokens, TokenHelperClass?: SubhutiTokenHelperConstructor<T>)

// 新增 getter
get tokens(): SubhutiMatchToken[]
get currentIndex(): number
```

#### Token 消费

```typescript
// 旧方式（通过 consume）
this.consume('Identifier')

// 新方式（保持兼容）
this.consume('Identifier')  // 直接调用 Parser 方法
this.tokenHelper.consume(token)  // 或通过 tokenHelper
```

#### 前瞻功能

```typescript
// 旧方式（静态方法，需要传参）
import SubhutiLookahead from './SubhutiLookahead'
SubhutiLookahead.peek(this._tokens, this.tokenIndex, 1)
SubhutiLookahead.isNot(this._tokens, this.tokenIndex, 'LBrace')
SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(this._tokens, this.tokenIndex)

// 新方式（实例方法，自动访问）
this.tokenHelper.peek(1)
this.tokenHelper.isNot('LBrace')
this.tokenHelper.isAsyncFunctionWithoutLineTerminator()
```

#### 行终止符检查

```typescript
// 旧方式（Parser 方法）
this.hasLineTerminatorBefore()

// 新方式（移到 tokenHelper）
this.tokenHelper.hasLineTerminatorBefore()
```

### 3. SubhutiTokenHelper 完整 API

#### Token 消费（修改状态）
```typescript
consume(token: SubhutiCreateToken): void
```

#### 行终止符检查
```typescript
hasLineTerminatorBefore(): boolean
```

#### 基础前瞻方法（8 个）
```typescript
peek(offset: number = 1): SubhutiMatchToken | undefined
peekSequence(count: number): SubhutiMatchToken[]
is(tokenName: string, offset = 1): boolean
isNot(tokenName: string, offset = 1): boolean
isIn(tokenNames: string[], offset = 1): boolean
isNotIn(tokenNames: string[], offset = 1): boolean
matchSequence(tokenNames: string[]): boolean
notMatchSequence(tokenNames: string[]): boolean
```

#### 高频组合方法（3 个）
```typescript
isAsyncFunctionWithoutLineTerminator(): boolean
isAsyncGeneratorWithoutLineTerminator(): boolean
isLetBracket(): boolean
```

## ✅ 优势

### 1. 统一入口
所有 token 操作都通过 `this.tokenHelper` 访问，使用更直观：
```typescript
this.tokenHelper.peek(1)          // 前瞻
this.tokenHelper.isNot('LBrace')  // 前瞻约束
this.tokenHelper.hasLineTerminatorBefore()  // 行终止符检查
```

### 2. 简化调用
无需传递 `tokens` 和 `currentIndex` 参数，实例方法自动访问：
```typescript
// 旧：需要传参
SubhutiLookahead.peek(this._tokens, this.tokenIndex, 1)

// 新：无需传参
this.tokenHelper.peek(1)
```

### 3. 职责集中
token 的"消费"、"前瞻"、"行终止符检查"都在一个类中，便于维护。

### 4. 向后兼容
保留了 `this.consume()` 方法，现有代码无需修改。

## 🧪 测试结果

所有测试通过 ✅

```bash
$ npx tsx tests/test-lookahead.ts

测试 1：peek() 方法 ✅
测试 2：is/isNot() 方法 ✅
测试 3：isIn/isNotIn() 方法 ✅
测试 4：matchSequence() 方法 ✅
测试 5：isAsyncFunctionWithoutLineTerminator() ✅
测试 6：isAsyncGeneratorWithoutLineTerminator() ✅
测试 7：isLetBracket() ✅
测试 8：peekSequence() ✅
测试 9：hasLineTerminatorBefore() ✅

✅ 所有测试完成！
```

## 📚 迁移指南

### 如果你在使用 SubhutiLookahead

```typescript
// 旧代码
import SubhutiLookahead from 'subhuti/SubhutiLookahead'

class MyParser extends SubhutiParser {
  MyRule() {
    if (SubhutiLookahead.isNot(this._tokens, this.tokenIndex, 'LBrace')) {
      // ...
    }
  }
}

// 新代码
class MyParser extends SubhutiParser {
  MyRule() {
    if (this.tokenHelper.isNot('LBrace')) {
      // ...
    }
  }
}
```

### 如果你在使用 hasLineTerminatorBefore

```typescript
// 旧代码
if (this.hasLineTerminatorBefore()) {
  // ...
}

// 新代码
if (this.tokenHelper.hasLineTerminatorBefore()) {
  // ...
}
```

### 如果你在使用 consume

```typescript
// 保持不变（向后兼容）
this.consume('Identifier')

// 或者使用新 API
this.tokenHelper.consume(token)
```

## 🎉 总结

这次重构：
- ✅ 统一了 token 操作入口
- ✅ 简化了前瞻方法调用
- ✅ 提高了代码可维护性
- ✅ 保持了向后兼容性
- ✅ 所有测试通过

**推荐：** 新项目直接使用 `this.tokenHelper.xxx()` API。

