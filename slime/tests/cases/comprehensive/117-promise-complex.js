// 复杂Promise
new Promise((resolve, reject) => {
  if (Math.random() > 0.5) {
    resolve('success');
  } else {
    reject('fail');
  }
}).then(result => result.toUpperCase())
  .catch(err => 'Error: ' + err);





