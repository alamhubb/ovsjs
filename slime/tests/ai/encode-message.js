// 生成base64编码的消息
// AI使用步骤：
// 1. 修改MESSAGE变量
// 2. 运行: node tests/ai/encode-message.js
// 3. 复制输出的base64字符串
// 4. 运行: node tests/ai/log.js <base64字符串>

const MESSAGE = '测试最新方案：AI修改此变量后生成base64';

const base64 = Buffer.from(MESSAGE, 'utf8').toString('base64');

console.log('原始消息:', MESSAGE);
console.log('\nBase64编码:', base64);
console.log('\n完整命令:');
console.log(`node tests/ai/log.js ${base64}`);

