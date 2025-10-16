// async/await完整测试

// 基础async函数
async function fetchData() {
  return 'data';
}

async function fetchWithAwait() {
  const result = await fetchData();
  return result;
}

// async箭头函数
const asyncArrow = async () => {
  const data = await Promise.resolve('arrow result');
  return data;
};

// async方法
class DataService {
  async getData() {
    const result = await Promise.resolve('service data');
    return result;
  }
  
  async processData(input) {
    const step1 = await this.getData();
    const step2 = await Promise.resolve(step1 + input);
    return step2;
  }
}

// 错误处理
async function withErrorHandling() {
  try {
    const result = await Promise.reject('error');
    return result;
  } catch (err) {
    return 'handled: ' + err;
  }
}

// 并行执行
async function parallelExecution() {
  const results = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ]);
  return results;
}

// 串行执行
async function serialExecution() {
  const first = await Promise.resolve(1);
  const second = await Promise.resolve(first + 1);
  const third = await Promise.resolve(second + 1);
  return third;
}

// async IIFE
(async () => {
  const result = await Promise.resolve('immediate');
  console.log(result);
})();

// 使用
const service = new DataService();
const data = service.getData();
const processed = service.processData('input');






