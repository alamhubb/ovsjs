// 复杂类
class Counter {
  constructor(initial = 0) {
    this.value = initial
  }
  
  increment() {
    this.value++
    return this
  }
  
  decrement() {
    this.value--
    return this
  }
  
  get current() {
    return this.value
  }
  
  static create(val) {
    return new Counter(val)
  }
}

