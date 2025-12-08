'use strict';

var serverProtocol = require('@volar/language-server/protocol');
var vscode$1 = require('@volar/vscode');
var node = require('@volar/vscode/node');
var vscode = require('vscode');
var path = require('path');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var serverProtocol__namespace = /*#__PURE__*/_interopNamespaceDefault(serverProtocol);
var vscode__namespace = /*#__PURE__*/_interopNamespaceDefault(vscode);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

let client;
// 创建输出通道用于显示调试日志
const outputChannel = vscode__namespace.window.createOutputChannel('ObjectScript Language Server', {
    log: true
});
function log(message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = data !== undefined ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}` : `[${timestamp}] ${message}`;
    outputChannel.appendLine(logMessage);
    console.log(logMessage);
}
async function activate(context) {
    log('=== ObjectScript Extension Activating ===');
    log('Extension path', context.extensionPath);
    log('Storage path', context.storagePath);
    log('Global storage path', context.globalStoragePath);
    // Language Server 已打包到 dist/language-server.cjs
    const serverModule = path__namespace.join(context.extensionPath, 'dist', 'language-server.cjs');
    log('Server module path', serverModule);
    // 检查服务器模块是否存在
    try {
        const fs = await import('fs');
        if (fs.existsSync(serverModule)) {
            log('Server module exists', true);
        } else {
            log('ERROR: Server module does not exist!');
        }
    } catch (e) {
        log('Error checking server module', e);
    }
    // 获取用户 VSCode 中的 TypeScript SDK 路径
    log('Getting TypeScript SDK...');
    let tsdk;
    try {
        // 添加超时，避免卡住
        const tsdkPromise = vscode$1.getTsdk(context);
        const timeoutPromise = new Promise((resolve)=>{
            setTimeout(()=>{
                log('TSDK timeout after 5 seconds, using default');
                resolve(undefined);
            }, 5000);
        });
        tsdk = await Promise.race([
            tsdkPromise,
            timeoutPromise
        ]);
        log('TSDK result', tsdk);
    } catch (e) {
        log('Error getting TSDK', e);
    }
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: node.TransportKind.ipc,
            options: {
                execArgv: [
                    '--nolazy',
                    '--inspect=6009'
                ]
            }
        }
    };
    const clientOptions = {
        documentSelector: [
            {
                scheme: 'file',
                language: 'objectscript'
            }
        ],
        initializationOptions: {
            typescript: {
                tsdk: tsdk?.tsdk
            }
        },
        outputChannel: outputChannel
    };
    log('Creating Language Client...');
    log('Document selector', clientOptions.documentSelector);
    log('Initialization options', clientOptions.initializationOptions);
    client = new node.LanguageClient('os-language-server', 'ObjectScript Language Server', serverOptions, clientOptions);
    log('Starting ObjectScript Language Client...');
    try {
        await client.start();
        log('=== ObjectScript Language Client Started Successfully! ===');
        log('Client state', client.state);
    } catch (e) {
        log('=== FAILED to start ObjectScript Language Client ===');
        log('Error', e);
        outputChannel.show(); // 自动显示输出面板以便查看错误
        throw e;
    }
    // 注册命令：显示 ObjectScript 日志
    context.subscriptions.push(vscode__namespace.commands.registerCommand('objectscript.showLog', ()=>{
        outputChannel.show();
    }));
    // 支持 Volar Labs
    const labsInfo = vscode$1.createLabsInfo(serverProtocol__namespace);
    labsInfo.addLanguageClient(client);
    log('Labs info created and client added');
    return labsInfo.extensionExports;
}
function deactivate() {
    log('=== ObjectScript Extension Deactivating ===');
    return client?.stop();
}

exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=extension.cjs.map
