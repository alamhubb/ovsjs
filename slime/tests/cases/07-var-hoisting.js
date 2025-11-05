// var声明和提升
var x = 1
var y, z
y = 2
z = 3
function test() {
  var local = 100
  return local
}

