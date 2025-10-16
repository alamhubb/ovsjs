// 正则表达式和Unicode测试

// 基础正则表达式
const regex1 = /hello/;
const regex2 = /world/gi;
const regex3 = new RegExp('pattern', 'i');

// ES6正则新特性
const stickyRegex = /test/y; // sticky flag
const unicodeRegex = /😀/u; // unicode flag

// Unicode码点
const unicodeStr1 = '\u{1F600}'; // 😀
const unicodeStr2 = '\u{1F4A9}'; // 💩
const unicodeStr3 = '你好世界';

// Unicode字符串方法
const codePoint = unicodeStr1.codePointAt(0);
const fromCodePoint = String.fromCodePoint(0x1F600);

// 正则匹配
const text = 'Hello World 123';
const match1 = text.match(/\w+/g);
const match2 = text.match(/\d+/);
const hasMatch = regex1.test('hello world');

// 字符串方法与正则
const replaced = text.replace(/World/, 'Universe');
const parts = text.split(/\s+/);
const searchIndex = text.search(/\d/);

// Unicode属性转义（ES2018，测试兼容性）
// const letterRegex = /\p{Letter}/u;
// const emojiRegex = /\p{Emoji}/u;

// 组合使用
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const email = 'test@example.com';
const isValidEmail = emailRegex.test(email);

// 分组和捕获
const urlRegex = /^(https?):\/\/([^/]+)(\/.*)?$/;
const url = 'https://example.com/path';
const urlMatch = url.match(urlRegex);

// Unicode标准化
const str1 = '\u00e9'; // é
const str2 = '\u0065\u0301'; // é (e + combining acute)
const normalized = str2.normalize('NFC');
const areEqual = str1 === normalized;






