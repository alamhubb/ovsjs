// ES5测试 - 异常处理

// try-catch
try {
  var x = 1;
  throw new Error('Test error');
} catch (e) {
  console.log(e.message);
}

// try-finally
try {
  var y = 2;
} finally {
  console.log('Finally block');
}

// try-catch-finally
try {
  var z = 3;
  if (z < 5) {
    throw 'Custom error';
  }
} catch (err) {
  console.log(err);
} finally {
  console.log('Cleanup');
}

// 嵌套try-catch
try {
  try {
    throw 'Inner error';
  } catch (inner) {
    console.log('Inner catch');
    throw 'Outer error';
  }
} catch (outer) {
  console.log('Outer catch');
}


