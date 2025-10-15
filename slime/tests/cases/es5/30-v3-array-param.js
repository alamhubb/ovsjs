// v3：增加数组作为参数

var data = { name: 'Alice', age: 25 };
var jsonString = JSON.stringify(data);
var parsed = JSON.parse('{"x": 1}');

// 带replacer数组的JSON.stringify
var filtered = JSON.stringify(data, ['name', 'age']);

