// 复杂模板组合
const user = {name: "Alice", age: 25, role: "admin"};
const template = `
  User Profile:
  Name: ${user.name}
  Age: ${user.age}
  Role: ${user.role}
  Status: ${user.age >= 18 ? "Adult" : "Minor"}
`;

const items = [1, 2, 3];
const list = `Items: ${items.map(x => x * 2).join(", ")}`;

const html = `
  <div class="${user.role}">
    <h1>${user.name}</h1>
    <p>Age: ${user.age}</p>
  </div>
`;






