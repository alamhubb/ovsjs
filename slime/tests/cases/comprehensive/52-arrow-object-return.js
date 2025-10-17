// 箭头函数返回对象字面量
const createPerson = (name, age) => ({name: name, age: age});
const createPoint = (x, y) => ({x, y});
const createConfig = () => ({debug: true, port: 8080});

// 嵌套对象
const createUser = (name, role) => ({
  name: name,
  role: role,
  permissions: {read: true, write: false}
});

// 使用
const person = createPerson("Alice", 25);
const point = createPoint(10, 20);
const config = createConfig();
const user = createUser("Bob", "admin");






