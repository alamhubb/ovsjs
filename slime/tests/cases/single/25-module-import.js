// Module导入导出测试

// 命名导出
export const name = 'Module';
export const version = '1.0.0';

export function greet(msg) {
  return 'Hello, ' + msg;
}

export class User {
  constructor(name) {
    this.name = name;
  }
}

// 批量导出
const API_URL = 'https://api.example.com';
const API_KEY = 'secret';
export { API_URL, API_KEY };

// 重命名导出
const internalFunc = () => 'internal';
export { internalFunc as publicFunc };

// 默认导出（注释掉，因为只能有一个）
// export default class App {}

// 导入语句（注释掉，避免实际导入）
// import { name, version } from './config';
// import * as utils from './utils';
// import defaultExport from './module';
// import { original as renamed } from './other';

// Re-export（注释掉）
// export { something } from './elsewhere';
// export * from './all';

// 动态导入（注释掉，运行时特性）
// const module = await import('./dynamic');






