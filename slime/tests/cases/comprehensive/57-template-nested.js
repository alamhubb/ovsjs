// 嵌套模板字符串
const inner = `inner value`;
const outer = `Outer: ${`Inner: ${inner}`}`;
const deep = `Level 1: ${`Level 2: ${`Level 3`}`}`;

const name = "Bob";
const nested = `Hello ${`Mr. ${name}`}`;






