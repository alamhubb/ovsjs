const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => {
  return fs.statSync(path.join(dir, f)).isFile() && /^(.+)-\d+\.js$/.test(f);
});

// 按照基础名称分组
const groups = {};
files.forEach(file => {
  const match = file.match(/^(.+)-(\d+)\.js$/);
  if (match) {
    const [, baseName, number] = match;
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push({ file, number: parseInt(number) });
  }
});

// 处理每一组
Object.keys(groups).forEach(baseName => {
  const fileList = groups[baseName].sort((a, b) => a.number - b.number);
  const minNumber = fileList[0].number;
  
  let targetFile = fileList[0].file;
  let targetPath = path.join(dir, targetFile);
  
  // 如果最小编号不是001，重命名为001
  if (minNumber !== 1) {
    const newName = `${baseName}-001.js`;
    const newPath = path.join(dir, newName);
    fs.renameSync(targetPath, newPath);
    targetPath = newPath;
    targetFile = newName;
    console.log(`重命名: ${fileList[0].file} -> ${newName}`);
  }
  
  // 如果有多个同名文件，合并内容
  if (fileList.length > 1) {
    let targetContent = fs.readFileSync(targetPath, 'utf8');
    
    for (let i = 1; i < fileList.length; i++) {
      const filePath = path.join(dir, fileList[i].file);
      const content = fs.readFileSync(filePath, 'utf8');
      targetContent += '\n' + content;
      fs.unlinkSync(filePath);
      console.log(`删除: ${fileList[i].file}`);
    }
    
    fs.writeFileSync(targetPath, targetContent, 'utf8');
    console.log(`合并: ${baseName} (共 ${fileList.length} 个文件)`);
  }
});

console.log('合并完成！');
