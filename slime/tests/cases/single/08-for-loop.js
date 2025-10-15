// 阶段1：基础语法 - for循环

// 基本for循环
var sum = 0;
for (var i = 0; i < 5; i++) {
  sum = sum + i;
}

// for循环嵌套
var total = 0;
for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    total = total + 1;
  }
}

// for-in循环
var obj = {a: 1, b: 2, c: 3};
for (var key in obj) {
  console.log(key);
}

