// 测试异步生成器函数（ES2018）

// 1. 基础异步生成器声明
async function* asyncGenBind() {
  yield 1
}

// 2. 带参数的异步生成器
async function* fetchPages(url) {
  let page = 1
  while (page <= 3) {
    yield fetch(`${url}?page=${page}`)
    page++
  }
}

// 3. 异步生成器表达式
const asyncGen = async function* () {
  yield await Promise.resolve(1)
  yield await Promise.resolve(2)
}

// 4. 命名的异步生成器表达式
const namedAsyncGen = async function* myGen() {
  yield 'a'
  yield 'b'
}

// 5. 使用异步生成器
async function testAsyncGen() {
  for await (const value of asyncGenBind()) {
    console.log(value)
  }
}







