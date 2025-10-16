// Generator函数测试

// 基础Generator
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// Generator with parameter
function* paramGenerator(start) {
  yield start;
  yield start + 1;
  yield start + 2;
}

// Generator with yield*
function* delegatingGenerator() {
  yield* [1, 2, 3];
  yield 4;
}

// Generator expression
const genExpr = function* () {
  yield 'a';
  yield 'b';
};

// 使用Generator
const gen = simpleGenerator();
const first = gen.next().value;
const second = gen.next().value;

const paramGen = paramGenerator(10);
const p1 = paramGen.next().value;

const delegateGen = delegatingGenerator();
const d1 = delegateGen.next().value;






