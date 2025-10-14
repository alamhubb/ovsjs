// ES5测试 - 控制流语句

// if-else语句
var x = 10;
if (x > 5) {
  x = x + 1;
} else {
  x = x - 1;
}

// switch语句
var day = 1;
switch (day) {
  case 1:
    console.log('Monday');
    break;
  case 2:
    console.log('Tuesday');
    break;
  default:
    console.log('Other');
}

// while循环
var i = 0;
while (i < 3) {
  i = i + 1;
}

// do-while循环
var j = 0;
do {
  j = j + 1;
} while (j < 3);

// for循环
var sum = 0;
for (var k = 0; k < 5; k++) {
  sum = sum + k;
}

// for-in循环
var obj = {a: 1, b: 2, c: 3};
for (var key in obj) {
  console.log(key);
}

// break和continue
for (var m = 0; m < 10; m++) {
  if (m === 3) {
    continue;
  }
  if (m === 7) {
    break;
  }
}


