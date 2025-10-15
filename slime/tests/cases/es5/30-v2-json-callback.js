// v2：增加带回调的JSON.parse

var data = { name: 'Alice' };
var jsonString = JSON.stringify(data);
var parsed = JSON.parse('{"x": 1}');

// 带reviver的JSON.parse
var withReviver = JSON.parse('{"date": "2025-01-01"}', function(key, value) {
  if (key === 'date') {
    return new Date(value);
  }
  return value;
});

