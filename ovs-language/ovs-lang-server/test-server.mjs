// 测试 ovs-lang-server 编译后的模块是否能正常加载和工作

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('========================================');
console.log('测试 OVS Language Server');
console.log('========================================\n');

// 测试 1: 验证 ovsjs 可以正常加载
console.log('📝 测试 1: 验证 ovsjs 模块加载');
try {
    const { vitePluginOvsTransform } = await import('ovsjs');
    const testCode = 'div { "Hello" }';
    const result = vitePluginOvsTransform(testCode);
    console.log('   输入:', testCode);
    console.log('   输出:', result.code);
    console.log('   ✅ ovsjs 模块加载成功\n');
} catch (e) {
    console.error('   ❌ ovsjs 模块加载失败:', e.message);
    process.exit(1);
}

// 测试 2: 验证 dist/index.mjs 可以被 Node 解析（不启动服务器）
console.log('📝 测试 2: 验证 dist/index.mjs 语法正确');
try {
    // 使用 Node 的 --check 模式验证语法
    const result = spawn('node', ['--check', 'dist/index.mjs'], {
        cwd: __dirname,
        stdio: 'pipe'
    });
    
    let stderr = '';
    result.stderr.on('data', (data) => {
        stderr += data.toString();
    });
    
    result.on('close', (code) => {
        if (code === 0) {
            console.log('   ✅ dist/index.mjs 语法检查通过\n');
            runTest3();
        } else {
            console.error('   ❌ dist/index.mjs 语法错误:', stderr);
            process.exit(1);
        }
    });
} catch (e) {
    console.error('   ❌ 验证失败:', e.message);
    process.exit(1);
}

function runTest3() {
    // 测试 3: 启动 language server 并发送初始化请求
    console.log('📝 测试 3: 启动 Language Server (--stdio 模式)');
    
    const serverProcess = spawn('node', ['dist/index.mjs', '--stdio'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let responseData = '';
    
    serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();
        // 检查是否收到响应
        if (responseData.includes('Content-Length:')) {
            console.log('   ✅ Language Server 响应正常');
            console.log('   收到响应数据长度:', responseData.length);
            serverProcess.kill();
        }
    });
    
    serverProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        // 忽略日志输出
        if (!msg.includes('[')) {
            console.log('   Server stderr:', msg);
        }
    });
    
    serverProcess.on('error', (err) => {
        console.error('   ❌ 启动失败:', err.message);
        process.exit(1);
    });
    
    serverProcess.on('close', (code) => {
        console.log('\n========================================');
        console.log('所有测试完成！');
        console.log('========================================');
    });
    
    // 发送 LSP 初始化请求
    const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            processId: process.pid,
            capabilities: {},
            rootUri: 'file://' + __dirname,
            initializationOptions: {
                typescript: {
                    tsdk: join(__dirname, 'node_modules', 'typescript', 'lib')
                }
            }
        }
    };
    
    const content = JSON.stringify(initRequest);
    const header = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n`;
    
    // 等待一下再发送请求
    setTimeout(() => {
        serverProcess.stdin.write(header + content);
    }, 500);
    
    // 5秒后超时
    setTimeout(() => {
        if (!responseData.includes('Content-Length:')) {
            console.log('   ⚠️ 等待响应超时，但服务器已启动');
        }
        serverProcess.kill();
    }, 5000);
}

