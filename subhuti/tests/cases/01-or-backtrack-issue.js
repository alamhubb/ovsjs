// Subhuti Or回退问题 - 最简复现

// 问题场景：Parser误将 (表达式) || 识别为箭头函数参数

// Case 1: 带括号的逻辑表达式
// 期望: 解析为 BinaryExpression
// 实际: ArrowFunction尝试匹配 (1 < 2)，失败后应回退但未回退
var x = (1 < 2) || false;

// Case 2: IIFE (立即执行函数)
// 期望: 解析为 CallExpression
// 实际: ArrowFunction尝试匹配 (function()...)，失败后应回退但未回退
(function() {
  console.log('test');
})();

