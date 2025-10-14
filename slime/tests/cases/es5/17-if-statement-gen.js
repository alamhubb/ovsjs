// 阶段1：只测Parser - if语句
// 目标：验证能否正确解析if/else语句

// 简单if
var x = 10;
if (x > 5) {
  x = x + 1;
}

// if-else
var y = 3;
if (y > 5) {
  y = y + 1;
} else {
  y = y - 1;
}

// if-else if-else
var z = 7;
if (z < 5) {
  z = 1;
} else if (z < 10) {
  z = 2;
} else {
  z = 3;
}

