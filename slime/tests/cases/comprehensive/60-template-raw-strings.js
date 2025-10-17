// 原始字符串
const path = String.raw`C:\Users\name\file.txt`;
const regex = String.raw`\d+\.\d+`;
const escape = String.raw`\n\t\r`;

// 带变量的raw
const dir = "docs";
const fullPath = String.raw`C:\${dir}\file.txt`;






