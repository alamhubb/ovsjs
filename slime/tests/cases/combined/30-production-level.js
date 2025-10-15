// 阶段3：复杂特性 - 生产级代码（JSON操作）

// JSON对象
var data = {
  name: 'Alice',
  age: 25,
  active: true,
  scores: [85, 90, 95]
};

// JSON.stringify
var jsonString = JSON.stringify(data);
var jsonIndent = JSON.stringify(data, null, 2);

// JSON.parse
var parsed = JSON.parse('{"x": 1, "y": 2}');

// 带reviver的JSON.parse
var withReviver = JSON.parse('{"date": "2025-01-01"}', function(key, value) {
  if (key === 'date') {
    return new Date(value);
  }
  return value;
});

// 带replacer的JSON.stringify
var filtered = JSON.stringify(data, ['name', 'age']);

