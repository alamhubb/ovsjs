// Promises
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000)
})

const promise2 = Promise.resolve(42)
const promise3 = Promise.reject("error")

Promise.all([promise1, promise2])
  .then(results => console.log(results))
  .catch(err => console.error(err))

