// 阶段1：只测Parser - 复杂解析
// 目标：验证能否正确解析复杂的嵌套结构

// 复杂函数：控制流 + 循环 + 函数调用
function calculateSum(numbers) {
  var total = 0;
  
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  
  for (var i = 0; i < numbers.length; i++) {
    if (numbers[i] > 0) {
      total = total + numbers[i];
    }
  }
  
  return total;
}

// 嵌套控制流
var x = 10;
if (x > 5) {
  for (var i = 0; i < x; i++) {
    if (i % 2 === 0) {
      console.log(i);
    }
  }
} else {
  while (x < 10) {
    x = x + 1;
  }
}

