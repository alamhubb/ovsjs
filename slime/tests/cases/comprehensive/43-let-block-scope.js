// Let块级作用域测试
let x = 1;

{
  let x = 2;
  let y = 3;
  const inner = x + y;
}

const outer = x + 10;

if (true) {
  let blockVar = 100;
  const blockConst = 200;
}

for (let i = 0; i < 3; i++) {
  let loopVar = i * 2;
}

let count = 0;
while (count < 3) {
  let temp = count;
  count++;

