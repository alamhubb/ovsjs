const fs = require('fs');

const content = fs.readFileSync('test-output-full.txt', 'utf8');
const lines = content.split('\n');

const treeLines = lines.filter(line => {
    // 检查是否包含树形字符
    return line.includes('├') || line.includes('└') || (line.includes('│') && !line.includes('栈深度'));
});

console.log(treeLines.join('\n'));

