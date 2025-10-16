// 二进制和八进制字面量测试

// 二进制字面量
const binary1 = 0b1010; // 10
const binary2 = 0B1111; // 15
const binary3 = 0b11111111; // 255

// 八进制字面量
const octal1 = 0o755; // 493
const octal2 = 0O644; // 420
const octal3 = 0o10; // 8

// 十六进制字面量（ES5已支持，但一起测试）
const hex1 = 0xFF; // 255
const hex2 = 0x10; // 16
const hex3 = 0xABCD; // 43981

// 数字分隔符（ES2021，但测试兼容性）
const large1 = 1000000;
const large2 = 1_000_000; // 1000000

// 组合运算
const sum = binary1 + octal1 + hex1;
const product = binary2 * octal2;

// 转换
const binaryStr = binary1.toString(2);
const octalStr = octal1.toString(8);
const hexStr = hex1.toString(16);






