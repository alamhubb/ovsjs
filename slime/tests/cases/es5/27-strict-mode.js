// ES5测试 - 严格模式

'use strict';

// 严格模式下的正常代码
var x = 10;

function test() {
  'use strict';
  var y = 20;
  return y;
}

// 正常的函数调用
function regularFunction() {
  return this;
}

// 对象方法
var obj = {
  method: function() {
    return 'method result';
  }
};

obj.method();


