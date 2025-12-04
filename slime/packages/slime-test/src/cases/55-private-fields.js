/**
 * 测试55: 私有属性（ES2022特性）
 * 
 * 测试内容：
 * - 私有字段声明
 * - 私有字段访问
 * - 私有方法
 */

class Counter {
  // 私有字段
  #count = 0;
  #name = "counter";
  
  // 公共方法访问私有字段
  increment() {
    this.#count++;
  }
  
  getCount() {
    return this.#count;
  }
  
  // 私有方法
  #reset() {
    this.#count = 0;
  }
  
  resetPublic() {
    this.#reset();
  }
}






































