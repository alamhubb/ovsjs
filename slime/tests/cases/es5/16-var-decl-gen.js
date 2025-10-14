// 阶段1：只测Parser - 变量声明
// 目标：验证能否正确解析各种变量声明

// var声明
var a = 1;
var b = 2;
var c = 3;

// 逗号分隔声明（已知问题：Parser暂不支持）
// var b = 2, c = 3;

// let声明（ES6）
let x = 10;
let y = 20;
let z = 30;

// const声明（ES6）
const PI = 3.14;
const MAX = 100;

// 声明但不初始化
var empty;
let uninitialized;

