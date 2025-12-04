// 综合测试：纯ES6特性混合使用
class UserManager {
  constructor(users = []) {
    this.users = users
    this.symbol = Symbol('id')
  }
  
  *getUsers() {
    for (const user of this.users) {
      yield user
    }
  }
  
  processUser(user) {
    const {name, age} = user
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          name: name,
          age: age,
          info: `${name} is ${age}`
        })
      }, 100)
    })
  }
  
  static create(...users) {
    return new UserManager(users)
  }
  
  get count() {
    return this.users.length
  }
  
  [Symbol.iterator]() {
    let index = 0
    const users = this.users
    
    return {
      next() {
        if (index < users.length) {
          return {value: users[index++], done: false}
        }
        return {done: true}
      }
    }
  }
}

const manager = UserManager.create(
  {name: "Alice", age: 25},
  {name: "Bob", age: 30}
)

const processAll = async () => {
  for (const user of manager.getUsers()) {
    const result = await manager.processUser(user)
    console.log(`${result.name}: ${result.age}`)
  }
}
